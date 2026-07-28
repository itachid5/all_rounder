"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { provisionBusiness } from "@/shared/actions/businesses";
import { Copy, Check, ArrowRight } from "lucide-react";

export default function NewBusinessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<{ username: string; password: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      const res = await provisionBusiness(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success && res.credentials) {
        setCredentials(res.credentials);
      }
    } catch (err) {
      setError("Failed to provision business. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = () => {
    if (!credentials) return;
    const text = `URL: ${credentials.url}\nUsername: ${credentials.username}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (credentials) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-500">Business Provisioned!</h1>
          <p className="text-muted-foreground mt-2">The business has been created and is ready to use.</p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Temporary Credentials</h3>
            <button 
              onClick={copyToClipboard}
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          
          <div className="bg-muted p-4 rounded-md space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">URL:</span>
              <span>{credentials.url}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username:</span>
              <span>{credentials.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Password:</span>
              <span>{credentials.password}</span>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-3 rounded text-sm border border-yellow-500/20">
            <strong>Important:</strong> Please save these credentials now. They will not be shown again. The user will be required to change this password on their first login.
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            onClick={() => router.push('/platform/businesses')}
            className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted"
          >
            Back to Businesses
          </button>
          <a 
            href={credentials.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go to Business Portal <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Provision New Business</h1>
        <p className="text-muted-foreground">Create and configure a new business on the platform.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-card border rounded-lg p-6">
        
        {/* Business Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Business Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="businessName" className="text-sm font-medium">Business Name *</label>
              <input type="text" id="businessName" name="businessName" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="template" className="text-sm font-medium">Template *</label>
              <select id="template" name="template" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                <option value="egg-shop">Egg Shop</option>
                <option value="egg-tasta">Egg Tasta</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="timezone" className="text-sm font-medium">Timezone</label>
              <select id="timezone" name="timezone" defaultValue="UTC" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="Europe/London">London</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium">Currency</label>
              <select id="currency" name="currency" defaultValue="USD" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium">Language</label>
              <select id="language" name="language" defaultValue="en" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Owner Account</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="ownerName" className="text-sm font-medium">Owner Name *</label>
              <input type="text" id="ownerName" name="ownerName" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Username *</label>
              <input type="text" id="username" name="username" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Temporary Password *</label>
              <input type="text" id="password" name="password" required minLength={8} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button 
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center"
          >
            {loading ? "Provisioning..." : "Provision Business"}
          </button>
        </div>
      </form>
    </div>
  );
}
