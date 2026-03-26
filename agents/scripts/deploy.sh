#!/usr/bin/env zsh
set -euo pipefail

PROJECT_DIR="/Users/yoelcastano/dev/Migraciones/decomprasporchina"
VPS="root@168.119.125.218"
IMAGE="decomprasporchina:latest"
CONTAINER="decomprasporchina"
DEPLOY_LOCK="$PROJECT_DIR/agents/state/deploy-lock"
LAST_DEPLOY="$PROJECT_DIR/agents/state/last-deploy.json"
DOMAIN="https://decomprasporchina.com"

cd "$PROJECT_DIR"

# Guard: content write lock
if [[ -f "$PROJECT_DIR/agents/state/content-write-lock" ]]; then
  echo "ERROR: content-write-lock exists. A content agent is writing. Aborting."
  exit 1
fi

# Set deploy lock
echo "PID=$$ STARTED=$(date -u +%Y-%m-%dT%H:%M:%SZ) AGENT=deploy-bot" > "$DEPLOY_LOCK"
trap "rm -f '$DEPLOY_LOCK'" EXIT

echo "==> Phase 1: Local build"
START_TIME=$SECONDS
source ~/.nvm/nvm.sh && nvm use 22
npx astro build 2>&1 | tail -20
BUILD_TIME=$((SECONDS - START_TIME))
echo "Build completed in ${BUILD_TIME}s"

echo "==> Phase 2: Docker build (linux/amd64)"
docker buildx build --platform linux/amd64 -t "$IMAGE" --load . 2>&1 | tail -10

echo "==> Phase 3: Transfer to VPS"
docker save "$IMAGE" | ssh -o Compression=no "$VPS" "docker load"

echo "==> Phase 4: Restart container"
ssh "$VPS" "
  docker stop $CONTAINER 2>/dev/null || true
  docker rm $CONTAINER 2>/dev/null || true
  docker run -d \
    --name $CONTAINER \
    --restart unless-stopped \
    --network coolify \
    -l 'traefik.enable=true' \
    -l 'traefik.http.routers.decomprasporchina.rule=Host(\`decomprasporchina.com\`) || Host(\`www.decomprasporchina.com\`)' \
    -l 'traefik.http.routers.decomprasporchina.entrypoints=https' \
    -l 'traefik.http.routers.decomprasporchina.tls=true' \
    -l 'traefik.http.routers.decomprasporchina.tls.certresolver=letsencrypt' \
    -l 'traefik.http.services.decomprasporchina.loadbalancer.server.port=80' \
    $IMAGE
"

echo "==> Phase 5: Post-deploy verification"
sleep 5
HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" --max-time 15 "$DOMAIN/" || echo "FAILED")
RESPONSE_MS=$(curl -o /dev/null -s -w "%{time_total}" --max-time 15 "$DOMAIN/" | awk '{printf "%.0f\n", $1*1000}' || echo "0")

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "CRITICAL: Post-deploy check failed — HTTP $HTTP_CODE"
  ssh "$VPS" "docker logs $CONTAINER --tail 30"
  exit 1
fi

echo "Post-deploy: HTTP $HTTP_CODE, ${RESPONSE_MS}ms — OK"

# Count posts
POST_COUNT=$(node -e "const p=require('./src/data/posts.json'); console.log(p.length)" 2>/dev/null || echo "unknown")

# Write state
cat > "$LAST_DEPLOY" <<EOF
{
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "method": "docker-manual",
  "imageTag": "$IMAGE",
  "postsCount": $POST_COUNT,
  "buildTimeSeconds": $BUILD_TIME,
  "postDeployStatus": "ok",
  "responseTimeMs": $RESPONSE_MS
}
EOF

echo "==> Deploy complete. $POST_COUNT posts live."
