@echo off
echo ================================================
echo   House Price Prediction - Integrated App
echo ================================================
echo.
echo Building frontend...
cd /d "%~dp0frontend"
call npm run build

echo.
echo Starting integrated server...
cd /d "%~dp0backend"
python app.py

echo.
echo Server stopped.
pause
