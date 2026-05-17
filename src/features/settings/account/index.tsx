import { Card, CardContent } from "@/components/ui/card";
import { ContentSection } from "../components/content-section";
import { AccountForm } from "./account-form";

export function SettingsAccount() {
  return (
    <ContentSection title="Account" desc="Update your account settings. Manage your password, 2FA, and sessions." header={false}>
      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardContent className="p-6">
          <AccountForm />
        </CardContent>
      </Card>
    </ContentSection>
  );
}
