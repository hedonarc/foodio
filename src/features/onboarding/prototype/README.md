# PROTOTYPE — location and delivery area

**Throwaway. Not merged to `main`. Not wired into onboarding. Nothing here
writes to the API.**

Answers Wayfinder ticket
[t8 — Setting the location and the delivery area](https://github.com/hedonarc/foodio-backend/blob/main/docs/wayfinder/restaurant-self-service/t8-location-and-delivery-area.md)
in the _Restaurants run themselves_ map.

## Run it

```
pnpm ios          # or: pnpm android
```

Then open the route:

```
foodio://prototype-location            # defaults to variant A
foodio://prototype-location?variant=C
```

Or cycle with the black bar at the bottom. That bar is deliberately ugly — it
is not part of the design being judged, and it is `__DEV__`-only.

## The three variants

They disagree about **what the primary affordance is**, which is the actual
question: is placing yourself a map gesture, a form field, or a choice about
who you want to serve?

|                    | Primary affordance                                  | How the radius is explained                | Asks the owner for     |
| ------------------ | --------------------------------------------------- | ------------------------------------------ | ---------------------- |
| **A — Map-first**  | Dragging the map under a fixed pin (the Uber shape) | A drawn circle over streets they recognise | A distance, as chips   |
| **B — Form-first** | "Use my current location", then a stepper           | **Words** — "Reaches Gulberg, Model Town"  | A distance, as ± steps |
| **C — Areas**      | Ticking the areas they want                         | The circle follows; the number is derived  | Nothing numeric at all |

**C is the one worth arguing about.** It never shows a radius as an input, and
it surfaces the thing a circle cannot do: tick one far area and several nearer
ones come along whether you wanted them or not. If that warning feels wrong,
the real answer may be that a radius is the wrong model and delivery areas want
polygons — which is a much larger decision than this ticket.

## What this proved about `expo-maps`

The map held `expo-maps` (alpha, unconfirmed on SDK 57) as fog since t3. See
the ticket's answer for the verdict.

## Throwing it away

Fold the winner into the real onboarding screen, then delete this directory and
`app/prototype-location.tsx` from `main`. The full set lives on the
`prototype/location-and-delivery-area` branch as the primary source.
