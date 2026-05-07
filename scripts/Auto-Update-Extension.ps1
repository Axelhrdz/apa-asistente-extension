# Auto-update script for APA Asistente Chrome Extension (Windows)
# This script pulls latest changes from the docker branch and notifies if updated

$ErrorActionPreference = "Stop"

# Configuration
$RepoDir = $PSScriptRoot | Split-Path
$Branch = "docker"
$ExtensionDir = Join-Path $RepoDir "extension"
$LogFile = Join-Path $RepoDir ".auto-update.log"
$LockFile = Join-Path $RepoDir ".auto-update.lock"

# Function to log messages with timestamp
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Host $logEntry
    Add-Content -Path $LogFile -Value $logEntry -ErrorAction SilentlyContinue
}

# Prevent concurrent runs
if (Test-Path $LockFile) {
    try {
        $lockPid = Get-Content $LockFile -ErrorAction SilentlyContinue
        if ($lockPid) {
            $process = Get-Process -Id $lockPid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Log "Update already in progress (PID: $lockPid). Exiting."
                exit 0
            }
        }
    } catch {}
}

$PID | Set-Content $LockFile

try {
    Set-Location $RepoDir

    # Check if we're in a git repo
    try {
        $null = git rev-parse --git-dir 2>$null
    } catch {
        Write-Log "ERROR: Not a git repository: $RepoDir"
        exit 1
    }

    # Fetch latest changes without merging
    Write-Log "Fetching latest changes from origin/$Branch..."
    $fetchOutput = git fetch origin $Branch 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Log "ERROR: Failed to fetch from origin: $fetchOutput"
        exit 1
    }

    # Check if there are new commits
    $localHash = git rev-parse HEAD
    $remoteHash = git rev-parse "origin/$Branch"

    if ($localHash -eq $remoteHash) {
        Write-Log "Already up to date (commit: $($localHash.Substring(0,7)))"
        exit 0
    }

    # Get commit info
    $commitMsg = git log --oneline "origin/$Branch" -1
    $newCommits = (git rev-list --count "HEAD..origin/$Branch") 

    Write-Log "Update available: $newCommits new commit(s)"
    Write-Log "Latest: $commitMsg"

    # Pull the changes
    Write-Log "Pulling updates..."
    $pullOutput = git pull origin $Branch 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Successfully updated to: $($remoteHash.Substring(0,7))"
        
        # Windows notification using PowerShell's BurntToast or fallback to msg
        $notificationTitle = "APA Asistente Updated"
        $notificationText = "Extension updated to $($remoteHash.Substring(0,7)). Open chrome://extensions and reload APA Asistente."
        
        try {
            # Try BurntToast module if available
            if (Get-Module -ListAvailable -Name BurntToast -ErrorAction SilentlyContinue) {
                New-BurntToastNotification -Text $notificationTitle, $notificationText
            } else {
                # Fallback to Windows Forms notification
                Add-Type -AssemblyName System.Windows.Forms
                $global:balloon = New-Object System.Windows.Forms.NotifyIcon
                $path = (Get-Process -id $pid).Path
                $balloon.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon($path)
                $balloon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
                $balloon.BalloonTipText = $notificationText
                $balloon.BalloonTipTitle = $notificationTitle
                $balloon.Visible = $true
                $balloon.ShowBalloonTip(5000)
            }
        } catch {
            # Final fallback: msg command (shows in console but at least notifies)
            msg * /TIME:5 "$notificationTitle - $notificationText" 2>$null
        }
        
        # Store the new hash
        $remoteHash | Set-Content (Join-Path $RepoDir ".last-updated-hash")
    } else {
        Write-Log "ERROR: Pull failed. There may be conflicts."
        msg * /TIME:5 "APA Asistente Update Error: Update failed - check for conflicts." 2>$null
        exit 1
    }
} finally {
    # Clean up lock file
    if (Test-Path $LockFile) {
        Remove-Item $LockFile -Force
    }
}
