import { ApiError } from '@/api/errors';

import { isAlreadyReviewed } from './reviewSubmission';

describe('isAlreadyReviewed', () => {
  it('recognises the 409 the backend answers a second review with', () => {
    const conflict = new ApiError('client', 'You have already reviewed this order.', {
      status: 409,
    });
    expect(isAlreadyReviewed(conflict)).toBe(true);
  });

  it('leaves every other failure an error', () => {
    expect(isAlreadyReviewed(new ApiError('client', 'Forbidden.', { status: 403 }))).toBe(false);
    expect(isAlreadyReviewed(new ApiError('server', 'Down.', { status: 500 }))).toBe(false);
    expect(isAlreadyReviewed(new ApiError('network', 'Offline.'))).toBe(false);
    expect(isAlreadyReviewed(new Error('409'))).toBe(false);
  });
});
