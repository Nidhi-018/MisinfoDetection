# Multi-Modal Misinformation Detection Platform - Backend

Complete backend implementation for a misinformation detection platform with Node.js/Express gateway and Python Flask ML service.

## Architecture

- **Gateway** (`/gateway`): Node.js/Express API gateway handling requests, authentication, and orchestration
- **ML Service** (`/ml_service`): Python Flask microservice providing ML analysis capabilities

## Quick Start

### Option 1: Docker Compose (Recommended)

1. **Start all services:**
```bash
make up
# or
docker-compose up --build
```

2. **Access services:**
   - Gateway: http://localhost:3000
   - ML Service: http://localhost:5000
   - API Docs: http://localhost:3000/docs

### Option 2: Local Development

#### Gateway Setup

```bash
cd gateway
npm install
cp .env.example .env  # Edit .env as needed
npm start
```

#### ML Service Setup

```bash
cd ml_service
pip install -r requirements.txt
python app.py
```

## API Endpoints

### New Endpoints (MongoDB-enabled)

#### Get User History
```bash
GET /api/v1/user/history?page=1&limit=20
```

#### Get Analysis Result by ID
```bash
GET /api/v1/user/results/:id
```

#### Dashboard Analytics (Admin)
```bash
GET /api/v1/admin/stats
```

#### Game Statistics
```bash
GET /api/v1/game/stats?userId=user123
```

### Analyze Endpoints

#### Analyze Text
```bash
curl -X POST http://localhost:3000/api/v1/analyze/text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-user123" \
  -d '{"text": "Scientists discover miracle cure for all diseases!"}'
```

#### Analyze Image
```bash
curl -X POST http://localhost:3000/api/v1/analyze/image \
  -H "Authorization: Bearer test-token-user123" \
  -F "image=@/path/to/image.jpg"
```

#### Analyze URL
```bash
curl -X POST http://localhost:3000/api/v1/analyze/url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-user123" \
  -d '{"url": "https://example.com/article"}'
```

#### Submit Feedback
```bash
curl -X POST http://localhost:3000/api/v1/analyze/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-user123" \
  -d '{
    "contentId": "analysis-id",
    "userId": "user123",
    "feedback": "agree",
    "notes": "Helpful analysis"
  }'
```

### Game Endpoints

#### Get Challenges
```bash
curl http://localhost:3000/api/v1/game/challenges?limit=10 \
  -H "Authorization: Bearer test-token-user123"
```

#### Submit Answer
```bash
curl -X POST http://localhost:3000/api/v1/game/answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-user123" \
  -d '{
    "challengeId": "challenge-id",
    "userId": "user123",
    "answer": "fake"
  }'
```

#### Get Leaderboard
```bash
curl http://localhost:3000/api/v1/game/leaderboard?period=alltime \
  -H "Authorization: Bearer test-token-user123"
```

### Admin Endpoints

#### Get Alerts
```bash
curl http://localhost:3000/api/v1/admin/alerts?status=pending \
  -H "Authorization: Bearer test-token-admin"
```

#### Take Action
```bash
curl -X POST http://localhost:3000/api/v1/admin/action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-admin" \
  -d '{
    "alertId": "alert-id",
    "action": "remove"
  }'
```

## Authentication

### Mock Authentication (Development)

The platform uses mock authentication for development. Generate test tokens:

```bash
node gateway/scripts/generate_test_token.js --userId=ish
```

Use the token in requests:
```bash
Authorization: Bearer test-token-ish
```

### Replacing with Real Auth

1. **Update `gateway/middlewares/authMock.js`:**
   - Replace with JWT verification using `jsonwebtoken`
   - Or integrate Firebase Admin SDK
   - Or use Passport.js with your auth provider

2. **Example with Firebase:**
```javascript
const admin = require('firebase-admin');
admin.initializeApp();

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { userId: decoded.uid, role: decoded.role };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

3. **Set environment variable:**
```bash
USE_MOCK_AUTH=false
```

## Database Integration

The platform now uses **MongoDB** with **Mongoose ODM** for all data persistence. All in-memory storage has been replaced with MongoDB collections.

### MongoDB Setup

#### 1. Get MongoDB Atlas Connection String

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

#### 2. Configure Environment Variables

Copy `.env.example` to `.env` and set your MongoDB URI:

```bash
cd gateway
cp .env.example .env
```

Edit `.env`:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/misinformation-detection?retryWrites=true&w=majority
```

#### 3. Install Dependencies

```bash
cd gateway
npm install
```

#### 4. Seed Database

Seed challenges and admin user:

```bash
# Seed game challenges
npm run seed:challenges

# Seed admin user
npm run seed:admin

# Clear all data (use with caution!)
npm run clear:db
```

### Database Architecture

#### Models

All models are located in `gateway/db/models/`:

- **User** (`User.js`) - User accounts, XP, badges, roles
- **Content** (`Content.js`) - Analysis results from text/image/URL analysis
- **Feedback** (`Feedback.js`) - User feedback on analysis results
- **Challenge** (`Challenge.js`) - Game challenges for gamification
- **Leaderboard** (`Leaderboard.js`) - User rankings and XP tracking
- **Alerts** (`Alerts.js`) - Moderation alerts for high-risk content

#### Services

Service layer in `gateway/db/services/` provides clean API for database operations:

- `userService.js` - User CRUD, XP management, badges
- `contentService.js` - Content CRUD, analysis result saving, search
- `feedbackService.js` - Feedback CRUD, statistics
- `challengeService.js` - Challenge CRUD, random selection, validation
- `leaderboardService.js` - Leaderboard management, XP updates
- `alertService.js` - Alert CRUD, high-risk content alerts

#### Indexes

All models include optimized indexes:

- **Content**: `contentId`, `createdAt`, `user`, `riskLevel`
- **Feedback**: `user + content` (unique), `content`, `user`
- **Challenge**: `difficulty`, `createdAt`
- **Leaderboard**: `xp` (descending for ranking), `user`
- **Alerts**: `status`, `riskLevel`, `createdAt`, `content`
- **User**: `email + providerId` (unique), `email`, `xp`

### Database Connection

Connection is handled in `gateway/db/connection.js`:

```javascript
const { connectDB } = require('./db/connection');
await connectDB(); // Connects to MongoDB Atlas
```

The server automatically connects on startup (see `server.js`).

### Example Queries

#### Using Services (Recommended)

```javascript
const contentService = require('./db/services/contentService');

// Save analysis result
const content = await contentService.saveAnalysisResult(analysisResult);

// Get user's content history
const history = await contentService.getUserContent(userId, page, limit);

// Search by risk level
const highRisk = await contentService.searchByRiskLevel('high', 1, 10);
```

#### Direct Model Access

```javascript
const Content = require('./db/models/Content');

// Find all high-risk content
const highRisk = await Content.find({ riskLevel: 'high' })
  .sort({ createdAt: -1 })
  .limit(10)
  .populate('user');
```

### API Endpoints

All endpoints now use MongoDB:

#### Content History
```bash
GET /api/v1/user/history?page=1&limit=20
```

#### Get Analysis Result
```bash
GET /api/v1/user/results/:id
```

#### Dashboard Stats (Admin)
```bash
GET /api/v1/admin/stats
```

#### Game Stats
```bash
GET /api/v1/game/stats?userId=user123
```

### Data Migration

If you have existing JSON data files, you can migrate them:

1. Read JSON files from `backend/data/`
2. Use services to create MongoDB documents
3. Example migration script:

```javascript
const fs = require('fs');
const contentService = require('./db/services/contentService');

const analyses = JSON.parse(fs.readFileSync('data/analyses.json'));
for (const analysis of analyses) {
  await contentService.saveAnalysisResult(analysis);
}
```

### Database Testing

Run database service tests:

```bash
cd gateway
npm test -- tests/db/
```

Test files are in `gateway/tests/db/`:
- `contentService.test.js`
- `challengeService.test.js`
- (Add more as needed)

### Production Considerations

1. **Connection Pooling**: Already configured in `connection.js`
2. **Indexes**: All critical indexes are defined in models
3. **TTL Collections**: Optional TTL index in Content model (commented out)
4. **Backups**: Configure MongoDB Atlas automated backups
5. **Monitoring**: Use MongoDB Atlas monitoring dashboard
6. **Replica Sets**: Use MongoDB Atlas replica sets for high availability

## ML Model Integration

### Text Analysis

1. **Install transformers:**
```bash
cd ml_service
pip install transformers torch
```

2. **Update `ml_service/models/text_model.py`:**
```python
from transformers import pipeline
classifier = pipeline("text-classification", model="facebook/roberta-base")
```

See `ml_service/README.md` for detailed instructions.

### Image Analysis

1. **Install CLIP:**
```bash
pip install clip-by-openai torch torchvision
```

2. **Update `ml_service/models/image_model.py`** with CLIP integration

See `ml_service/README.md` for detailed instructions.

## Testing

### Run All Tests
```bash
make test
```

### Gateway Tests
```bash
cd gateway
npm test
```

### ML Service Tests
```bash
cd ml_service
pytest tests/ -v
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Gateway
PORT=3000
ML_SERVICE_URL=http://localhost:5000
USE_MOCK_AUTH=true

# MongoDB (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/misinformation-detection?retryWrites=true&w=majority

# Admin User (for seeding)
ADMIN_EMAIL=admin@misinformation-detection.com
ADMIN_NAME=Admin User

# ML Service
PORT=5000
DEBUG=false
```

See `gateway/.env.example` for all available options.

## Project Structure

```
backend/
├── gateway/                 # Node.js/Express API Gateway
│   ├── db/                 # Database layer
│   │   ├── connection.js  # MongoDB connection
│   │   ├── models/        # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Content.js
│   │   │   ├── Feedback.js
│   │   │   ├── Challenge.js
│   │   │   ├── Leaderboard.js
│   │   │   └── Alerts.js
│   │   └── services/      # Database services
│   │       ├── userService.js
│   │       ├── contentService.js
│   │       ├── feedbackService.js
│   │       ├── challengeService.js
│   │       ├── leaderboardService.js
│   │       └── alertService.js
│   ├── routes/            # API route definitions
│   ├── controllers/      # Business logic
│   ├── middlewares/      # Auth, error handling, rate limiting
│   ├── services/         # External service clients (ML, etc.)
│   ├── scripts/          # Database seeding scripts
│   │   ├── seedChallenges.js
│   │   ├── seedAdminUser.js
│   │   └── clearDB.js
│   ├── tests/            # Jest unit tests
│   │   └── db/           # Database service tests
│   ├── utils/            # Helpers (legacy data storage removed)
│   └── server.js         # Express app entry point
│
├── ml_service/            # Python Flask ML Service
│   ├── routes/           # Flask route handlers
│   ├── models/           # ML model implementations
│   ├── utils/            # OCR and utilities
│   ├── tests/            # Pytest unit tests
│   └── app.py            # Flask app entry point
│
├── docker-compose.yml     # Docker Compose configuration
├── Makefile              # Convenience commands
└── README.md             # This file
```

## Makefile Commands

- `make up` - Start all services with Docker Compose
- `make down` - Stop all services
- `make test` - Run all tests
- `make test-gateway` - Run gateway tests only
- `make test-ml` - Run ML service tests only
- `make clean` - Clean up containers and generated files
- `make install-gateway` - Install gateway dependencies
- `make install-ml` - Install ML service dependencies

## Production Deployment

### Considerations

1. **Replace mock storage** with real database (MongoDB, PostgreSQL, etc.)
2. **Replace mock auth** with production auth provider
3. **Replace ML stubs** with trained models
4. **Add monitoring** (Prometheus, Grafana)
5. **Add logging** (Winston, ELK stack)
6. **Configure SSL/TLS** certificates
7. **Set up CI/CD** pipeline
8. **Add health checks** and readiness probes
9. **Configure resource limits** in Docker
10. **Set up backup** strategy for data

### Docker Production Build

```bash
docker-compose -f docker-compose.prod.yml up --build
```

(You'll need to create `docker-compose.prod.yml` with production configs)

## Troubleshooting

### ML Service Not Responding

1. Check if ML service is running: `curl http://localhost:5000/health`
2. Check gateway logs for connection errors
3. Verify `ML_SERVICE_URL` in gateway `.env`

### File Upload Issues

1. Check `uploads/` directory permissions
2. Verify `MAX_FILE_SIZE` setting
3. Check disk space

### Authentication Errors

1. Verify token format: `test-token-<userId>`
2. Check `USE_MOCK_AUTH=true` in `.env`
3. Generate new token: `node gateway/scripts/generate_test_token.js --userId=test`

## License

MIT

## Support

For issues and questions, please refer to the code comments marked with `TODO:` for integration points.

