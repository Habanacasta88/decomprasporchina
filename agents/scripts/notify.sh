#!/usr/bin/env zsh
# Notification system for decomprasporchina agents
# Usage: bash agents/scripts/notify.sh "Agent Name" "Subject" "Message body"
#
# Channels:
#   1. Email → dtotvalles@gmail.com (via system mail/osascript)
#   2. Telegram → via Claude Code MCP (requires running inside claude session)
#   3. macOS notification → always

set -euo pipefail

AGENT_NAME="${1:-Agent}"
SUBJECT="${2:-Notificación}"
BODY="${3:-Sin mensaje}"
EMAIL="dtotvalles@gmail.com"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
PROJECT_DIR="/Users/yoelcastano/dev/Migraciones/decomprasporchina"
NOTIFY_LOG="$PROJECT_DIR/agents/reports/notifications.log"

# Full message
FULL_MSG="[$TIMESTAMP] $AGENT_NAME: $SUBJECT

$BODY

---
decomprasporchina.com | Agent System"

# 1. macOS notification (always works)
osascript -e "display notification \"$SUBJECT\" with title \"🤖 $AGENT_NAME\" subtitle \"decomprasporchina.com\"" 2>/dev/null || true

# 2. Email via python (uses system SMTP or saves for manual send)
python3 << PYEOF 2>/dev/null || echo "Email: saved to log only"
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Try to send via local mail
msg = MIMEMultipart()
msg['From'] = 'agents@decomprasporchina.com'
msg['To'] = '$EMAIL'
msg['Subject'] = '🤖 $AGENT_NAME: $SUBJECT'
msg.attach(MIMEText("""$BODY

---
Timestamp: $TIMESTAMP
Agent: $AGENT_NAME
Site: decomprasporchina.com
""", 'plain'))

# Save email content to file for Claude Code to pick up and send via Gmail MCP
email_file = os.path.join('$PROJECT_DIR', 'agents', 'state', 'pending-email.json')
import json
with open(email_file, 'w') as f:
    json.dump({
        'to': '$EMAIL',
        'subject': '🤖 $AGENT_NAME: $SUBJECT',
        'body': """$BODY""",
        'timestamp': '$TIMESTAMP',
        'agent': '$AGENT_NAME'
    }, f, ensure_ascii=False)
print("Email: queued for Gmail MCP")
PYEOF

# 3. Log
echo "$FULL_MSG" >> "$NOTIFY_LOG"
echo "Notification sent: $AGENT_NAME → $SUBJECT"
