import { useState } from "react";
import countries from "@/data/countries.json";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type CountryProps } from "./types";

interface CountryDropdownProps {
  disabled?: boolean;
  value?: string;
  onChange?: (code: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CountryDropdown({
  disabled,
  value = "",
  onChange,
  open: controlledOpen,
  onOpenChange: onControlledOpenChange,
}: CountryDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && onControlledOpenChange !== undefined;
  const openDropdown = isControlled ? controlledOpen : internalOpen;
  const setOpenDropdown = isControlled ? onControlledOpenChange! : setInternalOpen;

  const countryData = countries as CountryProps[];

  const selectedCountry = countryData.find((c) => c.iso2 === value);

  return (
    <Popover open={openDropdown} onOpenChange={setOpenDropdown}>
      <PopoverTrigger asChild>
        <Button
          id="country-combobox"
          variant="outline"
          role="combobox"
          aria-expanded={openDropdown}
          className="h-9 w-full min-w-0 justify-between gap-2 overflow-hidden font-normal"
          disabled={disabled}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            {selectedCountry ? (
              <span className="flex items-end gap-2">
                <span>{selectedCountry.emoji}</span>
                <span>{selectedCountry.name}</span>
              </span>
            ) : (
              "Select country"
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-0 p-0" align="start">
        <Command className="w-full">
          <CommandInput placeholder="Search country..." />
          <CommandList className="max-h-75">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countryData.map((country) => (
                <CommandItem
                  key={country.id}
                  value={country.name}
                  onSelect={() => {
                    onChange?.(country.iso2);
                    setOpenDropdown(false);
                  }}
                  className="w-full justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-end gap-2 truncate">
                    <span>{country.emoji}</span>
                    <span>{country.name}</span>
                  </div>
                  <Check className={cn("size-4 shrink-0", value === country.iso2 ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
