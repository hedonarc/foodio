import { AxiosError, AxiosHeaders } from 'axios';

import { ApiError, toApiError } from './errors';

function axiosErrorWithResponse(status: number, data: unknown): AxiosError {
  const error = new AxiosError('Request failed');
  const headers = new AxiosHeaders();
  error.response = {
    status,
    statusText: '',
    data,
    headers,
    config: { headers },
  };
  return error;
}

describe('toApiError', () => {
  it('passes an existing ApiError straight through', () => {
    const original = new ApiError('server', 'boom');
    expect(toApiError(original)).toBe(original);
  });

  it('maps a missing response to a network error', () => {
    expect(toApiError(new AxiosError('Network Error')).kind).toBe('network');
  });

  it('maps an aborted request to a timeout', () => {
    const error = new AxiosError('timeout of 10000ms exceeded');
    error.code = 'ECONNABORTED';
    expect(toApiError(error).kind).toBe('timeout');
  });

  it('classifies 4xx as client and 5xx as server', () => {
    expect(toApiError(axiosErrorWithResponse(404, {})).kind).toBe('client');
    expect(toApiError(axiosErrorWithResponse(503, {})).kind).toBe('server');
  });

  it('prefers the message the server sent', () => {
    const error = toApiError(
      axiosErrorWithResponse(503, { error: { status: 503, message: 'Kitchen unreachable.' } }),
    );
    expect(error.message).toBe('Kitchen unreachable.');
  });

  it('falls back to a status-appropriate message when the body is empty', () => {
    // json-server answers an unknown id with a bare 404 and no body.
    expect(toApiError(axiosErrorWithResponse(404, {})).message).toContain('could not find');
  });

  it('keeps the status for callers that need it', () => {
    expect(toApiError(axiosErrorWithResponse(404, {})).status).toBe(404);
  });

  it('maps anything unrecognised to unknown', () => {
    expect(toApiError(new Error('???')).kind).toBe('unknown');
  });
});

describe('ApiError.isRetryable', () => {
  it('is true for failures that might succeed on a second attempt', () => {
    expect(new ApiError('network', '').isRetryable).toBe(true);
    expect(new ApiError('timeout', '').isRetryable).toBe(true);
    expect(new ApiError('server', '').isRetryable).toBe(true);
  });

  it('is false for a 404 or a broken contract, which will always fail the same way', () => {
    expect(new ApiError('client', '', { status: 404 }).isRetryable).toBe(false);
    expect(new ApiError('contract', '').isRetryable).toBe(false);
  });
});
