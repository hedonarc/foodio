# Testing hooks and components

`@testing-library/react-native@14.0.1` plus `react-test-renderer` matching the
installed React. Both work; [#18](https://github.com/hedonarc/foodio/issues/18)
concluded otherwise and was wrong.

**`render` and `renderHook` are async in v14 — `await` them.** The error that
closed the door last time —

```
Property 'result' does not exist on type 'Promise<RenderHookResult<…>>'
```

— is not a broken type. `render-hook.d.ts` declares
`Promise<RenderHookResult<Result, Props>>`, so the type is telling the truth and
the call needs awaiting. Typecheck and runtime both pass once it is.

**`jest.mock` factories are hoisted**, so any variable they close over must be
`mock`-prefixed. `const isFocused = jest.fn()` fails with _"not allowed to
reference any out-of-scope variables"_; `mockIsFocused` works. Rename the
variable, not the mocked property — the property still has to match what the
code under test calls.

**What is worth testing here** rather than everything that renders: behaviour a
pure function cannot express. `Link.test.tsx` presses the _text_ rather than the
padding, guarding the regression where NativeWind's `active:` on a `Text` made
it a touch responder that swallowed the press — found on a device, invisible to
every other kind of test.
