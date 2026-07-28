"use server";

import { db } from "@/db";
import { users, tenants, roles, userRoles, templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import * as argon2 from "argon2";
import { headers } from "next/headers";

export async function provisionBusiness(formData: FormData) {
  try {
    const businessName = formData.get('businessName') as string;
    const templateSlug = formData.get('template') as string;
    const timezone = formData.get('timezone') as string;
    const currency = formData.get('currency') as string;
    const language = formData.get('language') as string;
    const ownerName = formData.get('ownerName') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!businessName || !templateSlug || !ownerName || !username || !password) {
      return { error: 'All required fields must be filled' };
    }

    // Check if username exists
    const existingUser = await db.select().from(users).where(eq(users.username, username)).get();
    if (existingUser) {
      return { error: 'Username already exists' };
    }

    // Find the template
    let template = await db.select().from(templates).where(eq(templates.slug, templateSlug)).get();
    
    // If template doesn't exist, create it dynamically
    if (!template) {
      const templateId = crypto.randomUUID();
      const templateName = templateSlug === 'egg-tasta' ? 'Egg Tasta' : 
                           templateSlug === 'egg-shop' ? 'Egg Shop' : templateSlug;
      await db.insert(templates).values({
        id: templateId,
        name: templateName,
        slug: templateSlug,
        description: `Business template for ${templateName}.`,
        version: '1.0.0',
        status: 'ACTIVE',
      }).execute();
      template = await db.select().from(templates).where(eq(templates.id, templateId)).get();
    }

    if (!template) {
      return { error: 'Failed to resolve template' };
    }

    // Generate IDs
    const userId = crypto.randomUUID();
    const tenantId = crypto.randomUUID();
    const roleId = crypto.randomUUID();

    // 1. Create Business Admin User
    const passwordHash = await argon2.hash(password);
    const [firstName, ...lastNameParts] = ownerName.split(' ');
    
    await db.insert(users).values({
      id: userId,
      username,
      passwordHash,
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      userType: 'BUSINESS',
      status: 'ACTIVE',
      mustChangePassword: true,
    }).execute();

    // 2. Create Tenant (Business)
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const settings = JSON.stringify({
      timezone,
      currency,
      language,
    });

    await db.insert(tenants).values({
      id: tenantId,
      name: businessName,
      slug: slug,
      templateId: template.id,
      ownerId: userId,
      settings: settings,
      status: 'ACTIVE',
    }).execute();

    // 3. Create Default Business Owner Role for this tenant
    await db.insert(roles).values({
      id: roleId,
      name: 'Business Owner',
      slug: 'business_owner',
      description: 'Full access to the business',
      scope: 'BUSINESS',
      tenantId: tenantId,
      isSystem: true,
    }).execute();

    // 4. Assign user to role
    await db.insert(userRoles).values({
      userId: userId,
      roleId: roleId,
      tenantId: tenantId,
    }).execute();

    // In a real app we'd construct the URL from the request or env vars
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    return { 
      success: true, 
      credentials: {
        username,
        password,
        url: `${protocol}://${host}/app/login`
      } 
    };
  } catch (error: any) {
    console.error("Provisioning error:", error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}
