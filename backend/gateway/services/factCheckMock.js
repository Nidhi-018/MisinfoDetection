/**
 * Mock Fact-Checking Service
 * 
 * Simulates fact-checking API functionality
 * 
 * TODO: Replace with real fact-checking API:
 * - Google Fact Check API
 * - Snopes API
 * - PolitiFact API
 * - Custom fact-checking database
 */

/**
 * Mock fact-check for text content
 * @param {string} text - Text to fact-check
 * @returns {Promise<Object|null>} - Fact-check result or null
 */
async function factCheckText(text) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const lowerText = text.toLowerCase();

  // Check for common misinformation keywords
  const misinformationKeywords = {
    vaccine: { rating: 'False', link: 'https://example-factcheck.org/vaccine-myths' },
    cure: { rating: 'False', link: 'https://example-factcheck.org/miracle-cures' },
    election: { rating: 'Partially False', link: 'https://example-factcheck.org/election-claims' },
    miracle: { rating: 'False', link: 'https://example-factcheck.org/miracle-claims' },
    'click here': { rating: 'Misleading', link: 'https://example-factcheck.org/clickbait' },
  };

  for (const [keyword, result] of Object.entries(misinformationKeywords)) {
    if (lowerText.includes(keyword)) {
      return {
        match: true,
        rating: result.rating,
        link: result.link,
        claim: text.substring(0, 100) + '...',
        fact_checker: 'Example Fact Check Organization',
        date: new Date().toISOString(),
      };
    }
  }

  // No match found
  return null;
}

/**
 * Mock fact-check for image content
 * @param {string} imagePath - Path to image file
 * @param {string} ocrText - OCR extracted text from image
 * @returns {Promise<Object|null>} - Fact-check result or null
 */
async function factCheckImage(imagePath, ocrText) {
  if (!ocrText) {
    return null;
  }

  // Use OCR text for fact-checking
  return factCheckText(ocrText);
}

module.exports = {
  factCheckText,
  factCheckImage,
};

