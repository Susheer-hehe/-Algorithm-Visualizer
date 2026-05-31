@echo off
echo ===================================================
echo   Algorithm Visualizer - Starting...
echo ===================================================
echo.

:: Compile the C++ backend if needed
echo [1/3] Compiling C++ backend...
cd /d "%~dp0backend"
g++ -std=c++17 -O2 -o server.exe main.cpp -lws2_32 -lwsock32
if errorlevel 1 (
    echo ERROR: Compilation failed!
    pause
    exit /b 1
)
echo       Done!
echo.

:: Start C++ backend in a new window
echo [2/3] Starting C++ backend on port 8080...
start "C++ Backend" cmd /k "cd /d %~dp0backend && server.exe"

:: Wait a moment for backend to start
timeout /t 2 /nobreak > nul

:: Start React frontend in a new window
echo [3/3] Starting React frontend on port 5173...
start "React Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait for frontend to start then open browser
timeout /t 3 /nobreak > nul
echo.
echo ===================================================
echo   Opening browser...
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8080
echo ===================================================
start http://localhost:5173
