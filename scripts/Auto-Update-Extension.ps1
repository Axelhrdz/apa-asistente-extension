# Auto-update script for APA Asistente Chrome Extension (Windows)
# This script pulls latest changes from the docker branch and notifies if updated

$ErrorActionPreference = "Stop"

# Configuration
$SCRIPT_DIR = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$REPO_DIR = Split-Path -Parent $SCRIPT_DIR
$BRANCH = "docker"
$EXTENSION_DIR = Join-Path $REPO_DIR "extension"
$LOG_FILE = Join-Path $REPO_DIR ".auto-update.log"
$LOCK_FILE = Join-Path $REPO_DIR ".auto-update.lock"

# Function to log messages with timestamp
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Host $logEntry
    try {
        Add-Content -Path $LOG_FILE -Value $logEntry -ErrorAction SilentlyContinue
    } catch {}
}

# Prevent concurrent runs
if (Test-Path $LOCK_FILE) {
    try {
        $lockPid = Get-Content $LOCK_FILE -ErrorAction SilentlyContinue
        if ($lockPid) {
            $process = Get-Process -Id $lockPid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Log "Update already in progress (PID: $lockPid). Exiting."
                exit 0
            }
        }
    } catch {}
}

$PID | Set-Content $LOCK_FILE

try {
    Set-Location $REPO_DIR

    # Check if we're in a git repo
    try {
        $null = git rev-parse --git-dir 2>$null
        if ($LASTEXITCODE -ne 0) { throw }
    } catch {
        Write-Log "ERROR: Not a git repository: $REPO_DIR"
        exit 1
    }

    # Fetch latest changes without merging
    Write-Log "Fetching latest changes from origin/$BRANCH..."
    
    # Redirect stderr to null to avoid error messages from git progress output
    $fetchOutput = git fetch origin $BRANCH 2>&1
    $fetchExitCode = $LASTEXITCODE
    
    if ($fetchExitCode -ne 0) {
        Write-Log "ERROR: Failed to fetch from origin. Exit code: $fetchExitCode"
        if ($fetchOutput) {
            Write-Log "Output: $fetchOutput"
        }
        exit 1
    }

    # Check if there are new commits
    $localHash = git rev-parse HEAD 2>$null
    $remoteHash = git rev-parse "origin/$BRANCH" 2>$null

    if ($localHash -eq $remoteHash) {
        Write-Log "Already up to date (commit: $($localHash.Substring(0,7)))"
        exit 0
    }

    # Get commit info
    $commitMsg = git log --oneline "origin/$BRANCH" -1 2>$null
    $newCommits = git rev-list --count "HEAD..origin/$BRANCH" 2>$null

    Write-Log "Update available: $newCommits new commit(s)"
    Write-Log "Latest: $commitMsg"

    # Pull the changes
    Write-Log "Pulling updates..."
    $pullOutput = git pull origin $BRANCH 2>&1
    $pullExitCode = $LASTEXITCODE
    
    if ($pullExitCode -eq 0) {
        Write-Log "Successfully updated to: $($remoteHash.Substring(0,7))"
        
        # Windows notification
        $notificationTitle = "APA Asistente Updated"
        $notificationText = "Extension updated to $($remoteHash.Substring(0,7)). Open chrome://extensions and reload APA Asistente."
        
        try {
            # Try BurntToast module if available
            if (Get-Module -ListAvailable -Name BurntToast -ErrorAction SilentlyContinue) {
                New-BurntToastNotification -Text $notificationTitle, $notificationText -ErrorAction SilentlyContinue
            } else {
                # Fallback to Windows Forms notification
                Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
                $balloon = New-Object System.Windows.Forms.NotifyIcon -ErrorAction SilentlyContinue
                if ($balloon) {
                    $balloon.Icon = [System.Drawing.SystemIcons]::Information
                    $balloon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
                    $balloon.BalloonTipText = $notificationText
                    $balloon.BalloonTipTitle = $notificationTitle
                    $balloon.Visible = $true
                    $balloon.ShowBalloonTip(5000)
                    Start-Sleep -Seconds 6
                    $balloon.Dispose()
                }
            }
        } catch {
            # Silently fail if notification doesn't work
        }
        
        # Store the new hash
        $remoteHash | Set-Content (Join-Path $REPO_DIR ".last-updated-hash") -ErrorAction SilentlyContinue
    } else {
        Write-Log "ERROR: Pull failed. There may be conflicts."
        try {
            msg * /TIME:5 "APA Asistente Update Error: Update failed - check for conflicts." 2>$null
        } catch {}
        exit 1
    }
} finally {
    # Clean up lock file
    if (Test-Path $LOCK_FILE) {
        Remove-Item $LOCK_FILE -Force -ErrorAction SilentlyContinue
    }
}
