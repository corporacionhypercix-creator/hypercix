# 🚀 Guía de despliegue (hosting) — HYPERCIX

Esta app es **Node.js (Express) + SQLite**. No es un sitio estático: necesita un
servidor Node corriendo **y disco persistente** para la base de datos.

---

## ⚠️ 1. Elige el hosting correcto

| Tipo de hosting | ¿Sirve? | Por qué |
|---|:---:|---|
| **VPS** (DigitalOcean, Hostinger VPS, Contabo, AWS EC2) | ✅ Ideal | Control total, disco permanente |
| **Render**, **Railway**, **Fly.io** | ✅ Sí | Soportan Node + disco/volumen persistente |
| **Hosting Node con cPanel** (Passenger) | ✅ Sí | Disco permanente; revisar versión de Node |
| Vercel / Netlify / Cloudflare Pages | ❌ No (tal cual) | Son *serverless*: el disco se borra → **se pierde la base de datos SQLite** |
| Hosting solo PHP / estático | ❌ No | No ejecuta Node |

> 🔑 **Regla de oro:** el archivo `database/hypercix.db` debe vivir en un **disco
> que NO se borre** entre reinicios/despliegues. Si el host no ofrece disco
> persistente, los productos y configuraciones desaparecerán.

---

## 🔐 2. Antes de subir (checklist)

1. **Define un usuario y contraseña seguros** (NO uses `admin123`):
   - En el panel del host, crea las variables de entorno (ver tabla abajo), **o**
   - crea un archivo `.env` (cópialo de `.env.example`):
     ```
     PORT=3000
     ADMIN_USER=tu_usuario
     ADMIN_PASS=una_clave_larga_y_unica
     ```
   > La contraseña admin se crea **en el primer arranque**. Defínela ANTES de
   > iniciar por primera vez. Si ya arrancó con la de por defecto, cámbiala con:
   > `node reset-admin.js tu_usuario una_clave_larga_y_unica`

2. **No subas** estos archivos (ya están en `.gitignore`): `.env`,
   `node_modules/`, `database/*.db`, `logs/`, `INICIAR-HYPERCIX.bat`.

### Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `3000` | El host normalmente lo asigna solo. No lo fuerces si el host ya lo define. |
| `ADMIN_USER` | `admin` | Usuario del panel (solo se aplica en el primer arranque). |
| `ADMIN_PASS` | `admin123` | **Cámbiala.** Contraseña del panel (primer arranque). |
| `TRUST_PROXY` | `1` | Déjalo en `1` detrás del proxy del host. Ponlo en `0` solo en local sin proxy. |

---

## 🛠️ 3. Comandos que usa el host

| Paso | Comando |
|---|---|
| Instalar dependencias (build) | `npm install` |
| Iniciar la app (start) | `npm start`  *(ejecuta `node server.js`)* |
| Versión de Node | **18 o superior** |
| Health check | `GET /api/health` → `{ "status": "ok" }` |

La app escucha en `process.env.PORT` (o 3000). El `Procfile` incluido
(`web: node server.js`) ya le dice a Render/Railway/Heroku cómo arrancarla.

---

## 📦 4. Pasos por tipo de host

### A) VPS (recomendado — control total)
```bash
# en el servidor, con Node 18+ instalado
git clone <tu-repo>   # o sube los archivos por SFTP
cd "PAGINA WEB"
npm install
cp .env.example .env  # edita ADMIN_USER / ADMIN_PASS
# mantenerla viva con PM2:
npm install -g pm2
pm2 start server.js --name hypercix
pm2 save && pm2 startup     # arranque automático al reiniciar el VPS
```
Luego apunta tu dominio al VPS y pon **Nginx** delante (proxy inverso) en el
puerto 80/443 hacia `http://localhost:3000`. (Certificado SSL con Certbot.)

### B) Render
1. Crea un **Web Service** desde tu repo.
2. Build: `npm install` · Start: `npm start`.
3. Agrega un **Disk** y móntalo en la carpeta `database` del proyecto.
4. En *Environment* define `ADMIN_USER`, `ADMIN_PASS` (no definas `PORT`).
5. Health check path: `/api/health`.

### C) Railway
1. *New Project → Deploy from repo*.
2. Agrega un **Volume** montado en `/app/database`.
3. Variables: `ADMIN_USER`, `ADMIN_PASS`.
4. Railway detecta `npm start` automáticamente.

---

## ✅ 5. Después de desplegar (verificar)

1. Abre `https://tudominio.com/api/health` → debe responder `{"status":"ok"}`.
2. Abre `https://tudominio.com/` → carga la tienda.
3. Entra a `https://tudominio.com/admin/login.html` con tu usuario/clave.
4. Agrega un producto en **Productos** → recarga la tienda → debe aparecer.

---

## 💾 6. Respaldos

Toda la información vive en **un solo archivo**: `database/hypercix.db`.
Descárgalo periódicamente (SFTP, o el panel de disco del host) para tener copia.
Para reiniciar desde cero, borra ese archivo y reinicia (se recrea con datos demo).

---

## ❓ Problemas comunes

- **"Se borraron los productos tras un despliegue"** → el host no tiene disco
  persistente, o el disco no está montado en la carpeta `database`. Revisa el punto 1.
- **"No puedo entrar al admin"** → la contraseña se fijó en el primer arranque.
  Usa `node reset-admin.js usuario clave` en el servidor.
- **"Demasiados intentos / rate-limit raro"** → asegúrate de que `TRUST_PROXY=1`
  (valor por defecto) para que el límite cuente por IP real y no por la del proxy.
