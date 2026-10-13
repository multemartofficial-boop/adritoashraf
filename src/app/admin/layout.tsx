import type { Metadata } from "next";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh bg-admin-bg font-admin text-admin-text">
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster position="top-right" richColors closeButton toastOptions={{ className: "font-admin" }} />
    </div>
  );
}
