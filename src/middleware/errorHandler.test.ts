import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { errorHandler } from '@/middleware/errorHandler';

describe('errorHandler middleware', () => {
  it('should return 500 and default message if status is not provided', async () => {
    const app = express();
    
    // Silence console.error for tests
    vi.spyOn(console, 'error').mockImplementation(() => {});

    app.get('/error', (req, res, next) => {
      next(new Error('Test error'));
    });

    app.use(errorHandler);

    const res = await request(app).get('/error');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: 'error',
      message: 'Test error',
    });
  });

  it('should return the error status code if provided', async () => {
    const app = express();
    
    // Silence console.error for tests
    vi.spyOn(console, 'error').mockImplementation(() => {});

    app.get('/error', (req, res, next) => {
      const error = new Error('Not found') as any;
      error.status = 404;
      next(error);
    });

    app.use(errorHandler);

    const res = await request(app).get('/error');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: 'error',
      message: 'Not found',
    });
  });
});
