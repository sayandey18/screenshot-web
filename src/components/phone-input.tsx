import { useState } from "react";
import phoneCountries from "@/data/phone.json";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PhoneCountry {
  name: string;
  iso2: string;
  dialCode: string;
  flag: string;
}

function parsePhoneValue(value: string): { dial: string; number: string } {
  const match = value.match(/^(\+\d+)\s*(.*)/);
  if (match) {
    return { dial: match[1], number: match[2].trim() };
  }
  return { dial: "", number: value };
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({ value, onChange, disabled, className }: PhoneInputProps) {
  const { dial, number } = parsePhoneValue(value);
  const initialCountry =
    (phoneCountries as PhoneCountry[]).find((c) => c.dialCode === dial) ??
    (phoneCountries as PhoneCountry[]).find((c) => c.iso2 === "IN")!;
  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(initialCountry);
  const [open, setOpen] = useState(false);

  function handleCountrySelect(country: PhoneCountry) {
    setSelectedCountry(country);
    onChange(`${country.dialCode} ${number}`);
    setOpen(false);
  }

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(`${selectedCountry.dialCode} ${e.target.value}`);
  }

  return (
    <div className={cn("flex", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="shrink-0 rounded-r-none border-r-0 px-3"
          >
            <img src={selectedCountry.flag} alt="" className="mr-1 h-4 w-5" />
            <span className="text-sm">{selectedCountry.dialCode}</span>
            <ChevronDown className="ml-1 size-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {(phoneCountries as PhoneCountry[]).map((country) => (
                  <CommandItem
                    key={country.iso2}
                    value={`${country.name} ${country.dialCode} ${country.iso2}`}
                    onSelect={() => handleCountrySelect(country)}
                  >
                    <img src={country.flag} alt={country.iso2} className="mr-2 h-4 w-5" />
                    <span className="flex-1">{country.name}</span>
                    <span className="text-muted-foreground">{country.dialCode}</span>
                    {selectedCountry.iso2 === country.iso2 && <Check className="ml-2 size-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        value={number}
        onChange={handleNumberChange}
        disabled={disabled}
        className="rounded-l-none"
        placeholder="Phone number"
      />
    </div>
  );
}
