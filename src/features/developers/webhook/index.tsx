import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentSection } from "../components/content-section";

export function DevelopersWebhook() {
  return (
    <ContentSection title="Webhook" desc="Manage event webhooks for your workspace." header={false}>
      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Webhook Integrations</CardTitle>
            <Badge>Coming Soon</Badge>
          </div>
          <CardDescription>
            You will be able to register webhook endpoints to inspect delivery activity.
          </CardDescription>
        </CardHeader>
      </Card>
    </ContentSection>
  );
}
