@echo off
:: Auto-update script for APA Asistente Chrome Extension (Windows CMD version)
:: This script pulls latest changes from the docker branch using only CMD

setlocal EnableDelayedExpansion

:: Configuration
set "SCRIPT_DIR=%~dp0"
set "REPO_DIR=%SCRIPT_DIR%.."
set "BRANCH=docker"
set "LOG_FILE=%REPO_DIR%\.auto-update.log"
set "LOCK_FILE=%REPO_DIR%\.auto-update.lock"

:: Change to repo directory
cd /d "%REPO_DIR%"

:: Check for lock file (prevent concurrent runs)
if exist "%LOCK_FILE%" (
    :: Check if process is still running
    for /f "tokens=*" %%a in ('type "%LOCK_FILE%" 2^>nul') do (
        tasklist /fi "pid eq %%a" 2>nul | find "%%a" >nul
        if !errorlevel! == 0 (
            call :log "Update already in progress (PID: %%a). Exiting."
            exit /b 0
        )
    )
)

:: Create lock file with current PID
echo %PID% > "%LOCK_FILE%"

:: Fetch latest changes
call :log "Fetching latest changes from origin/%BRANCH%..."

git fetch origin %BRANCH% >nul 2>&1
if errorlevel 1 (
    call :log "ERROR: Failed to fetch from origin"
    del "%LOCK_FILE%" 2>nul
    exit /b 1
)

:: Check if there are new commits
for /f "tokens=*" %%a in ('git rev-parse HEAD') do set "LOCAL_HASH=%%a"
for /f "tokens=*" %%a in ('git rev-parse origin/%BRANCH%') do set "REMOTE_HASH=%%a"

if "%LOCAL_HASH%"=="%REMOTE_HASH%" (
    call :log "Already up to date (commit: %LOCAL_HASH:~0,7%)"
    del "%LOCK_FILE%" 2>nul
    exit /b 0
)

:: Get commit info
for /f "tokens=*" %%a in ('git log --oneline origin/%BRANCH% -1') do set "COMMIT_MSG=%%a"
for /f "tokens=*" %%a in ('git rev-list --count HEAD..origin/%BRANCH%') do set "NEW_COMMITS=%%a"

call :log "Update available: %NEW_COMMITS% new commit(s)"
call :log "Latest: %COMMIT_MSG%"

:: Pull the changes
call :log "Pulling updates..."
git pull origin %BRANCH% >nul 2>&1
if errorlevel 1 (
    call :log "ERROR: Pull failed. There may be conflicts."
    :: Show notification
    msg * /TIME:10 "APA Asistente Update Error: Update failed - check for conflicts in %REPO_DIR%" 2>nul
    del "%LOCK_FILE%" 2>nul
    exit /b 1
)

call :log "Successfully updated to: %REMOTE_HASH:~0,7%"

:: Save the new hash
echo %REMOTE_HASH% > "%REPO_DIR%\.last-updated-hash"

:: Show notification
msg * /TIME:10 "APA Asistente Updated to %REMOTE_HASH:~0,7%. Open chrome://extensions and reload the extension." 2>nul

:: Clean up lock file
del "%LOCK_FILE%" 2>nul

exit /b 0

:: Function to log with timestamp
:log
echo [%date% %time%] %~1
>>"%LOG_FILE%" echo [%date% %time%] %~1
goto :eof
