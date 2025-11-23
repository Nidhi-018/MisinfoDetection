const challengeService = require('../../db/services/challengeService');
const { connectDB, disconnectDB } = require('../../db/connection');
const Challenge = require('../../db/models/Challenge');

describe('Challenge Service', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await Challenge.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    await Challenge.deleteMany({});
  });

  describe('createChallenge', () => {
    it('should create a new challenge', async () => {
      const challengeData = {
        title: 'Test Challenge',
        mediaType: 'text',
        prompt: 'Is this real or fake?',
        correctAnswer: 'real',
        explanation: 'This is real',
        difficulty: 2,
      };

      const challenge = await challengeService.createChallenge(challengeData);

      expect(challenge).toBeDefined();
      expect(challenge.title).toBe('Test Challenge');
      expect(challenge.correctAnswer).toBe('real');
    });
  });

  describe('getRandomChallenges', () => {
    it('should return random challenges', async () => {
      // Create multiple challenges
      for (let i = 0; i < 10; i++) {
        await challengeService.createChallenge({
          title: `Challenge ${i}`,
          mediaType: 'text',
          prompt: `Prompt ${i}`,
          correctAnswer: i % 2 === 0 ? 'real' : 'fake',
          explanation: 'Explanation',
          difficulty: 1,
        });
      }

      const random = await challengeService.getRandomChallenges(5);

      expect(random.length).toBe(5);
    });
  });

  describe('validateAnswer', () => {
    it('should validate correct answer', async () => {
      const challenge = await challengeService.createChallenge({
        title: 'Test',
        mediaType: 'text',
        prompt: 'Test prompt',
        correctAnswer: 'real',
        explanation: 'Explanation',
        difficulty: 1,
      });

      const validation = await challengeService.validateAnswer(challenge._id, 'real');

      expect(validation.isCorrect).toBe(true);
    });

    it('should validate incorrect answer', async () => {
      const challenge = await challengeService.createChallenge({
        title: 'Test',
        mediaType: 'text',
        prompt: 'Test prompt',
        correctAnswer: 'real',
        explanation: 'Explanation',
        difficulty: 1,
      });

      const validation = await challengeService.validateAnswer(challenge._id, 'fake');

      expect(validation.isCorrect).toBe(false);
    });
  });
});

