@echo off
echo 🔥 Running Smoke Tests on BlueZone API...
echo.

REM Check if containers are running
docker compose -f docker-compose.dev.yml ps | findstr "Up" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Docker containers not running. Starting them...
    docker compose -f docker-compose.dev.yml up -d
    echo ⏳ Waiting 15 seconds for services to start...
    timeout /t 15 /nobreak >nul
)

REM Run the tests
echo 📊 Running endpoint tests...
docker compose -f docker-compose.dev.yml exec -T api node test-all-endpoints.js

echo.
echo ✅ Smoke test complete!
echo.
