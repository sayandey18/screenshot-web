import { Card, CardContent } from "@/components/ui/card";
import { AccountForm } from "./account-form";

export function SettingsAccount() {
  return (
    <Card className="overflow-hidden border-muted/60 shadow-sm">
      <CardContent className="p-6">
        <AccountForm />
      </CardContent>
    </Card>
  );
}
