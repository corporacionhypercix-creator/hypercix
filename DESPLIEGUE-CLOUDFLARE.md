# Deploy HYPERCIX en Cloudflare Pages (frontend) + Render (backend)

Arquitectura **híbrida**: el panel admin y la tienda pública se sirven desde
**Cloudflare Pages** (CDN global, súper rápido, ilimitado gratis), y el servidor
Node + SQLite sigue en **Render** (donde ya está funcionando).

El frontend detecta automáticamente que está en Cloudflare y dirige todas las
llamadas `/api/*` al backend Render. No hay que configurar nada en el código:
el cambio ya está aplicado en `js/store-sync.js`.

## Requisitos previos

- Backend ya desplegado en Render con URL: **https://hypercix.onrender.com**
  (ver [RENDER-DEPLOY.md](RENDER-DEPLOY.md))
- Código del repo subido a GitHub
- Cuenta gratis en https://cloudflare.com

## Paso 1 — Crear el proyecto en Cloudflare Pages (3 min)

1. Entra a https://dash.cloudflare.com → menú lateral **Workers & Pages** →
   pestaña **Pages** → **Create application** → **Connect to Git**.
2. Autoriza GitHub la primera vez y selecciona el repo `hypercix`.
3. Pantalla de **Set up builds and deployments**:
   - **Project name**: `hypercix` (tu URL será `hypercix.pages.dev`)
   - **Production branch**: `main`
   - **Framework preset**: **None**
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: (vacío, raíz del repo)
4. **Save and Deploy**.

Cloudflare clona el repo, corre `npm run build` (que ejecuta `build-pages.js`)
y publica el contenido de `dist/`. Tarda ~1-2 minutos.

## Paso 2 — Verificar (2 min)

Cuando termine verás un cartel verde **Success**. Tu sitio estará en:

```
https://hypercix.pages.dev
```

Comprobar:

| URL | Qué debe pasar |
|---|---|
| `https://hypercix.pages.dev/` | Redirige a `/public/index.html` (catálogo) |
| `https://hypercix.pages.dev/admin/login.html` | Pantalla de login admin |
| Login con tus credenciales | Entra al panel (los datos los lee de Render) |

Si abres la consola del navegador (F12 → Network) verás que las llamadas
`/api/*` van a `https://hypercix.onrender.com` — es lo esperado.

## Paso 3 — Deploys automáticos (ya configurado)

Cada `git push` a `main` dispara un nuevo build en Cloudflare Pages:

```powershell
git add .
git commit -m "lo que cambiaste"
git push
```

Cloudflare detecta el push, corre `npm run build` y publica en ~1 min.
Lo verás en el dashboard → tu proyecto → **Deployments**.

## Cambios al backend (server.js)

Cuando cambies `server.js` o cualquier cosa del backend, ese push dispara DOS
cosas:

- **Render** redeploy del servidor (~2 min)
- **Cloudflare** redeploy del frontend estático (~1 min)

Ambos son automáticos. No hay que hacer nada manual.

## Dominio propio (opcional)

Si compras `hypercix.com`:

1. Cloudflare Pages → tu proyecto → **Custom domains** → **Set up a custom domain**.
2. Si compras el dominio dentro de Cloudflare, lo conecta solo.
3. Si lo tienes en otro registrador, agrega un CNAME apuntando a
   `hypercix.pages.dev`.

Cloudflare genera el certificado HTTPS automáticamente.

## Si la URL del backend cambia

Si algún día migras de Render a otro hosting, edita
`js/store-sync.js` línea ~37 y cambia el valor de `BACKEND_URL`:

```js
var BACKEND_URL = (window.HC_BACKEND_URL || 'https://NUEVO-DOMINIO.com').replace(/\/+$/, '');
```

Push, y Cloudflare redeploy automático.

## Mantener Render despierto (recordatorio)

El plan gratis de Render duerme la app tras 15 min sin tráfico. La PRIMERA
llamada después de dormir tarda ~30s. Para evitarlo:

- Crear cuenta gratis en https://uptimerobot.com
- Add Monitor → HTTP(s) → URL: `https://hypercix.onrender.com/api/health`
  → interval: 5 min.

Cloudflare Pages no se duerme nunca — solo el backend.

## Resumen visual

```
                      ┌────────────────────────┐
   Usuario  ────────► │  hypercix.pages.dev    │ (Cloudflare CDN — instantáneo)
                      │  HTML, CSS, JS, IMG    │
                      └──────────┬─────────────┘
                                 │ fetch /api/*
                                 ▼
                      ┌────────────────────────┐
                      │ hypercix.onrender.com  │ (Render — Node + SQLite)
                      │  Express + DB          │
                      └────────────────────────┘
```
