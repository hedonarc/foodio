import { z } from 'zod';

import { parsePage } from './page';

const schema = z.array(z.object({ id: z.string() }));

describe('parsePage', () => {
  it('carries the header cursor forward when present', () => {
    expect(parsePage(schema, [{ id: '1' }], 'abc123', 'GET /x')).toEqual({
      items: [{ id: '1' }],
      nextCursor: 'abc123',
    });
  });

  it('treats a missing header as the last page', () => {
    expect(parsePage(schema, [{ id: '1' }], undefined, 'GET /x').nextCursor).toBeNull();
  });

  it('treats an empty header as the last page', () => {
    expect(parsePage(schema, [], '', 'GET /x').nextCursor).toBeNull();
  });

  it('ignores a non-string header value', () => {
    // Axios types allow number/string[]/etc on a header; only a string is ever a real cursor.
    expect(parsePage(schema, [], ['abc'], 'GET /x').nextCursor).toBeNull();
    expect(parsePage(schema, [], 42, 'GET /x').nextCursor).toBeNull();
  });

  it('still parses the body through the shared schema', () => {
    expect(() => parsePage(schema, [{ id: 1 }], undefined, 'GET /x')).toThrow();
  });
});
