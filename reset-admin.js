/* Utilidad: reinicia (o crea) el usuario admin con una contraseña conocida.
 * Uso:
 *   node reset-admin.js                  -> admin / admin123
 *   node reset-admin.js miusuario claveSegura
 */
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const user = process.argv[2] || 'admin';
const pass = process.argv[3] || 'admin123';
const dbPath = path.join(__dirname, 'database', 'hypercix.db');
const db = new sqlite3.Database(dbPath);

const hash = bcrypt.hashSync(pass, 10);
const now = new Date().toISOString();

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY, username TEXT UNIQUE, pass TEXT, role TEXT, created_at TEXT
  )`);
  db.run(
    `INSERT INTO users (username, pass, role, created_at) VALUES (?, ?, 'admin', ?)
     ON CONFLICT(username) DO UPDATE SET pass = excluded.pass`,
    [user, hash, now],
    function (err) {
      if (err) { console.error('Error:', err.message); process.exit(1); }
      console.log('\n  Credenciales actualizadas correctamente:');
      console.log('  ------------------------------------------');
      console.log('  Usuario:     ' + user);
      console.log('  Contraseña:  ' + pass);
      console.log('  ------------------------------------------');
      console.log('  Reinicia el servidor (npm start) e inicia sesión en:');
      console.log('  http://localhost:3000/admin/login.html\n');
      db.close();
    }
  );
});
