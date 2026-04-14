import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGenderFromName } from '@/services/genderiseService';
import { ApiError, NoPredictionError } from '@/errors/ExternalApiErrors';
import { fetch } from 'undici';

vi.mock('undici', () => ({
  fetch: vi.fn(),
  ProxyAgent: vi.fn(),
}));

describe('genderiseService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return transformed response for high confidence result', async () => {
    const mockResponse = {
      count: 1500,
      name: 'luc',
      gender: 'male',
      probability: 0.98,
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getGenderFromName('luc');

    expect(result.name).toBe('luc');
    expect(result.gender).toBe('male');
    expect(result.is_confident).toBe(true);
    expect(result.sample_size).toBe(1500);
    expect(result.processed_at).toBeDefined();
  });

  it('should return is_confident false if probability is low', async () => {
    const mockResponse = {
      count: 1500,
      name: 'kim',
      gender: 'female',
      probability: 0.5,
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getGenderFromName('kim');

    expect(result.is_confident).toBe(false);
  });

  it('should return is_confident false if sample size is small', async () => {
    const mockResponse = {
      count: 50,
      name: 'rare',
      gender: 'male',
      probability: 0.99,
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getGenderFromName('rare');

    expect(result.is_confident).toBe(false);
  });

  it('should throw ApiError if response is not ok', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'Rate limit exceeded',
    });

    vi.spyOn(console, 'error').mockImplementation(() => { });

    await expect(getGenderFromName('luc')).rejects.toThrow(ApiError);
    await expect(getGenderFromName('luc')).rejects.toThrow('Genderize API returned non-OK status');
  });

  it('should throw ApiError 504 on timeout', async () => {
    (fetch as any).mockRejectedValue(new DOMException('The user aborted a request.', 'AbortError'));

    try {
      await getGenderFromName('luc');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(504);
      expect(error.message).toContain('timed out');
    }
  });

  it('should throw ApiError 502 on network error', async () => {
    (fetch as any).mockRejectedValue(new Error('Network failure'));

    await expect(getGenderFromName('luc')).rejects.toThrow(ApiError);
    await expect(getGenderFromName('luc')).rejects.toThrow('Failed to fetch from Genderize API: Network failure');
  });

  it('should throw NoPredictionError when API returns null gender', async () => {
    const mockResponse = {
      count: 0,
      name: 'unknown_name_xyz',
      gender: null,
      probability: null,
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await expect(getGenderFromName('unknown_name_xyz')).rejects.toThrow(NoPredictionError);
    await expect(getGenderFromName('unknown_name_xyz')).rejects.toThrow('No prediction available');
  });
});
