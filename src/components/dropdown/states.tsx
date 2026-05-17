import states from "@/data/states.json";
import { Check, ChevronsUpDown } from "lucide-react";
import { useLocationStore } from "@/stores/location-store";
import { cn, lowerCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type StateProps } from "./types";

export function StateDropdown() {
  const { countryValue, stateValue, openStateDropdown, setOpenStateDropdown, setStateValue, setStateCode } =
    useLocationStore();

  const stateData = states as StateProps[];
  const filtered = stateData.filter((state) => state.country_code === countryValue);

  const selectedState = filtered.find((s) => lowerCase(s.name) === stateValue);

  return (
    <Popover open={openStateDropdown} onOpenChange={setOpenStateDropdown}>
      <PopoverTrigger asChild>
        <Button
          id="state-combobox"
          variant="outline"
          role="combobox"
          aria-expanded={openStateDropdown}
          className="h-9 w-full min-w-0 justify-between gap-2 overflow-hidden font-normal"
          disabled={!countryValue || filtered.length === 0}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            {selectedState?.name ?? (countryValue ? "Select state" : "Select country first")}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-0 p-0" align="start">
        <Command className="w-full">
          <CommandInput placeholder="Search state..." />
          <CommandList className="max-h-75">
            <CommandEmpty>No state found.</CommandEmpty>
            <CommandGroup>
              {filtered.map((state) => (
                <CommandItem
                  key={state.id}
                  value={state.name}
                  onSelect={() => {
                    setStateValue(lowerCase(state.name));
                    setStateCode(state.state_code);
                    setOpenStateDropdown(false);
                  }}
                  className="w-full justify-between"
                >
                  <span className="min-w-0 flex-1 truncate">{state.name}</span>
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      stateValue === lowerCase(state.name) ? "opacity-100" : "opacity-0"
                    )}
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
