# Misinformation Detection Platform

A modern, AI-powered multimodal misinformation detection and defense platform built with React.

## Features

- 🛡️ **Multimodal Analysis**: Analyze images, text, and URLs for misinformation
- 🎮 **Gamification**: Real or Fake challenge game to test your detection skills
- 📊 **Leaderboard**: Compete with other users and track your ranking
- 📋 **History**: View your past analyses and results
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive**: Works seamlessly on all devices

## Tech Stack

- React 18
- React Router v6
- Vite
- Axios (for API calls)
- CSS Modules

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**Note:** Make sure the backend server is running on `http://localhost:3000` for API calls to work.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
  ├── components/       # Reusable UI components
  ├── pages/           # Page components
  ├── layouts/         # Layout components (Navbar, etc.)
  ├── context/         # React Context providers
  ├── services/        # API services (currently mocked)
  ├── hooks/           # Custom React hooks
  └── assets/          # Static assets
```

## API Integration

The frontend is **fully connected** to the backend API. The app uses axios to communicate with the backend gateway.

### Backend Setup

1. **Start the backend server:**
   ```bash
   cd backend
   make up
   # or
   docker-compose up --build
   ```

2. **Backend should be running on:** `http://localhost:3000`

3. **API Base URL:** The frontend connects to `http://localhost:3000/api/v1` by default

### Environment Configuration

Create a `.env` file in the root directory (optional):
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### API Endpoints Used

The frontend connects to these backend endpoints:

- `POST /api/v1/analyze/text` - Analyze text content
- `POST /api/v1/analyze/image` - Analyze image (multipart/form-data)
- `POST /api/v1/analyze/url` - Analyze URL content
- `POST /api/v1/analyze/feedback` - Submit feedback on analysis
- `GET /api/v1/game/challenges` - Get game challenges
- `POST /api/v1/game/answer` - Submit challenge answer
- `GET /api/v1/game/leaderboard` - Get leaderboard
- `GET /api/v1/user/history` - Get user analysis history
- `GET /api/v1/user/results/:id` - Get analysis result by ID

### Authentication

The app uses mock authentication tokens for development. To set a custom token:

```javascript
localStorage.setItem('authToken', 'your-token-here');
localStorage.setItem('userId', 'your-user-id');
```

Default token: `test-token-user123` (for development)

## Features Overview

### Home Dashboard
- Hero section with platform introduction
- Overview statistics cards
- Recent verifications list
- Quick action buttons

### Analyze Page
- Multimodal upload interface (Image, Text, URL)
- Real-time analysis with loading states
- Credibility score visualization
- Explainable AI breakdown
- Risk level assessment
- Fact-check references

### Challenge Page
- Interactive Real or Fake game
- Timer-based challenges
- Score and streak tracking
- Difficulty progression
- Results and leaderboard submission

### Leaderboard Page
- Top players ranking
- Filter by time period (Daily, Weekly, All Time)
- Player statistics (Score, Streak, Accuracy)
- Badge system

### History Page
- Past analysis records
- Detailed view modal
- Filter and search capabilities
- Score visualization

## Customization

### Themes
The app supports light and dark themes. Theme preference is stored in localStorage.

### Styling
All components use CSS modules for scoped styling. Global styles are in `src/index.css`.

## License

MIT

