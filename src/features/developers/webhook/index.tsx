import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentSection } from "../components/content-section";

export function DevelopersWebhook() {
  return (
    <ContentSection title="Webhook" desc="Manage event webhooks for your workspace.">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Webhook Integrations</CardTitle>
            <Badge>Coming Soon</Badge>
          </div>
          <CardDescription>Webhook configuration will be available in Phase 2.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You will be able to register webhook endpoints, manage secrets, and inspect delivery activity.
          </p>
        </CardContent>
      </Card>
    </ContentSection>
  );
}
