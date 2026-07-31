# 🚀 Deploy HYPERCIX en Render (gratis, todo funcional)

Render es como Fly.io pero MÁS FÁCIL: deploy desde GitHub con clic, dominio gratis con HTTPS, disco persistente para SQLite, base de datos no se borra.

## ⏱️ Tiempo total: ~10 minutos

---

## 📋 PASO 1 — Subir tu código a GitHub (3 min)

Render se conecta a GitHub. Si tu código aún no está en GitHub:

```powershell
cd "E:\PAGINA WEB"
git init
git add .
git commit -m "HYPERCIX listo para Render"
```

Luego entra a https://github.com/new → crea repo `hypercix` (privado o público) → en la pantalla siguiente verás un comando como:

```powershell
git remote add origin https://github.com/TU_USUARIO/hypercix.git
git branch -M main
git push -u origin main
```

Copia y pega esos 3 comandos en PowerShell. Listo, código en GitHub.

---

## 📋 PASO 2 — Crear cuenta en Render (2 min)

1. Ve a 👉 **https://render.com/**
2. Clic en **"Get Started"** → entra con tu cuenta de **GitHub** (1 clic).
3. Listo, ya tienes Render.

---

## 📋 PASO 3 — Crear el Web Service (3 min)

1. En el dashboard de Render → clic **"New +"** → **"Web Service"**.
2. Conecta tu repo `hypercix` (te aparecerá la lista).
3. Render detecta automáticamente el `render.yaml` que dejé en el proyecto y te llena los campos. Solo verifica:
   - **Name**: `hypercix`
   - **Region**: Oregon (más rápido para Latinoamérica)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: **Free**

4. En **Environment Variables** define DOS variables:
   - `ADMIN_USER` → tu usuario admin (ej: `cixadmin`)
   - `ADMIN_PASS` → contraseña LARGA y única (ej: `HyperCix2026!Seguro`)

5. Clic **"Create Web Service"**.

---

## ⏳ PASO 4 — Esperar el primer deploy (3-5 min)

Render compila e instala. Verás logs en vivo:
```
==> Cloning from https://github.com/...
==> Running 'npm install'
==> Running 'node server.js'
HYPERCIX - Servidor Express + SQLite
Escuchando en el puerto 10000
==> Your service is live 🎉
```

Tu URL será algo como: **`https://www.corporacionhypercix.com`**

---

## ✅ PASO 5 — Verificar que todo funciona

| URL | Qué debe ver |
|---|---|
| `https://www.corporacionhypercix.com/` | La tienda con tu producto |
| `https://www.corporacionhypercix.com/api/health` | `{"status":"ok"}` |
| `https://www.corporacionhypercix.com/admin/login.html` | Pantalla de login |

Login admin → usa el `ADMIN_USER` y `ADMIN_PASS` que definiste arriba.

---

## 💡 Detalles importantes

### El "Free" tier de Render
- ✅ Web Service: GRATIS para siempre
- ✅ HTTPS automático
- ✅ Auto-deploy: cada `git push` actualiza el sitio
- ⚠️ Las apps gratis se **duermen tras 15 min sin tráfico**. Cuando alguien entra, despiertan en ~30 segundos. Eso es lo único.
- ✅ Disco persistente 1 GB para SQLite (BD nunca se pierde)

### Para evitar el "dormir" (opcional)
- Plan Starter: $7/mes — sin sleep, más rápido.
- O usar https://uptimerobot.com gratis para hacer ping cada 5 min al `/api/health` y mantener despierta la app.

### Actualizar la tienda después
```powershell
# En tu PC, después de cambios:
cd "E:\PAGINA WEB"
git add .
git commit -m "lo que cambiaste"
git push
```
Render detecta el push y re-despliega automáticamente en ~2 min. **No tocas Render para nada**.

---

## 🌐 Para usar tu dominio (hypercix.com en el futuro)

1. En Render → tu servicio → **Settings → Custom Domain** → agrega `hypercix.com`.
2. Render te da un CNAME tipo `hypercix.onrender.com`.
3. En el panel DNS del proveedor donde compraste el dominio: agrega un CNAME apuntando ahí.
4. Render configura el HTTPS automáticamente.

---

## ❓ Si algo falla

1. **App no arranca**: revisa los logs en Render → tu servicio → tab "Logs".
2. **Login falla**: revisa que `ADMIN_USER` y `ADMIN_PASS` estén bien escritos en Environment Variables.
3. **404 en algo**: confirma que el archivo existe en GitHub.

Cualquier error, pégame los logs y lo soluciono.
