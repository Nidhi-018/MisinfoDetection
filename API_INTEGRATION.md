# API Integration Guide

This document describes how the frontend connects to the backend API.

## Overview

The frontend uses **axios** to communicate with the backend gateway API. All API calls are centralized in `src/services/api.js`.

## Configuration

### API Base URL

The API base URL is configured in `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
```

You can override this by setting the `VITE_API_BASE_URL` environment variable.

### Authentication

The app uses Bearer token authentication. Tokens are managed via:

- **Storage:** `localStorage.getItem('authToken')`
- **Default:** `test-token-user123` (for development)
- **Header:** `Authorization: Bearer <token>`

To set a custom token:
```javascript
localStorage.setItem('authToken', 'your-token');
localStorage.setItem('userId', 'your-user-id');
```

## API Endpoints

### Analysis Endpoints

#### 1. Analyze Text
```javascript
POST /api/v1/analyze/text
Body: { text: "string to analyze" }
Response: Analysis result with credibility score, risk level, etc.
```

#### 2. Analyze Image
```javascript
POST /api/v1/analyze/image
Body: FormData with 'image' field
Response: Analysis result with visual analysis scores
```

#### 3. Analyze URL
```javascript
POST /api/v1/analyze/url
Body: { url: "https://example.com" }
Response: Multi-modal analysis result
```

### Game Endpoints

#### 4. Get Challenges
```javascript
GET /api/v1/game/challenges?limit=1
Response: { challenges: [...], count: number }
```

#### 5. Submit Answer
```javascript
POST /api/v1/game/answer
Body: { challengeId: string, userId: string, answer: "real" | "fake" }
Response: { correct: boolean, xp_earned: number, explanation: string }
```

#### 6. Get Leaderboard
```javascript
GET /api/v1/game/leaderboard?period=alltime&limit=100
Response: { leaderboard: [...], count: number }
```

### User Endpoints

#### 7. Get History
```javascript
GET /api/v1/user/history?userId=string&page=1&limit=50
Response: { history: [...], pagination: {...} }
```

#### 8. Get Analysis Result
```javascript
GET /api/v1/user/results/:id
Response: Full analysis result object
```

#### 9. Submit Feedback
```javascript
POST /api/v1/analyze/feedback
Body: { contentId: string, userId: string, feedback: "agree" | "disagree", notes?: string }
Response: { success: boolean, feedback_id: string }
```

## Response Transformation

The backend API returns data in a different format than the frontend expects. The `transformAnalysisResponse()` function in `src/services/api.js` handles this transformation:

### Backend Format → Frontend Format

- `risk_level`: `"low" | "moderate" | "high"` → `"Safe" | "Medium" | "High"`
- `credibility_score`: `number` → `credibilityScore: number`
- `reasons`: `string[]` → `explanation.whyFlagged: string`
- `supporting_evidence`: `object[]` → `explanation.supportingEvidence: string[]`
- `text_analysis_score` / `visual_analysis_score` → `modalities` object

## Error Handling

All API calls include error handling:

1. **Network Errors:** Displayed as "Network error. Please check your connection."
2. **Server Errors:** Error message from backend response
3. **Validation Errors:** Displayed via toast notifications

## Usage Examples

### In Components

```javascript
import { analyzeText, analyzeImage, analyzeURL } from '../services/api';
import { useToast } from '../context/ToastContext';

const MyComponent = () => {
  const { showSuccess, showError } = useToast();
  
  const handleAnalyze = async () => {
    try {
      const response = await analyzeText("Some text to analyze");
      const result = response.data;
      // Use result...
      showSuccess('Analysis completed!');
    } catch (error) {
      showError(error.message);
    }
  };
};
```

## Development vs Production

### Development
- Uses mock token: `test-token-user123`
- Default user ID: `user123`
- API URL: `http://localhost:3000/api/v1`

### Production
- Set `VITE_API_BASE_URL` environment variable
- Implement proper authentication flow
- Store tokens securely
- Handle token refresh

## Troubleshooting

### Backend Not Running
- Error: "Network error. Please check your connection."
- Solution: Start backend with `cd backend && make up`

### CORS Issues
- Backend should allow requests from frontend origin
- Check backend CORS configuration

### Authentication Errors
- Verify token is set in localStorage
- Check backend auth middleware configuration

### Response Format Mismatch
- Check `transformAnalysisResponse()` function
- Verify backend response structure matches expected format

