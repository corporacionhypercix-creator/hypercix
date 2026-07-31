# ðŸš€ Deploy HYPERCIX en Render (gratis, todo funcional)

Render es como Fly.io pero MÃS FÃCIL: deploy desde GitHub con clic, dominio gratis con HTTPS, disco persistente para SQLite, base de datos no se borra.

## â±ï¸ Tiempo total: ~10 minutos

---

## ðŸ“‹ PASO 1 â€” Subir tu cÃ³digo a GitHub (3 min)

Render se conecta a GitHub. Si tu cÃ³digo aÃºn no estÃ¡ en GitHub:

```powershell
cd "E:\PAGINA WEB"
git init
git add .
git commit -m "HYPERCIX listo para Render"
```

Luego entra a https://github.com/new â†’ crea repo `hypercix` (privado o pÃºblico) â†’ en la pantalla siguiente verÃ¡s un comando como:

```powershell
git remote add origin https://github.com/TU_USUARIO/hypercix.git
git branch -M main
git push -u origin main
```

Copia y pega esos 3 comandos en PowerShell. Listo, cÃ³digo en GitHub.

---

## ðŸ“‹ PASO 2 â€” Crear cuenta en Render (2 min)

1. Ve a ðŸ‘‰ **https://render.com/**
2. Clic en **"Get Started"** â†’ entra con tu cuenta de **GitHub** (1 clic).
3. Listo, ya tienes Render.

---

## ðŸ“‹ PASO 3 â€” Crear el Web Service (3 min)

1. En el dashboard de Render â†’ clic **"New +"** â†’ **"Web Service"**.
2. Conecta tu repo `hypercix` (te aparecerÃ¡ la lista).
3. Render detecta automÃ¡ticamente el `render.yaml` que dejÃ© en el proyecto y te llena los campos. Solo verifica:
   - **Name**: `hypercix`
   - **Region**: Oregon (mÃ¡s rÃ¡pido para LatinoamÃ©rica)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: **Free**

4. En **Environment Variables** define DOS variables:
   - `ADMIN_USER` â†’ tu usuario admin (ej: `cixadmin`)
   - `ADMIN_PASS` â†’ contraseÃ±a LARGA y Ãºnica (ej: `HyperCix2026!Seguro`)

5. Clic **"Create Web Service"**.

---

## â³ PASO 4 â€” Esperar el primer deploy (3-5 min)

Render compila e instala. VerÃ¡s logs en vivo:
```
==> Cloning from https://github.com/...
==> Running 'npm install'
==> Running 'node server.js'
HYPERCIX - Servidor Express + SQLite
Escuchando en el puerto 10000
==> Your service is live ðŸŽ‰
```

Tu URL serÃ¡ algo como: **`https://www.corporacionhypercix.com`**

---

## âœ… PASO 5 â€” Verificar que todo funciona

| URL | QuÃ© debe ver |
|---|---|
| `https://www.corporacionhypercix.com/` | La tienda con tu producto |
| `https://www.corporacionhypercix.com/api/health` | `{"status":"ok"}` |
| `https://www.corporacionhypercix.com/admin/login.html` | Pantalla de login |

Login admin â†’ usa el `ADMIN_USER` y `ADMIN_PASS` que definiste arriba.

---

## ðŸ’¡ Detalles importantes

### El "Free" tier de Render
- âœ… Web Service: GRATIS para siempre
- âœ… HTTPS automÃ¡tico
- âœ… Auto-deploy: cada `git push` actualiza el sitio
- âš ï¸ Las apps gratis se **duermen tras 15 min sin trÃ¡fico**. Cuando alguien entra, despiertan en ~30 segundos. Eso es lo Ãºnico.
- âœ… Disco persistente 1 GB para SQLite (BD nunca se pierde)

### Para evitar el "dormir" (opcional)
- Plan Starter: $7/mes â€” sin sleep, mÃ¡s rÃ¡pido.
- O usar https://uptimerobot.com gratis para hacer ping cada 5 min al `/api/health` y mantener despierta la app.

### Actualizar la tienda despuÃ©s
```powershell
# En tu PC, despuÃ©s de cambios:
cd "E:\PAGINA WEB"
git add .
git commit -m "lo que cambiaste"
git push
```
Render detecta el push y re-despliega automÃ¡ticamente en ~2 min. **No tocas Render para nada**.

---

## ðŸŒ Para usar tu dominio (hypercix.com en el futuro)

1. En Render â†’ tu servicio â†’ **Settings â†’ Custom Domain** â†’ agrega `hypercix.com`.
2. Render te da un CNAME tipo `hypercix.onrender.com`.
3. En el panel DNS del proveedor donde compraste el dominio: agrega un CNAME apuntando ahÃ­.
4. Render configura el HTTPS automÃ¡ticamente.

---

## â“ Si algo falla

1. **App no arranca**: revisa los logs en Render â†’ tu servicio â†’ tab "Logs".
2. **Login falla**: revisa que `ADMIN_USER` y `ADMIN_PASS` estÃ©n bien escritos en Environment Variables.
3. **404 en algo**: confirma que el archivo existe en GitHub.

Cualquier error, pÃ©game los logs y lo soluciono.
