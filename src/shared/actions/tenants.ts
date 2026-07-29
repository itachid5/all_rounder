"use server";

import { db } from "@/shared/db/database";
import { users, tenants, roles, userRoles, templates } from "@/platform/db/schema";

import { eq, and } from "drizzle-orm";
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
    let roleId: string = crypto.randomUUID();

    // 1. Create Business Admin User
    const passwordHash = await argon2.hash(password);
    const [firstName, ...lastNameParts] = ownerName.split(' ');
    
    // Generate base slug and check availability
    let slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (slug.endsWith('-')) slug = slug.slice(0, -1);
    if (slug.startsWith('-')) slug = slug.slice(1);
    if (!slug) slug = 'business';

    let existingTenant = await db.select().from(tenants).where(eq(tenants.slug, slug)).get();
    let counter = 2;
    const baseSlug = slug;
    while (existingTenant) {
      slug = `${baseSlug}-${counter}`;
      existingTenant = await db.select().from(tenants).where(eq(tenants.slug, slug)).get();
      counter++;
    }

    const settings = JSON.stringify({
      timezone,
      currency,
      language,
    });

    // Run inserts in a transaction for atomicity
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        username,
        passwordHash,
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        userType: 'BUSINESS',
        status: 'ACTIVE',
        mustChangePassword: true,
      }).execute();

      await tx.insert(tenants).values({
        id: tenantId,
        name: businessName,
        slug: slug,
        templateId: template!.id,
        ownerId: userId,
        settings: settings,
        status: 'ACTIVE',
      }).execute();

      let role = await tx.select().from(roles).where(and(eq(roles.slug, 'business_owner'), eq(roles.tenantId, tenantId))).get();
      
      if (!role) {
        await tx.insert(roles).values({
          id: roleId,
          name: 'Business Owner',
          slug: 'business_owner',
          description: 'Full access to the business',
          scope: 'BUSINESS',
          tenantId: tenantId,
          isSystem: true,
        }).execute();
      } else {
        roleId = role.id;
      }

      await tx.insert(userRoles).values({
        userId: userId,
        roleId: roleId,
        tenantId: tenantId,
      }).execute();
    });

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
