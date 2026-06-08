#!/bin/bash
# VPS-side monitoring script for decomprasporchina.com
# Runs as cron job on the VPS itself (no SSH needed)
# Install: copy to /home/deploy/monitor.sh + add cron entry
set -euo pipefail

DOMAIN="https://decomprasporchina.com"
CONTAINER="decomprasporchina"
LOG_FILE="/home/deploy/monitor.log"
ALERT_FILE="/home/deploy/monitor-alert.log"
MAX_RESPONSE_MS=3000
MAX_LOG_SIZE=1048576  # 1MB

# Rotate log if too large
if [[ -f "$LOG_FILE" ]] && [[ $(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt $MAX_LOG_SIZE ]]; then
  mv "$LOG_FILE" "${LOG_FILE}.old"
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ALERTS=""

# 1. Container check
CONTAINER_STATUS=$(docker ps --filter "name=$CONTAINER" --format '{{.Status}}' 2>/dev/null || echo "DOCKER_ERROR")
if [[ -z "$CONTAINER_STATUS" ]]; then
  ALERTS="${ALERTS}CRITICAL: Container $CONTAINER not running\n"
  # Auto-restart attempt
  docker start "$CONTAINER" 2>/dev/null && ALERTS="${ALERTS}INFO: Auto-restart attempted\n"
fi

# 2. HTTP check
HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$DOMAIN/" 2>/dev/null || echo "TIMEOUT")
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" --max-time 10 "$DOMAIN/" 2>/dev/null || echo "0")
RESPONSE_MS=$(echo "$RESPONSE_TIME" | awk '{printf "%.0f", $1*1000}')

if [[ "$HTTP_CODE" != "200" ]]; then
  ALERTS="${ALERTS}CRITICAL: HTTP $HTTP_CODE on homepage\n"
fi

if [[ "$RESPONSE_MS" -gt "$MAX_RESPONSE_MS" ]]; then
  ALERTS="${ALERTS}WARNING: Slow response ${RESPONSE_MS}ms (threshold: ${MAX_RESPONSE_MS}ms)\n"
fi

# 3. Golden page check (most important page)
GOLDEN_CODE=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$DOMAIN/escoger-tu-talla-ropa-china/" 2>/dev/null || echo "TIMEOUT")
if [[ "$GOLDEN_CODE" != "200" ]]; then
  ALERTS="${ALERTS}CRITICAL: Golden page HTTP $GOLDEN_CODE\n"
fi

# 4. Disk space check
DISK_USAGE=$(df / --output=pcent | tail -1 | tr -d ' %')
if [[ "$DISK_USAGE" -gt 85 ]]; then
  ALERTS="${ALERTS}WARNING: Disk usage at ${DISK_USAGE}%\n"
  # Auto-cleanup old Docker images
  docker image prune -f --filter "until=168h" >/dev/null 2>&1 || true
fi

# 5. Docker disk usage
DOCKER_DISK=$(docker system df --format '{{.Size}}' 2>/dev/null | head -1 || echo "unknown")

# 6. Memory check
MEM_AVAILABLE=$(free -m | awk '/^Mem:/{print $7}')
if [[ "$MEM_AVAILABLE" -lt 200 ]]; then
  ALERTS="${ALERTS}WARNING: Low memory — ${MEM_AVAILABLE}MB available\n"
fi

# Log result
STATUS="OK"
if [[ -n "$ALERTS" ]]; then
  STATUS="ALERT"
  echo -e "[$TIMESTAMP] $ALERTS" >> "$ALERT_FILE"
fi

echo "[$TIMESTAMP] status=$STATUS http=$HTTP_CODE time=${RESPONSE_MS}ms golden=$GOLDEN_CODE disk=${DISK_USAGE}% mem=${MEM_AVAILABLE}MB container=$CONTAINER_STATUS" >> "$LOG_FILE"

# Output for cron mail (only on alerts)
if [[ -n "$ALERTS" ]]; then
  echo "=== DECOMPRASPORCHINA MONITOR ALERT ==="
  echo "Time: $TIMESTAMP"
  echo -e "$ALERTS"
  echo "Container: $CONTAINER_STATUS"
  echo "HTTP: $HTTP_CODE (${RESPONSE_MS}ms)"
  echo "Disk: ${DISK_USAGE}%"
  echo "Memory: ${MEM_AVAILABLE}MB available"
fi
