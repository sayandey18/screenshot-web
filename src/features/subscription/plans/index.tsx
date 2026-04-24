import { useMemo, useState } from "react";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ContentSection } from "../components/content-section";

type BillingCycle = "monthly" | "annual";
type SubscriptionStatus = "active" | "cancelled" | "trial" | "cancellation_scheduled";
type PlanId = "starter" | "growth" | "enterprise";

type Plan = {
  id: PlanId;
  name: string;
  price: string;
  tagline: string;
  icon: React.ReactNode;
  features: string[];
  rank: number;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "STARTER",
    price: "$0/month",
    tagline: "Perfect for getting started with essential screenshot workflows.",
    icon: <Sparkles size={16} />,
    rank: 1,
    features: [
      "Up to 100 screenshots / month",
      "Basic workspace controls",
      "Community support",
      "Standard image retention",
    ],
  },
  {
    id: "growth",
    name: "GROWTH",
    price: "$8/month",
    tagline: "Built for growing teams that need automation and higher limits.",
    icon: <Zap size={16} />,
    rank: 2,
    features: ["Up to 10,000 screenshots / month", "Priority processing queue", "Team member roles", "Email support"],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: "$15/month",
    tagline: "Advanced controls and scale for production-grade workloads.",
    icon: <Crown size={16} />,
    rank: 3,
    features: ["Unlimited screenshots", "Advanced webhook controls", "SLA-backed support", "Audit logs and governance"],
  },
];

function statusToBadgeVariant(status: SubscriptionStatus): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "active":
      return "default";
    case "trial":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "cancellation_scheduled":
      return "outline";
    default:
      return "outline";
  }
}

function statusLabel(status: SubscriptionStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "trial":
      return "Trial";
    case "cancelled":
      return "Cancelled";
    case "cancellation_scheduled":
      return "Cancellation Scheduled";
    default:
      return "Unknown";
  }
}

export function SubscriptionPlans() {
  const [activePlanId, setActivePlanId] = useState<PlanId>("starter");
  const [status, setStatus] = useState<SubscriptionStatus>("active");
  const [billingCycle] = useState<BillingCycle>("monthly");
  const [nextBillingDate, setNextBillingDate] = useState("2026-02-01");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const activePlan = useMemo(() => plans.find((plan) => plan.id === activePlanId) ?? plans[0], [activePlanId]);

  const getCta = (plan: Plan) => {
    if (plan.id === activePlanId) {
      return {
        label: "Current Plan",
        variant: "default" as const,
        disabled: true,
      };
    }

    const isUpgrade = plan.rank > activePlan.rank;
    return {
      label: isUpgrade ? "Upgrade" : "Downgrade",
      variant: isUpgrade ? ("default" as const) : ("outline" as const),
      disabled: false,
    };
  };

  const handleChangePlan = (targetPlan: Plan) => {
    if (targetPlan.id === activePlanId) return;

    setActivePlanId(targetPlan.id);
    setStatus("active");
    setNextBillingDate("2026-02-01");
    toast.success(`Your subscription has been updated to ${targetPlan.name}.`);
  };

  const handleCancelSubscription = () => {
    setStatus("cancellation_scheduled");
    toast.success("Cancellation scheduled. Your plan will revert to STARTER at period end.");
    setCancelDialogOpen(false);
  };

  return (
    <ContentSection title="Plans" desc="Choose a plan that fits your usage now and scale when you need more.">
      <>
        <div className="space-y-6">
          <Card className="gap-4">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Active Subscription</CardTitle>
                  <CardDescription>Current plan details and billing timeline.</CardDescription>
                </div>
                <Badge variant={statusToBadgeVariant(status)}>{statusLabel(status)}</Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="text-sm font-medium">{activePlan.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Billing Cycle</p>
                <p className="text-sm font-medium capitalize">{billingCycle}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next Billing Date</p>
                <p className="text-sm font-medium">{nextBillingDate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Provider</p>
                <p className="text-sm font-medium">Dodo Payments</p>
              </div>
            </CardContent>

            {activePlan.name && activePlan.name !== "STARTER" && (
              <CardFooter>
                <Button
                  variant="outline"
                  className="text-sm text-destructive hover:text-destructive"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={status === "cancellation_scheduled" || status === "cancelled"}
                >
                  Cancel Subscription
                </Button>
              </CardFooter>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const cta = getCta(plan);
              const isCurrent = plan.id === activePlanId;

              return (
                <Card key={plan.id} className={isCurrent ? "border-primary" : ""}>
                  <CardHeader>
                    {/*<CardAction>{isCurrent ? <Badge>Current</Badge> : null}</CardAction>*/}
                    <CardTitle className="flex items-center gap-2 text-base">
                      {plan.icon}
                      <span>{plan.name}</span>
                    </CardTitle>
                    <CardDescription className="text-2xl font-bold text-foreground">{plan.price}</CardDescription>
                    <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="mt-auto">
                    <Button
                      variant={cta.variant}
                      className="w-full"
                      disabled={cta.disabled}
                      onClick={() => handleChangePlan(plan)}
                    >
                      {cta.label}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        <ConfirmDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          title="Cancel Subscription?"
          desc="Your paid plan will remain active until the end of the current billing period. After that, your account will automatically revert to STARTER."
          cancelBtnText="Keep Subscription"
          confirmText="Schedule Cancellation"
          destructive
          handleConfirm={handleCancelSubscription}
        />
      </>
    </ContentSection>
  );
}
