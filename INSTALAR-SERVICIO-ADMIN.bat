@echo off
title HYPERCIX - Instalar servicio Cloudflare (arranque automatico)
echo ============================================================
echo  Instalar cloudflared como servicio de Windows
echo ============================================================
echo.
echo Este script debe ejecutarse como ADMINISTRADOR.
echo (Clic derecho sobre el archivo -^> "Ejecutar como administrador")
echo.

net session >nul 2>&1
if %errorLevel% NEQ 0 (
  echo [ERROR] No estas como administrador.
  echo Cierra esta ventana, haz clic DERECHO sobre el archivo
  echo INSTALAR-SERVICIO-ADMIN.bat y elige "Ejecutar como administrador".
  pause
  exit /b
)

echo [..] Instalando servicio cloudflared...
"C:\Users\Lenovo\AppData\Local\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe" --config "C:\Users\Lenovo\.cloudflared\config.yml" service install
echo.

echo [..] Iniciando servicio...
sc start cloudflared
echo.

echo [..] Verificando estado...
sc query cloudflared
echo.

echo Listo. El tunel se conectara solo cada vez que prendas la PC.
pause
