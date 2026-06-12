require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// Detras de un proxy inverso del hosting (Render, Railway, Nginx, etc.) para
// que el rate-limit y la IP del cliente se lean del header X-Forwarded-For.
// TRUST_PROXY=0 lo desactiva (util en local sin proxy).
app.set('trust proxy', Number(process.env.TRUST_PROXY != null ? process.env.TRUST_PROXY : 1));

// ─── CARPETAS ─────────────────────────────────────────
const dataDir = path.join(ROOT, 'database');
const logsDir = path.join(ROOT, 'logs');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// ─── SEGURIDAD ────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
      fontSrc: ["'self'", 'https:', 'http:', 'data:'],
      connectSrc: ["'self'", 'https:', 'http:'],
      frameSrc: ["'self'", 'https://maps.google.com', 'https://www.google.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  originAgentCluster: false,
}));
app.use(cors({ origin: true, credentials: true }));
// Compresion gzip de todas las respuestas (html, css, js, json) — reduce 70-80%
app.use(compression({ threshold: 1024 }));
app.use(express.json({ limit: '12mb' }));

// Rate limit general
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 2000 }));
// Rate limit de login (anti fuerza bruta)
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, skipSuccessfulRequests: true });

// ─── BASE DE DATOS ────────────────────────────────────
const dbPath = path.join(dataDir, 'hypercix.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Error al abrir DB:', err.message);
  console.log('Conectado a SQLite:', dbPath);
  initDatabase();
});

// Colecciones validas (mismas claves que usa el front en localStorage)
const VALID_KEYS = new Set([
  'hypercix-admin-products',
  'hypercix-admin-categories',
  'hypercix-admin-categories-data',
  'hypercix-admin-brands',
  'hypercix-admin-brands-data',
  'hypercix-admin-clients',
  'hypercix-admin-quotes',
  'hypercix-admin-exchange-rate',
  'hypercix-admin-rate-history',
  'hypercix-admin-banners',
  'hypercix-admin-settings'
]);

function initDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS collections (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      pass TEXT,
      role TEXT,
      created_at TEXT
    )`, () => {
      seedDefaults();
    });
  });
}

function seedDefaults() {
  // Usuario admin por defecto
  db.get('SELECT COUNT(*) AS n FROM users', (err, row) => {
    if (!err && row.n === 0) {
      const hash = bcrypt.hashSync(process.env.ADMIN_PASS || 'admin123', 10);
      db.run('INSERT INTO users (username, pass, role, created_at) VALUES (?, ?, ?, ?)',
        [process.env.ADMIN_USER || 'admin', hash, 'admin', new Date().toISOString()]);
      console.log('✓ Usuario admin creado (admin / admin123)');
    }
  });

  // Datos demo iniciales (solo si la coleccion no existe)
  const seed = {
    'hypercix-admin-categories': ['General', 'Camaras', 'Seguridad', 'Redes', 'Servicios', 'Alarmas', 'Accesorios'],
    'hypercix-admin-brands': ['Sin marca', 'Hikvision', 'Dahua', 'Ezviz', 'Ubiquiti', 'Generica', 'Servicio'],
    'hypercix-admin-products': [
      { id: 'demo-1', code: 'CAM-001', description: 'Camara CCTV domo 2MP', category: 'Camaras', brand: 'Hikvision', price: 180, stock: 12, taxType: 'gravado', image: '', color: '#111827' },
      { id: 'demo-2', code: 'CAM-002', description: 'Camara IP bullet 4MP', category: 'Camaras', brand: 'Dahua', price: 320, stock: 8, taxType: 'gravado', image: '', color: '#1f2937' },
      { id: 'demo-3', code: 'DVR-004', description: 'DVR 8 canales HD', category: 'Seguridad', brand: 'Hikvision', price: 620, stock: 5, taxType: 'gravado', image: '', color: '#b40f2e' },
      { id: 'demo-4', code: 'RED-001', description: 'Cable UTP Cat 6 por metro', category: 'Redes', brand: 'Generica', price: 2.8, stock: 500, taxType: 'gravado', image: '', color: '#2563eb' },
      { id: 'demo-5', code: 'SRV-001', description: 'Instalacion y configuracion tecnica', category: 'Servicios', brand: 'Servicio', price: 150, stock: 99, taxType: 'gravado', image: '', color: '#10b981' }
    ]
  };
  const now = new Date().toISOString();
  Object.entries(seed).forEach(([key, value]) => {
    db.run('INSERT OR IGNORE INTO collections (key, data, updated_at) VALUES (?, ?, ?)',
      [key, JSON.stringify(value), now]);
  });
}

// ─── AUTENTICACION (tokens en memoria) ────────────────
const sessions = new Map(); // token -> { username, role, createdAt }

function makeToken() {
  return crypto.randomBytes(24).toString('hex');
}

function requireAuth(req, res, next) {
  const token = req.headers['x-auth-token'] || (req.query && req.query.token);
  const sess = token && sessions.get(token);
  if (!sess) return res.status(401).json({ error: 'No autorizado' });
  req.session = sess;
  next();
}

app.post('/api/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });

  db.get('SELECT * FROM users WHERE username = ?', [String(username).trim()], (err, user) => {
    if (err) return res.status(500).json({ error: 'Error del servidor' });
    if (!user || !bcrypt.compareSync(password, user.pass)) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const token = makeToken();
    sessions.set(token, { username: user.username, role: user.role, createdAt: Date.now() });
    res.json({ success: true, token, user: { username: user.username, role: user.role } });
  });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const token = req.headers['x-auth-token'];
  sessions.delete(token);
  res.json({ success: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.session });
});

// ─── API DE COLECCIONES (store) ───────────────────────
// Lectura publica (la tienda necesita leer productos sin login)
app.get('/api/store', (req, res) => {
  db.all('SELECT key, data FROM collections', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const out = {};
    (rows || []).forEach((r) => {
      try { out[r.key] = JSON.parse(r.data); } catch (e) { out[r.key] = null; }
    });
    res.json(out);
  });
});

app.get('/api/store/:key', (req, res) => {
  const { key } = req.params;
  if (!VALID_KEYS.has(key)) return res.status(400).json({ error: 'Clave no permitida' });
  db.get('SELECT data FROM collections WHERE key = ?', [key], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.json(null);
    try { res.json(JSON.parse(row.data)); } catch (e) { res.json(null); }
  });
});

// Escritura protegida (solo admin autenticado)
app.put('/api/store/:key', requireAuth, (req, res) => {
  const { key } = req.params;
  if (!VALID_KEYS.has(key)) return res.status(400).json({ error: 'Clave no permitida' });
  const data = JSON.stringify(req.body === undefined ? null : req.body);
  const now = new Date().toISOString();
  db.run(
    `INSERT INTO collections (key, data, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    [key, data, now],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, updated_at: now });
    }
  );
});

// ─── COTIZACIONES PUBLICAS (desde la tienda, sin login) ──
const quoteLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20 }); // 20 cotizaciones/hora por IP

app.post('/api/quotes', quoteLimiter, (req, res) => {
  const b = req.body || {};
  const client = String(b.client || '').trim().slice(0, 120);
  const email = String(b.email || '').trim().slice(0, 120);
  const phone = String(b.phone || '').trim().slice(0, 40);
  const items = Array.isArray(b.items) ? b.items : [];

  if (!client || (!email && !phone)) {
    return res.status(400).json({ error: 'Nombre y un medio de contacto (email o teléfono) son requeridos' });
  }
  if (!items.length) {
    return res.status(400).json({ error: 'La cotización no tiene productos' });
  }

  // Construir resumen compatible con el modulo admin de cotizaciones
  let amount = 0;
  const lines = items.map((it) => {
    const qty = Math.max(1, Number(it.qty) || 1);
    const price = Number(it.price) || 0;
    amount += qty * price;
    return `${qty} x ${String(it.code || '').slice(0, 40)} ${String(it.description || '').slice(0, 80)}`;
  });
  const productSummary = items.length === 1
    ? String(items[0].description || items[0].code || 'Producto').slice(0, 80)
    : `${items.length} productos`;

  const quote = {
    id: 'web-' + Date.now(),
    client, email, phone,
    product: productSummary,
    description: (b.message ? (String(b.message).slice(0, 300) + ' | ') : '') + lines.join('; '),
    amount: Number(amount.toFixed(2)),
    status: 'pendiente',
    date: new Date().toISOString().split('T')[0],
    source: 'tienda'
  };

  const key = 'hypercix-admin-quotes';
  db.get('SELECT data FROM collections WHERE key = ?', [key], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    let quotes = [];
    if (row) { try { quotes = JSON.parse(row.data) || []; } catch (e) { quotes = []; } }
    quotes.unshift(quote);
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO collections (key, data, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
      [key, JSON.stringify(quotes), now],
      (e2) => {
        if (e2) return res.status(500).json({ error: e2.message });
        res.json({ success: true, id: quote.id, amount: quote.amount });
      }
    );
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'hypercix-web', time: new Date().toISOString() });
});

// ─── ARCHIVOS ESTATICOS ───────────────────────────────
// Estaticos: HTML y JS siempre frescos (max-age=0, must-revalidate),
// CSS/imagenes con cache de 7 dias (el navegador valida con ETag).
app.use(express.static(ROOT, {
  extensions: ['html'],
  dotfiles: 'ignore',
  etag: true,
  lastModified: true,
  setHeaders: function (res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.html' || ext === '.js') {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (['.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.json'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 dias
    }
  }
}));

// Rutas amigables
app.get('/', (req, res) => res.redirect('/public/index.html#catalogo'));
app.get('/admin', (req, res) => res.redirect('/admin/dashboard.html'));
// 404 (sin reflejar la ruta del usuario en el HTML, evita XSS reflejado)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Ruta no encontrada' });
  res.status(404).send('<!doctype html><meta charset="utf-8"><title>404</title>' +
    '<body style="font-family:system-ui;background:#0A0A0F;color:#e8e8ee;display:grid;place-items:center;height:100vh;margin:0;text-align:center">' +
    '<div><h1 style="color:#C8102E;font-size:3rem;margin:0">404</h1>' +
    '<p>Pagina no encontrada.</p><p><a href="/" style="color:#C8102E">Volver al inicio</a></p></div></body>');
});

const server = app.listen(PORT, () => {
  const usingDefaultPass = !process.env.ADMIN_PASS;
  console.log(`\n  HYPERCIX - Servidor Express + SQLite`);
  console.log(`  ───────────────────────────────────`);
  console.log(`  Escuchando en el puerto ${PORT}`);
  console.log(`  Local:    http://localhost:${PORT}/`);
  console.log(`  Admin:    http://localhost:${PORT}/admin/dashboard.html`);
  console.log(`  Health:   http://localhost:${PORT}/api/health`);
  console.log(`  ───────────────────────────────────`);
  console.log(`  Seguridad: Helmet · CORS · Rate-limit · bcrypt`);
  if (usingDefaultPass) {
    console.log(`  ⚠ ADVERTENCIA: usando contraseña admin por defecto (admin123).`);
    console.log(`    Define ADMIN_USER y ADMIN_PASS en .env ANTES del primer arranque,`);
    console.log(`    o ejecuta:  node reset-admin.js <usuario> <claveSegura>\n`);
  } else {
    console.log(`  Admin configurado vía variables de entorno.\n`);
  }
  // Abrir navegador automáticamente
  const url = `http://localhost:${PORT}/admin/dashboard.html`;
  if (process.platform === 'win32') {
    require('child_process').exec(`cmd /c start "" "${url}"`);
  } else {
    const start = process.platform === 'darwin' ? 'open' : 'xdg-open';
    require('child_process').exec(`${start} "${url}"`);
  }
});

// Cierre limpio cuando el hosting reinicia/despliega (SIGTERM) o Ctrl+C (SIGINT)
function shutdown(signal) {
  console.log(`\n  Recibido ${signal}, cerrando servidor...`);
  server.close(() => {
    db.close(() => {
      console.log('  Conexiones cerradas. Adios.');
      process.exit(0);
    });
  });
  // Por si algo se cuelga, forzar salida a los 8s
  setTimeout(() => process.exit(1), 8000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
