const contentService = require('../../db/services/contentService');
const { connectDB, disconnectDB } = require('../../db/connection');
const Content = require('../../db/models/Content');

describe('Content Service', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await Content.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    await Content.deleteMany({});
  });

  describe('createContent', () => {
    it('should create a new content entry', async () => {
      const contentData = {
        contentId: 'test-content-1',
        type: 'text',
        rawInput: { text: 'Test content' },
        credibilityScore: 75,
        riskLevel: 'low',
        textAnalysisScore: 80,
        summary: 'Test summary',
      };

      const content = await contentService.createContent(contentData);

      expect(content).toBeDefined();
      expect(content.contentId).toBe('test-content-1');
      expect(content.type).toBe('text');
      expect(content.credibilityScore).toBe(75);
    });
  });

  describe('getContentByContentId', () => {
    it('should retrieve content by contentId', async () => {
      const contentData = {
        contentId: 'test-content-2',
        type: 'text',
        rawInput: { text: 'Test' },
        credibilityScore: 50,
        riskLevel: 'moderate',
      };

      await contentService.createContent(contentData);
      const retrieved = await contentService.getContentByContentId('test-content-2');

      expect(retrieved).toBeDefined();
      expect(retrieved.contentId).toBe('test-content-2');
    });
  });

  describe('saveAnalysisResult', () => {
    it('should save analysis result with proper format conversion', async () => {
      const result = {
        id: 'analysis-1',
        type: 'text',
        credibility_score: 60,
        risk_level: 'moderate',
        text_analysis_score: 65,
        summary: 'Analysis complete',
        rawInput: { text: 'Sample text' },
      };

      const saved = await contentService.saveAnalysisResult(result);

      expect(saved).toBeDefined();
      expect(saved.contentId).toBe('analysis-1');
      expect(saved.credibilityScore).toBe(60);
      expect(saved.riskLevel).toBe('moderate');
    });
  });

  describe('getRecentAnalyses', () => {
    it('should return recent analyses', async () => {
      // Create multiple content entries
      for (let i = 0; i < 5; i++) {
        await contentService.createContent({
          contentId: `test-${i}`,
          type: 'text',
          rawInput: { text: `Test ${i}` },
          credibilityScore: 50 + i,
          riskLevel: 'low',
        });
      }

      const recent = await contentService.getRecentAnalyses(3);

      expect(recent.length).toBe(3);
    });
  });

  describe('searchByRiskLevel', () => {
    it('should filter content by risk level', async () => {
      await contentService.createContent({
        contentId: 'high-risk-1',
        type: 'text',
        rawInput: { text: 'Test' },
        credibilityScore: 20,
        riskLevel: 'high',
      });

      await contentService.createContent({
        contentId: 'low-risk-1',
        type: 'text',
        rawInput: { text: 'Test' },
        credibilityScore: 80,
        riskLevel: 'low',
      });

      const highRisk = await contentService.searchByRiskLevel('high', 1, 10);

      expect(highRisk.content.length).toBe(1);
      expect(highRisk.content[0].riskLevel).toBe('high');
    });
  });
});

