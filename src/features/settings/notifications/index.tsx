import { Card, CardContent } from "@/components/ui/card";
import { ContentSection } from "../components/content-section";
import { NotificationsForm } from "./notifications-form";

export function SettingsNotifications() {
  return (
    <ContentSection title="Notifications" desc="Configure how you receive notifications." header={false}>
      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardContent className="p-6">
          <NotificationsForm />
        </CardContent>
      </Card>
    </ContentSection>
  );
}
