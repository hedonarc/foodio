import { MAX_EDGE, resizeTo } from './resize';

describe('resizeTo', () => {
  it('leaves a picture already within the limit alone', () => {
    expect(resizeTo({ width: 1200, height: 900 })).toBeUndefined();
    expect(resizeTo({ width: MAX_EDGE, height: MAX_EDGE })).toBeUndefined();
  });

  it('constrains the long edge of a landscape picture', () => {
    expect(resizeTo({ width: 4032, height: 3024 })).toEqual({ width: MAX_EDGE });
  });

  it('constrains the long edge of a portrait picture', () => {
    expect(resizeTo({ width: 3024, height: 4032 })).toEqual({ height: MAX_EDGE });
  });

  /**
   * Only ever one dimension. Giving the manipulator both is how a photograph
   * ends up subtly stretched, and nobody notices until a customer sees a
   * squashed biryani.
   */
  it('never constrains both dimensions at once', () => {
    const result = resizeTo({ width: 4032, height: 3024 });

    expect(result).toBeDefined();
    expect(Object.keys(result ?? {})).toHaveLength(1);
  });

  it('treats a square as landscape rather than doing nothing', () => {
    expect(resizeTo({ width: 3000, height: 3000 })).toEqual({ width: MAX_EDGE });
  });

  /**
   * A picker can report zeroes before a picture has loaded. Dividing by that
   * would be the bug; refusing to resize is harmless, because the upload is
   * still capped by the bucket.
   */
  it.each([[{ width: 0, height: 0 }], [{ width: 4032, height: 0 }], [{ width: -1, height: 900 }]])(
    'leaves nonsense dimensions alone: %j',
    (dimensions) => {
      expect(resizeTo(dimensions)).toBeUndefined();
    },
  );
});
