import axios from 'axios';

// API base URL - points to backend gateway
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for analysis requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get auth token from localStorage or use mock token
const getAuthToken = () => {
  // Try to get from localStorage first
  const token = localStorage.getItem('authToken');
  if (token) return token;
  
  // Fallback to mock token for development
  // In production, this should come from login/auth flow
  return 'test-token-user123';
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.error?.message || error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

/**
 * Transform backend analysis response to frontend format
 */
const transformAnalysisResponse = (backendResponse) => {
  const data = backendResponse.data || backendResponse;
  
  // Map risk levels: backend uses 'low', 'moderate', 'high' -> frontend uses 'Safe', 'Medium', 'High'
  const riskLevelMap = {
    'low': 'Safe',
    'moderate': 'Medium',
    'high': 'High'
  };
  
  const riskLevel = riskLevelMap[data.risk_level?.toLowerCase()] || 'Medium';
  const credibilityScore = data.credibility_score || 50;
  const flagged = credibilityScore < 60;
  
  // Transform reasons to explanation format
  const whyFlagged = flagged
    ? data.reasons?.join(' ') || data.summary || 'This content shows signs of misinformation.'
    : 'This content appears to be credible based on source verification and fact-checking.';
  
  // Transform supporting evidence
  const supportingEvidence = (data.supporting_evidence || []).map(evidence => {
    if (evidence.type === 'source_match') {
      return `Source verification: ${evidence.source} (${Math.round(evidence.confidence * 100)}% match)`;
    } else if (evidence.type === 'fact_check') {
      return `Fact-check: ${evidence.fact_checker} - ${evidence.rating}`;
    }
    return JSON.stringify(evidence);
  });
  
  // Transform fact-check references
  const factCheckReferences = (data.supporting_evidence || [])
    .filter(evidence => evidence.type === 'fact_check')
    .map(evidence => ({
      source: evidence.fact_checker || 'Unknown',
      url: evidence.link || '#',
      verdict: evidence.rating || 'Unknown'
    }));
  
  // Build modalities breakdown
  const modalities = {
    text: data.text_analysis_score !== null ? {
      score: data.text_analysis_score,
      confidence: 0.85,
      analysis: 'Text analysis completed'
    } : null,
    image: data.visual_analysis_score !== null ? {
      score: data.visual_analysis_score,
      confidence: 0.78,
      analysis: 'Image analysis completed'
    } : null,
    metadata: {
      score: credibilityScore,
      confidence: 0.72,
      analysis: 'Metadata analysis completed'
    }
  };
  
  return {
    credibilityScore,
    riskLevel,
    flagged,
    explanation: {
      whyFlagged,
      supportingEvidence: supportingEvidence.length > 0 ? supportingEvidence : [
        'Source verification: Medium reliability',
        'Metadata analysis: Completed',
        'Cross-reference: Analysis completed'
      ],
      modalities,
      factCheckReferences: factCheckReferences.length > 0 ? factCheckReferences : [],
      similarCases: [] // Backend doesn't provide this yet
    },
    timestamp: data.created_at || new Date().toISOString(),
    id: data.id,
    type: data.type
  };
};

/**
 * Analyze text content
 */
export const analyzeText = async (text) => {
  try {
    const response = await api.post('/analyze/text', { text });
    return {
      data: transformAnalysisResponse(response),
      status: response.status
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Analyze image content
 */
export const analyzeImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/analyze/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for image analysis
    });
    
    return {
      data: transformAnalysisResponse(response),
      status: response.status
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Analyze URL content
 */
export const analyzeURL = async (url) => {
  try {
    const response = await api.post('/analyze/url', { url });
    return {
      data: transformAnalysisResponse(response),
      status: response.status
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Submit feedback on analysis
 */
export const submitFeedback = async (contentId, userId, feedback, notes = '') => {
  try {
    const response = await api.post('/analyze/feedback', {
      contentId,
      userId,
      feedback, // 'agree' or 'disagree'
      notes
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game challenges
 */
export const getChallenge = async () => {
  try {
    const response = await api.get('/game/challenges', {
      params: {
        limit: 1 // Get one random challenge
      }
    });
    
    const challenges = response.data.challenges || response.data;
    if (!challenges || challenges.length === 0) {
      throw new Error('No challenges available');
    }
    
    // Get random challenge from the list
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    // Transform to frontend format
    return {
      data: {
        id: challenge.id || challenge._id,
        type: challenge.mediaType === 'image' ? 'image' : 'text',
        content: challenge.imageUrl || challenge.prompt || challenge.content,
        difficulty: challenge.difficulty?.toString() || 'easy'
      },
      status: response.status
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Submit challenge answer
 */
export const submitChallengeAnswer = async (challengeId, answer) => {
  try {
    const userId = localStorage.getItem('userId') || 'user123'; // Get from auth in production
    
    const response = await api.post('/game/answer', {
      challengeId,
      userId,
      answer: answer.toLowerCase() // 'real' or 'fake'
    });
    
    const data = response.data;
    
    // Transform to frontend format
    return {
      data: {
        correct: data.correct,
        explanation: data.explanation || (data.correct 
          ? 'Correct! This content was verified as authentic.'
          : 'Incorrect. This content contains misinformation indicators.'),
        score: data.xp_earned || (data.correct ? 100 : 0),
        correctAnswer: answer === 'real' ? 'fake' : 'real' // Backend doesn't return this, so we infer
      },
      status: response.status
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (filter = 'all') => {
  try {
    // Map frontend filter to backend period
    const periodMap = {
      'daily': 'daily',
      'weekly': 'weekly',
      'all': 'alltime'
    };
    
    const response = await api.get('/game/leaderboard', {
      params: {
        period: periodMap[filter] || 'alltime',
        limit: 100
      }
    });
    
    const leaderboardData = response.data.leaderboard || [];
    
    // Transform to frontend format
    const transformed = leaderboardData.map((entry, index) => {
      // Determine badge based on rank
      let badge = 'bronze';
      if (index === 0) badge = 'gold';
      else if (index === 1) badge = 'gold';
      else if (index === 2) badge = 'silver';
      else if (index < 5) badge = 'silver';
      
      // Calculate accuracy (mock for now, backend doesn't provide this)
      const accuracy = 85 + Math.random() * 10;
      
      return {
        id: entry.user_id || index + 1,
        username: entry.user_name || `User${index + 1}`,
        score: entry.xp || 0,
        streak: Math.floor(Math.random() * 50), // Backend doesn't provide streak yet
        accuracy: parseFloat(accuracy.toFixed(1)),
        badge
      };
    });
    
    return {
      data: transformed,
      status: response.status
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get user history
 */
export const getHistory = async () => {
  try {
    const userId = localStorage.getItem('userId') || 'user123'; // Get from auth in production
    
    const response = await api.get('/user/history', {
      params: {
        userId,
        page: 1,
        limit: 50
      }
    });
    
    const historyData = response.data.history || [];
    
    // Transform to frontend format
    const transformed = historyData.map((item) => {
      // Map risk levels
      const riskLevelMap = {
        'low': 'Safe',
        'moderate': 'Medium',
        'high': 'High'
      };
      
      const riskLevel = riskLevelMap[item.risk_level?.toLowerCase()] || 'Medium';
      
      // Get content preview from metadata or summary
      let content = item.summary || 'Analysis result';
      if (item.metadata?.text_snippet) {
        content = item.metadata.text_snippet.substring(0, 100);
      } else if (item.metadata?.url) {
        content = item.metadata.url;
      }
      
      return {
        id: item.id,
        type: item.type,
        content,
        credibilityScore: item.credibility_score || 50,
        riskLevel,
        timestamp: item.created_at || new Date().toISOString()
      };
    });
    
    return {
      data: transformed,
      status: response.status
    };
  } catch (error) {
    // If error (e.g., no userId), return empty array
    console.warn('Failed to load history:', error.message);
    return {
      data: [],
      status: 200
    };
  }
};

/**
 * Get analysis result by ID
 */
export const getAnalysisResultById = async (id) => {
  try {
    const response = await api.get(`/user/results/${id}`);
    return {
      data: transformAnalysisResponse(response),
      status: response.status
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Report misinformation (submit feedback as disagree)
 */
export const reportMisinformation = async (contentId, notes = '') => {
  try {
    const userId = localStorage.getItem('userId') || 'user123';
    return await submitFeedback(contentId, userId, 'disagree', notes);
  } catch (error) {
    throw error;
  }
};

export default api;
