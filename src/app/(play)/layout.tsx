/**
 * PlayLab game shell layout.
 *
 * Renders a fixed full-viewport overlay (.pl-shell) so games take over the
 * entire screen without touching html/body styles. The parent providers
 * (Auth, Query, Locale) from the root layout are still active.
 */
import "@/playlab/playlab.css";

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pl-shell font-rounded fixed inset-0 z-50 overflow-hidden bg-white antialiased"
      style={{ height: "100dvh" }}
    >
      {children}
    </div>
  );
}
