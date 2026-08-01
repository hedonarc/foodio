import { isAxiosError } from 'axios';

/**
 * Why a request failed, at the granularity the UI actually branches on.
 *
 * `contract` means the server answered but not in the shape we expect, and
 * `config` means the request never left because the app does not know where to
 * send it. Both are bugs rather than conditions a user can retry away.
 */
export type ApiErrorKind =
  'network' | 'timeout' | 'client' | 'server' | 'contract' | 'config' | 'unknown';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, options?: { status?: number; cause?: unknown }) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'ApiError';
    this.kind = kind;
    if (options?.status !== undefined) this.status = options.status;
  }

  /** Retrying a network blip may help; a 404 or a broken contract never will. */
  get isRetryable(): boolean {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server';
  }
}

/** Error envelope returned by the mock API's middleware. */
function readServerMessage(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) return null;

  const { error } = payload as { error?: unknown };
  if (typeof error !== 'object' || error === null) return null;

  const { message } = error as { message?: unknown };
  return typeof message === 'string' && message.length > 0 ? message : null;
}

function messageForStatus(status: number): string {
  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 408) return 'The request took too long. Please try again.';
  if (status >= 500) return 'Something went wrong on our end. Please try again.';
  return 'That request could not be completed.';
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError('timeout', 'The request took too long. Please try again.', {
        cause: error,
      });
    }

    if (!error.response) {
      return new ApiError('network', 'Cannot reach the server. Check your connection.', {
        cause: error,
      });
    }

    const { status, data } = error.response;
    return new ApiError(
      status >= 500 ? 'server' : 'client',
      readServerMessage(data) ?? messageForStatus(status),
      {
        status,
        cause: error,
      },
    );
  }

  return new ApiError('unknown', 'Something went wrong. Please try again.', { cause: error });
}
