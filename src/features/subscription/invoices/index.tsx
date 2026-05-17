import { getRouteApi } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { ContentSection } from "../components/content-section";
import { useInvoices } from "../hooks/use-invoices";
import { InvoicesTable } from "./components/invoices-table";

const route = getRouteApi("/_authenticated/subscription/invoices");

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export function SubscriptionInvoices() {
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const page = search.page ?? DEFAULT_PAGE;
  const pageSize = search.pageSize ?? DEFAULT_PAGE_SIZE;

  const { data, isLoading, isPlaceholderData } = useInvoices({ page, pageSize });

  const invoices = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <ContentSection title="Invoices" desc="Review your billing history and download past invoices." header={false}>
      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardContent className="p-6">
          <InvoicesTable
            data={invoices}
            total={total}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            isFetching={isPlaceholderData}
            search={search}
            navigate={navigate}
          />
        </CardContent>
      </Card>
    </ContentSection>
  );
}
