#!/bin/bash
# Install script for APA Asistente auto-updater (macOS)
# Run this on each Mac where you want auto-updates

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/auto-update-extension.sh"
PLIST_NAME="com.apaasistente.auto-update"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"
INTERVAL_MINUTES=15  # Check every 15 minutes - adjust as needed

echo "=== APA Asistente Auto-Updater Installer ==="
echo ""
echo "This will install a background agent that checks for updates"
echo "every $INTERVAL_MINUTES minutes and notifies you when new code is available."
echo ""

# Make script executable
chmod +x "$SCRIPT_PATH"
echo "✓ Made update script executable"

# Unload existing agent if present
if launchctl list 2>/dev/null | grep -q "$PLIST_NAME"; then
    echo "→ Stopping existing agent..."
    launchctl unload "$PLIST_PATH" 2>/dev/null || true
fi

# Create LaunchAgent plist file
cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$PLIST_NAME</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$SCRIPT_PATH</string>
    </array>
    
    <key>StartInterval</key>
    <integer>$((INTERVAL_MINUTES * 60))</integer>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>/tmp/apa-asistente-update.out</string>
    
    <key>StandardErrorPath</key>
    <string>/tmp/apa-asistente-update.err</string>
    
    <key>WorkingDirectory</key>
    <string>$REPO_DIR</string>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    </dict>
</dict>
</plist>
EOF

echo "✓ Created LaunchAgent at: $PLIST_PATH"

# Load the agent
launchctl load "$PLIST_PATH"
echo "✓ Agent loaded and scheduled (runs every $INTERVAL_MINUTES minutes)"

# Run once immediately to test
echo ""
echo "→ Running initial check..."
"$SCRIPT_PATH"

echo ""
echo "=== Installation Complete ==="
echo ""
echo "The updater will:"
echo "  • Check for updates every $INTERVAL_MINUTES minutes"
echo "  • Pull automatically when new commits are available"
echo "  • Send a macOS notification when updated"
echo ""
echo "To manually check: $SCRIPT_PATH"
echo "To uninstall: launchctl unload $PLIST_PATH && rm $PLIST_PATH"
echo ""
echo "Logs: tail -f $REPO_DIR/.auto-update.log"
