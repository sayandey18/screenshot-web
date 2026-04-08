import { redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export type OtpFlowType = "otp:signup" | "otp:login-2fa" | "otp:sensitive-action";

export interface OtpContextData {
  email?: string;
  intent: string;
  redirect?: string;
  timestamp: number;
}

const EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

export const otpContext = {
  set(flow: OtpFlowType, data: Omit<OtpContextData, "timestamp">) {
    sessionStorage.setItem(flow, JSON.stringify({ ...data, timestamp: Date.now() }));
  },

  get(flow: OtpFlowType): OtpContextData | null {
    const raw = sessionStorage.getItem(flow);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as OtpContextData;
    } catch {
      return null;
    }
  },

  clear(flow: OtpFlowType) {
    sessionStorage.removeItem(flow);
  },

  /**
   * Validates the flow context and returns the data.
   * Designed to be used inside TanStack Router's `beforeLoad`.
   */
  validate(flow: OtpFlowType, expectedIntent: string, fallbackUrl: string): OtpContextData {
    const ctx = this.get(flow);

    if (!ctx) {
      throw redirect({ to: fallbackUrl, replace: true });
    }

    if (Date.now() - ctx.timestamp > EXPIRY_MS || ctx.intent !== expectedIntent) {
      this.clear(flow);
      throw redirect({ to: fallbackUrl, replace: true });
    }

    return ctx;
  },

  /**
   * Centralized successful post-verification handler.
   */
  handleSuccess(flow: OtpFlowType, defaultRedirect: string, message?: string) {
    const ctx = this.get(flow);
    const destination = ctx?.redirect || defaultRedirect;

    this.clear(flow);

    if (message) {
      toast.success(message);
    }

    return destination;
  },
};
