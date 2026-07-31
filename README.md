# HYPERCIX â€” Tienda online + Panel administrativo

Tienda web y panel de administraciÃ³n con **backend real (Express + SQLite)**, persistencia compartida entre dispositivos, autenticaciÃ³n y seguridad.

## ðŸš€ CÃ³mo ejecutar

```bash
npm install      # instala dependencias (solo la primera vez)
npm start        # inicia el servidor en http://localhost:3000
```

- **Inicio:** http://localhost:3000/
- **Tienda:** http://localhost:3000/tienda/
- **Admin:** http://localhost:3000/admin/login.html
- **API health:** http://localhost:3000/api/health

**Acceso admin por defecto:** `admin` / `admin123` (configurable en `.env`).

## ðŸ—ï¸ Arquitectura

```
Navegador (localStorage)  â‡„  store-sync.js  â‡„  API REST  â‡„  SQLite
```

- **`server.js`** â€” Express: sirve los archivos estÃ¡ticos + API + seguridad.
- **`js/store-sync.js`** â€” capa de sincronizaciÃ³n: al cargar cada pÃ¡gina hidrata
  `localStorage` desde el servidor, y replica cada cambio del admin a la base de datos.
  Los 9 mÃ³dulos admin existentes siguen funcionando **sin cambios**.
- **`database/hypercix.db`** â€” base de datos SQLite (colecciones + usuarios).

### Antes vs Ahora
| | Antes | Ahora |
|---|---|---|
| Persistencia | Solo `localStorage` (1 navegador) | **SQLite compartida** (todos los dispositivos) |
| Backend | Servidor estÃ¡tico | **Express + API REST** |
| Seguridad | Ninguna | **Helmet Â· CORS Â· Rate-limit Â· bcrypt** |
| Acceso admin | Abierto | **Login con token** |

## ðŸ”Œ API

| MÃ©todo | Ruta | Auth | DescripciÃ³n |
|--------|------|:----:|-------------|
| GET  | `/api/health` | â€” | Estado del servicio |
| GET  | `/api/store` | â€” | Todas las colecciones (la tienda lee productos) |
| GET  | `/api/store/:key` | â€” | Una colecciÃ³n |
| PUT  | `/api/store/:key` | âœ… | Guardar una colecciÃ³n (solo admin) |
| POST | `/api/login` | â€” | Inicia sesiÃ³n, devuelve token |
| POST | `/api/logout` | âœ… | Cierra sesiÃ³n |
| GET  | `/api/me` | âœ… | Datos de la sesiÃ³n |

Colecciones vÃ¡lidas: productos, categorÃ­as, marcas, clientes, cotizaciones,
tipo de cambio + historial, banners, configuraciÃ³n.

## ðŸ”’ Seguridad

- ContraseÃ±as con **bcrypt**.
- **Rate-limit** general (2000/15min) y de login (8 intentos/15min).
- Escritura de datos **solo con token** de sesiÃ³n vÃ¡lido.
- Cabeceras seguras con **Helmet** (CSP, etc.).

## ðŸ›’ Carrito de cotizaciÃ³n (tienda)

Los clientes agregan productos con el botÃ³n **Cotizar**, ajustan cantidades en un
panel lateral y envÃ­an una solicitud con sus datos. La cotizaciÃ³n se guarda en el
servidor (`POST /api/quotes`, pÃºblico y con rate-limit) y aparece automÃ¡ticamente
en el panel **Admin â†’ Cotizaciones**.

- `js/tienda-cart.js` â€” carrito flotante + panel + formulario de envÃ­o.
- `js/ui-kit.js` â€” toasts y modales reutilizables (`HCToast`, `HCConfirm`, `HCPrompt`);
  reemplaza `alert()` por un toast no bloqueante en todas las pÃ¡ginas.

| MÃ©todo | Ruta | Auth | DescripciÃ³n |
|--------|------|:----:|-------------|
| POST | `/api/quotes` | â€” | Enviar cotizaciÃ³n desde la tienda (mÃ¡x. 20/hora por IP) |

## ðŸ“¦ Datos

La base de datos se crea automÃ¡ticamente en `database/hypercix.db` con datos demo
(5 productos, categorÃ­as y marcas). Borra ese archivo para reiniciar desde cero.
