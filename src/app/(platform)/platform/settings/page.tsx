import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform behavior</p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          <button className="px-6 py-3 font-medium text-sm text-primary border-b-2 border-primary bg-muted/30">General</button>
          <button className="px-6 py-3 font-medium text-sm text-muted-foreground hover:text-foreground">Security</button>
          <button className="px-6 py-3 font-medium text-sm text-muted-foreground hover:text-foreground">Database</button>
          <button className="px-6 py-3 font-medium text-sm text-muted-foreground hover:text-foreground">Maintenance</button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General Information</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Platform Name</label>
                <input 
                  type="text" 
                  value="ERP Platform" 
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-70"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Primary URL</label>
                <input 
                  type="text" 
                  value="https://erp.local" 
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-70"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  value="Multi-Tenant Enterprise Resource Planning Platform"
                  disabled
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-70"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button disabled className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 opacity-50 cursor-not-allowed">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
