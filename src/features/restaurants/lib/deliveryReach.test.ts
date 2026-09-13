import { deliveryReach, toKm } from './deliveryReach';

// Sweet Tooth Bakery, Garden Town, and a home ~500 m north-east of it.
const bakery = { latitude: 31.5825, longitude: 74.3499, deliveryRadiusMeters: 3500 };
const home = { latitude: 31.584, longitude: 74.352 };
const farAway = { latitude: 31.505, longitude: 74.36 };

describe('deliveryReach', () => {
  it('reaches an address inside the radius', () => {
    const reach = deliveryReach(home, bakery);

    expect(reach.deliverable).toBe(true);
    expect(reach.distanceMeters).toBeGreaterThan(200);
    expect(reach.distanceMeters).toBeLessThan(400);
    expect(reach.radiusMeters).toBe(3500);
  });

  it('does not reach an address past the radius, and says how far', () => {
    const reach = deliveryReach(farAway, bakery);

    expect(reach.deliverable).toBe(false);
    expect(reach.distanceMeters).toBeGreaterThan(8000);
  });

  it('takes the server at its word when it answered', () => {
    const said = deliveryReach(farAway, { ...bakery, isDeliverable: true, distanceMeters: 1200 });

    expect(said).toEqual({ deliverable: true, distanceMeters: 1200, radiusMeters: 3500 });
  });

  it('falls back to the radius when the server said no without a distance', () => {
    expect(deliveryReach(home, { ...bakery, isDeliverable: false }).distanceMeters).toBe(3500);
  });
});

describe('toKm', () => {
  it('rounds to a tenth', () => {
    expect(toKm(1434)).toBe('1.4');
    expect(toKm(8766)).toBe('8.8');
  });
});
