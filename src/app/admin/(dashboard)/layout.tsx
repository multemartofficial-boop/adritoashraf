import { requireAdmin } from "@/lib/auth/session";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const { data: settings } = await session.supabase.from("site_settings").select("site_name").eq("id", 1).maybeSingle();

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden">
      <Topbar email={session.email} name={session.name} siteName={settings?.site_name || "Portfolio"} />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 lg:flex">
          <Sidebar />
        </aside>
        <main id="admin-main" className="min-w-0 flex-1 overflow-y-auto lg:pr-3 lg:pb-3">
          <div className="min-h-full border-t border-admin-border bg-white/45 p-4 md:p-6 lg:rounded-2xl lg:border lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
