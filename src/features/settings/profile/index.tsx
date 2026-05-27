import { Card, CardContent } from "@/components/ui/card";
import { ContentSection } from "../components/content-section";
import { ProfileForm } from "./profile-form";

export function SettingsProfile() {
  return (
    <ContentSection title="Profile" desc="Update your profile information." header={false}>
      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardContent className="p-6">
          <ProfileForm />
        </CardContent>
      </Card>
    </ContentSection>
  );
}
