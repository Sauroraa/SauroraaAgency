.PHONY: dev up down build logs restart clean seed prod-up prod-down prod-logs prod-deploy

dev:
	cp -n .env.example .env 2>/dev/null || true
	docker-compose up --build

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build --no-cache

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

restart:
	docker-compose restart

clean:
	docker-compose down -v --remove-orphans

seed:
	docker-compose exec backend npm run seed

migrate:
	docker-compose exec backend npm run migration:run

shell-backend:
	docker-compose exec backend sh

shell-db:
	docker-compose exec mariadb mysql -u$(DB_USER) -p$(DB_PASSWORD) $(DB_NAME)

prod-up:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

prod-deploy:
	bash scripts/deploy-vps.sh
