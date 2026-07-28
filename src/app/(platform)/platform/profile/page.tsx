import { UserCircle, Mail, Key } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-6 bg-muted/30 border-b flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              SA
            </div>
            <div>
              <h2 className="text-2xl font-bold">Super Admin</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" /> admin@erp-platform.local
              </p>
              <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                System Administrator
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Personal Information</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Full Name</label>
                <input 
                  type="text" 
                  value="Super Admin" 
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-70"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email Address</label>
                <input 
                  type="email" 
                  value="admin@erp-platform.local" 
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-70"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Security</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.
              </p>
              <button disabled className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 opacity-50 cursor-not-allowed">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
