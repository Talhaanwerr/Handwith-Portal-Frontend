/**
 * Safe user-facing error messages.
 * Never surface raw stack traces or internal exception details to the UI.
 */
import { ApiError } from "./api-error";

const GENERIC = "Something went wrong. Please try again.";

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Prefer short API message; never expose nested stack/debug payloads
    const msg = error.message?.trim();
    if (!msg) return GENERIC;
    // Truncate overly long / suspicious payloads
    if (msg.length > 200) return GENERIC;
    if (/stack|exception|prisma|sql|econnrefused/i.test(msg)) return GENERIC;
    return msg;
  }

  if (error instanceof Error && error.message && error.message.length < 120) {
    return error.message;
  }

  return GENERIC;
}
