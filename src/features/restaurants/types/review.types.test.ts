import { newReviewSchema, reviewFormSchema, toNewReview } from './review.types';

describe('newReviewSchema', () => {
  it.each([1, 3, 5])('accepts a rating of %i', (rating) => {
    expect(newReviewSchema.safeParse({ rating }).success).toBe(true);
  });

  it.each([0, 6, 2.5, -1])('rejects a rating of %s', (rating) => {
    expect(newReviewSchema.safeParse({ rating }).success).toBe(false);
  });

  it('accepts a comment at the 1000-char cap', () => {
    expect(newReviewSchema.safeParse({ rating: 4, comment: 'a'.repeat(1000) }).success).toBe(true);
  });

  it('rejects a comment over the cap', () => {
    expect(newReviewSchema.safeParse({ rating: 4, comment: 'a'.repeat(1001) }).success).toBe(false);
  });

  it('treats the comment as optional', () => {
    expect(newReviewSchema.safeParse({ rating: 5 }).success).toBe(true);
  });
});

describe('reviewFormSchema', () => {
  it('rejects the unset rating the form starts with', () => {
    expect(reviewFormSchema.safeParse({ rating: 0, comment: '' }).success).toBe(false);
  });

  it('accepts a picked rating and an empty comment', () => {
    expect(reviewFormSchema.safeParse({ rating: 5, comment: '' }).success).toBe(true);
  });

  it('rejects a comment over the cap', () => {
    expect(reviewFormSchema.safeParse({ rating: 5, comment: 'a'.repeat(1001) }).success).toBe(
      false,
    );
  });
});

describe('toNewReview', () => {
  it('omits a whitespace-only comment from the payload', () => {
    expect(toNewReview({ rating: 4, comment: '   ' })).toEqual({ rating: 4 });
  });

  it('trims and keeps a real comment', () => {
    expect(toNewReview({ rating: 4, comment: ' great ' })).toEqual({
      rating: 4,
      comment: 'great',
    });
  });
});
