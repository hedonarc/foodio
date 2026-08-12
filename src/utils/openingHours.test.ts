import {
  formatTimeOfDay,
  formatWeekday,
  groupOpeningHours,
  isOpenAt,
  type OpeningHours,
} from './openingHours';

/**
 * Instants in UTC, read against a fixed restaurant zone. Karachi is UTC+5 with
 * no DST, so each case is written as the Karachi wall-clock time it is about.
 */
const at = (isoUtc: string) => new Date(isoUtc);
const KARACHI = 'Asia/Karachi';

describe('isOpenAt', () => {
  const weekday: OpeningHours[] = [{ dayOfWeek: 1, opensAt: '11:00', closesAt: '22:00' }];

  it('is open between opening and closing', () => {
    // 2026-08-03 is a Monday.
    expect(isOpenAt(weekday, at('2026-08-03T07:00:00Z'), KARACHI)).toBe(true);
  });

  it('is closed before opening', () => {
    expect(isOpenAt(weekday, at('2026-08-03T05:59:00Z'), KARACHI)).toBe(false);
  });

  it('treats the opening minute as open and the closing minute as closed', () => {
    expect(isOpenAt(weekday, at('2026-08-03T06:00:00Z'), KARACHI)).toBe(true);
    expect(isOpenAt(weekday, at('2026-08-03T17:00:00Z'), KARACHI)).toBe(false);
  });

  it('is closed on a day with no entry', () => {
    // Tuesday.
    expect(isOpenAt(weekday, at('2026-08-04T07:00:00Z'), KARACHI)).toBe(false);
  });

  it('is closed when there are no opening hours at all', () => {
    expect(isOpenAt([], at('2026-08-03T07:00:00Z'), KARACHI)).toBe(false);
  });

  it('judges by the restaurant clock, not the phone in the hand', () => {
    const lunchtimeInKarachi = at('2026-08-03T07:00:00Z');

    expect(isOpenAt(weekday, lunchtimeInKarachi, KARACHI)).toBe(true);
    // Same instant, midnight on Monday in Los Angeles — shut.
    expect(isOpenAt(weekday, lunchtimeInKarachi, 'America/Los_Angeles')).toBe(false);
  });

  describe('periods running past midnight', () => {
    const lateNight: OpeningHours[] = [{ dayOfWeek: 5, opensAt: '18:00', closesAt: '02:00' }];

    it('is open late on its own day', () => {
      // Friday 23:30.
      expect(isOpenAt(lateNight, at('2026-08-07T18:30:00Z'), KARACHI)).toBe(true);
    });

    it('is still open in the small hours of the next day', () => {
      // Saturday 01:00 — covered by Friday's period.
      expect(isOpenAt(lateNight, at('2026-08-07T20:00:00Z'), KARACHI)).toBe(true);
    });

    it('is closed once the overnight period ends', () => {
      // Saturday 02:00.
      expect(isOpenAt(lateNight, at('2026-08-07T21:00:00Z'), KARACHI)).toBe(false);
    });
  });
});

describe('groupOpeningHours', () => {
  const sameHours = (dayOfWeek: number): OpeningHours => ({
    dayOfWeek,
    opensAt: '11:00',
    closesAt: '22:00',
  });

  it('collapses a full identical week into a single Monday-to-Sunday row', () => {
    const groups = groupOpeningHours([0, 1, 2, 3, 4, 5, 6].map(sameHours));

    expect(groups).toHaveLength(1);
    expect(groups[0]?.days).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it('splits when the hours differ', () => {
    const groups = groupOpeningHours([
      sameHours(1),
      sameHours(2),
      { dayOfWeek: 3, opensAt: '11:00', closesAt: '23:30' },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.days).toEqual([1, 2]);
    expect(groups[1]?.days).toEqual([3]);
  });

  it('splits when a day in the middle is closed', () => {
    const groups = groupOpeningHours([sameHours(1), sameHours(3)]);

    expect(groups.map((group) => group.days)).toEqual([[1], [3]]);
  });

  it('orders the week from Monday so a Mon-Fri block stays contiguous', () => {
    const groups = groupOpeningHours([1, 2, 3, 4, 5].map(sameHours));

    expect(groups).toHaveLength(1);
    expect(groups[0]?.days).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns nothing when the restaurant never opens', () => {
    expect(groupOpeningHours([])).toEqual([]);
  });
});

describe('formatWeekday', () => {
  it('maps 0 to Sunday and 1 to Monday, matching Date#getDay', () => {
    expect(formatWeekday(0, 'en-US')).toBe('Sun');
    expect(formatWeekday(1, 'en-US')).toBe('Mon');
    expect(formatWeekday(6, 'en-US')).toBe('Sat');
  });
});

describe('formatTimeOfDay', () => {
  it('uses a 12-hour clock for en-US', () => {
    expect(formatTimeOfDay('22:30', 'en-US')).toBe('10:30 PM');
  });

  it('uses a 24-hour clock for de-DE', () => {
    expect(formatTimeOfDay('22:30', 'de-DE')).toBe('22:30');
  });
});
