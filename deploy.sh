#!/usr/bin/env bash
set -euo pipefail

git fetch origin master
git reset --hard origin/master

docker compose down || docker-compose down || true
docker compose up -d --build || docker-compose up -d --build
