#!/usr/bin/env zsh
set -euo pipefail

DOMAIN="https://decomprasporchina.com"
VPS="168.119.125.218"
CONTAINER="decomprasporchina"
PROJECT_DIR="/Users/yoelcastano/dev/Migraciones/decomprasporchina"
REPORT_DIR="$PROJECT_DIR/agents/reports/health"
STATE_FILE="$PROJECT_DIR/agents/state/site-health.json"
DATE=$(date +%Y-%m-%d)
REPORT_FILE="$REPORT_DIR/$DATE-health.md"

mkdir -p "$REPORT_DIR"

echo "# Site Health Report — $DATE" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 1. Container status
echo "## Container Status" >> "$REPORT_FILE"
CONTAINER_STATUS=$(ssh -o ConnectTimeout=10 root@$VPS "docker ps --filter name=$CONTAINER --format '{{.Status}}'" 2>/dev/null || echo "SSH_FAILED")
echo "- Container: $CONTAINER_STATUS" >> "$REPORT_FILE"

# 2. HTTP checks
echo "" >> "$REPORT_FILE"
echo "## HTTP Checks" >> "$REPORT_FILE"
HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$DOMAIN/" || echo "TIMEOUT")
RESPONSE_MS=$(curl -o /dev/null -s -w "%{time_total}" --max-time 10 "$DOMAIN/" 2>/dev/null | awk '{printf "%.0f\n", $1*1000}' || echo "0")
echo "- Homepage: HTTP $HTTP_CODE, ${RESPONSE_MS}ms" >> "$REPORT_FILE"

ERRORS=0
for SLUG in escoger-tu-talla-ropa-china blog categoria/tiendas-chinas tallas-chinas-a-peruanas nuevo-arancel-compras-china-2026; do
  CODE=$(curl -o /dev/null -s -w "%{http_code}" --max-time 8 "$DOMAIN/$SLUG/" || echo "TIMEOUT")
  echo "- /$SLUG/: HTTP $CODE" >> "$REPORT_FILE"
  [[ "$CODE" != "200" ]] && ERRORS=$((ERRORS + 1))
done

# 3. SSL expiry
echo "" >> "$REPORT_FILE"
echo "## SSL Certificate" >> "$REPORT_FILE"
SSL_EXPIRY=$(echo | openssl s_client -connect decomprasporchina.com:443 -servername decomprasporchina.com 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || echo "CHECK_FAILED")
echo "- Expiry: $SSL_EXPIRY" >> "$REPORT_FILE"

# 4. Sitemap
echo "" >> "$REPORT_FILE"
echo "## Sitemap" >> "$REPORT_FILE"
SITEMAP_CODE=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$DOMAIN/sitemap-index.xml" || echo "FAILED")
echo "- sitemap-index.xml: HTTP $SITEMAP_CODE" >> "$REPORT_FILE"

# 5. Summary
echo "" >> "$REPORT_FILE"
echo "## Summary" >> "$REPORT_FILE"
if [[ "$HTTP_CODE" == "200" && "$ERRORS" == "0" ]]; then
  echo "- **Status: ✅ HEALTHY**" >> "$REPORT_FILE"
else
  echo "- **Status: ⚠️ ISSUES DETECTED** ($ERRORS page errors)" >> "$REPORT_FILE"
fi

# Write state JSON
cat > "$STATE_FILE" <<EOF
{
  "lastChecked": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "containerStatus": "$CONTAINER_STATUS",
  "httpCode": "$HTTP_CODE",
  "responseTimeMs": $RESPONSE_MS,
  "sslExpiry": "$SSL_EXPIRY",
  "sitemapCode": "$SITEMAP_CODE",
  "pageErrors": $ERRORS
}
EOF

echo "Report: $REPORT_FILE"
cat "$REPORT_FILE"
