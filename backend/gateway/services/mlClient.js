/**
 * ML Service Client
 * 
 * Handles communication with the Python ML microservice
 * 
 * Features:
 * - Retry logic (3 attempts)
 * - Timeout handling (10s per request)
 * - Graceful fallback on failure
 */

const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
const ML_SERVICE_TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT || '10000', 10);
const ML_SERVICE_RETRIES = parseInt(process.env.ML_SERVICE_RETRIES || '3', 10);

/**
 * Create axios instance with default config
 */
const mlServiceClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: ML_SERVICE_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Retry wrapper for ML service calls
 * @param {Function} requestFn - Function that returns a promise
 * @param {number} retries - Number of retry attempts
 * @returns {Promise} - Request result or fallback response
 */
async function retryRequest(requestFn, retries = ML_SERVICE_RETRIES) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await requestFn();
      return response.data;
    } catch (error) {
      lastError = error;
      console.error(`ML service request failed (attempt ${attempt}/${retries}):`, error.message);

      // Don't retry on 4xx errors (client errors)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed - return fallback response
  console.warn('ML service unavailable after all retries, returning fallback response');
  return getFallbackResponse();
}

/**
 * Get fallback response when ML service is unavailable
 */
function getFallbackResponse() {
  return {
    text_analysis_score: null,
    visual_analysis_score: null,
    sentiment: 'unknown',
    claims: [],
    contradictions: [],
    summary: 'Analysis temporarily unavailable. Please try again later.',
    reasons: ['ML service is currently unavailable'],
    manipulation_prob: null,
    match_sources: [],
    ocr_text: null,
    analysis_unavailable: true,
  };
}

/**
 * Analyze text using ML service
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} - Analysis result
 */
async function analyzeText(text) {
  try {
    return await retryRequest(() =>
      mlServiceClient.post('/ml/analyze/text', { text })
    );
  } catch (error) {
    console.error('Error calling ML service for text analysis:', error.message);
    return getFallbackResponse();
  }
}

/**
 * Analyze image using ML service
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Object>} - Analysis result
 */
async function analyzeImage(imagePath) {
  try {
    // Read file and send as multipart form data
    const fs = require('fs');
    const FormData = require('form-data');

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    return await retryRequest(() =>
      axios.post(`${ML_SERVICE_URL}/ml/analyze/image`, form, {
        headers: {
          ...form.getHeaders(),
        },
        timeout: ML_SERVICE_TIMEOUT * 2, // Images may take longer
      })
    );
  } catch (error) {
    console.error('Error calling ML service for image analysis:', error.message);
    return getFallbackResponse();
  }
}

/**
 * Analyze multi-modal content
 * @param {Object} payload - { text?, image_path?, url_meta? }
 * @returns {Promise<Object>} - Combined analysis result
 */
async function analyzeMulti(payload) {
  try {
    return await retryRequest(() =>
      mlServiceClient.post('/ml/analyze/multi', payload)
    );
  } catch (error) {
    console.error('Error calling ML service for multi-modal analysis:', error.message);
    return getFallbackResponse();
  }
}

module.exports = {
  analyzeText,
  analyzeImage,
  analyzeMulti,
};

