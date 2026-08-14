import {
  DAYS,
  emptyWeek,
  fromOpeningHours,
  isOvernight,
  MAX_SHIFTS,
  optionsFor,
  problemsWith,
  TIMES,
  toOpeningHours,
  withCurrent,
  withExtraShift,
} from './week';

const day = (value: number) => `Day ${value}`;

describe('TIMES', () => {
  it('covers the whole day at half-hour steps', () => {
    expect(TIMES).toHaveLength(48);
    expect(TIMES[0]).toBe('00:00');
    expect(TIMES[1]).toBe('00:30');
    expect(TIMES.at(-1)).toBe('23:30');
  });

  it('is sorted as text, which is what every comparison here relies on', () => {
    expect([...TIMES].sort()).toEqual([...TIMES]);
  });
});

describe('fromOpeningHours', () => {
  it('groups windows onto their day and sorts them chronologically', () => {
    const week = fromOpeningHours([
      { dayOfWeek: 1, opensAt: '19:00', closesAt: '23:30' },
      { dayOfWeek: 1, opensAt: '12:00', closesAt: '15:00' },
    ]);

    expect(week[1]).toEqual([
      { opensAt: '12:00', closesAt: '15:00' },
      { opensAt: '19:00', closesAt: '23:30' },
    ]);
  });

  it('leaves a day with no hours empty rather than absent', () => {
    expect(fromOpeningHours([])[3]).toEqual([]);
  });

  it('round-trips through toOpeningHours', () => {
    const hours = [
      { dayOfWeek: 1, opensAt: '12:00', closesAt: '15:00' },
      { dayOfWeek: 1, opensAt: '19:00', closesAt: '23:30' },
      { dayOfWeek: 0, opensAt: '11:00', closesAt: '22:00' },
    ];

    expect(toOpeningHours(fromOpeningHours(hours))).toEqual(
      expect.arrayContaining(hours.map((entry) => expect.objectContaining(entry))),
    );
    expect(toOpeningHours(fromOpeningHours(hours))).toHaveLength(3);
  });

  it('orders the week from Monday so Sunday lands last', () => {
    const week = emptyWeek();
    for (const value of DAYS) week[value] = [{ opensAt: '11:00', closesAt: '22:00' }];

    expect(toOpeningHours(week).map((entry) => entry.dayOfWeek)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });
});

describe('optionsFor', () => {
  const split = [
    { opensAt: '11:00', closesAt: '15:00' },
    { opensAt: '19:00', closesAt: '23:30' },
  ];

  it('stops a later shift starting before the one before it ends', () => {
    const options = optionsFor(split, 1, 'opensAt');

    expect(options).not.toContain('15:00');
    expect(options).not.toContain('12:00');
    expect(options[0]).toBe('15:30');
  });

  it('stops an earlier shift closing after the next one starts', () => {
    const options = optionsFor(split, 0, 'closesAt');

    expect(options).not.toContain('19:00');
    expect(options).not.toContain('23:00');
    expect(options.at(-1)).toBe('18:30');
  });

  /**
   * A shift with another after it cannot run past midnight, so its open is also
   * bounded by its own close. Only a day's last window closes unbounded.
   */
  it('bounds an earlier shift by its own close, so it cannot go overnight', () => {
    expect(optionsFor(split, 0, 'opensAt')).not.toContain('16:00');
    expect(optionsFor(split, 1, 'closesAt')).toEqual(TIMES);
  });

  it('leaves a lone shift completely free, so overnight stays reachable', () => {
    const lone = [{ opensAt: '19:00', closesAt: '01:00' }];

    expect(optionsFor(lone, 0, 'opensAt')).toEqual(TIMES);
    expect(optionsFor(lone, 0, 'closesAt')).toEqual(TIMES);
  });

  /**
   * The no-dead-end property, and the reason every bound is read off the current
   * week: a control whose list excluded its own value would have nothing to show.
   */
  it.each([
    [0, 'opensAt' as const],
    [0, 'closesAt' as const],
    [1, 'opensAt' as const],
    [1, 'closesAt' as const],
  ])('always offers the value shift %i is already showing for %s', (index, field) => {
    const options = optionsFor(split, index, field);

    expect(options).toContain(split[index]?.[field]);
    expect(options.length).toBeGreaterThan(0);
  });
});

describe('withExtraShift', () => {
  it('splits an all-day window rather than appending an overlapping one', () => {
    expect(withExtraShift([{ opensAt: '11:00', closesAt: '23:00' }])).toEqual([
      { opensAt: '11:00', closesAt: '15:00' },
      { opensAt: '19:00', closesAt: '23:30' },
    ]);
  });

  /**
   * Clipping unconditionally made 19:00 to 15:00 — an accidental overnight
   * window — which is exactly the bug the prototype shipped with.
   */
  it('does not clip a shift that already starts in the evening', () => {
    const result = withExtraShift([{ opensAt: '19:00', closesAt: '23:30' }]);

    expect(result[0]).toEqual({ opensAt: '12:00', closesAt: '15:00' });
    expect(isOvernight(result[0] ?? { opensAt: '', closesAt: '' })).toBe(false);
  });

  it('refuses to go past the cap', () => {
    const full = [
      { opensAt: '12:00', closesAt: '15:00' },
      { opensAt: '19:00', closesAt: '23:30' },
    ];

    expect(withExtraShift(full)).toHaveLength(MAX_SHIFTS);
  });
});

describe('problemsWith', () => {
  it('says nothing about a sound week', () => {
    const week = emptyWeek();
    week[1] = [
      { opensAt: '12:00', closesAt: '15:00' },
      { opensAt: '19:00', closesAt: '23:30' },
    ];

    expect(problemsWith(week, day)).toEqual([]);
  });

  it('catches a zero-length window', () => {
    const week = emptyWeek();
    week[2] = [{ opensAt: '12:00', closesAt: '12:00' }];

    expect(problemsWith(week, day)[0]).toContain('same time');
  });

  it('catches an overlap, whatever order the windows arrive in', () => {
    const week = emptyWeek();
    week[3] = [
      { opensAt: '19:00', closesAt: '23:00' },
      { opensAt: '12:00', closesAt: '20:00' },
    ];

    expect(problemsWith(week, day)[0]).toContain('overlap');
  });

  it('does not mistake an overnight window for an overlap', () => {
    const week = emptyWeek();
    week[4] = [{ opensAt: '19:00', closesAt: '01:00' }];

    expect(problemsWith(week, day)).toEqual([]);
  });

  it('is silent about a closed week — an empty week is closed, not wrong', () => {
    expect(problemsWith(emptyWeek(), day)).toEqual([]);
  });
});

describe('withCurrent', () => {
  it('leaves a value already on the grid alone', () => {
    expect(withCurrent(['09:00', '09:30'], '09:00')).toEqual(['09:00', '09:30']);
  });

  /**
   * Stored data need not sit on the half-hour grid — 23:59 is real, and a
   * picker unable to show its own current value looks broken.
   */
  it('adds an off-grid value in the right place', () => {
    expect(withCurrent(['23:00', '23:30'], '23:59')).toEqual(['23:00', '23:30', '23:59']);
    expect(withCurrent(['09:00', '10:00'], '09:45')).toEqual(['09:00', '09:45', '10:00']);
  });

  it('ignores an empty value rather than adding a blank row', () => {
    expect(withCurrent(['09:00'], '')).toEqual(['09:00']);
  });
});
