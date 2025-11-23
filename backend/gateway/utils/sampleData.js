/**
 * In-Memory Data Store with Optional JSON Persistence
 * 
 * TODO: Replace with real database:
 * - Use MongoDB, PostgreSQL, or your preferred database
 * - Replace all dataStore objects with database collections/tables
 * - Add proper indexing for performance
 * - Implement transactions for data consistency
 * - Add connection pooling
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const PERSIST_TO_JSON = process.env.PERSIST_TO_JSON === 'true';

// In-memory data stores
const dataStore = {
  analyses: [], // Store analysis results
  feedback: [], // Store user feedback
  challenges: [], // Game challenges
  leaderboard: {
    daily: new Map(), // userId -> { score, xp, timestamp }
    weekly: new Map(),
    alltime: new Map(),
  },
  alerts: [], // Admin moderation alerts
};

/**
 * Initialize data store - load from JSON files if they exist
 */
async function initializeDataStore() {
  if (!PERSIST_TO_JSON) {
    // Initialize with sample data
    initializeSampleData();
    return;
  }

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Load data from JSON files
  try {
    const analysesFile = path.join(DATA_DIR, 'analyses.json');
    if (fs.existsSync(analysesFile)) {
      const data = fs.readFileSync(analysesFile, 'utf8');
      dataStore.analyses = JSON.parse(data);
    }

    const feedbackFile = path.join(DATA_DIR, 'feedback.json');
    if (fs.existsSync(feedbackFile)) {
      const data = fs.readFileSync(feedbackFile, 'utf8');
      dataStore.feedback = JSON.parse(data);
    }

    const challengesFile = path.join(DATA_DIR, 'challenges.json');
    if (fs.existsSync(challengesFile)) {
      const data = fs.readFileSync(challengesFile, 'utf8');
      dataStore.challenges = JSON.parse(data);
    } else {
      // Initialize with sample challenges
      initializeSampleChallenges();
      saveToJSON('challenges.json', dataStore.challenges);
    }

    const leaderboardFile = path.join(DATA_DIR, 'leaderboard.json');
    if (fs.existsSync(leaderboardFile)) {
      const data = fs.readFileSync(leaderboardFile, 'utf8');
      const leaderboardData = JSON.parse(data);
      // Convert arrays back to Maps
      dataStore.leaderboard.daily = new Map(leaderboardData.daily || []);
      dataStore.leaderboard.weekly = new Map(leaderboardData.weekly || []);
      dataStore.leaderboard.alltime = new Map(leaderboardData.alltime || []);
    }

    const alertsFile = path.join(DATA_DIR, 'alerts.json');
    if (fs.existsSync(alertsFile)) {
      const data = fs.readFileSync(alertsFile, 'utf8');
      dataStore.alerts = JSON.parse(data);
    } else {
      initializeSampleAlerts();
      saveToJSON('alerts.json', dataStore.alerts);
    }
  } catch (err) {
    console.error('Error loading data from JSON files:', err);
    // Initialize with sample data as fallback
    initializeSampleData();
  }
}

/**
 * Save data to JSON file
 */
function saveToJSON(filename, data) {
  if (!PERSIST_TO_JSON) return;

  try {
    const filepath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error saving ${filename}:`, err);
  }
}

/**
 * Initialize sample challenges for the game
 */
function initializeSampleChallenges() {
  dataStore.challenges = [
    {
      id: uuidv4(),
      type: 'text',
      content: 'Scientists discover miracle cure for all diseases!',
      correct_answer: 'fake',
      difficulty: 'easy',
      explanation: 'Claims of "miracle cures" are typically false. Real medical breakthroughs go through rigorous testing.',
    },
    {
      id: uuidv4(),
      type: 'text',
      content: 'The World Health Organization recommends washing hands regularly to prevent disease spread.',
      correct_answer: 'real',
      difficulty: 'easy',
      explanation: 'This is a well-established public health recommendation from WHO.',
    },
    {
      id: uuidv4(),
      type: 'image',
      content: 'A photo showing a celebrity endorsing a product',
      image_url: '/samples/sample1.jpg',
      correct_answer: 'fake',
      difficulty: 'medium',
      explanation: 'Celebrity endorsements in images can be manipulated or taken out of context.',
    },
    {
      id: uuidv4(),
      type: 'text',
      content: 'Breaking: Major election results announced before polls close!',
      correct_answer: 'fake',
      difficulty: 'medium',
      explanation: 'Election results are never announced before polls officially close.',
    },
    {
      id: uuidv4(),
      type: 'text',
      content: 'NASA confirms new exoplanet discovery using James Webb Space Telescope.',
      correct_answer: 'real',
      difficulty: 'hard',
      explanation: 'NASA regularly announces exoplanet discoveries through official channels.',
    },
  ];
}

/**
 * Initialize sample alerts for admin moderation
 */
function initializeSampleAlerts() {
  dataStore.alerts = [
    {
      id: uuidv4(),
      content_id: uuidv4(),
      content_type: 'text',
      content_preview: 'Miracle cure discovered...',
      risk_level: 'high',
      reported_by: 'user123',
      reported_at: new Date().toISOString(),
      status: 'pending',
      analysis_score: 15,
    },
    {
      id: uuidv4(),
      content_id: uuidv4(),
      content_type: 'image',
      content_preview: 'Manipulated image detected',
      risk_level: 'moderate',
      reported_by: 'user456',
      reported_at: new Date(Date.now() - 3600000).toISOString(),
      status: 'pending',
      analysis_score: 45,
    },
  ];
}

/**
 * Initialize all sample data
 */
function initializeSampleData() {
  initializeSampleChallenges();
  initializeSampleAlerts();
}

/**
 * Save leaderboard to JSON (converts Maps to arrays)
 */
function saveLeaderboard() {
  if (!PERSIST_TO_JSON) return;

  const leaderboardData = {
    daily: Array.from(dataStore.leaderboard.daily.entries()),
    weekly: Array.from(dataStore.leaderboard.weekly.entries()),
    alltime: Array.from(dataStore.leaderboard.alltime.entries()),
  };
  saveToJSON('leaderboard.json', leaderboardData);
}

module.exports = {
  dataStore,
  initializeDataStore,
  saveToJSON,
  saveLeaderboard,
};

