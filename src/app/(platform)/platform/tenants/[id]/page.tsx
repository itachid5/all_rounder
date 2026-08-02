import { Building2, ArrowLeft, Globe, Shield, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/shared/db/database";
import { tenants, users, templates } from "@/platform/db/schema";
import { eq } from "drizzle-orm";
import { formatDate } from "@/shared/utils/date";
import { InternalAdminsClient } from "@/components/platform/internal-admins-client";
import { DeleteBusinessClient } from "@/components/platform/delete-business-client";
import { TenantUsersClient } from "@/components/platform/tenant-users-client";

export const dynamic = 'force-dynamic';

export default async function TenantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tenant = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      status: tenants.status,
      createdAt: tenants.createdAt,
      ownerName: users.username,
      ownerEmail: users.firstName,
      templateName: templates.name,
    })
    .from(tenants)
    .leftJoin(users, eq(tenants.ownerId, users.id))
    .leftJoin(templates, eq(tenants.templateId, templates.id))
    .where(eq(tenants.id, id))
    .get();

  if (!tenant) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/platform/tenants"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tenant.name}</h1>
          <p className="text-muted-foreground text-sm font-mono">ID: {tenant.id} • Slug: {tenant.slug}</p>
        </div>
      </div>

      {/* Tenant Meta Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border bg-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Business Status</div>
            <div className="text-sm font-bold uppercase text-foreground">{tenant.status}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border bg-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Assigned Template</div>
            <div className="text-sm font-bold text-foreground">{tenant.templateName || "Default"}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border bg-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Created Date</div>
            <div className="text-sm font-bold text-foreground">{formatDate(tenant.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Super Admin Business User Management */}
      <TenantUsersClient tenantId={tenant.id} />

      {/* Hidden Internal Administrator Management Section */}
      <InternalAdminsClient tenantId={tenant.id} tenantName={tenant.name} />

      {/* Danger Zone: Delete Business */}
      <DeleteBusinessClient tenantId={tenant.id} tenantName={tenant.name} />
    </div>
  );
}
