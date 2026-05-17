# Plan: Fix Broken `billing/switch/preview` & Align Frontend to New Backend API

## Status: Ready for implementation

---

## Background

The backend `billing.ts` has undergone a breaking API redesign. Three endpoints changed:

| Endpoint | Old behaviour | New behaviour |
|---|---|---|
| `POST /billing/switch/preview` | Existed — returned preview data | **Removed entirely. No replacement.** |
| `POST /billing/checkout` | Body: `{ plan: "GROWTH" \| "ENTERPRISE" }` | Body: `{ slug: "growth-plan" \| "enterprise-plan" }` |
| `POST /billing/switch` | Body: `{ plan: "GROWTH" \| "ENTERPRISE" }` | Body: `{ slug, billingMode?, quantity? }` |

The frontend is still calling the old shapes, causing an error toast when users try to switch between paid plans ("Unable to fetch switch preview. Please try again.").

---

## Root Cause

`fetchSwitchPreview` in `src/features/subscription/data/api.ts:78` calls `POST /billing/switch/preview`, which no longer exists. The mutation's `onError` handler fires the error toast.

Additionally, `startCheckout` (line 73) and `confirmSwitch` (line 83) both send `{ plan: "GROWTH" }` style bodies, but the backend now expects `{ slug: "growth-plan" }` — these would fail silently or return 400 errors.

---

## Affected Files (3 total)

1. `src/features/subscription/data/api.ts`
2. `src/features/subscription/hooks/use-subscription.ts`
3. `src/features/subscription/plans/index.tsx`

---

## Detailed Changes

### Step 1 — `src/features/subscription/data/api.ts`

This is the data layer. All API contract changes are encapsulated here so higher layers stay clean.

**1a. Add a plan-to-slug mapping helper** (private, not exported)

```ts
const planToSlug: Record<Exclude<PlanId, "STARTER">, "growth-plan" | "enterprise-plan"> = {
  GROWTH: "growth-plan",
  ENTERPRISE: "enterprise-plan",
};
```

**1b. Update `startCheckout`** — map `PlanId` to slug before sending

```ts
// Before
export async function startCheckout(plan: Exclude<PlanId, "STARTER">): Promise<{ checkoutUrl: string }> {
  const { data } = await api.post<{ checkoutUrl: string }>("/billing/checkout", { plan });
  return data;
}

// After
export async function startCheckout(plan: Exclude<PlanId, "STARTER">): Promise<{ checkoutUrl: string }> {
  const { data } = await api.post<{ checkoutUrl: string }>("/billing/checkout", { slug: planToSlug[plan] });
  return data;
}
```

**1c. Update `confirmSwitch`** — map `PlanId` to slug, add `billingMode` and `quantity`

```ts
// Before
export async function confirmSwitch(plan: Exclude<PlanId, "STARTER">): Promise<void> {
  await api.post("/billing/switch", { plan });
}

// After
export async function confirmSwitch(plan: Exclude<PlanId, "STARTER">): Promise<void> {
  await api.post("/billing/switch", {
    slug: planToSlug[plan],
    billingMode: "prorated_immediately",
    quantity: 1,
  });
}
```

> `billingMode: "prorated_immediately"` matches the backend SwitchPlanBodySchema default. `quantity: 1`
> is the standard value. Both are hardcoded since the frontend has no UI to configure them.

**1d. Remove `fetchSwitchPreview` function entirely** (lines 78-80)

**1e. Remove `SwitchPreviewResponse` type entirely** (lines 15-22)

---

### Step 2 — `src/features/subscription/hooks/use-subscription.ts`

This is the hook layer. Only dead code is removed.

**2a. Remove `fetchSwitchPreview` from the import** (line 7)

**2b. Remove `SwitchPreviewResponse` from the import** (line 14)

**2c. Remove the `SwitchPreviewResponse` re-export** from line 20:

```ts
// Before
export type { PlanId, SwitchPreviewResponse, PaymentMethodItem, BillingAddressInput };

// After
export type { PlanId, PaymentMethodItem, BillingAddressInput };
```

**2d. Remove `SwitchPreviewInput` type** (line 22)

**2e. Remove `useSwitchPreview` hook entirely** (lines 57-63)

No changes needed to `useConfirmSwitch` — its mutationFn signature stays the same
(`{ plan: Exclude<PlanId, "STARTER"> }`); slug translation now happens transparently
inside `confirmSwitch` in `data/api.ts`.

---

### Step 3 — `src/features/subscription/plans/index.tsx`

This is the UI layer. The paid-to-paid switch flow is simplified from a 2-step async
flow (preview then confirm) to a 1-step direct confirmation dialog.

**3a. Remove `useSwitchPreview` from import** (line 17)

**3b. Remove `type SwitchPreviewResponse` from import** (line 18)

**3c. Remove the `useSwitchPreview` mutation** (line 112):

```ts
// Remove:
const { mutate: fetchSwitchPreview, isPending: isFetchingPreview } = useSwitchPreview();
```

**3d. Remove `isFetchingPreview` from `isBusy`** (line 129):

```ts
// Before
const isBusy = isLoading || isCheckingOut || isFetchingPreview || isConfirmingSwitch || isCancelling;

// After
const isBusy = isLoading || isCheckingOut || isConfirmingSwitch || isCancelling;
```

**3e. Remove `switchPreview` state** (line 119):

```ts
// Remove:
const [switchPreview, setSwitchPreview] = useState<SwitchPreviewResponse | null>(null);
```

**3f. Simplify `handleSelectPlan` for the paid-to-paid case** (lines 158-171):

```ts
// Before: async preview call, then open dialog on success
setTargetSwitchPlan(targetPlan);
setPendingPlanId(targetPlan.id);
fetchSwitchPreview(
  { plan: targetPlan.id },
  {
    onSuccess: (preview) => {
      setSwitchPreview(preview ?? null);
      setSwitchDialogOpen(true);
    },
    onError: () => {
      setPendingPlanId(null);
    },
  }
);

// After: open dialog immediately, no API call needed
setTargetSwitchPlan(targetPlan);
setPendingPlanId(targetPlan.id);
setSwitchDialogOpen(true);
```

**3g. Remove preview-derived display variables** (lines 198-205):

```ts
// Remove all four:
const previewTitle = switchPreview?.title ?? "Confirm plan switch";
const previewDescription = switchPreview?.description ?? "...";
const previewLines = Array.isArray(switchPreview?.lines) ? switchPreview.lines : [];
const previewAmount = typeof switchPreview?.amount === "number" ? `...` : null;
```

**3h. Update the switch ConfirmDialog to use static strings** (lines 356-391):

The dialog already used fallback strings when preview returned nothing. Promote those
fallbacks to the actual values:

```tsx
// Before (dynamic from preview):
title={previewTitle}
desc={
  <div className="space-y-2">
    <p>{previewDescription}</p>
    {targetSwitchPlan ? <p>Target plan: <span className="font-medium">{targetSwitchPlan.name}</span></p> : null}
    {previewAmount ? <p>Charge preview: <span className="font-medium">{previewAmount}</span></p> : null}
    {previewLines.length > 0 ? <ul>...</ul> : null}
  </div>
}

// After (static):
title="Confirm plan switch"
desc={
  <div className="space-y-2">
    <p>Your subscription will switch to the selected paid plan on confirmation.</p>
    {targetSwitchPlan ? (
      <p>Target plan: <span className="font-medium">{targetSwitchPlan.name}</span></p>
    ) : null}
  </div>
}
```

**3i. Clean up `handleConfirmSwitch`** — remove the `setSwitchPreview(null)` call (line 188):

```ts
// Before
onSuccess: () => {
  setSwitchDialogOpen(false);
  setTargetSwitchPlan(null);
  setSwitchPreview(null);  // remove this
  setPendingPlanId(null);
},

// After
onSuccess: () => {
  setSwitchDialogOpen(false);
  setTargetSwitchPlan(null);
  setPendingPlanId(null);
},
```

---

## What Does NOT Change

- `/billing/cancel` — no changes, body format is unchanged (no body required)
- `/billing/subscription` — no changes
- `/billing/address` (GET/PUT) — no changes
- `/billing/portal` — no changes
- `/billing/invoices` — no changes
- `/billing/payment-methods` — no changes
- The checkout flow (STARTER to paid plan) — behaviour unchanged, only the internal body
  mapping in `startCheckout` changes
- The cancel flow (paid to STARTER) — no changes
- All type definitions in `data/schema.ts` — no changes
- `use-billing.ts`, `use-invoices.ts` — no changes
- All route files under `src/routes/_authenticated/subscription/` — no changes

---

## New Switch Flow (After Fix)

```
User clicks "Upgrade" / "Downgrade" on a paid plan card
         |
         v
handleSelectPlan() -- sets targetSwitchPlan, setPendingPlanId, opens dialog immediately
         |
         v
ConfirmDialog shown with static text + target plan name
         |
         v
User clicks "Confirm Switch"
         |
         v
confirmSwitch({ plan: targetSwitchPlan.id })
  --> POST /billing/switch { slug: "growth-plan", billingMode: "prorated_immediately", quantity: 1 }
         |
         v
onSuccess: close dialog, invalidate caches, toast "Your subscription plan has been updated."
```

---

## Risk Assessment

| Risk | Likelihood | Notes |
|---|---|---|
| `startCheckout` body mismatch causes 400 on checkout | High (already broken) | Fixed by slug mapping in `startCheckout` |
| `confirmSwitch` body mismatch causes 400/502 | High (already broken) | Fixed by slug mapping + new fields in `confirmSwitch` |
| Removing preview dialog loses useful UX (charge estimate) | Low | Backend never returned preview data — dialog already showed static fallback strings |
| Type errors after removing `SwitchPreviewResponse` | None | All usages are co-located in the 3 files listed above |
