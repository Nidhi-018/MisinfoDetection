.PHONY: up down build test test-gateway test-ml clean

# Start all services
up:
	docker-compose up --build

# Start services in background
up-d:
	docker-compose up -d --build

# Stop all services
down:
	docker-compose down

# Build images
build:
	docker-compose build

# Run all tests
test: test-gateway test-ml

# Run gateway tests
test-gateway:
	cd gateway && npm test

# Run ML service tests
test-ml:
	cd ml_service && pytest tests/ -v

# Clean up
clean:
	docker-compose down -v
	rm -rf gateway/node_modules gateway/uploads/* gateway/data/*.json
	rm -rf ml_service/__pycache__ ml_service/**/__pycache__

# Install gateway dependencies
install-gateway:
	cd gateway && npm install

# Install ML service dependencies
install-ml:
	cd ml_service && pip install -r requirements.txt

# Run gateway locally (requires ML service running)
run-gateway:
	cd gateway && npm start

# Run ML service locally
run-ml:
	cd ml_service && python app.py

