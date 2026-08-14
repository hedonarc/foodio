import type { TFunction } from 'i18next';

import { toApiError } from '@/api/errors';

/**
 * A denied photo library is the owner's own choice, not a fault, so it gets its
 * own sentence. Everything else is whatever the API said.
 */
export function photoErrorMessage(cause: unknown, t: TFunction): string {
  if (cause instanceof Error && cause.message === 'photo-library-denied') {
    return t('work.menu.photoDenied');
  }

  return toApiError(cause).message;
}
