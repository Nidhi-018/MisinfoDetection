const request = require('supertest');
const app = require('../server');

describe('POST /api/v1/analyze/text', () => {
  it('should return proper schema for text analysis', async () => {
    const response = await request(app)
      .post('/api/v1/analyze/text')
      .send({ text: 'This is a test text about vaccines.' })
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('type', 'text');
    expect(response.body).toHaveProperty('credibility_score');
    expect(response.body).toHaveProperty('risk_level');
    expect(response.body).toHaveProperty('text_analysis_score');
    expect(response.body).toHaveProperty('visual_analysis_score');
    expect(response.body).toHaveProperty('source_verified');
    expect(response.body).toHaveProperty('fact_check_match');
    expect(response.body).toHaveProperty('reasons');
    expect(response.body).toHaveProperty('supporting_evidence');
    expect(response.body).toHaveProperty('summary');
    expect(response.body).toHaveProperty('metadata');

    // Type checks
    expect(typeof response.body.id).toBe('string');
    expect(typeof response.body.credibility_score).toBe('number');
    expect(Array.isArray(response.body.reasons)).toBe(true);
    expect(Array.isArray(response.body.supporting_evidence)).toBe(true);
  });

  it('should return 400 for empty text', async () => {
    const response = await request(app)
      .post('/api/v1/analyze/text')
      .send({ text: '' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for missing text', async () => {
    const response = await request(app)
      .post('/api/v1/analyze/text')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});

describe('POST /api/v1/analyze/url', () => {
  it('should return 400 for invalid URL', async () => {
    const response = await request(app)
      .post('/api/v1/analyze/url')
      .send({ url: 'not-a-valid-url' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});

describe('POST /api/v1/analyze/feedback', () => {
  it('should accept valid feedback', async () => {
    const contentId = 'test-content-id';
    const userId = 'test-user';

    const response = await request(app)
      .post('/api/v1/analyze/feedback')
      .send({
        contentId,
        userId,
        feedback: 'agree',
        notes: 'Test feedback',
      })
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('feedback_id');
    expect(response.body).toHaveProperty('feedback_count');
    expect(response.body).toHaveProperty('agree_count');
    expect(response.body).toHaveProperty('disagree_count');
  });

  it('should return 400 for invalid feedback value', async () => {
    const response = await request(app)
      .post('/api/v1/analyze/feedback')
      .send({
        contentId: 'test-id',
        userId: 'test-user',
        feedback: 'invalid',
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});

