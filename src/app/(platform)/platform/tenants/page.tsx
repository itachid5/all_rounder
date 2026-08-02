import { Building2, Search, Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/shared/db/database";
import { tenants, users, templates } from "@/platform/db/schema";
import { eq } from "drizzle-orm";
import { formatDate } from "@/shared/utils/date";

export const dynamic = 'force-dynamic';

export default async function BusinessesPage() {
  const allTenants = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      status: tenants.status,
      createdAt: tenants.createdAt,
      ownerName: users.username,
      templateName: templates.name,
    })
    .from(tenants)
    .leftJoin(users, eq(tenants.ownerId, users.id))
    .leftJoin(templates, eq(tenants.templateId, templates.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Businesses</h1>
          <p className="text-muted-foreground">Manage all businesses on the platform</p>
        </div>
        <Link href="/platform/tenants/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus className="h-4 w-4 mr-2" />
          Create Business
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            type="search" 
            placeholder="Search businesses..." 
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
          />
        </div>
        <select className="flex h-10 w-full sm:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="rounded-md border bg-card">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Owner</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Template</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {allTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center align-middle">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Building2 className="h-8 w-8 mb-2 opacity-20" />
                      <p className="font-medium text-foreground">No businesses yet</p>
                      <p className="text-sm">Create your first business to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                allTenants.map((t) => (
                  <tr key={t.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4">{t.name}</td>
                    <td className="p-4">{t.ownerName}</td>
                    <td className="p-4">{t.templateName}</td>
                    <td className="p-4">{t.status}</td>
                    <td className="p-4">{formatDate(t.createdAt)}</td>
                    <td className="p-4">
                      <Link href={`/platform/tenants/${t.id}`} className="text-blue-500 hover:underline">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
