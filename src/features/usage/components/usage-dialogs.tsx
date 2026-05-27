import { UsageDetailsDialog } from "./usage-details-dialog";
import { useUsage } from "./usage-provider";

export function UsageDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsage();

  return (
    <UsageDetailsDialog
      open={open === "details"}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setOpen(null);
          setTimeout(() => {
            setCurrentRow(null);
          }, 200);
          return;
        }

        setOpen("details");
      }}
      row={currentRow}
    />
  );
}
