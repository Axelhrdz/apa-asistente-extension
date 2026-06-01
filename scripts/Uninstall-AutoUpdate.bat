@echo off
:: Uninstall script for APA Asistente auto-updater on Windows

echo === APA Asistente Auto-Updater Uninstaller ===
echo.

set "TASK_NAME=APA-Asistente-AutoUpdate"

:: Check if running as admin
net session >nul 2>nul
if %errorlevel% neq 0 (
    echo This script requires administrator privileges to remove the scheduled task.
    echo Please run this batch file as Administrator (right-click -^> Run as administrator).
    pause
    exit /b 1
)

:: Check if task exists
schtasks /query /tn "%TASK_NAME%" >nul 2>nul
if %errorlevel% neq 0 (
    echo No scheduled task found with name: %TASK_NAME%
    echo.
    pause
    exit /b 0
)

echo Removing scheduled task: %TASK_NAME%
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>nul

if %errorlevel% equ 0 (
    echo [+] Scheduled task removed successfully.
) else (
    echo ERROR: Failed to remove scheduled task.
)

echo.
pause
