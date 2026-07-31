/* Migra datos de SQLite (database/hypercix.db) a MySQL/MariaDB.
 * Uso: node migrate-sqlite-to-mysql.js
 * Configurar DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME en .env
 */
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2');
const path = require('path');

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'hypercix';
const sqlitePath = process.argv[2] || path.join(__dirname, 'database', 'hypercix.db');

console.log('== Migración SQLite -> MySQL ==');
console.log('Origen :', sqlitePath);
console.log('Destino:', `${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
console.log('');

const src = new sqlite3.Database(sqlitePath, (err) => {
  if (err) { console.error('No se pudo abrir SQLite:', err.message); process.exit(1); }

  const conn = mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASS });
  conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, (e1) => {
    if (e1) { console.error('Error creando BD MySQL:', e1.message); process.exit(1); }
    conn.end();

    const pool = mysql.createPool({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASS, database: DB_NAME, charset: 'utf8mb4' });

    pool.query(`CREATE TABLE IF NOT EXISTS collections (
      \`key\` VARCHAR(191) PRIMARY KEY,
      data LONGTEXT NOT NULL,
      updated_at VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    pool.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(191) UNIQUE,
      pass VARCHAR(255),
      role VARCHAR(50),
      created_at VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    pool.query(`CREATE TABLE IF NOT EXISTS sessions (
      token VARCHAR(64) PRIMARY KEY,
      username VARCHAR(191) NOT NULL,
      role VARCHAR(50),
      created_at BIGINT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    setTimeout(() => migrateCollections(src, pool), 300);
  });
});

function migrateCollections(src, pool) {
  src.all('SELECT key, data, updated_at FROM collections', (err, rows) => {
    if (err) { console.error('Error leyendo SQLite:', err.message); process.exit(1); }
    if (!rows || !rows.length) {
      console.log('⚠ Sin colecciones para migrar.');
      return migrateUsers(src, pool);
    }
    let i = 0;
    const step = () => {
      if (i >= rows.length) {
        console.log(`✓ ${rows.length} colecciones migradas.`);
        return migrateUsers(src, pool);
      }
      const r = rows[i++];
      pool.query(
        'INSERT INTO collections (`key`, data, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)',
        [r.key, r.data, r.updated_at || null],
        (e) => { if (e) console.error('  ✗', r.key, '->', e.message); step(); }
      );
    };
    step();
  });
}

function migrateUsers(src, pool) {
  src.all('SELECT id, username, pass, role, created_at FROM users', (err, rows) => {
    if (err) { console.error('Error leyendo usuarios:', err.message); process.exit(1); }
    if (!rows || !rows.length) {
      console.log('⚠ Sin usuarios para migrar.');
      return migrateSessions(src, pool);
    }
    let i = 0;
    const step = () => {
      if (i >= rows.length) {
        console.log(`✓ ${rows.length} usuarios migrados.`);
        return migrateSessions(src, pool);
      }
      const r = rows[i++];
      pool.query(
        'INSERT INTO users (username, pass, role, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE pass = VALUES(pass), role = VALUES(role)',
        [r.username, r.pass, r.role || 'admin', r.created_at || null],
        (e) => { if (e) console.error('  ✗', r.username, '->', e.message); step(); }
      );
    };
    step();
  });
}

function migrateSessions(src, pool) {
  src.all('SELECT token, username, role, created_at FROM sessions', (err, rows) => {
    if (err) { console.error('Error leyendo sesiones:', err.message); process.exit(1); }
    if (!rows || !rows.length) {
      console.log('⚠ Sin sesiones para migrar.');
      return finish(src, pool);
    }
    let i = 0;
    const step = () => {
      if (i >= rows.length) {
        console.log(`✓ ${rows.length} sesiones migradas.`);
        return finish(src, pool);
      }
      const r = rows[i++];
      pool.query(
        'INSERT INTO sessions (token, username, role, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE username = VALUES(username)',
        [r.token, r.username, r.role || 'admin', r.created_at],
        (e) => { if (e) console.error('  ✗', r.token.slice(0, 8) + '...', '->', e.message); step(); }
      );
    };
    step();
  });
}

function finish(src, pool) {
  src.close();
  pool.end((e) => {
    if (e) console.error('Error cerrando pool:', e.message);
    console.log('');
    console.log('== Migración completada ==');
    console.log(`Ahora inicia el servidor con:  DB_DRIVER=mysql node server.js`);
    process.exit(0);
  });
}
