import { db } from "@/shared/db/database";
import { employees } from "../schema/employees";
import { users, userRoles, roles, tenants } from "@/platform/db/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";
import * as argon2 from "argon2";

export interface CreateEmployeeParams {
  fullName: string;
  mobile: string;
  email?: string;
  designation: string;
  joinDate: string;
  status: string;
  username?: string;
  password?: string;
}

export class EmployeeRepository {
  static async generateNextEmpId(tenantId: string): Promise<string> {
    const list = await db
      .select({ empId: employees.empId })
      .from(employees)
      .where(and(eq(employees.tenantId, tenantId), eq(employees.isInternal, false)))
      .all();

    let maxNum = 0;
    list.forEach((e) => {
      const match = e.empId.match(/^EMP-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    const nextNum = maxNum + 1;
    return `EMP-${String(nextNum).padStart(3, "0")}`;
  }

  static async getEmployees(tenantId: string) {
    const list = await db
      .select({
        id: employees.id,
        empId: employees.empId,
        fullName: employees.fullName,
        mobile: employees.mobile,
        email: employees.email,
        designation: employees.designation,
        joinDate: employees.joinDate,
        status: employees.status,
        userId: employees.userId,
        createdAt: employees.createdAt,
      })
      .from(employees)
      .where(and(eq(employees.tenantId, tenantId), eq(employees.isInternal, false)))
      .orderBy(desc(employees.createdAt))
      .all();

    // Fetch usernames for linked non-internal users
    const results = await Promise.all(
      list.map(async (emp) => {
        let username = "";
        let lastLogin = "Never";
        if (emp.userId) {
          const u = await db.select().from(users).where(and(eq(users.id, emp.userId), eq(users.isInternal, false))).get();
          if (u) {
            username = u.username;
            if (u.lastLoginAt) {
              lastLogin = new Date(u.lastLoginAt).toLocaleDateString();
            }
          }
        }
        return {
          ...emp,
          username,
          lastLogin,
        };
      })
    );

    return results;
  }

  static async getEmployeeById(tenantId: string, id: string) {
    const emp = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.tenantId, tenantId), eq(employees.isInternal, false)))
      .get();

    if (!emp) return null;

    let username = "";
    if (emp.userId) {
      const u = await db.select().from(users).where(and(eq(users.id, emp.userId), eq(users.isInternal, false))).get();
      if (u) username = u.username;
    }

    return {
      ...emp,
      username,
    };
  }

  static async createEmployee(tenantId: string, params: CreateEmployeeParams) {
    const empId = await this.generateNextEmpId(tenantId);
    const employeeId = crypto.randomUUID();
    let createdUserId: string | null = null;

    // Check duplicate mobile
    const existingEmp = await db
      .select()
      .from(employees)
      .where(and(eq(employees.tenantId, tenantId), eq(employees.mobile, params.mobile), eq(employees.isInternal, false)))
      .get();

    if (existingEmp) {
      throw new Error(`An employee with mobile number "${params.mobile}" already exists.`);
    }

    // Handle user creation if username provided
    if (params.username && params.password) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, params.username))
        .get();

      if (existingUser) {
        throw new Error(`Username "${params.username}" is already taken. Please choose another username.`);
      }

      createdUserId = crypto.randomUUID();
      const passwordHash = await argon2.hash(params.password);

      const nameParts = params.fullName.trim().split(" ");
      const firstName = nameParts[0] || "Employee";
      const lastName = nameParts.slice(1).join(" ") || "";

      await db.insert(users).values({
        id: createdUserId,
        username: params.username,
        passwordHash,
        firstName,
        lastName,
        userType: "BUSINESS",
        status: params.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
        mustChangePassword: false,
        isInternal: false,
      });

      // Find or assign default role
      let role = await db
        .select()
        .from(roles)
        .where(and(eq(roles.tenantId, tenantId), eq(roles.slug, params.designation.toLowerCase()), eq(roles.isInternal, false)))
        .get();

      if (!role) {
        role = await db.select().from(roles).where(and(eq(roles.tenantId, tenantId), eq(roles.isInternal, false))).get();
      }

      if (role) {
        await db.insert(userRoles).values({
          userId: createdUserId,
          roleId: role.id,
          tenantId,
        });
      }
    }

    await db.insert(employees).values({
      id: employeeId,
      tenantId,
      empId,
      fullName: params.fullName,
      mobile: params.mobile,
      email: params.email || null,
      designation: params.designation,
      joinDate: params.joinDate,
      status: params.status || "ACTIVE",
      isInternal: false,
      userId: createdUserId,
    });

    return { employeeId, empId };
  }

  static async updateEmployee(
    tenantId: string,
    id: string,
    params: {
      fullName: string;
      mobile: string;
      email?: string;
      designation: string;
      joinDate: string;
      status: string;
      username?: string;
      password?: string;
    }
  ) {
    const existing = await this.getEmployeeById(tenantId, id);
    if (!existing) throw new Error("Employee not found.");

    await db
      .update(employees)
      .set({
        fullName: params.fullName,
        mobile: params.mobile,
        email: params.email || null,
        designation: params.designation,
        joinDate: params.joinDate,
        status: params.status,
        updatedAt: new Date(),
      })
      .where(and(eq(employees.id, id), eq(employees.tenantId, tenantId), eq(employees.isInternal, false)));

    if (existing.userId) {
      const nameParts = params.fullName.trim().split(" ");
      const firstName = nameParts[0] || "Employee";
      const lastName = nameParts.slice(1).join(" ") || "";

      const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
      const isOwner = tenant?.ownerId === existing.userId;

      const userUpdate: any = {
        firstName,
        lastName,
        updatedAt: new Date(),
      };

      if (!isOwner || params.status === "ACTIVE") {
        userUpdate.status = params.status === "ACTIVE" ? "ACTIVE" : "INACTIVE";
      }

      if (params.password && params.password.trim().length > 0) {
        userUpdate.passwordHash = await argon2.hash(params.password.trim());
      }

      await db.update(users).set(userUpdate).where(and(eq(users.id, existing.userId), eq(users.isInternal, false)));
    }
  }

  static async toggleEmployeeStatus(tenantId: string, id: string) {
    const existing = await this.getEmployeeById(tenantId, id);
    if (!existing) throw new Error("Employee not found.");

    const newStatus = existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await db
      .update(employees)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(and(eq(employees.id, id), eq(employees.tenantId, tenantId), eq(employees.isInternal, false)));

    if (existing.userId) {
      const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
      if (tenant?.ownerId === existing.userId) {
        throw new Error("Cannot change status of the Business Owner.");
      }
      await db
        .update(users)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(and(eq(users.id, existing.userId), eq(users.isInternal, false)));
    }

    return newStatus;
  }

  static async deleteEmployee(tenantId: string, id: string) {
    const existing = await this.getEmployeeById(tenantId, id);
    if (!existing) throw new Error("Employee not found.");

    await db
      .delete(employees)
      .where(and(eq(employees.id, id), eq(employees.tenantId, tenantId), eq(employees.isInternal, false)));

    if (existing.userId) {
      const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
      if (tenant?.ownerId === existing.userId) {
        throw new Error("Cannot delete the Business Owner. Please transfer ownership or delete the business instead.");
      }
      await db.delete(userRoles).where(eq(userRoles.userId, existing.userId));
      await db.delete(users).where(and(eq(users.id, existing.userId), eq(users.isInternal, false)));
    }
  }
}
