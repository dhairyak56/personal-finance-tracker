const request = require('supertest');
const app = require('../server/server');

describe('GET /api/health', () => {
  it('returns 200 and health message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'OK', message: 'Server is running' });
  });
});
