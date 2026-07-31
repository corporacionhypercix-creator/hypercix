# Deploy HYPERCIX en Cloudflare Pages (frontend) + Render (backend)

Arquitectura **hÃ­brida**: el panel admin y la tienda pÃºblica se sirven desde
**Cloudflare Pages** (CDN global, sÃºper rÃ¡pido, ilimitado gratis), y el servidor
Node + SQLite sigue en **Render** (donde ya estÃ¡ funcionando).

El frontend detecta automÃ¡ticamente que estÃ¡ en Cloudflare y dirige todas las
llamadas `/api/*` al backend Render. No hay que configurar nada en el cÃ³digo:
el cambio ya estÃ¡ aplicado en `js/store-sync.js`.

## Requisitos previos

- Backend ya desplegado en Render con URL: **https://www.corporacionhypercix.com**
  (ver [RENDER-DEPLOY.md](RENDER-DEPLOY.md))
- CÃ³digo del repo subido a GitHub
- Cuenta gratis en https://cloudflare.com

## Paso 1 â€” Crear el proyecto en Cloudflare Pages (3 min)

1. Entra a https://dash.cloudflare.com â†’ menÃº lateral **Workers & Pages** â†’
   pestaÃ±a **Pages** â†’ **Create application** â†’ **Connect to Git**.
2. Autoriza GitHub la primera vez y selecciona el repo `hypercix`.
3. Pantalla de **Set up builds and deployments**:
   - **Project name**: `hypercix` (tu URL serÃ¡ `hypercix.pages.dev`)
   - **Production branch**: `main`
   - **Framework preset**: **None**
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: (vacÃ­o, raÃ­z del repo)
4. **Save and Deploy**.

Cloudflare clona el repo, corre `npm run build` (que ejecuta `build-pages.js`)
y publica el contenido de `dist/`. Tarda ~1-2 minutos.

## Paso 2 â€” Verificar (2 min)

Cuando termine verÃ¡s un cartel verde **Success**. Tu sitio estarÃ¡ en:

```
https://hypercix.pages.dev
```

Comprobar:

| URL | QuÃ© debe pasar |
|---|---|
| `https://hypercix.pages.dev/` | Redirige a `/public/index.html` (catÃ¡logo) |
| `https://hypercix.pages.dev/admin/login.html` | Pantalla de login admin |
| Login con tus credenciales | Entra al panel (los datos los lee de Render) |

Si abres la consola del navegador (F12 â†’ Network) verÃ¡s que las llamadas
`/api/*` van a `https://www.corporacionhypercix.com` â€” es lo esperado.

## Paso 3 â€” Deploys automÃ¡ticos (ya configurado)

Cada `git push` a `main` dispara un nuevo build en Cloudflare Pages:

```powershell
git add .
git commit -m "lo que cambiaste"
git push
```

Cloudflare detecta el push, corre `npm run build` y publica en ~1 min.
Lo verÃ¡s en el dashboard â†’ tu proyecto â†’ **Deployments**.

## Cambios al backend (server.js)

Cuando cambies `server.js` o cualquier cosa del backend, ese push dispara DOS
cosas:

- **Render** redeploy del servidor (~2 min)
- **Cloudflare** redeploy del frontend estÃ¡tico (~1 min)

Ambos son automÃ¡ticos. No hay que hacer nada manual.

## Dominio propio (opcional)

Si compras `hypercix.com`:

1. Cloudflare Pages â†’ tu proyecto â†’ **Custom domains** â†’ **Set up a custom domain**.
2. Si compras el dominio dentro de Cloudflare, lo conecta solo.
3. Si lo tienes en otro registrador, agrega un CNAME apuntando a
   `hypercix.pages.dev`.

Cloudflare genera el certificado HTTPS automÃ¡ticamente.

## Si la URL del backend cambia

Si algÃºn dÃ­a migras de Render a otro hosting, edita
`js/store-sync.js` lÃ­nea ~37 y cambia el valor de `BACKEND_URL`:

```js
var BACKEND_URL = (window.HC_BACKEND_URL || 'https://NUEVO-DOMINIO.com').replace(/\/+$/, '');
```

Push, y Cloudflare redeploy automÃ¡tico.

## Mantener Render despierto (recordatorio)

El plan gratis de Render duerme la app tras 15 min sin trÃ¡fico. La PRIMERA
llamada despuÃ©s de dormir tarda ~30s. Para evitarlo:

- Crear cuenta gratis en https://uptimerobot.com
- Add Monitor â†’ HTTP(s) â†’ URL: `https://www.corporacionhypercix.com/api/health`
  â†’ interval: 5 min.

Cloudflare Pages no se duerme nunca â€” solo el backend.

## Resumen visual

```
                      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   Usuario  â”€â”€â”€â”€â”€â”€â”€â”€â–º â”‚  hypercix.pages.dev    â”‚ (Cloudflare CDN â€” instantÃ¡neo)
                      â”‚  HTML, CSS, JS, IMG    â”‚
                      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                 â”‚ fetch /api/*
                                 â–¼
                      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                      â”‚ hypercix.onrender.com  â”‚ (Render â€” Node + SQLite)
                      â”‚  Express + DB          â”‚
                      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```
