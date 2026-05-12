import { useEffect, useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Crown, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ContentSection } from "../components/content-section";
import type { SubscriptionStatus } from "../data/schema";
import {
  useCancelSubscription,
  useConfirmSwitch,
  useStartCheckout,
  useSubscription,
  useSwitchPreview,
  type SwitchPreviewResponse,
} from "../hooks/use-subscription";

const route = getRouteApi("/_authenticated/subscription/");

type PlanId = "STARTER" | "GROWTH" | "ENTERPRISE";

type Plan = {
  id: PlanId;
  name: string;
  price: string;
  tagline: string;
  icon: React.ReactNode;
  rank: number;
};

const plans: Plan[] = [
  {
    id: "STARTER",
    name: "Starter",
    price: "$0/month",
    tagline: "Perfect for getting started with essential screenshot workflows.",
    icon: <Sparkles size={16} />,
    rank: 1,
  },
  {
    id: "GROWTH",
    name: "Growth",
    price: "$8/month",
    tagline: "Built for growing teams that need automation and higher limits.",
    icon: <Zap size={16} />,
    rank: 2,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "$15/month",
    tagline: "Advanced controls and scale for production-grade workloads.",
    icon: <Crown size={16} />,
    rank: 3,
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

function formatDate(isoDate: string | null | undefined) {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

export function SubscriptionPlans() {
  const navigate = route.useNavigate();
  const search = route.useSearch();

  useEffect(() => {
    if (!search.success) return;
    void navigate({ search: (prev) => ({ ...prev, success: undefined }), replace: true });
    toast.success("Your subscription has been updated.");
  }, [search.success, navigate]);

  const { data: subscription, isLoading } = useSubscription();
  const { mutate: startCheckout, isPending: isCheckingOut } = useStartCheckout();
  const { mutate: fetchSwitchPreview, isPending: isFetchingPreview } = useSwitchPreview();
  const { mutate: confirmSwitch, isPending: isConfirmingSwitch } = useConfirmSwitch();
  const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [targetSwitchPlan, setTargetSwitchPlan] = useState<Plan | null>(null);
  const [switchPreview, setSwitchPreview] = useState<SwitchPreviewResponse | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<PlanId | null>(null);

  const activePlanId = subscription?.plan ?? "STARTER";
  const activePlan = useMemo(() => plans.find((p) => p.id === activePlanId) ?? plans[0], [activePlanId]);
  const isCancellationScheduled = Boolean(
    subscription?.cancelSchedule || subscription?.status === "cancellation_scheduled"
  );
  const isOnPaidPlan = activePlan.id !== "STARTER";

  const isBusy = isLoading || isCheckingOut || isFetchingPreview || isConfirmingSwitch || isCancelling;

  const getCta = (plan: Plan) => {
    if (plan.id === activePlanId) {
      return { label: "Current Plan", variant: "secondary" as const, disabled: true };
    }

    const isUpgrade = plan.rank > activePlan.rank;
    return {
      label: isUpgrade ? "Upgrade" : "Downgrade",
      variant: isUpgrade ? ("default" as const) : ("outline" as const),
      disabled: false,
    };
  };

  const handleSelectPlan = (targetPlan: Plan) => {
    if (targetPlan.id === activePlanId) return;

    if (!isOnPaidPlan && targetPlan.id !== "STARTER") {
      setPendingPlanId(targetPlan.id);
      startCheckout({ plan: targetPlan.id });
      return;
    }

    if (isOnPaidPlan && targetPlan.id === "STARTER") {
      setCancelDialogOpen(true);
      return;
    }

    setTargetSwitchPlan(targetPlan);
    setPendingPlanId(targetPlan.id);
    fetchSwitchPreview(
      { plan: targetPlan.id },
      {
        onSuccess: (preview) => {
          setSwitchPreview(preview ?? null);
          setSwitchDialogOpen(true);
        },
        onError: () => {
          setPendingPlanId(null);
        },
      }
    );
  };

  const handleConfirmCancel = () => {
    setCancelDialogOpen(false);
    setPendingPlanId(null);
    cancelSubscription();
  };

  const handleConfirmSwitch = () => {
    if (!targetSwitchPlan || targetSwitchPlan.id === "STARTER") return;
    confirmSwitch(
      { plan: targetSwitchPlan.id },
      {
        onSuccess: () => {
          setSwitchDialogOpen(false);
          setTargetSwitchPlan(null);
          setSwitchPreview(null);
          setPendingPlanId(null);
        },
        onError: () => {
          setPendingPlanId(null);
        },
      }
    );
  };

  const previewTitle = switchPreview?.title ?? "Confirm plan switch";
  const previewDescription =
    switchPreview?.description ?? "Your subscription will switch to the selected paid plan on confirmation.";
  const previewLines = Array.isArray(switchPreview?.lines) ? switchPreview.lines : [];
  const previewAmount =
    typeof switchPreview?.amount === "number"
      ? `${switchPreview.currency ?? "USD"} ${switchPreview.amount.toFixed(2)}`
      : null;

  return (
    <ContentSection title="Plans" desc="Choose a plan that fits your usage now and scale when you need more.">
      <>
        <div className="space-y-6">
          <Card className="gap-4">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="mb-1">Active Subscription</CardTitle>
                  <CardDescription>Current subscription details and upcoming billing timeline.</CardDescription>
                </div>
                {isLoading ? (
                  <Skeleton className="h-5 w-24 rounded-full" />
                ) : subscription ? (
                  <Badge variant={statusToBadgeVariant(subscription.status)}>{statusLabel(subscription.status)}</Badge>
                ) : null}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {isCancellationScheduled && (
                <div className="rounded-md border border-amber-200/70 bg-amber-50/60 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
                  Cancellation has been scheduled. Your current plan will remain active until the next billing date.
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="pb-1 text-xs text-muted-foreground">Subscription</p>
                  <p className="text-sm font-medium">{activePlan.name}</p>
                </div>
                <div>
                  <p className="pb-1 text-xs text-muted-foreground">Cycle</p>
                  {isLoading ? (
                    <Skeleton className="mt-1 h-4 w-16" />
                  ) : (
                    <p className="text-sm font-medium capitalize">{subscription?.billingCycle ?? "-"}</p>
                  )}
                </div>
                <div>
                  <p className="pb-1 text-xs text-muted-foreground">Upcoming Date</p>
                  {isLoading ? (
                    <Skeleton className="mt-1 h-4 w-24" />
                  ) : (
                    <p className="text-sm font-medium">{formatDate(subscription?.nextBillingDate)}</p>
                  )}
                </div>
                <div>
                  <p className="pb-1 text-xs text-muted-foreground">Provider</p>
                  <p className="text-sm font-medium">{activePlan.id === "STARTER" ? "-" : "Dodo Payments"}</p>
                </div>
              </div>
            </CardContent>

            {!isLoading && activePlan.id !== "STARTER" && !isCancellationScheduled && (
              <CardFooter>
                <Button
                  variant="outline"
                  className="text-sm text-destructive hover:text-destructive"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={isBusy || subscription?.status === "cancelled"}
                >
                  {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                </Button>
              </CardFooter>
            )}
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => {
              const cta = getCta(plan);
              const isCurrent = plan.id === activePlanId;

              return (
                <Card
                  key={plan.id}
                  className={`flex h-full flex-col justify-between gap-5 ${isCurrent ? "border-primary ring-1 ring-primary/30" : ""}`}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        {plan.icon}
                        <span>{plan.name}</span>
                      </CardTitle>
                      {isCurrent ? <Badge>Current</Badge> : null}
                    </div>
                    <div className="space-y-1">
                      <CardDescription className="text-2xl font-bold text-foreground">{plan.price}</CardDescription>
                      <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                    </div>
                  </CardHeader>

                  <CardFooter className="pt-0">
                    <Button
                      variant={cta.variant}
                      className="w-full"
                      disabled={cta.disabled || isBusy}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {isBusy && pendingPlanId === plan.id ? "Updating..." : cta.label}
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
          handleConfirm={handleConfirmCancel}
          isLoading={isCancelling}
        />

        <ConfirmDialog
          open={switchDialogOpen}
          onOpenChange={(open) => {
            setSwitchDialogOpen(open);
            if (!open && !isConfirmingSwitch) {
              setPendingPlanId(null);
            }
          }}
          title={previewTitle}
          desc={
            <div className="space-y-2">
              <p>{previewDescription}</p>
              {targetSwitchPlan ? (
                <p>
                  Target plan: <span className="font-medium">{targetSwitchPlan.name}</span>
                </p>
              ) : null}
              {previewAmount ? (
                <p>
                  Charge preview: <span className="font-medium">{previewAmount}</span>
                </p>
              ) : null}
              {previewLines.length > 0 ? (
                <ul className="list-disc space-y-1 ps-5">
                  {previewLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          }
          cancelBtnText="Keep Current Plan"
          confirmText="Confirm Switch"
          handleConfirm={handleConfirmSwitch}
          isLoading={isConfirmingSwitch}
        />
      </>
    </ContentSection>
  );
}
