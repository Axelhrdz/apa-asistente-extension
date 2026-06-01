@echo off
:: Install script for APA Asistente auto-updater on Windows (CMD version)
:: Run this on each Windows machine where you want auto-updates

echo === APA Asistente Auto-Updater Installer (CMD Version) ===
echo.
echo This will install a scheduled task that checks for updates
echo every 15 minutes using only CMD (no PowerShell needed).
echo.

:: Get the script directory
set "SCRIPT_DIR=%~dp0"
set "BAT_SCRIPT=%SCRIPT_DIR%auto-update.bat"
set "REPO_DIR=%SCRIPT_DIR%.."
set "TASK_NAME=APA-Asistente-AutoUpdate"

:: Check if batch script exists
if not exist "%BAT_SCRIPT%" (
    echo ERROR: auto-update.bat not found at %BAT_SCRIPT%
    pause
    exit /b 1
)

:: Check if running as admin
net session >nul 2>nul
if %errorlevel% neq 0 (
    echo This script requires administrator privileges to create a scheduled task.
    echo Please run this batch file as Administrator (right-click -^> Run as administrator).
    pause
    exit /b 1
)

echo [+] Batch script found: %BAT_SCRIPT%
echo.

:: Delete existing task if it exists
schtasks /query /tn "%TASK_NAME%" >nul 2>nul
if %errorlevel% equ 0 (
    echo [-] Removing existing scheduled task...
    schtasks /delete /tn "%TASK_NAME%" /f >nul 2>nul
)

:: Create the scheduled task using cmd /c (completely hidden, no window)
:: Using cmd /c ensures no PowerShell execution policy issues
echo [+] Creating scheduled task (runs every 15 minutes, completely hidden)...
schtasks /create /tn "%TASK_NAME%" /tr "cmd.exe /c ""%BAT_SCRIPT%\""" /sc minute /mo 15 /f >nul 2>nul

if %errorlevel% neq 0 (
    echo ERROR: Failed to create scheduled task.
    pause
    exit /b 1
)

echo [+] Scheduled task created successfully!
echo.

:: Run initial check (visible to verify it works)
echo === Running initial check ===
call "%BAT_SCRIPT%"

echo.
echo === Installation Complete ===
echo.
echo The updater will:
echo   - Check for updates every 15 minutes (completely hidden)
echo   - Pull automatically when new commits are available
echo   - Show a Windows notification (msg) when updated
echo.
echo To manually check: %BAT_SCRIPT%
echo To uninstall: schtasks /delete /tn "%TASK_NAME%" /f
echo To view logs: type "%REPO_DIR%\.auto-update.log"
echo.
pause
