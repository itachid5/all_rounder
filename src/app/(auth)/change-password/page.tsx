"use client";

import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { changePassword } from '@/shared/actions/auth';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await changePassword(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        // Redirect to a generic dashboard or let the user login again
        // For simplicity, we just redirect them to the home page or dashboard selector
        // Since we don't know the userType easily on the client here, we can redirect to /
        // and let them log in again, or redirect based on a known parameter.
        // Let's redirect to home so they can select their portal and log in with new credentials.
        router.push('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Action Required</h2>
        <p className="text-sm text-muted-foreground mt-1">Please change your default password to continue</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="currentPassword">Current Password</label>
          <input 
            id="currentPassword" 
            name="currentPassword"
            type="password" 
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
            placeholder="••••••••" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="newPassword">New Password</label>
          <input 
            id="newPassword" 
            name="newPassword"
            type="password" 
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
            placeholder="••••••••" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm New Password</label>
          <input 
            id="confirmPassword" 
            name="confirmPassword"
            type="password" 
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
            placeholder="••••••••" 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
