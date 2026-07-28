import { Shield, Plus } from "lucide-react";

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">Manage platform roles and permissions</p>
        </div>
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Empty state for roles */}
        <div className="col-span-full py-12 rounded-xl border border-dashed border-border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center">
          <Shield className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
          <p className="text-lg font-medium">No custom roles configured</p>
          <p className="text-sm text-muted-foreground">System roles are managed automatically.</p>
        </div>
      </div>
    </div>
  );
}
