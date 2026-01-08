@echo off
echo Football Manager 5v5 - Web API
echo ================================

:: Check if virtual environment exists
if not exist ".venv\" (
    echo Creating virtual environment...
    py -m venv .venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        echo Make sure Python is installed and available in PATH
        pause
        exit /b 1
    )
)

:: Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate.bat

:: Install dependencies if requirements.txt exists and venv is fresh
if exist "requirements.txt" (
    echo Installing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    echo DB_HOST=localhost > .env
    echo DB_PORT=3306 >> .env
    echo DB_NAME=foot5 >> .env
    echo DB_USER=root >> .env
    echo DB_PASSWORD= >> .env
    echo JWT_SECRET_KEY=your-secret-key-here-change-in-production >> .env
    echo JWT_ALGORITHM=HS256 >> .env
    echo JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30 >> .env
    echo.
    echo ⚠️  Please edit .env file with your database credentials!
    echo.
)

:: Start the API server
echo Starting Football Manager 5v5 API...
echo API will be available at: http://localhost:8000
echo Documentation at: http://localhost:8000/docs
echo.
py -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause