.PHONY: help dev-up dev-down dev-logs dev-shell prod-up prod-down prod-logs prod-shell clean

# Default target
help: ## Show this help message
	@echo "Cooking API - Available commands:"
	@echo ""
	@echo "🔧 Development Commands:"
	@grep -E '^dev-.*:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "🚀 Production Commands:"
	@grep -E '^prod-.*:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "🧹 Utility Commands:"
	@grep -E '^(clean|db-|test-).*:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# =============================================================================
# 🔧 DEVELOPMENT ENVIRONMENT
# =============================================================================

dev-up: ## Start development environment with hot reload
	docker-compose -f docker-compose.dev.yaml up -d
	@echo "🔧 Development server starting at http://localhost:3000"
	@echo "📊 Health check: http://localhost:3000/health"

dev-down: ## Stop development environment
	docker-compose -f docker-compose.dev.yaml down

dev-logs: ## View development logs
	docker-compose -f docker-compose.dev.yaml logs -f api-dev

dev-shell: ## Access development container shell
	docker-compose -f docker-compose.dev.yaml exec api-dev sh

dev-restart: ## Restart development services
	docker-compose -f docker-compose.dev.yaml restart api-dev

dev-rebuild: ## Rebuild and restart development environment
	docker-compose -f docker-compose.dev.yaml down
	docker-compose -f docker-compose.dev.yaml build --no-cache api-dev
	docker-compose -f docker-compose.dev.yaml up -d

# =============================================================================
# 🚀 PRODUCTION ENVIRONMENT  
# =============================================================================

prod-up: ## Start production environment
	docker-compose --profile production up -d
	@echo "🚀 Production server starting at http://localhost:3000"

prod-down: ## Stop production environment
	docker-compose --profile production down

prod-logs: ## View production logs
	docker-compose logs -f api

prod-shell: ## Access production container shell
	docker-compose exec api sh

prod-restart: ## Restart production services
	docker-compose --profile production restart api

prod-rebuild: ## Rebuild and restart production environment
	docker-compose --profile production down
	docker-compose build --no-cache api
	docker-compose --profile production up -d

# =============================================================================
# 🧹 UTILITY COMMANDS
# =============================================================================

clean: ## Clean up Docker resources
	docker-compose -f docker-compose.dev.yaml down -v --remove-orphans
	docker-compose --profile production down -v --remove-orphans
	docker system prune -f
	@echo "🧹 Cleaned up Docker resources"

db-migrate: ## Run database migrations (development)
	docker-compose -f docker-compose.dev.yaml exec api-dev npm run db:migrate

db-generate: ## Generate Prisma client (development)
	docker-compose -f docker-compose.dev.yaml exec api-dev npm run db:generate

db-seed: ## Seed database with sample data (development)
	docker-compose -f docker-compose.dev.yaml exec api-dev npm run db:seed

db-studio: ## Open Prisma Studio (development)
	docker-compose -f docker-compose.dev.yaml exec api-dev npm run db:studio

test-unit: ## Run unit tests (development)
	docker-compose -f docker-compose.dev.yaml exec api-dev npm test

test-watch: ## Run tests in watch mode (development)
	docker-compose -f docker-compose.dev.yaml exec api-dev npm run test:watch

test-coverage: ## Run tests with coverage (development)
	docker-compose -f docker-compose.dev.yaml exec api-dev npm run test:coverage


