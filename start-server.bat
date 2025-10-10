@echo off
REM Simple HTTP server starter for E2 MathsTyper (Windows)
REM This script starts a local web server so ES6 modules work properly

echo 🚀 Starting E2 MathsTyper local server...
echo.

set PORT=8000

REM Check if Python 3 is available
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Using Python HTTP server
    echo 📝 Open your browser to: http://localhost:%PORT%/index.html
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server %PORT%
    goto :end
)

REM Check if npx is available
where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Using npx serve
    echo 📝 Open your browser to: http://localhost:%PORT%/index.html
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    npx serve -l %PORT%
    goto :end
)

REM Check if PHP is available
where php >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Using PHP built-in server
    echo 📝 Open your browser to: http://localhost:%PORT%/index.html
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    php -S localhost:%PORT%
    goto :end
)

echo ❌ No suitable HTTP server found!
echo.
echo Please install one of the following:
echo   - Python 3: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo   - PHP: https://www.php.net/downloads

:end
pause

