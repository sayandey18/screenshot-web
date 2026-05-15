import { useMemo, useState } from "react";
import { Country, State } from "country-state-city";
import { Check, ChevronsUpDown, CreditCard, MapPin, Plus, ExternalLink, Loader2, Landmark } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentSection } from "../components/content-section";
import {
  usePaymentMethods,
  useBillingAddress,
  useUpdateBillingAddress,
  type BillingAddressInput,
} from "../hooks/use-subscription";

type CountryOption = {
  isoCode: string;
  name: string;
};

type StateOption = {
  isoCode: string;
  name: string;
};

function getCountries(): CountryOption[] {
  return Country.getAllCountries()
    .map((country) => ({
      isoCode: country.isoCode,
      name: country.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getStates(countryCode: string): StateOption[] {
  return State.getStatesOfCountry(countryCode)
    .map((state) => ({
      isoCode: state.isoCode,
      name: state.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function SubscriptionBilling() {
  const countries = useMemo(() => getCountries(), []);

  const { data: pmData, isLoading: isLoadingPM } = usePaymentMethods();
  const { data: addressData, isLoading: isLoadingAddress } = useBillingAddress();
  const updateAddress = useUpdateBillingAddress();

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  // Address form state
  const [fullName, setFullName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false);
  const [statePopoverOpen, setStatePopoverOpen] = useState(false);

  // useEffect(() => {
  //   if (addressData) {
  //     setFullName(addressData.fullName);
  //     setAddressLine1(addressData.addressLine1);
  //     setAddressLine2(addressData.addressLine2 || "");
  //     setCountryCode(addressData.countryCode);
  //     setStateCode(addressData.stateCode);
  //     setCity(addressData.city);
  //     setPostalCode(addressData.postalCode);
  //   }
  // }, [addressData]);

  const states = useMemo(() => {
    if (!countryCode) return [];
    return getStates(countryCode);
  }, [countryCode]);

  const selectedCountry = useMemo(
    () => countries.find((country) => country.isoCode === countryCode),
    [countries, countryCode]
  );

  const selectedState = useMemo(() => states.find((state) => state.isoCode === stateCode), [states, stateCode]);

  const openAddressDialog = () => {
    if (addressData) {
      setFullName(addressData.fullName);
      setAddressLine1(addressData.addressLine1);
      setAddressLine2(addressData.addressLine2 || "");
      setCountryCode(addressData.countryCode);
      setStateCode(addressData.stateCode);
      setCity(addressData.city);
      setPostalCode(addressData.postalCode);
    }
    setAddressDialogOpen(true);
  };

  const handleCountryChange = (nextCountryCode: string) => {
    setCountryCode(nextCountryCode);
    setStateCode("");
    setCountryPopoverOpen(false);
  };

  const handleStateChange = (nextStateCode: string) => {
    setStateCode(nextStateCode);
    setStatePopoverOpen(false);
  };

  const handleSaveAddress = async () => {
    if (!fullName || !addressLine1 || !countryCode || !stateCode || !city || !postalCode) {
      toast.error("Please complete all required address fields.");
      return;
    }

    const payload: BillingAddressInput = {
      fullName,
      addressLine1,
      addressLine2,
      countryCode,
      stateCode,
      city,
      postalCode,
    };

    updateAddress.mutate(payload, {
      onSuccess: () => setAddressDialogOpen(false),
    });
  };

  const handleManagePaymentMethods = async () => {
    setIsPortalLoading(true);
    try {
      const { data } = await api.post<{ url: string }>("/billing/portal");
      window.location.href = data.url;
    } catch (_err) {
      toast.error("Unable to open customer portal. Please try again.");
      setIsPortalLoading(false);
    }
  };

  const renderPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "card":
        return <CreditCard className="size-4 text-primary" />;
      case "upi":
        return <Landmark className="size-4 text-primary" />;
      default:
        return <CreditCard className="size-4 text-primary" />;
    }
  };

  const paymentMethods = pmData || [];

  return (
    <ContentSection
      title="Billing"
      desc="Manage your payment methods and billing information. Securely processed by Dodo Payments."
    >
      <div className="space-y-6">
        <Card className="overflow-hidden border-muted/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManagePaymentMethods}
                disabled={isPortalLoading}
                className="h-8 gap-2"
              >
                {isPortalLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="size-3.5" />
                )}
                Manage in Dodo
              </Button>
            </CardAction>
            <CardTitle className="text-base font-semibold">Payment Methods</CardTitle>
            <CardDescription>All payment methods saved for your subscription renewals.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingPM ? (
              <div className="space-y-4 px-6 py-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ) : paymentMethods.length > 0 ? (
              <div className="divide-y divide-muted/60">
                {paymentMethods.map((pm) => (
                  <div key={pm.payment_method_id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/5">
                        {renderPaymentMethodIcon(pm.payment_method)}
                      </div>
                      <div className="space-y-0.5">
                        <p className={cn("text-sm font-medium", pm.payment_method !== "upi" && "capitalize")}>
                          {pm.payment_method === "card"
                            ? `${pm.card?.card_network || "Card"} •••• ${pm.card?.last4_digits || ""}`
                            : pm.payment_method === "upi"
                              ? "UPI"
                              : pm.payment_method}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pm.payment_method === "card"
                            ? `Expires ${pm.card?.expiry_month}/${pm.card?.expiry_year}`
                            : pm.recurring_enabled
                              ? "Auto-renewal active"
                              : "Single use"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted/30">
                  <Plus className="size-6 text-muted-foreground/60" />
                </div>
                <h3 className="mt-4 text-sm font-medium">No payment methods</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add a payment method via the Dodo portal to get started.
                </p>
                <Button variant="link" size="sm" onClick={handleManagePaymentMethods} className="mt-2 text-xs">
                  Go to Dodo Portal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardAction>
              <Button variant="outline" size="sm" onClick={openAddressDialog} className="h-8">
                Edit Address
              </Button>
            </CardAction>
            <CardTitle className="text-base font-semibold">Billing Address</CardTitle>
            <CardDescription>Information used for your receipts and tax compliance.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAddress ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ) : addressData ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-[10px] tracking-wider text-muted-foreground/70 uppercase">
                    Name & Address
                  </Label>
                  <p className="text-sm font-medium">{addressData.fullName}</p>
                  <p className="text-sm text-muted-foreground">{addressData.addressLine1}</p>
                  {addressData.addressLine2 && (
                    <p className="text-sm text-muted-foreground">{addressData.addressLine2}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] tracking-wider text-muted-foreground/70 uppercase">Location</Label>
                  <p className="text-sm text-muted-foreground">
                    {addressData.city}, {addressData.stateCode} {addressData.postalCode},
                  </p>
                  <p className="text-sm text-muted-foreground">{addressData.countryCode}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <MapPin className="size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No billing address on file.</p>
                <Button variant="link" size="sm" onClick={openAddressDialog} className="mt-1 text-xs">
                  Add Address
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Billing Address</DialogTitle>
              <DialogDescription>Update your billing contact and address information.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Billing Name</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Full name"
                  className="h-9"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address-line-1">Address Line 1</Label>
                <Input
                  id="address-line-1"
                  value={addressLine1}
                  onChange={(event) => setAddressLine1(event.target.value)}
                  placeholder="Address line 1"
                  className="h-9"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address-line-2">Address Line 2 (optional)</Label>
                <Input
                  id="address-line-2"
                  value={addressLine2}
                  onChange={(event) => setAddressLine2(event.target.value)}
                  placeholder="Address line 2"
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="country-combobox">Country</Label>
                  <Popover open={countryPopoverOpen} onOpenChange={setCountryPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="country-combobox"
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryPopoverOpen}
                        className="h-9 w-full min-w-0 justify-between gap-2 overflow-hidden font-normal"
                      >
                        <span className="min-w-0 flex-1 truncate text-left">
                          {selectedCountry?.name ?? "Select country"}
                        </span>
                        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-(--radix-popover-trigger-width) min-w-0 p-0" align="start">
                      <Command className="w-full">
                        <CommandInput placeholder="Search country..." className="h-9" />
                        <CommandList className="max-h-64 overflow-x-hidden overflow-y-auto overscroll-contain">
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {countries.map((country) => (
                              <CommandItem
                                key={country.isoCode}
                                value={`${country.name} ${country.isoCode}`}
                                onSelect={() => handleCountryChange(country.isoCode)}
                                className="min-w-0"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 size-4 shrink-0",
                                    countryCode === country.isoCode ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="min-w-0 flex-1 truncate">{country.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state-combobox">State/Province</Label>
                  <Popover open={statePopoverOpen} onOpenChange={setStatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="state-combobox"
                        variant="outline"
                        role="combobox"
                        aria-expanded={statePopoverOpen}
                        className="h-9 w-full min-w-0 justify-between gap-2 overflow-hidden font-normal"
                        disabled={!countryCode}
                      >
                        <span className="min-w-0 flex-1 truncate text-left">
                          {selectedState?.name ?? (countryCode ? "Select state" : "Select country first")}
                        </span>
                        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-(--radix-popover-trigger-width) min-w-0 p-0" align="start">
                      <Command className="w-full">
                        <CommandInput placeholder="Search state..." className="h-9" />
                        <CommandList className="max-h-64 overflow-x-hidden overflow-y-auto overscroll-contain">
                          <CommandEmpty>No state found.</CommandEmpty>
                          <CommandGroup>
                            {states.map((state) => (
                              <CommandItem
                                key={state.isoCode}
                                value={`${state.name} ${state.isoCode}`}
                                onSelect={() => handleStateChange(state.isoCode)}
                                className="min-w-0"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 size-4 shrink-0",
                                    stateCode === state.isoCode ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="min-w-0 flex-1 truncate">{state.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="City"
                    className="h-9"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input
                    id="postal-code"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    placeholder="ZIP/Postal Code"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddressDialogOpen(false)} disabled={updateAddress.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSaveAddress} disabled={updateAddress.isPending}>
                {updateAddress.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save Address
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ContentSection>
  );
}
