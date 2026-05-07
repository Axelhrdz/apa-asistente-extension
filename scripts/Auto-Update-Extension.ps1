# Auto-update script for APA Asistente Chrome Extension (Windows)
# This script pulls latest changes from the docker branch and notifies if updated

# Allow continuing on errors since git outputs progress to stderr
$ErrorActionPreference = "Continue"
$WarningPreference = "SilentlyContinue"

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

# Function to run git commands and check exit code
function Invoke-GitCommand {
    param([string]$Command)
    $gitPath = (Get-Command git).Source
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $gitPath
    $psi.Arguments = $Command
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.WorkingDirectory = $REPO_DIR
    
    $process = [System.Diagnostics.Process]::Start($psi)
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    
    return @{ ExitCode = $process.ExitCode; StdOut = $stdout; StdErr = $stderr }
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
    $checkResult = Invoke-GitCommand "rev-parse --git-dir"
    if ($checkResult.ExitCode -ne 0) {
        Write-Log "ERROR: Not a git repository: $REPO_DIR"
        exit 1
    }

    # Fetch latest changes without merging
    Write-Log "Fetching latest changes from origin/$BRANCH..."
    $fetchResult = Invoke-GitCommand "fetch origin $BRANCH"
    
    if ($fetchResult.ExitCode -ne 0) {
        Write-Log "ERROR: Failed to fetch from origin. Exit code: $($fetchResult.ExitCode)"
        if ($fetchResult.StdErr) {
            Write-Log "Error: $($fetchResult.StdErr)"
        }
        exit 1
    }

    # Check if there are new commits
    $localResult = Invoke-GitCommand "rev-parse HEAD"
    $remoteResult = Invoke-GitCommand "rev-parse origin/$BRANCH"
    
    $localHash = $localResult.StdOut.Trim()
    $remoteHash = $remoteResult.StdOut.Trim()

    if ($localHash -eq $remoteHash) {
        Write-Log "Already up to date (commit: $($localHash.Substring(0,7)))"
        exit 0
    }

    # Get commit info
    $logResult = Invoke-GitCommand "log --oneline origin/$BRANCH -1"
    $countResult = Invoke-GitCommand "rev-list --count HEAD..origin/$BRANCH"
    
    $commitMsg = $logResult.StdOut.Trim()
    $newCommits = $countResult.StdOut.Trim()

    Write-Log "Update available: $newCommits new commit(s)"
    Write-Log "Latest: $commitMsg"

    # Pull the changes
    Write-Log "Pulling updates..."
    $pullResult = Invoke-GitCommand "pull origin $BRANCH"
    
    if ($pullResult.ExitCode -eq 0) {
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
        if ($pullResult.StdErr) {
            Write-Log "Error details: $($pullResult.StdErr)"
        }
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
