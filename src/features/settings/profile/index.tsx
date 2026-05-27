import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";

export function SettingsProfile() {
  return (
    <Card className="overflow-hidden border-muted/60 shadow-sm">
      <CardContent className="p-6">
        <ProfileForm />
      </CardContent>
    </Card>
  );
}
