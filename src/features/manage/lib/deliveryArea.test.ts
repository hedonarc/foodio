import {
  formatRadius,
  hasChanged,
  movedFar,
  RADIUS_CHOICES,
  radiusChoicesFor,
  zoomForRadius,
} from './deliveryArea';

const LAHORE = { latitude: 31.5204, longitude: 74.3587 };

describe('formatRadius', () => {
  it('keeps metres below a kilometre', () => {
    expect(formatRadius(500)).toBe('500 m');
  });

  it('drops a trailing zero rather than writing 3.0 km', () => {
    expect(formatRadius(3_000)).toBe('3 km');
  });

  it('keeps one decimal where it carries information', () => {
    expect(formatRadius(1_500)).toBe('1.5 km');
  });
});

describe('radiusChoicesFor', () => {
  it('leaves the list alone for a radius already on it', () => {
    expect(radiusChoicesFor(3_000)).toEqual([...RADIUS_CHOICES]);
  });

  it('keeps an off-grid radius rather than rounding it away', () => {
    expect(radiusChoicesFor(3_500)).toContain(3_500);
  });

  it('slots it into place, so the chips still read low to high', () => {
    const choices = radiusChoicesFor(3_500);
    expect(choices).toEqual([...choices].sort((a, b) => a - b));
    expect(choices).toHaveLength(RADIUS_CHOICES.length + 1);
  });

  it('never drops a standard choice to make room', () => {
    for (const standard of RADIUS_CHOICES) {
      expect(radiusChoicesFor(6_400)).toContain(standard);
    }
  });
});

describe('hasChanged', () => {
  const saved = { point: LAHORE, radiusMeters: 3_000 };

  it('is false for an untouched screen', () => {
    expect(hasChanged(saved, saved)).toBe(false);
  });

  it('ignores the metre or two the camera drifts on its own', () => {
    const drifted = { latitude: LAHORE.latitude + 0.00002, longitude: LAHORE.longitude };
    expect(hasChanged(saved, { point: drifted, radiusMeters: 3_000 })).toBe(false);
  });

  it('notices a deliberate drag', () => {
    const moved = { latitude: LAHORE.latitude + 0.002, longitude: LAHORE.longitude };
    expect(hasChanged(saved, { point: moved, radiusMeters: 3_000 })).toBe(true);
  });

  it('notices a radius change with the pin left alone', () => {
    expect(hasChanged(saved, { point: LAHORE, radiusMeters: 5_000 })).toBe(true);
  });
});

describe('movedFar', () => {
  it('says nothing about a nudge down the street', () => {
    expect(movedFar(LAHORE, { latitude: 31.5215, longitude: 74.3587 })).toBe(false);
  });

  it('warns when the kitchen has crossed the city', () => {
    expect(movedFar(LAHORE, { latitude: 31.4697, longitude: 74.2728 })).toBe(true);
  });
});

describe('zoomForRadius', () => {
  it('gives up one zoom level per doubling of the radius', () => {
    expect(zoomForRadius(1_000) - zoomForRadius(2_000)).toBeCloseTo(1);
  });

  it('zooms out as the circle grows, never in', () => {
    const zooms = RADIUS_CHOICES.map(zoomForRadius);
    expect(zooms).toEqual([...zooms].sort((a, b) => b - a));
  });
});
