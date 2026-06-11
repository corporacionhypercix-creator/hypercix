# HYPERCIX — Tienda online + Panel administrativo

Tienda web y panel de administración con **backend real (Express + SQLite)**, persistencia compartida entre dispositivos, autenticación y seguridad.

## 🚀 Cómo ejecutar

```bash
npm install      # instala dependencias (solo la primera vez)
npm start        # inicia el servidor en http://localhost:3000
```

- **Inicio:** http://localhost:3000/
- **Tienda:** http://localhost:3000/tienda/
- **Admin:** http://localhost:3000/admin/login.html
- **API health:** http://localhost:3000/api/health

**Acceso admin por defecto:** `admin` / `admin123` (configurable en `.env`).

## 🏗️ Arquitectura

```
Navegador (localStorage)  ⇄  store-sync.js  ⇄  API REST  ⇄  SQLite
```

- **`server.js`** — Express: sirve los archivos estáticos + API + seguridad.
- **`js/store-sync.js`** — capa de sincronización: al cargar cada página hidrata
  `localStorage` desde el servidor, y replica cada cambio del admin a la base de datos.
  Los 9 módulos admin existentes siguen funcionando **sin cambios**.
- **`database/hypercix.db`** — base de datos SQLite (colecciones + usuarios).

### Antes vs Ahora
| | Antes | Ahora |
|---|---|---|
| Persistencia | Solo `localStorage` (1 navegador) | **SQLite compartida** (todos los dispositivos) |
| Backend | Servidor estático | **Express + API REST** |
| Seguridad | Ninguna | **Helmet · CORS · Rate-limit · bcrypt** |
| Acceso admin | Abierto | **Login con token** |

## 🔌 API

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| GET  | `/api/health` | — | Estado del servicio |
| GET  | `/api/store` | — | Todas las colecciones (la tienda lee productos) |
| GET  | `/api/store/:key` | — | Una colección |
| PUT  | `/api/store/:key` | ✅ | Guardar una colección (solo admin) |
| POST | `/api/login` | — | Inicia sesión, devuelve token |
| POST | `/api/logout` | ✅ | Cierra sesión |
| GET  | `/api/me` | ✅ | Datos de la sesión |

Colecciones válidas: productos, categorías, marcas, clientes, cotizaciones,
tipo de cambio + historial, banners, configuración.

## 🔒 Seguridad

- Contraseñas con **bcrypt**.
- **Rate-limit** general (2000/15min) y de login (8 intentos/15min).
- Escritura de datos **solo con token** de sesión válido.
- Cabeceras seguras con **Helmet** (CSP, etc.).

## 🛒 Carrito de cotización (tienda)

Los clientes agregan productos con el botón **Cotizar**, ajustan cantidades en un
panel lateral y envían una solicitud con sus datos. La cotización se guarda en el
servidor (`POST /api/quotes`, público y con rate-limit) y aparece automáticamente
en el panel **Admin → Cotizaciones**.

- `js/tienda-cart.js` — carrito flotante + panel + formulario de envío.
- `js/ui-kit.js` — toasts y modales reutilizables (`HCToast`, `HCConfirm`, `HCPrompt`);
  reemplaza `alert()` por un toast no bloqueante en todas las páginas.

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| POST | `/api/quotes` | — | Enviar cotización desde la tienda (máx. 20/hora por IP) |

## 📦 Datos

La base de datos se crea automáticamente en `database/hypercix.db` con datos demo
(5 productos, categorías y marcas). Borra ese archivo para reiniciar desde cero.
