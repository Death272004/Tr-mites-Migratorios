@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"
set "PORTAL_URL=http://localhost:8080/login"
set "CORREO_URL=http://localhost:8081"
set "FRONTEND_PORT=8080"
set "WEBMAIL_PORT=8081"

where docker >nul 2>&1
if errorlevel 1 (
  echo.
  echo Error: Docker no esta instalado o no esta disponible en PATH.
  pause
  exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
  echo.
  echo Error: Docker Compose no esta disponible.
  pause
  exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
  echo.
  echo Error: Docker no esta iniciado. Abra Docker Desktop y vuelva a intentarlo.
  pause
  exit /b 1
)

echo Deteniendo una ejecucion anterior de Tramites Migratorios...
docker compose down --remove-orphans >nul 2>&1

call :LiberarPuerto 8080
if errorlevel 1 goto :ErrorPuerto
call :LiberarPuerto 8081
if errorlevel 1 goto :ErrorPuerto

echo Construyendo e iniciando la aplicacion y el correo local...
docker compose up -d --build --wait --wait-timeout 240
if errorlevel 1 (
  echo.
  echo Error: no fue posible iniciar todos los servicios.
  docker compose ps
  pause
  exit /b 1
)

echo.
echo Aplicacion lista: %PORTAL_URL%
echo Correo local listo: %CORREO_URL%

if not "%NO_ABRIR_NAVEGADOR%"=="1" (
  start "" "%PORTAL_URL%"
  start "" "%CORREO_URL%"
)

echo.
echo Puede cerrar esta ventana. Los servicios continuaran ejecutandose en Docker.
pause
exit /b 0

:LiberarPuerto
set "PUERTO=%~1"
echo Revisando el puerto !PUERTO!...

for /f "usebackq delims=" %%C in (`docker ps --filter "publish=!PUERTO!" --format "{{.ID}}" 2^>nul`) do (
  echo Deteniendo un contenedor que usa el puerto !PUERTO!...
  docker stop %%C >nul
)

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":!PUERTO! .*LISTENING"') do (
  if not "%%P"=="0" (
    echo Cerrando el proceso %%P que usa el puerto !PUERTO!...
    taskkill /PID %%P /F >nul 2>&1
  )
)

timeout /t 1 /nobreak >nul
netstat -ano | findstr /R /C:":!PUERTO! .*LISTENING" >nul
if not errorlevel 1 exit /b 1
exit /b 0

:ErrorPuerto
echo.
echo Error: no se pudo liberar uno de los puertos. Ejecute este archivo como administrador.
pause
exit /b 1

