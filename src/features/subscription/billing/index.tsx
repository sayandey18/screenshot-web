import { useMemo, useState } from "react";
import { Country, State } from "country-state-city";
import { Check, ChevronsUpDown, CreditCard, MapPin } from "lucide-react";
import { toast } from "sonner";
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
import { ContentSection } from "../components/content-section";

type PaymentMethod = {
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
};

type BillingAddress = {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  city: string;
  postalCode: string;
};

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

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    brand: "Visa",
    last4: "4242",
    expMonth: "08",
    expYear: "2029",
  });

  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    fullName: "Alex Johnson",
    addressLine1: "221B Baker Street",
    addressLine2: "Suite 4",
    countryCode: "GB",
    countryName: "United Kingdom",
    stateCode: "ENG",
    stateName: "England",
    city: "London",
    postalCode: "NW1 6XE",
  });

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  const [cardBrand, setCardBrand] = useState(paymentMethod.brand);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState(paymentMethod.expMonth);
  const [cardExpYear, setCardExpYear] = useState(paymentMethod.expYear);
  const [cardCvc, setCardCvc] = useState("");

  const [fullName, setFullName] = useState(billingAddress.fullName);
  const [addressLine1, setAddressLine1] = useState(billingAddress.addressLine1);
  const [addressLine2, setAddressLine2] = useState(billingAddress.addressLine2);
  const [countryCode, setCountryCode] = useState(billingAddress.countryCode);
  const [stateCode, setStateCode] = useState(billingAddress.stateCode);
  const [city, setCity] = useState(billingAddress.city);
  const [postalCode, setPostalCode] = useState(billingAddress.postalCode);

  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false);
  const [statePopoverOpen, setStatePopoverOpen] = useState(false);

  const states = useMemo(() => {
    if (!countryCode) return [];
    return getStates(countryCode);
  }, [countryCode]);

  const selectedCountry = useMemo(
    () => countries.find((country) => country.isoCode === countryCode),
    [countries, countryCode]
  );

  const selectedState = useMemo(() => states.find((state) => state.isoCode === stateCode), [states, stateCode]);

  const openPaymentDialog = () => {
    setCardBrand(paymentMethod.brand);
    setCardExpMonth(paymentMethod.expMonth);
    setCardExpYear(paymentMethod.expYear);
    setCardNumber("");
    setCardCvc("");
    setPaymentDialogOpen(true);
  };

  const openAddressDialog = () => {
    setFullName(billingAddress.fullName);
    setAddressLine1(billingAddress.addressLine1);
    setAddressLine2(billingAddress.addressLine2);
    setCountryCode(billingAddress.countryCode);
    setStateCode(billingAddress.stateCode);
    setCity(billingAddress.city);
    setPostalCode(billingAddress.postalCode);
    setCountryPopoverOpen(false);
    setStatePopoverOpen(false);
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

  const handleSavePaymentMethod = () => {
    const trimmed = cardNumber.replace(/\s/g, "");
    if (trimmed.length < 12) {
      toast.error("Please enter a valid card number.");
      return;
    }

    if (!cardExpMonth || !cardExpYear || !cardCvc) {
      toast.error("Please complete all card fields.");
      return;
    }

    const nextLast4 = trimmed.slice(-4);
    setPaymentMethod({
      brand: cardBrand,
      last4: nextLast4,
      expMonth: cardExpMonth,
      expYear: cardExpYear,
    });

    setPaymentDialogOpen(false);
    toast.success("Payment method updated.");
  };

  const handleSaveAddress = () => {
    if (!fullName || !addressLine1 || !countryCode || !stateCode || !city || !postalCode) {
      toast.error("Please complete all required address fields.");
      return;
    }

    if (!selectedCountry || !selectedState) {
      toast.error("Please select a valid country and state.");
      return;
    }

    setBillingAddress({
      fullName,
      addressLine1,
      addressLine2,
      countryCode,
      countryName: selectedCountry.name,
      stateCode,
      stateName: selectedState.name,
      city,
      postalCode,
    });

    setAddressDialogOpen(false);
    toast.success("Billing address updated.");
  };

  return (
    <ContentSection
      title="Billing"
      desc="Manage your payment method and billing address. Structured to support Dodo Payments integration in upcoming phases."
    >
      <>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardAction>
                <Button onClick={openPaymentDialog}>Update Payment Method</Button>
              </CardAction>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard size={16} />
                Payment Method
              </CardTitle>
              <CardDescription>Your default card for recurring subscription charges.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Card</p>
                <p className="text-sm font-medium">
                  {paymentMethod.brand} ending in {paymentMethod.last4}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expiry</p>
                <p className="text-sm font-medium">
                  {paymentMethod.expMonth}/{paymentMethod.expYear}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Processor</p>
                <p className="text-sm font-medium">Dodo Payments (ready)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardAction>
                <Button variant="outline" onClick={openAddressDialog}>
                  Edit
                </Button>
              </CardAction>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin size={16} />
                Billing Address
              </CardTitle>
              <CardDescription>Address used for invoices, tax calculations, and payment records.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{billingAddress.fullName}</p>
              <p>{billingAddress.addressLine1}</p>
              {billingAddress.addressLine2 ? <p>{billingAddress.addressLine2}</p> : null}
              <p>
                {billingAddress.city}, {billingAddress.stateName} {billingAddress.postalCode}
              </p>
              <p>{billingAddress.countryName}</p>
            </CardContent>
          </Card>
        </div>

        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Payment Method</DialogTitle>
              <DialogDescription>Update card details for upcoming subscription renewals.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-1">
              <div className="grid gap-2">
                <Label htmlFor="card-brand">Card Brand</Label>
                <Input
                  id="card-brand"
                  value={cardBrand}
                  onChange={(event) => setCardBrand(event.target.value)}
                  placeholder="Visa"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="exp-month">Expiry Month</Label>
                  <Input
                    id="exp-month"
                    value={cardExpMonth}
                    onChange={(event) => setCardExpMonth(event.target.value)}
                    placeholder="08"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="exp-year">Expiry Year</Label>
                  <Input
                    id="exp-year"
                    value={cardExpYear}
                    onChange={(event) => setCardExpYear(event.target.value)}
                    placeholder="2029"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="card-cvc">CVC</Label>
                  <Input
                    id="card-cvc"
                    value={cardCvc}
                    onChange={(event) => setCardCvc(event.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePaymentMethod}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Billing Address</DialogTitle>
              <DialogDescription>Update your billing contact and address information.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-1">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Billing Name</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address-line-1">Address Line 1</Label>
                <Input
                  id="address-line-1"
                  value={addressLine1}
                  onChange={(event) => setAddressLine1(event.target.value)}
                  placeholder="Address line 1"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address-line-2">Address Line 2 (optional)</Label>
                <Input
                  id="address-line-2"
                  value={addressLine2}
                  onChange={(event) => setAddressLine2(event.target.value)}
                  placeholder="Address line 2"
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
                        className="w-full min-w-0 justify-between gap-2 overflow-hidden font-normal"
                      >
                        <span className="min-w-0 flex-1 truncate text-left">
                          {selectedCountry?.name ?? "Select country"}
                        </span>
                        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-(--radix-popover-trigger-width) min-w-0 p-0" align="start">
                      <Command className="w-full">
                        <CommandInput placeholder="Search country..." />
                        <CommandList
                          className="max-h-64 overflow-x-hidden overflow-y-auto overscroll-contain"
                          onWheel={(event) => {
                            event.stopPropagation();
                          }}
                        >
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
                        className="w-full min-w-0 justify-between gap-2 overflow-hidden font-normal"
                        disabled={!countryCode}
                      >
                        <span className="min-w-0 flex-1 truncate text-left">
                          {selectedState?.name ?? (countryCode ? "Select state/province" : "Select country first")}
                        </span>
                        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-(--radix-popover-trigger-width) min-w-0 p-0" align="start">
                      <Command className="w-full">
                        <CommandInput placeholder="Search state/province..." />
                        <CommandList
                          className="max-h-64 overflow-x-hidden overflow-y-auto overscroll-contain"
                          onWheel={(event) => {
                            event.stopPropagation();
                          }}
                        >
                          <CommandEmpty>No state/province found.</CommandEmpty>
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
                  <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input
                    id="postal-code"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    placeholder="ZIP/Postal Code"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAddress}>Save Address</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </ContentSection>
  );
}
