"use client";

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useState } from 'react';
import { login } from '@/shared/actions/auth';
import { useRouter } from 'next/navigation';

export default function PlatformLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    formData.append('isPlatform', 'true');
    
    try {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.requiresPasswordChange) {
        router.push('/change-password');
      } else if (result?.success) {
        router.push('/platform/dashboard');
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
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Platform Administration</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to manage the platform</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="username">Username</label>
          <input 
            id="username" 
            name="username"
            type="text" 
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
            placeholder="superadmin" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input 
            id="password" 
            name="password"
            type="password" 
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
            placeholder="••••••••" 
          />
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="remember" name="remember" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
          <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</label>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4 disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
