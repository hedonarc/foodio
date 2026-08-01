import { z } from 'zod';

import { ApiError } from './errors';
import { parseResponse } from './parse';

const schema = z.object({ id: z.string(), priceMinor: z.number().int() });

describe('parseResponse', () => {
  it('returns the parsed value when the response matches', () => {
    expect(parseResponse(schema, { id: 'r1', priceMinor: 1499 }, 'GET /x')).toEqual({
      id: 'r1',
      priceMinor: 1499,
    });
  });

  it('strips fields the contract does not declare', () => {
    // The list endpoint returns whole restaurants; a summary schema drops the rest.
    const parsed = parseResponse(schema, { id: 'r1', priceMinor: 1499, gallery: [] }, 'GET /x');
    expect(parsed).not.toHaveProperty('gallery');
  });

  it('throws a contract ApiError when a field is missing', () => {
    expect(() => parseResponse(schema, { id: 'r1' }, 'GET /x')).toThrow(ApiError);
  });

  it('names the endpoint and the offending field', () => {
    expect(() => parseResponse(schema, { id: 'r1' }, 'GET /restaurants')).toThrow(
      /GET \/restaurants.*priceMinor/s,
    );
  });

  it('marks contract failures as not retryable', () => {
    try {
      parseResponse(schema, {}, 'GET /x');
      throw new Error('expected parseResponse to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).kind).toBe('contract');
      expect((error as ApiError).isRetryable).toBe(false);
    }
  });

  it('rejects a float where an integer price is required', () => {
    expect(() => parseResponse(schema, { id: 'r1', priceMinor: 14.99 }, 'GET /x')).toThrow(
      ApiError,
    );
  });
});
