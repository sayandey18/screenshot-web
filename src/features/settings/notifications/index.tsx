import { Card, CardContent } from "@/components/ui/card";
import { NotificationsForm } from "./notifications-form";

export function SettingsNotifications() {
  return (
    <Card className="overflow-hidden border-muted/60 shadow-sm">
      <CardContent className="p-6">
        <NotificationsForm />
      </CardContent>
    </Card>
  );
}
