@echo off
:: Install script for APA Asistente auto-updater on Windows
:: Run this on each Windows machine where you want auto-updates

echo === APA Asistente Auto-Updater Installer ===
echo.
echo This will install a scheduled task that checks for updates
echo every 15 minutes and notifies you when new code is available.
echo.

:: Get the script directory
set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%Auto-Update-Extension.ps1"
set "REPO_DIR=%SCRIPT_DIR%.."
set "TASK_NAME=APA-Asistente-AutoUpdate"

:: Check for PowerShell
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PowerShell is required but not found.
    pause
    exit /b 1
)

:: Check if running as admin (required for creating scheduled tasks)
net session >nul 2>nul
if %errorlevel% neq 0 (
    echo This script requires administrator privileges to create a scheduled task.
    echo Please run this batch file as Administrator (right-click -^> Run as administrator).
    pause
    exit /b 1
)

echo [+] PowerShell script found: %PS_SCRIPT%
echo.

:: Delete existing task if it exists
schtasks /query /tn "%TASK_NAME%" >nul 2>nul
if %errorlevel% equ 0 (
    echo [-] Removing existing scheduled task...
    schtasks /delete /tn "%TASK_NAME%" /f >nul 2>nul
)

:: Create the scheduled task to run every 15 minutes
echo [+] Creating scheduled task (runs every 15 minutes)...
schtasks /create /tn "%TASK_NAME%" /tr "powershell.exe -ExecutionPolicy Bypass -File \"%PS_SCRIPT%\"" /sc minute /mo 15 /rl HIGHEST /ru SYSTEM /f >nul 2>nul

if %errorlevel% neq 0 (
    echo ERROR: Failed to create scheduled task. Trying alternative method...
    :: Try with current user instead of SYSTEM
    schtasks /create /tn "%TASK_NAME%" /tr "powershell.exe -ExecutionPolicy Bypass -File \"%PS_SCRIPT%\"" /sc minute /mo 15 /f >nul 2>nul
)

if %errorlevel% neq 0 (
    echo ERROR: Failed to create scheduled task.
    pause
    exit /b 1
)

echo [+] Scheduled task created successfully!
echo.
echo === Running initial check ===
powershell.exe -ExecutionPolicy Bypass -File "%PS_SCRIPT%"

echo.
echo === Installation Complete ===
echo.
echo The updater will:
echo   - Check for updates every 15 minutes
echo   - Pull automatically when new commits are available
echo   - Show a Windows notification when updated
echo.
echo To manually check: PowerShell -File "%PS_SCRIPT%"
echo To uninstall: schtasks /delete /tn "%TASK_NAME%" /f
echo To view logs: type "%REPO_DIR%\.auto-update.log"
echo.
pause
