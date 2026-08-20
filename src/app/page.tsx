import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";
import { getHomePath } from "@/lib/post-login-path";
import { parseSessionCookie } from "@/lib/session-cookie";

export default async function RootPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("next-session")?.value;
  const session = raw ? parseSessionCookie(`next-session=${encodeURIComponent(raw)}`) : null;

  if (session) {
    redirect(getHomePath(session.role));
  }

  redirect(ROUTES.LOGIN);
}
