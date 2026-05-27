import { Card, CardContent } from "@/components/ui/card";
import { AppearanceForm } from "./appearance-form";

export function SettingsAppearance() {
  return (
    <Card className="overflow-hidden border-muted/60 shadow-sm">
      <CardContent className="p-6">
        <AppearanceForm />
      </CardContent>
    </Card>
  );
}
