import { Building2, Users, Layers, Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { db } from "@/shared/db/database";
import { tenants, users, auditLogs } from "@/platform/db/schema";

import { eq, count, desc } from "drizzle-orm";

export default async function DashboardPage() {
  // Fetch real metrics from the database
  const [totalBusinessesResult] = await db.select({ value: count() }).from(tenants);
  const [activeBusinessesResult] = await db.select({ value: count() }).from(tenants).where(eq(tenants.status, 'ACTIVE'));
  const [suspendedBusinessesResult] = await db.select({ value: count() }).from(tenants).where(eq(tenants.status, 'SUSPENDED'));
  
  const [totalPlatformUsersResult] = await db.select({ value: count() }).from(users).where(eq(users.userType, 'PLATFORM'));

  const recentActivities = await db.select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(5);

  const totalBusinesses = totalBusinessesResult.value;
  const activeBusinesses = activeBusinessesResult.value;
  const suspendedBusinesses = suspendedBusinessesResult.value;
  const totalPlatformUsers = totalPlatformUsersResult.value;
  
  const platformStatus = "Healthy"; // In the future, this can check DB connection or background worker status

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col space-y-2 hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Businesses</p>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold tracking-tight">{totalBusinesses}</h2>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col space-y-2 hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Active Businesses</p>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold tracking-tight">{activeBusinesses}</h2>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col space-y-2 hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Suspended Businesses</p>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold tracking-tight">{suspendedBusinesses}</h2>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col space-y-2 hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Platform Users</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold tracking-tight">{totalPlatformUsers}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="p-6 pb-2 border-b">
            <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
            <p className="text-sm text-muted-foreground mt-1.5">Latest actions across the platform</p>
          </div>
          <div className="p-0 flex-1 flex flex-col">
            {recentActivities.length === 0 ? (
              <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Activity className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No recent activity</p>
                <p className="text-sm text-muted-foreground">Activity will appear here once users interact with the system.</p>
              </div>
            ) : (
              <div className="divide-y">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                    <div className="mt-1 bg-primary/10 p-2 rounded-full">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'Unknown Date'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="p-6 pb-2 border-b">
            <h3 className="font-semibold leading-none tracking-tight">System Status</h3>
            <p className="text-sm text-muted-foreground mt-1.5">Platform health overview</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-medium">Database Connection</span>
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-medium">Authentication Service</span>
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-medium">Overall Platform Status</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:text-green-300">
                {platformStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
