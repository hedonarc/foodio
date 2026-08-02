# Mockups

Browser-viewable design mockups. Not production code — the app itself is
React Native; these exist to make design decisions cheap to see and argue
about. Serve the folder and open on a phone or in devtools mobile view:

```
python3 -m http.server 4173 --directory mockups
```

## home-directions/ — the wheel

Ten Home-screen directions, switchable via `?variant=` (arrows or the pill).
All render real content from `mocks/db.json`.

| key | name | fabric |
|-----|------|--------|
| B | Marketplace | white, dense, carousels + grid — **chosen** |
| C | Clips first | full-bleed snapping video feed |
| D | Dish first | dark 2-up dish grid, restaurant demoted |
| F | Clips + list | clip hero over a scannable sheet |
| H | Gallery | pure typography, no cards |
| I | Decided | one recommendation, rest behind a link |
| J | Ask | the app converses and justifies picks |
| K | Tonight | pick the arrival time, food follows |
| L | The Block | night map, kitchens as lit windows |
| M | One | one dish at a time — PASS / EAT |

Cut along the way: A (editorial serif), E (single column), G (ad-vs-arrived
proof cards).

**Decision: B** for the app's design language (2026-08-03). The brand colour
is NOT settled — `#FF9800` everywhere is scaffolding.

## app-b/ — B through the app

The chosen language applied to the screens that stress it: home, restaurant
detail, dish detail, cart. Switch with `?screen=`.
