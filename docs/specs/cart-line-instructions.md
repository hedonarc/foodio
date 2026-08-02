# Cart line instructions

**What**: a `CartLine` carries an `instruction` — what the customer asked for.
Identity is **dish plus instruction**, not dish alone.

**The merge key** is `(menuItemId, instruction.trim())` — `sameLine` in
`cart.types.ts`. Trimmed because trailing whitespace is invisible and merging
on it never surprises anyone; **never case-folded**, because capitalisation is
a deliberate keystroke and folding would silently rewrite what someone typed.

**Empty is a value, not an absence.** The plain line is the one whose
instruction is `''`, which is why a whitespace-only note is the plain line
rather than a third invisible variant. One rule instead of two.

**`setLineInstruction` is an action, not a setter.** Editing re-applies the
identity rule: an edit that collides with another line for the same dish folds
quantity into it and drops the edited line. A setter that only rewrote the
string would leave two lines that are the same thing.

**Selectors that assumed one line per dish**: `selectQuantityOf` now sums
across every line for the dish — a badge reading "1" over a cart holding three
is wrong. `selectLineOf` became `selectPlainLineOf`, and the rename is the
point: the menu row is a **plain-line-only** control, because it cannot say
which noted line its stepper would mean. `selectItemCount` and
`selectSubtotalMinor` already folded over every line and needed nothing.

Decided in [#44](https://github.com/hedonarc/foodio/issues/44),
[#47](https://github.com/hedonarc/foodio/issues/47) and
[#48](https://github.com/hedonarc/foodio/issues/48).
