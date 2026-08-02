# Clips on a dish page

**What**: one restaurant clip beside one customer clip, headed _"How it looked ·
How it came"_. The labels carry the comparison, so the pairing reads without a
caption.

**Paired, not shelved.** All 4 dishes that have clips have exactly one of each,
so the pairing is never lopsided today. Shelves would render those two clips as
two rows of one, asking the reader to hold the first in mind while looking at
the second — which is the one thing this layout exists to avoid. The restaurant
page keeps its shelves: it answers _"what does this place look like"_ across
many dishes, where grouping by author is the useful cut.

**Degradation**: one side only renders alone, with **no empty slot** — a gap
where the customer clip should be reads as an accusation the data does not
support. More than one per side takes the most recent, since the API sorts by
`postedAt`. **No clips means no section** — not an empty state, not a prompt,
because there is still no posting flow to honour one.

**Tapping** opens `clip/[id]`, which already hides "View menu" — doubly wrong
here, since the viewer was reached _from_ the menu.

Decided in [#46](https://github.com/hedonarc/foodio/issues/46).
