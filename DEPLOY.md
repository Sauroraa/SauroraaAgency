# VPS Deployment (Docker, Auto Secrets, HTTPS)

## 1. Prepare server

```bash
sudo mkdir -p /var/www/agency.sauroraa.be
cd /var/www/agency.sauroraa.be
sudo git clone https://github.com/Sauroraa/SauroraaAgency.git .
```

Install Docker + Compose plugin if missing.

## 2. Run one-command deployment

```bash
cd /var/www/agency.sauroraa.be
sudo chmod +x scripts/deploy-vps.sh
sudo APP_DIR=/var/www/agency.sauroraa.be \
  ROOT_DOMAIN=sauroraa.be \
  AGENCY_DOMAIN=agency.sauroraa.be \
  LETSENCRYPT_EMAIL=admin@sauroraa.be \
  bash scripts/deploy-vps.sh
```

This will:
- Generate `.env` automatically with strong random secrets.
- Start Docker stack in production mode.
- Request Let's Encrypt certificates.
- Switch nginx from HTTP to HTTPS config.
- Reload nginx and finalize services.

## 3. Daily operations

```bash
make prod-logs
make prod-up
make prod-down
```

## 4. Important

- Point DNS `A` records for both `sauroraa.be` and `agency.sauroraa.be` to your VPS IP before running deploy.
- Configure real SMTP values in `.env` after first deploy.
