import { ContentSection } from "../components/content-section";
import { AccountForm } from "./account-form";

export function SettingsAccount() {
  return (
    <ContentSection
      title="Account"
      desc="Update your account settings. Manage your password, 2FA, and sessions."
    >
      <AccountForm />
    </ContentSection>
  );
}
