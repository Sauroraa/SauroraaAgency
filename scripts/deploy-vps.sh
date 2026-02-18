#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/agency.sauroraa.be}"
ROOT_DOMAIN="${ROOT_DOMAIN:-sauroraa.be}"
AGENCY_DOMAIN="${AGENCY_DOMAIN:-agency.sauroraa.be}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-admin@sauroraa.be}"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing required command: $1"; exit 1; }
}

require_cmd docker
require_cmd openssl
require_cmd sed

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is required (docker compose)."
  exit 1
fi

cd "$APP_DIR"

if [[ ! -f ".env" ]]; then
  echo "Generating .env with strong random secrets..."
  DB_PASSWORD="$(openssl rand -hex 24)"
  DB_ROOT_PASSWORD="$(openssl rand -hex 24)"
  REDIS_PASSWORD="$(openssl rand -hex 24)"
  MINIO_ACCESS_KEY="sauroraa$(openssl rand -hex 4)"
  MINIO_SECRET_KEY="$(openssl rand -hex 24)"
  JWT_ACCESS_SECRET="$(openssl rand -hex 48)"
  JWT_REFRESH_SECRET="$(openssl rand -hex 48)"
  JWT_PRESSKIT_SECRET="$(openssl rand -hex 48)"
  ADMIN_PASSWORD="$(openssl rand -base64 20 | tr -d '=+/' | cut -c1-20)"

  cat > .env <<EOF
# Database
DB_HOST=mariadb
DB_PORT=3306
DB_NAME=sauroraa
DB_USER=sauroraa
DB_PASSWORD=$DB_PASSWORD
DB_ROOT_PASSWORD=$DB_ROOT_PASSWORD

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY
MINIO_SECRET_KEY=$MINIO_SECRET_KEY
MINIO_BUCKET_ARTISTS=artists
MINIO_BUCKET_PRESSKITS=presskits
MINIO_BUCKET_BOOKINGS=bookings
MINIO_BUCKET_AVATARS=avatars

# JWT
JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRY=7d
JWT_PRESSKIT_SECRET=$JWT_PRESSKIT_SECRET

# Mail (configure with your provider)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=noreply@$ROOT_DOMAIN
MAIL_PASSWORD=change-me-mail-password
MAIL_FROM=Sauroraa <noreply@$ROOT_DOMAIN>

# App
APP_URL=https://$ROOT_DOMAIN
AGENCY_URL=https://$AGENCY_DOMAIN
API_URL=http://backend:3001
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=https://$AGENCY_DOMAIN/api
NEXT_PUBLIC_APP_URL=https://$ROOT_DOMAIN

# Admin seed
ADMIN_EMAIL=admin@$ROOT_DOMAIN
ADMIN_PASSWORD=$ADMIN_PASSWORD
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=Sauroraa

# TLS / deploy
LETSENCRYPT_EMAIL=$LETSENCRYPT_EMAIL
EOF

  echo ".env generated."
fi

echo "Preparing HTTP nginx config for ACME challenge..."
sed -e "s/__ROOT_DOMAIN__/$ROOT_DOMAIN/g" \
    -e "s/__AGENCY_DOMAIN__/$AGENCY_DOMAIN/g" \
    docker/nginx/conf.d/default.http.template.conf > docker/nginx/conf.d/default.conf

echo "Starting stack (HTTP phase)..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

echo "Requesting Let's Encrypt certificate..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$LETSENCRYPT_EMAIL" --agree-tos --no-eff-email \
  -d "$AGENCY_DOMAIN" -d "$ROOT_DOMAIN"

echo "Switching nginx to HTTPS config..."
sed -e "s/__ROOT_DOMAIN__/$ROOT_DOMAIN/g" \
    -e "s/__AGENCY_DOMAIN__/$AGENCY_DOMAIN/g" \
    docker/nginx/conf.d/default.https.template.conf > docker/nginx/conf.d/default.conf

docker compose -f docker-compose.yml -f docker-compose.prod.yml exec nginx nginx -s reload
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo "Deployment complete."
echo "URL public: https://$ROOT_DOMAIN"
echo "URL agency: https://$AGENCY_DOMAIN"
