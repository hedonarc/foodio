import { distanceBetween } from './distance';

const SF_MISSION = { latitude: 37.7599, longitude: -122.4148 };
const SF_NORTH_BEACH = { latitude: 37.8003, longitude: -122.4104 };
const BERKELEY = { latitude: 37.8715, longitude: -122.273 };

describe('distanceBetween', () => {
  it('is zero for the same point', () => {
    expect(distanceBetween(SF_MISSION, SF_MISSION)).toBe(0);
  });

  it('measures a few kilometres across a city', () => {
    // Mission to North Beach is about 4.5km.
    const metres = distanceBetween(SF_MISSION, SF_NORTH_BEACH);
    expect(metres).toBeGreaterThan(4_000);
    expect(metres).toBeLessThan(5_000);
  });

  it('measures tens of kilometres across a bay', () => {
    // Mission to Berkeley is about 18km.
    const metres = distanceBetween(SF_MISSION, BERKELEY);
    expect(metres).toBeGreaterThan(16_000);
    expect(metres).toBeLessThan(20_000);
  });

  it('is symmetric', () => {
    expect(distanceBetween(SF_MISSION, BERKELEY)).toBeCloseTo(
      distanceBetween(BERKELEY, SF_MISSION),
      6,
    );
  });

  it('handles the antimeridian without going imaginary', () => {
    const west = { latitude: 0, longitude: 179.9 };
    const east = { latitude: 0, longitude: -179.9 };

    // 0.2 degrees at the equator is roughly 22km, not a lap of the planet.
    expect(distanceBetween(west, east)).toBeLessThan(30_000);
  });
});
