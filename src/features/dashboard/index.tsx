import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { useQuota } from "@/hooks/api/use-quota";
import { AnalyticsChart } from "./components/analytics-chart";
import { FormatBreakdown } from "./components/format-breakdown";
import { LastScreenshots } from "./components/last-screenshots";
import { useUsageChart } from "./hooks/use-dashboard";

export function Dashboard() {
  const [range, setRange] = useState("14d");
  const { data: chartData, isLoading: chartLoading } = useUsageChart(range);
  const { data: quota, isLoading: quotaLoading } = useQuota();

  const isLoading = chartLoading || quotaLoading;

  const kpiCards = [
    {
      title: "Total Screenshots",
      value: isLoading ? null : (chartData?.summary.totalRequests ?? 0).toLocaleString(),
      subtitle: "This period",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" x2="3" y1="12" y2="12" />
        </svg>
      ),
    },
    {
      title: "API Calls This Month",
      value: isLoading ? null : (quota?.quota.used ?? 0).toLocaleString(),
      subtitle: quota ? `${quota.quota.remaining.toLocaleString()} remaining of ${quota.quota.limit.toLocaleString()}` : "Loading...",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M3 3v18h18" />
          <path d="M7 15l4-4 4 4 4-6" />
        </svg>
      ),
    },
    {
      title: "Success Rate",
      value: isLoading ? null : `${chartData?.summary.successRate ?? 100}%`,
      subtitle: `${chartData?.summary.totalSuccess ?? 0} successful of ${chartData?.summary.totalRequests ?? 0} total`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      title: "Failed Requests",
      value: isLoading ? null : (chartData?.summary.totalErrors ?? 0).toLocaleString(),
      subtitle: chartData?.summary.totalErrors ? `${chartData.summary.totalErrors} errors in this period` : "No errors",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" x2="9" y1="9" y2="15" />
          <line x1="9" x2="15" y1="9" y2="15" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpiCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="mt-1 h-3 w-32" />
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{card.value}</div>
                      <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <AnalyticsChart range={range} onRangeChange={setRange} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[7fr_3fr]">
            <LastScreenshots />
            <FormatBreakdown range={range} />
          </div>
        </div>
      </Main>
    </>
  );
}
