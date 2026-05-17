import countries from "@/data/countries.json";
import { Check, ChevronsUpDown } from "lucide-react";
import { useLocationStore } from "@/stores/location-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type CountryProps } from "./types";

interface CountryDropdownProps {
  disabled?: boolean;
}

export function CountryDropdown({ disabled }: CountryDropdownProps) {
  const { countryValue, setCountryValue, openCountryDropdown, setOpenCountryDropdown } = useLocationStore();
  const { setStateValue, setStateCode } = useLocationStore();
  const countryData = countries as CountryProps[];

  const selectedCountry = countryData.find((c) => c.iso2 === countryValue);

  return (
    <Popover open={openCountryDropdown} onOpenChange={setOpenCountryDropdown}>
      <PopoverTrigger asChild>
        <Button
          id="country-combobox"
          variant="outline"
          role="combobox"
          aria-expanded={openCountryDropdown}
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
                    setCountryValue(country.iso2);
                    setStateValue("");
                    setStateCode("");
                    setOpenCountryDropdown(false);
                  }}
                  className="w-full justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-end gap-2 truncate">
                    <span>{country.emoji}</span>
                    <span>{country.name}</span>
                  </div>
                  <Check
                    className={cn("size-4 shrink-0", countryValue === country.iso2 ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
