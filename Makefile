# Makefile for managing docker compose tasks for powersync

# Target to run the development version of the docker compose
dev:
	docker-compose -f docker-compose.dev.yml up

# Target to run the local version of the docker compose
local:
	docker-compose -f docker-compose.local.yml up

# Target to run the production version of the docker compose
prod:
	docker-compose -f docker-compose.prod.yml up

# Target to stop all running docker compose services
stop:
	docker-compose down

# Target to build all docker compose services
build:
	docker-compose build

# Target to remove all docker compose services
clean:
	docker-compose down -v
