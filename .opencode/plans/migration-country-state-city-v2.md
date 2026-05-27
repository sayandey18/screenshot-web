# Migration Plan v2: Replace `country-state-city` with Local JSON Data

## What Went Wrong in v1
- Modified `billing/index.tsx` inline instead of leveraging existing Zustand-based dropdown components
- Left duplicate Popovers in `countries.tsx` (reference style + billing style)
- Left inline Popovers AND `<CountryDropdown/>`/`<StateDropdown/>` side-by-side in `billing/index.tsx`
- Created unnecessary `@/lib/countries.ts` — dropdowns already import JSON directly
- The separate dropdown architecture (`stores/location-store.ts`, `components/dropdown/*`) already existed but was ignored

---

## Step-by-Step v2 Plan

### Step 1 — Extend `src/stores/location-store.ts`
Add `stateCode` and `setStateCode` to the Zustand store.

**Why:** The billing API needs `stateCode` (e.g., "CA", "UP") for form submission, but the store only had `stateValue` (display name). The `CountryDropdown` also needs to reset state when country changes.

```diff
 interface LocationState {
   countryValue: string;
-  setCountryValue: (countries: string) => void;
+  setCountryValue: (code: string) => void;
   openCountryDropdown: boolean;
   setOpenCountryDropdown: (openCountry: boolean) => void;
   stateValue: string;
   setStateValue: (state: string) => void;
+  stateCode: string;
+  setStateCode: (code: string) => void;
   openStateDropdown: boolean;
   setOpenStateDropdown: (openState: boolean) => void;
 }
```

Initialize `stateCode: ""` and add `setStateCode: (code) => set({ stateCode: code })`.

### Step 2 — Rewrite `src/components/dropdown/countries.tsx`
Remove the first `<Popover>` (reference-repo dark style, lines 20-76) and keep only the second `<Popover>` (billing-style, lines 78-118), adapted to use Zustand.

**Keep:**
- billing-style trigger classes: `h-9 w-full min-w-0 justify-between gap-2 overflow-hidden font-normal`
- `ScrollArea className="h-[300px]"` + `ScrollBar` for scrollability

**Replace inline billing references with Zustand:**
- `countryPopoverOpen` → `openCountryDropdown` from `useLocationStore()`
- `countryCode` comparisons → `countryValue` (stores `iso2`) from Zustand
- `selectedCountry` → computed from `countries.find(c => c.iso2 === countryValue)`
- Trigger text: show emoji + country name when selected, "Select country" when not
- `onSelect`: set `countryValue = country.iso2`, reset `stateValue = ""`, `stateCode = ""`, close dropdown
- Command items: show emoji + country.name, `value={country.name}` for search filtering

**Remove:** unused imports (`cn`, `lowerCase` from utils, `Check` from lucide — actually keep `Check` for the checkmark)

### Step 3 — Rewrite `src/components/dropdown/states.tsx`
Replace the entire component — the old one filters by `country_name` (fragile) and has dark styling.

**New implementation:**
- Import `useLocationStore` for state management
- Filter: `states.filter(s => s.country_code === countryValue)` — uses `iso2` from Zustand, reliable
- Trigger: billing-style classes `h-9 w-full min-w-0 justify-between gap-2 overflow-hidden font-normal`
- Disabled: `!countryValue || filtered.length === 0`
- Trigger text: selected state name when `stateValue` is set, "Select state" when country selected, "Select country first" when no country
- `onSelect`: set `stateValue = lowerCase(state.name)` (for display), `setStateCode = state.state_code` (for API)
- Command items: show state name, `value={state.name}`, `ScrollArea` + `ScrollBar`

### Step 4 — Clean up `src/features/subscription/billing/index.tsx`
This is the biggest change — remove the inline Popovers and wire up the Zustand dropdowns.

**Remove imports:**
- `getCountries, getStates` from `@/lib/countries` (file will be deleted)
- `Command, CommandEmpty, CommandGroup, CommandInput, CommandItem` from `@/components/ui/command`
- `Popover, PopoverContent, PopoverTrigger` from `@/components/ui/popover`
- `ScrollArea, ScrollBar` from `@/components/ui/scroll-area`
- `useMemo` from `react`
- `Check, ChevronsUpDown` from `lucide-react`

**Add import:** `{ useLocationStore }` from `@/stores/location-store`

**Remove local state:**
- `countryCode` useState
- `stateCode` useState  
- `countryPopoverOpen` useState
- `statePopoverOpen` useState

**Remove local functions:**
- `handleCountryChange` — state reset is handled inside `CountryDropdown`'s `onSelect` now
- `handleStateChange` — state setting handled inside `StateDropdown`'s `onSelect`

**Remove computed values:**
- `countries` useMemo — no longer used
- `states` useMemo — no longer used
- `selectedCountry` useMemo — no longer used
- `selectedState` useMemo — no longer used

**Keep local state:**
- `fullName`, `addressLine1`, `city`, `postalCode` — these are text fields, not dropdowns

**Wire up `handleSaveAddress` to read from Zustand instead of local state:**
```ts
const handleSaveAddress = async () => {
  const { countryValue, stateCode } = useLocationStore.getState();
  if (!fullName || !addressLine1 || !countryValue || !stateCode || !city || !postalCode) {
    toast.error("Please complete all required address fields.");
    return;
  }
  const payload: BillingAddressInput = {
    fullName,
    addressLine1,
    city,
    stateCode,
    postalCode,
    countryCode: countryValue,
  };
  updateAddress.mutate(payload, { onSuccess: () => setAddressDialogOpen(false) });
};
```

**Wire up `openAddressDialog` to sync address data into Zustand:**
```ts
const openAddressDialog = () => {
  if (addressData) {
    const { setCountryValue, setStateValue, setStateCode } = useLocationStore.getState();
    setFullName(addressData.fullName);
    setAddressLine1(addressData.addressLine1);
    setCity(addressData.city);
    setPostalCode(addressData.postalCode);
    setCountryValue(addressData.countryCode);
    setStateCode(addressData.stateCode);
    // Find the matching state name for display in the dropdown
    const match = statesData.find(s => s.state_code === addressData.stateCode);
    setStateValue(match ? lowerCase(match.name) : "");
  }
  setAddressDialogOpen(true);
};
```
Add imports: `statesData` from `@/data/states.json`, `{ lowerCase }` from `@/lib/utils`.

**JSX DOM:**
- Keep `<CountryDropdown />` and `<StateDropdown />` in place (lines 353, 402 currently)
- Remove the wrapping inline Popovers entirely
- Keep `<Label>` elements — just remove `htmlFor` attributes

### Step 5 — Delete `src/lib/countries.ts`
No file imports from it anymore. The dropdowns import JSON directly. The billing form uses Zustand + `states.json` for the lookup.

### Step 6 — Remove npm dependency
```bash
pnpm remove country-state-city
```

### Step 7 — Verify
```bash
pnpm build
pnpm lint
```

---

## Summary of Files Changed

| File | Action |
|------|--------|
| `src/stores/location-store.ts` | Add `stateCode` + `setStateCode` |
| `src/components/dropdown/countries.tsx` | Remove first Popover, refactor second to use Zustand |
| `src/components/dropdown/states.tsx` | Full rewrite with billing-style UI + iso2 filtering |
| `src/features/subscription/billing/index.tsx` | Strip inline Popovers, wire Zustand, remove unused code |
| `src/lib/countries.ts` | **Delete** |
| `package.json` | Remove `country-state-city` dependency (already removed) |
