import { Card, CardContent } from "@/components/ui/card";
import { ContentSection } from "../components/content-section";
import { AppearanceForm } from "./appearance-form";

export function SettingsAppearance() {
  return (
    <ContentSection
      title="Appearance"
      desc="Customize the appearance of the app. Automatically switch between day
          and night themes."
      header={false}
    >
      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardContent className="p-6">
          <AppearanceForm />
        </CardContent>
      </Card>
    </ContentSection>
  );
}
