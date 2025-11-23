/**
 * Mock Reverse Search Service
 * 
 * Simulates reverse image/text search functionality
 * 
 * TODO: Replace with real reverse search API:
 * - Google Reverse Image Search API
 * - TinEye API
 * - Custom reverse search service
 * - Web scraping with proper rate limiting
 */

/**
 * Mock reverse search for images
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Array>} - Array of search results
 */
async function reverseSearchImage(imagePath) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Randomly return 0-3 matches
  const numMatches = Math.floor(Math.random() * 4);
  const results = [];

  const sampleSources = [
    { name: 'News Source A', url: 'https://example.com/news/a', match_confidence: 0.85 },
    { name: 'Social Media Post', url: 'https://example.com/social/123', match_confidence: 0.72 },
    { name: 'Blog Article', url: 'https://example.com/blog/article', match_confidence: 0.65 },
    { name: 'Fact Check Site', url: 'https://example.com/factcheck/1', match_confidence: 0.90 },
  ];

  for (let i = 0; i < numMatches; i++) {
    const source = sampleSources[Math.floor(Math.random() * sampleSources.length)];
    results.push({
      ...source,
      match_confidence: source.match_confidence + (Math.random() - 0.5) * 0.1,
    });
  }

  // Remove duplicates and sort by confidence
  const uniqueResults = results
    .filter((r, index, self) => index === self.findIndex((t) => t.url === r.url))
    .sort((a, b) => b.match_confidence - a.match_confidence);

  return uniqueResults;
}

/**
 * Mock reverse search for text
 * @param {string} text - Text to search
 * @returns {Promise<Array>} - Array of search results
 */
async function reverseSearchText(text) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Check for keywords that might have matches
  const keywords = ['vaccine', 'cure', 'election', 'miracle', 'breaking'];
  const hasKeywords = keywords.some((keyword) =>
    text.toLowerCase().includes(keyword)
  );

  if (!hasKeywords) {
    return [];
  }

  // Return 1-2 matches for keyword-containing text
  const numMatches = Math.floor(Math.random() * 2) + 1;
  const results = [];

  const sampleSources = [
    { name: 'Fact Check Database', url: 'https://example.com/factcheck/vaccine', match_confidence: 0.88 },
    { name: 'News Archive', url: 'https://example.com/archive/2023', match_confidence: 0.75 },
    { name: 'Research Paper', url: 'https://example.com/research/paper', match_confidence: 0.82 },
  ];

  for (let i = 0; i < numMatches; i++) {
    const source = sampleSources[Math.floor(Math.random() * sampleSources.length)];
    results.push({
      ...source,
      match_confidence: source.match_confidence + (Math.random() - 0.5) * 0.1,
    });
  }

  return results.slice(0, numMatches);
}

module.exports = {
  reverseSearchImage,
  reverseSearchText,
};

