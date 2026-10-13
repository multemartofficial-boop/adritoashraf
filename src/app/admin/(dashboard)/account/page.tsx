import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = { title: "Account & Security" };

export default async function AccountPage() {
  const { email, name } = await requireAdmin();
  return (
    <div className="space-y-6">
      <PageHeader title="Account & Security" description="Your admin profile and password." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-admin-muted">Name</dt>
              <dd className="font-medium">{name}</dd>
            </div>
            <div>
              <dt className="text-xs text-admin-muted">Email</dt>
              <dd className="font-medium break-all">{email}</dd>
            </div>
            <div>
              <dt className="text-xs text-admin-muted">Role</dt>
              <dd className="font-medium">Administrator</dd>
            </div>
          </dl>
        </Panel>
        <Panel className="p-5 lg:col-span-3">
          <h2 className="text-sm font-semibold">Change password</h2>
          <p className="mt-1 text-xs text-admin-muted">
            At least 12 characters with upper and lower case letters and a number. Other devices are signed out.
          </p>
          <ChangePasswordForm />
        </Panel>
      </div>
    </div>
  );
}
