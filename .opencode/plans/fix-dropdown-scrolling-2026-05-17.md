# Fix dropdown mouse scrolling

## Problem
Mouse wheel scrolling doesn't work in country/state dropdowns. The dropdown popover opens but mouse wheel over the list items doesn't scroll.

## Root Cause
The `Command` component has `overflow-hidden`. Any scroll container inside it (`CommandList` with `overflow-y-auto`, or `ScrollArea` with Radix viewport) doesn't reliably capture wheel events because the parent `overflow-hidden` creates a stacking context that blocks event propagation.

## Final Solution
Make `CommandGroup` the scroll container directly by adding `max-h-[300px] overflow-y-auto` to its `className`. This overrides the base `overflow-hidden` for the Y-axis via CSS cascade (`overflow-x: hidden` from base, `overflow-y: auto` from override), creating a native scroll region that captures wheel events.

No intermediate wrappers (`CommandList`, `ScrollArea`) needed — items render directly inside the scrollable `CommandGroup`, which is cmdk-compatible.

## Files Changed
- `src/components/dropdown/countries.tsx`
- `src/components/dropdown/states.tsx`

## Changes

### countries.tsx
- Remove `CommandList` and `ScrollArea/ScrollBar` imports
- Replace `CommandList > CommandGroup > items` with `CommandGroup className="max-h-[300px] overflow-y-auto" > items`
- `Check` icon preserved, `justify-between` preserved

### states.tsx
Same pattern as countries.tsx.

## Verification
- `pnpm build` passes (only pre-existing errors in `command-menu.tsx`, `calendar.tsx`)
- Mouse wheel scrolls the dropdown list
- Check icon shows beside selected item
- Arrow key navigation auto-scrolls into view
