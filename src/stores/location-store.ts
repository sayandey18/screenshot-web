import { create } from "zustand";

interface LocationState {
  countryValue: string;
  setCountryValue: (code: string) => void;
  openCountryDropdown: boolean;
  setOpenCountryDropdown: (openCountry: boolean) => void;
  stateValue: string;
  setStateValue: (state: string) => void;
  stateCode: string;
  setStateCode: (code: string) => void;
  openStateDropdown: boolean;
  setOpenStateDropdown: (openState: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  countryValue: "",
  setCountryValue: (code: string) => {
    set({ countryValue: code });
  },
  openCountryDropdown: false,
  setOpenCountryDropdown: (openCountry: boolean) => {
    set({ openCountryDropdown: openCountry });
  },
  stateValue: "",
  setStateValue: (state: string) => {
    set({ stateValue: state });
  },
  stateCode: "",
  setStateCode: (code: string) => {
    set({ stateCode: code });
  },
  openStateDropdown: false,
  setOpenStateDropdown: (openState: boolean) => {
    set({ openStateDropdown: openState });
  },
}));
