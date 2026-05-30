@echo off
echo ===================================================
echo Starting Taskflow Full-Stack Application...
echo ===================================================
echo.
echo Launching Spring Boot Backend (Port 8082)...
start "Taskflow Backend" cmd /c "cd backend && mvn spring-boot:run"
echo.
echo Launching React Frontend (Port 5173)...
start "Taskflow Frontend" cmd /c "cd frontend && npm run dev"
echo.
echo ===================================================
echo Backend and Frontend have been launched!
echo.
echo Frontend Web UI: http://localhost:5173
echo Backend REST API: http://localhost:8082
echo ===================================================
pause
