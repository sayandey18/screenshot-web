import { AxiosError } from "axios";
import { toast } from "sonner";

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error("[handleServerError]", error);
  }

  let errMsg = "Something went wrong!";

  if (error instanceof AxiosError) {
    errMsg = error.response?.data?.message ?? error.response?.data?.title ?? errMsg;
  }

  toast.error(errMsg);
}
