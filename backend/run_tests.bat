@echo off
echo Football Manager 5v5 - API Tests
echo =================================

:: Activate virtual environment
if exist ".venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
)

echo.
echo Select test to run:
echo 1. Test business logic only
echo 2. Test full API (requires server running)
echo 3. Test both
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Running business logic tests...
    py test_logic.py
    goto end
)

if "%choice%"=="2" (
    echo Running API tests...
    echo Make sure the API server is running on http://localhost:8000
    pause
    py test_api.py
    goto end
)

if "%choice%"=="3" (
    echo Running business logic tests...
    py test_logic.py
    echo.
    echo Running API tests...
    echo Make sure the API server is running on http://localhost:8000
    pause
    py test_api.py
    goto end
)

echo Invalid choice. Please select 1, 2, or 3.

:end
echo.
echo Tests completed!
pause