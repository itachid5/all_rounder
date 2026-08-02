'use server';

import { cookies } from 'next/headers';
import { db } from '@/shared/db/database';
import { users } from "@/platform/db/schema";
import { sessions } from "@/platform/db/schema/sessions";

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import * as argon2 from 'argon2';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const isPlatform = formData.get('isPlatform') === 'true';

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  // Check DB
  const dbUser = await db.select().from(users).where(eq(users.username, username)).get();
  
  if (!dbUser) {
    return { error: 'Invalid credentials' };
  }
  
  // Verify user type matches
  if (isPlatform && dbUser.userType !== 'PLATFORM') {
    return { error: 'Unauthorized access' };
  }
  if (!isPlatform && dbUser.userType !== 'BUSINESS') {
    return { error: 'Unauthorized access' };
  }
  
  // Check password
  const isValid = await argon2.verify(dbUser.passwordHash, password);
  if (!isValid) {
    return { error: 'Invalid credentials' };
  }
  
  if (dbUser.status !== 'ACTIVE') {
    return { error: 'Account is suspended or disabled' };
  }

  const remember = formData.get('remember') === 'on';
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    ...(remember ? { maxAge: 30 * 86400 } : {})
  };

  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + (remember ? 30 * 86400 * 1000 : 86400 * 1000));

  await db.insert(sessions).values({
    id: sessionId,
    userId: dbUser.id,
    token: sessionId,
    expiresAt,
    createdAt: new Date(),
  });

  const cookieStore = await cookies();
  cookieStore.set('auth-token', dbUser.id, cookieOptions);
  cookieStore.set('session-token', sessionId, cookieOptions);

  if (dbUser.mustChangePassword) {
    return { requiresPasswordChange: true };
  }

  return { success: true };
}

export async function changePassword(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return { error: 'Not authenticated' };
  }
  
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required' };
  }
  
  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' };
  }
  
  const dbUser = await db.select().from(users).where(eq(users.id, token)).get();
  if (!dbUser) {
    return { error: 'User not found' };
  }
  
  const isValid = await argon2.verify(dbUser.passwordHash, currentPassword);
  if (!isValid) {
    return { error: 'Current password is incorrect' };
  }
  
  const newHash = await argon2.hash(newPassword);
  
  await db.update(users)
    .set({ 
      passwordHash: newHash,
      mustChangePassword: false 
    })
    .where(eq(users.id, token));
    
  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session-token')?.value;
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
  cookieStore.delete('auth-token');
  cookieStore.delete('session-token');
  redirect('/business-login');
}
