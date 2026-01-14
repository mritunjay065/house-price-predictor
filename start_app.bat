@echo off
echo ================================================
echo   House Price Prediction - Starting Servers
echo ================================================
echo.

:: Start Backend
echo Starting Backend API on port 5000...
cd /d "%~dp0backend"
start "Backend API" cmd /k "python app.py"

:: Wait a moment for backend to start
timeout /t 3 /nobreak > nul

:: Start Frontend
echo Starting Frontend on port 5173...
cd /d "%~dp0frontend"
start "Frontend" cmd /k "set PATH=C:\Program Files\nodejs;%PATH% && npm run dev"

echo.
echo ================================================
echo   Servers Started!
echo ================================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo.
echo   Press any key to open the app in browser...
pause > nul
start http://localhost:5173
