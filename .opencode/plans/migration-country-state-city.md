# Migration Plan: Replace `country-state-city` with Local JSON Data

## Scan Summary

### 1. `country-state-city` Imports & Usage
Only **one file** imports the package:
- `src/features/subscription/billing/index.tsx`
- Uses `Country.getAllCountries()` and `State.getStatesOfCountry(countryCode)` to populate dropdowns.
- Fields consumed: `.isoCode` and `.name`.

### 2. Form & State Handling
- Uses plain React `useState` hooks.
- **State Reset Logic:** The current implementation correctly handles resetting the state (`setStateCode("")`) whenever the `countryCode` changes. This is a critical pattern we must maintain (the reference repo relies on a Zustand store, but our local `handleCountryChange` approach perfectly achieves this).
- **Schema:** `data/schema.ts` validates `countryCode: z.string().length(2)` and `stateCode: z.string().min(1)`.

### 3. Component Architecture (Insights from Reference)
- The reference implementation uses a specific composition: `Popover` > `Command` > `CommandGroup` > `ScrollArea`. 
- Our current implementation relies on native CSS scrolling (`<CommandList className="max-h-64 overflow-y-auto...">`). We need to update this to use Shadcn's `<ScrollArea>` and `<ScrollBar>` for a consistent, polished UI, mirroring the reference repo's approach.
- All required Shadcn components (`popover`, `command`, `scroll-area`) are already installed in `src/components/ui/`.

### 4. Local JSON Data Structure
- `src/data/countries.json`: Top-level array containing objects with `.name` and `.iso2`.
- `src/data/states.json`: Top-level array containing objects with `.name`, `.state_code`, and a linking key `.country_code` (which maps to the country's `.iso2`).

---

## Step-by-Step Migration Plan

### Step 1 — Create `src/lib/countries.ts` Data Utility
Instead of importing the large JSON directly inside the component (like the reference does), we adapt it to our codebase by creating a utility file to encapsulate the filtering and sorting.

1. Create `src/lib/countries.ts`.
2. Import `countriesData` and `statesData`.
3. Export `CountryOption` and `StateOption` types (`{ isoCode: string; name: string }`).
4. Export `getCountries()`:
   - Map `countriesData` to `{ isoCode: c.iso2, name: c.name }`.
   - Sort alphabetically.
5. Export `getStates(countryCode: string)`:
   - Filter `statesData` by `s.country_code === countryCode` (more reliable than the reference's `sentenceCase` name matching).
   - Map to `{ isoCode: s.state_code, name: s.name }`.
   - Sort alphabetically.

### Step 2 — Update the Billing Component (`src/features/subscription/billing/index.tsx`)
1. **Update Imports:**
   - Remove `country-state-city` imports.
   - Import `getCountries`, `getStates` from `@/lib/countries`.
   - Import `ScrollArea` and `ScrollBar` from `@/components/ui/scroll-area`.
2. **Remove Local Functions:** Delete the old `getCountries` and `getStates` definitions from the component file.
3. **Refactor Dropdown UI (Popover + Command + ScrollArea pattern):**
   - Locate the `<CommandList>` for both Country and State dropdowns.
   - Wrap the mapped `<CommandItem>` elements inside a `<ScrollArea className="h-[300px] w-full">`.
   - Add `<ScrollBar orientation="vertical" />` inside the `ScrollArea`.
   - Ensure `CommandList` no longer uses native overflow classes.
4. **Preserve State Reset Logic:** Maintain the existing `handleCountryChange` function to ensure `setStateCode("")` triggers when a new country is selected.
5. **Disable Logic:** Ensure the State dropdown's `<Button>` remains disabled if `!countryCode` or if the filtered states array is empty (matching the reference repo's UX).

### Step 3 — Remove the npm Dependency
Run `pnpm remove country-state-city` to clean up the package and reduce the bundle size.

### Step 4 — Verify Build & Lint
Run `pnpm build` and `pnpm lint` to ensure type safety and formatting are intact.