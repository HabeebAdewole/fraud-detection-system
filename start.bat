@echo off
REM ============================================================
REM  Tracer Fraud Detection - one-click launcher (Windows)
REM  Starts MySQL, Apache, the Flask backend, and the React frontend.
REM ============================================================

echo.
echo [1/4] Starting MySQL (XAMPP) on port 3306 ...
tasklist /FI "IMAGENAME eq mysqld.exe" | find /I "mysqld.exe" >nul
if errorlevel 1 (
  start "MySQL" /min "C:\xampp\mysql\bin\mysqld.exe" --defaults-file=C:\xampp\mysql\bin\my.ini
  echo     MySQL launched.
) else (
  echo     MySQL already running.
)
ping -n 6 127.0.0.1 >nul

echo [2/4] Starting Apache on port 80 (for phpMyAdmin) ...
REM The app itself does NOT need Apache - Flask talks to MySQL directly.
REM Apache only serves phpMyAdmin at http://localhost/phpmyadmin
tasklist /FI "IMAGENAME eq httpd.exe" | find /I "httpd.exe" >nul
if errorlevel 1 (
  start "Apache" /min "C:\xampp\apache\bin\httpd.exe"
  echo     Apache launched.
) else (
  echo     Apache already running.
)
ping -n 4 127.0.0.1 >nul

echo [3/4] Starting Flask backend on http://localhost:5000 ...
REM Kill any stale backend/frontend processes first so they never stack up
REM (a stale process holding the port serves OLD code = mystery 404s).
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='python.exe'\" | Where-Object { $_.CommandLine -like '*run.py*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -like '*vite*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1
ping -n 3 127.0.0.1 >nul
start "Tracer Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe run.py"
ping -n 4 127.0.0.1 >nul

echo [4/4] Starting React frontend on http://localhost:5173 ...
start "Tracer Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo All services starting. Give it ~10 seconds, then open:
echo     The app          http://localhost:5173
echo     The database     http://localhost/phpmyadmin   (database: elliptic_fraud)
echo.
echo Login:  admin / admin123    or    analyst / analyst123
echo.
echo To stop: close the two black terminal windows (backend + frontend).
echo          MySQL and Apache keep running - stop them from the XAMPP Control Panel.
echo.
pause
