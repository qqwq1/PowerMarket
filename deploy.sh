#!/usr/bin/env bash
set -euo pipefail

git fetch origin PowerMarketUpdate
git reset --hard origin/PowerMarketUpdate

docker compose down || docker-compose down || true
docker compose up -d --build || docker-compose up -d --build
