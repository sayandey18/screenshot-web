import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { type Usage } from "../data/schema";

type UsageDialogType = "details";

type UsageContextType = {
  open: UsageDialogType | null;
  setOpen: (str: UsageDialogType | null) => void;
  currentRow: Usage | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Usage | null>>;
};

const UsageContext = React.createContext<UsageContextType | null>(null);

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsageDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Usage | null>(null);

  return <UsageContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</UsageContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsage = () => {
  const usageContext = React.useContext(UsageContext);

  if (!usageContext) {
    throw new Error("useUsage has to be used within <UsageContext>");
  }

  return usageContext;
};
