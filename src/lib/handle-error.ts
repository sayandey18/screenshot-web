import { AxiosError } from "axios";
import { toast } from "sonner";

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error);

  let errMsg = "Something went wrong!";

  if (error instanceof AxiosError) {
    if (error.response?.status === 204) {
      errMsg = "Content not found.";
    } else {
      errMsg = error.response?.data?.title ?? errMsg;
    }
  }

  toast.error(errMsg);
}
