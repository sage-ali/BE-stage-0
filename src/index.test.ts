import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '@/index';
describe('GET /', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });
  });