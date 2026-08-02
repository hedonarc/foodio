# Restaurant page clips

**What**: two labelled shelves on the restaurant page — "From <restaurant>",
then "From customers" — placed **after the menu**, in the gallery's old slot;
the gallery moves below. Tapping a card opens `clip/[id]`, a single full-screen
clip reusing the feed cell, closed with an X.

**Why this shape** ([#26](https://github.com/hedonarc/foodio/issues/26)):
separated because the two sources make different claims — claim first, then
evidence. After the menu because the menu is what people came for; the feed
does acquisition, this page does conversion. Each shelf renders only when
non-empty, and there is no "be the first to post" — there is no posting flow,
and inviting a post the app cannot accept is a lie.

**The marker travels** ([#32](https://github.com/hedonarc/foodio/issues/32)):
every card carries the authorship mark (check for a delivered order, storefront
for the restaurant's own) and the same composed accessibility label as a feed
cell — the shelf heading is gone the moment the clip is full-screen.

**The gallery survives**: 10 of 10 restaurants have galleries, 6 have clips.
Cutting stills would empty 40% of pages below the hero.

**Gone**: `ClipCarousel` — the Home shelf it existed for was replaced by the
Clips tab, and these shelves are its successor.
