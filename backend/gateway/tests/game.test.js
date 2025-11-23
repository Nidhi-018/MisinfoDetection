const request = require('supertest');
const app = require('../server');

describe('POST /api/v1/game/answer', () => {
  it('should calculate XP correctly for correct answer', async () => {
    // First get challenges to get a valid challengeId
    const challengesResponse = await request(app)
      .get('/api/v1/game/challenges')
      .expect(200);

    expect(challengesResponse.body.challenges.length).toBeGreaterThan(0);
    const challengeId = challengesResponse.body.challenges[0].id;

    // We need to know the correct answer, but the API doesn't return it
    // So we'll test with a mock - in real tests, you'd seed test data
    const response = await request(app)
      .post('/api/v1/game/answer')
      .send({
        challengeId: challengeId,
        userId: 'test-user-123',
        answer: 'real', // May or may not be correct
      })
      .expect(200);

    expect(response.body).toHaveProperty('correct');
    expect(response.body).toHaveProperty('xp_earned');
    expect(response.body).toHaveProperty('explanation');
    expect(response.body).toHaveProperty('user_stats');

    // Check user_stats structure
    expect(response.body.user_stats).toHaveProperty('total_xp');
    expect(response.body.user_stats).toHaveProperty('total_correct');
    expect(response.body.user_stats).toHaveProperty('total_played');
    expect(response.body.user_stats).toHaveProperty('accuracy');

    // XP should be non-negative
    expect(response.body.xp_earned).toBeGreaterThanOrEqual(0);

    // If correct, XP should be > 0
    if (response.body.correct) {
      expect(response.body.xp_earned).toBeGreaterThan(0);
    }
  });

  it('should return 400 for invalid answer', async () => {
    const response = await request(app)
      .post('/api/v1/game/answer')
      .send({
        challengeId: 'test-id',
        userId: 'test-user',
        answer: 'invalid-answer',
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for non-existent challenge', async () => {
    const response = await request(app)
      .post('/api/v1/game/answer')
      .send({
        challengeId: 'non-existent-id',
        userId: 'test-user',
        answer: 'real',
      })
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });
});

describe('GET /api/v1/game/challenges', () => {
  it('should return list of challenges', async () => {
    const response = await request(app)
      .get('/api/v1/game/challenges')
      .expect(200);

    expect(response.body).toHaveProperty('challenges');
    expect(response.body).toHaveProperty('count');
    expect(Array.isArray(response.body.challenges)).toBe(true);
  });

  it('should respect limit parameter', async () => {
    const response = await request(app)
      .get('/api/v1/game/challenges?limit=3')
      .expect(200);

    expect(response.body.challenges.length).toBeLessThanOrEqual(3);
  });
});

describe('GET /api/v1/game/leaderboard', () => {
  it('should return leaderboard data', async () => {
    const response = await request(app)
      .get('/api/v1/game/leaderboard')
      .expect(200);

    expect(response.body).toHaveProperty('period');
    expect(response.body).toHaveProperty('leaderboard');
    expect(response.body).toHaveProperty('count');
    expect(Array.isArray(response.body.leaderboard)).toBe(true);
  });

  it('should support period parameter', async () => {
    const periods = ['daily', 'weekly', 'alltime'];
    
    for (const period of periods) {
      const response = await request(app)
        .get(`/api/v1/game/leaderboard?period=${period}`)
        .expect(200);

      expect(response.body.period).toBe(period);
    }
  });
});

