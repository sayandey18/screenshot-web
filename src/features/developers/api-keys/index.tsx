import { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCreateApiKey,
  useApiKeys,
  useDeleteApiKey,
  useUpdateApiKey,
  type CreatedApiKeyResult,
} from "@/features/developers/api-keys/hooks/use-api-keys";
import { ContentSection } from "../components/content-section";
import { ApiKeyCreateDialog } from "./components/api-key-create-dialog";
import { ApiKeyDeleteDialog } from "./components/api-key-delete-dialog";
import { ApiKeyManageDialog } from "./components/api-key-manage-dialog";
import { ApiKeysTable } from "./components/api-keys-table";
import { type ApiKeyItem } from "./data/schema";

const route = getRouteApi("/_authenticated/developers/");

type CreateApiKeyValues = {
  name: string;
  expiresIn?: number;
};

export function DevelopersApiKeys() {
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const [openCreate, setOpenCreate] = useState(false);
  const [openManage, setOpenManage] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentRow, setCurrentRow] = useState<ApiKeyItem | null>(null);

  const currentPage = typeof search.page === "number" ? search.page : 1;

  const apiKeysQuery = useApiKeys(currentPage);
  const createApiKey = useCreateApiKey();
  const updateApiKey = useUpdateApiKey();
  const deleteApiKey = useDeleteApiKey();

  const apiKeys = apiKeysQuery.data?.items ?? [];
  const total = apiKeysQuery.data?.total ?? 0;
  const isLoading = apiKeysQuery.isLoading;

  const handleCreate = async (values: CreateApiKeyValues): Promise<CreatedApiKeyResult | null> => {
    const result = await createApiKey.mutateAsync(values);
    const key =
      result && typeof result === "object" && "key" in result && typeof result.key === "string" ? result.key : null;

    toast.success("API key created successfully.");
    return key ? { key } : null;
  };

  const handleManage = async (id: string, name: string) => {
    await updateApiKey.mutateAsync({ keyId: id, name });
    toast.success("API key updated successfully.");
    setOpenManage(false);
    setCurrentRow(null);
  };

  const handleToggleStatus = async (row: ApiKeyItem) => {
    const isExpired = !!row.expiresAt && row.expiresAt.getTime() < Date.now();
    if (isExpired) return;

    const nextEnabled = row.enabled === false;

    await updateApiKey.mutateAsync({ keyId: row.id, enabled: nextEnabled });
    toast.success(nextEnabled ? "API key enabled successfully." : "API key disabled successfully.");
  };

  const handleDelete = async (id: string) => {
    await deleteApiKey.mutateAsync(id);
    toast.success("API key deleted successfully.");
    setOpenDelete(false);
    setCurrentRow(null);
  };

  const handleBulkDelete = async (rows: ApiKeyItem[]) => {
    for (const row of rows) {
      try {
        await deleteApiKey.mutateAsync(row.id);
      } catch (error) {
        throw Object.assign(new Error(getErrorMessage(error, "Failed to delete selected API keys.")), {
          cause: error,
        });
      }
    }
  };

  return (
    <ContentSection title="API Keys" desc="Create, manage, and delete API keys for your integrations." header={false}>
      <>
        <Card className="overflow-hidden border-muted/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex justify-end">
                <Button className="space-x-1" onClick={() => setOpenCreate(true)} aria-busy={createApiKey.isPending}>
                  <span>Create</span>
                  <Plus size={18} />
                </Button>
              </div>

              <ApiKeysTable
                data={apiKeys}
                total={total}
                isLoading={isLoading}
                search={search}
                navigate={navigate}
                onManage={(row) => {
                  setCurrentRow(row);
                  setOpenManage(true);
                }}
                onToggleStatus={handleToggleStatus}
                onDelete={(row) => {
                  setCurrentRow(row);
                  setOpenDelete(true);
                }}
                onBulkDelete={handleBulkDelete}
              />
            </div>
          </CardContent>
        </Card>

        <ApiKeyCreateDialog
          open={openCreate}
          onOpenChange={setOpenCreate}
          onCreate={handleCreate}
          isLoading={createApiKey.isPending}
        />

        <ApiKeyManageDialog
          currentRow={currentRow}
          open={openManage}
          onOpenChange={(open) => {
            setOpenManage(open);
            if (!open) setCurrentRow(null);
          }}
          onSave={handleManage}
          isLoading={updateApiKey.isPending}
        />

        <ApiKeyDeleteDialog
          currentRow={currentRow}
          open={openDelete}
          onOpenChange={(open) => {
            setOpenDelete(open);
            if (!open) setCurrentRow(null);
          }}
          onDelete={handleDelete}
          isLoading={deleteApiKey.isPending}
        />
      </>
    </ContentSection>
  );
}
