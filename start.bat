@echo off
REM ============================================================
REM  Tracer Fraud Detection - one-click launcher (Windows)
REM  Starts MySQL, the Flask backend, and the React frontend.
REM ============================================================

echo.
echo [1/3] Starting MySQL (XAMPP)...
tasklist /FI "IMAGENAME eq mysqld.exe" | find /I "mysqld.exe" >nul
if errorlevel 1 (
  start "MySQL" /min "C:\xampp\mysql\bin\mysqld.exe" --defaults-file=C:\xampp\mysql\bin\my.ini
  echo     MySQL launched.
) else (
  echo     MySQL already running.
)
timeout /t 5 /nobreak >nul

echo [2/3] Starting Flask backend on http://localhost:5000 ...
start "Tracer Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe run.py"
timeout /t 3 /nobreak >nul

echo [3/3] Starting React frontend on http://localhost:5173 ...
start "Tracer Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo All three services starting. Give it ~10 seconds, then open:
echo     http://localhost:5173
echo.
echo Login:  admin / admin123    or    analyst / analyst123
echo Close the two black terminal windows to stop the app.
echo.
pause
