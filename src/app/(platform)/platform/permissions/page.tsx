import { Key } from "lucide-react";

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
        <p className="text-muted-foreground">View and manage platform permissions</p>
      </div>

      <div className="py-12 rounded-xl border border-dashed border-border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center">
        <Key className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
        <p className="text-lg font-medium">Permissions list empty</p>
        <p className="text-sm text-muted-foreground">Platform permissions are read-only for now.</p>
      </div>
    </div>
  );
}
