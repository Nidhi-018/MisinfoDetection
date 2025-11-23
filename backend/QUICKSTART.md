# Quick Start Guide

## Prerequisites

- Docker and Docker Compose installed
- OR Node.js 18+ and Python 3.11+ for local development

## Fastest Start (Docker)

```bash
# From backend/ directory
docker-compose up --build
```

Wait for services to start, then:
- Gateway: http://localhost:3000
- ML Service: http://localhost:5000
- API Docs: http://localhost:3000/docs

## Generate Test Token

```bash
cd gateway
node scripts/generate_test_token.js --userId=testuser
```

Use the token: `Authorization: Bearer test-token-testuser`

## Test the API

```bash
# Analyze text
curl -X POST http://localhost:3000/api/v1/analyze/text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-testuser" \
  -d '{"text": "Miracle cure discovered!"}'

# Get challenges
curl http://localhost:3000/api/v1/game/challenges \
  -H "Authorization: Bearer test-token-testuser"
```

## Local Development

### Gateway
```bash
cd gateway
npm install
npm start
```

### ML Service
```bash
cd ml_service
pip install -r requirements.txt
python app.py
```

## Next Steps

1. Read `README.md` for full documentation
2. Check `ml_service/README.md` for ML model integration
3. Review code comments marked with `TODO:` for integration points

