import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateNameParam } from '@/middleware/validateNameParams';
import { ValidationError } from '@/errors/ValidationErrors';
import { Request, Response } from 'express';

describe('validateNameParam middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: any;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = vi.fn();
  });

  it('should call next() if name is a valid string', () => {
    mockRequest.query = { name: 'llcoolj' };
    validateNameParam(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
    expect(nextFunction).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should throw ValidationError 400 if name is missing', () => {
    mockRequest.query = {};
    validateNameParam(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
    const error = nextFunction.mock.calls[0][0];
    expect(error.status).toBe(400);
    expect(error.message).toContain('required');
  });

  it('should throw ValidationError 400 if name is empty string', () => {
    mockRequest.query = { name: '  ' };
    validateNameParam(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
    const error = nextFunction.mock.calls[0][0];
    expect(error.status).toBe(400);
  });

  it('should throw ValidationError 422 if name is not a string (e.g., array)', () => {
    mockRequest.query = { name: ['llcoolj', 'ali'] as any };
    validateNameParam(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
    const error = nextFunction.mock.calls[0][0];
    expect(error.status).toBe(422);
    expect(error.message).toContain('must be a string');
  });
});
