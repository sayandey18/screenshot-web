import { useState } from "react";
import states from "@/data/states.json";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, lowerCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type StateProps } from "./types";

interface StateDropdownProps {
  countryCode?: string;
  value?: string;
  onChange?: (displayValue: string, code: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StateDropdown({
  countryCode = "",
  value = "",
  onChange,
  open: controlledOpen,
  onOpenChange: onControlledOpenChange,
}: StateDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && onControlledOpenChange !== undefined;
  const openDropdown = isControlled ? controlledOpen : internalOpen;
  const setOpenDropdown = isControlled ? onControlledOpenChange! : setInternalOpen;

  const stateData = states as StateProps[];
  const filtered = stateData.filter((state) => state.country_code === countryCode);

  const selectedState = filtered.find((s) => lowerCase(s.name) === value);

  return (
    <Popover open={openDropdown} onOpenChange={setOpenDropdown}>
      <PopoverTrigger asChild>
        <Button
          id="state-combobox"
          variant="outline"
          role="combobox"
          aria-expanded={openDropdown}
          className="h-9 w-full min-w-0 justify-between gap-2 overflow-hidden font-normal"
          disabled={!countryCode || filtered.length === 0}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            {selectedState?.name ?? (countryCode ? "Select state" : "Select country first")}
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
                    onChange?.(lowerCase(state.name), state.state_code);
                    setOpenDropdown(false);
                  }}
                  className="w-full justify-between"
                >
                  <span className="min-w-0 flex-1 truncate">{state.name}</span>
                  <Check
                    className={cn("size-4 shrink-0", value === lowerCase(state.name) ? "opacity-100" : "opacity-0")}
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
