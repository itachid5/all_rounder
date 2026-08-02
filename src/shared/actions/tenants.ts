"use server";

import { db } from "@/shared/db/database";
import { users, tenants, roles, userRoles, templates } from "@/platform/db/schema";
import { accounts } from "@/templates/egg-tasta/db/schema/accounts";

import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import * as argon2 from "argon2";
import { headers } from "next/headers";

export async function provisionBusiness(formData: FormData) {
  try {
    const businessName = (formData.get('businessName') as string || '').trim();
    const templateSlug = (formData.get('template') as string || '').trim();
    const timezone = (formData.get('timezone') as string || 'Asia/Dhaka').trim();
    const currency = (formData.get('currency') as string || 'BDT').trim();
    const language = (formData.get('language') as string || 'en').trim();
    const ownerName = (formData.get('ownerName') as string || '').trim();
    const username = (formData.get('username') as string || '').trim();
    const password = (formData.get('password') as string || '').trim();

    if (!businessName) {
      return { error: 'Business Name is required' };
    }
    if (!templateSlug) {
      return { error: 'Template selection is required' };
    }
    if (!ownerName) {
      return { error: 'Owner Name is required' };
    }
    if (!username) {
      return { error: 'Username is required' };
    }
    if (!password || password.length < 8) {
      return { error: 'Password must be at least 8 characters long' };
    }

    // 1. Check if username exists globally
    const existingUser = await db.select().from(users).where(eq(users.username, username)).get();
    if (existingUser) {
      return { error: `Username "${username}" already exists. Please choose a different username.` };
    }

    // 2. Resolve template
    let template = await db.select().from(templates).where(eq(templates.slug, templateSlug)).get();
    
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
      });
      template = await db.select().from(templates).where(eq(templates.id, templateId)).get();
    }

    if (!template) {
      return { error: 'Failed to resolve or create business template' };
    }

    // 3. Generate base slug and check uniqueness
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

    // 4. Generate IDs & Password Hash
    const userId = crypto.randomUUID();
    const tenantId = crypto.randomUUID();
    let roleId: string = crypto.randomUUID();
    const passwordHash = await argon2.hash(password);
    const [firstName, ...lastNameParts] = ownerName.split(' ');

    const settings = JSON.stringify({
      businessName,
      slug,
      logoUrl: null,
      timezone,
      currency,
      language,
      dateFormat: 'YYYY-MM-DD',
      numberFormat: 'en-US',
      status: 'ACTIVE',
      createdDate: new Date().toISOString(),
    });

    // 5. Atomic Transaction for all records
    await db.transaction(async (tx) => {
      // a. Create User
      await tx.insert(users).values({
        id: userId,
        username,
        passwordHash,
        firstName: firstName || ownerName,
        lastName: lastNameParts.join(' ') || '',
        userType: 'BUSINESS',
        status: 'ACTIVE',
        mustChangePassword: true,
      });

      // b. Create Tenant
      await tx.insert(tenants).values({
        id: tenantId,
        name: businessName,
        slug: slug,
        templateId: template!.id,
        ownerId: userId,
        settings: settings,
        status: 'ACTIVE',
      });

      // c. Create or Assign Business Owner Role
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
        });
      } else {
        roleId = role.id;
      }

      // d. Assign Role to User
      await tx.insert(userRoles).values({
        userId: userId,
        roleId: roleId,
        tenantId: tenantId,
      });

      // e. Create Default Cash Account
      await tx.insert(accounts).values({
        id: crypto.randomUUID(),
        tenantId: tenantId,
        name: 'Main Cash Account',
        type: 'CASH',
        openingBalance: 0,
        currentBalance: 0,
        status: 'ACTIVE',
      });
    });

    let host = 'localhost:3000';
    let protocol = 'http';
    try {
      const headersList = await headers();
      host = headersList.get('host') || 'localhost:3000';
      protocol = host.includes('localhost') ? 'http' : 'https';
    } catch {
      // Fallback for non-request environments or CLI testing
    }
    
    return { 
      success: true, 
      credentials: {
        username,
        password,
        url: `${protocol}://${host}/app/login`
      } 
    };
  } catch (error: any) {
    const rawError = error?.message || String(error);
    console.error("Business Provisioning Failed:", rawError);
    
    let userFacingMessage = rawError;
    if (rawError.includes('UNIQUE constraint failed')) {
      if (rawError.includes('users.username')) {
        userFacingMessage = 'Username already exists. Please choose another username.';
      } else if (rawError.includes('tenants.slug')) {
        userFacingMessage = 'Business slug already exists. Please choose another business name.';
      } else {
        userFacingMessage = 'Database uniqueness constraint failed.';
      }
    }
    return { error: userFacingMessage };
  }
}
