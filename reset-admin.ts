import { db } from '@/shared/db/database';
import { users } from '@/platform/db/schema';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';

async function resetSuperAdmin() {
  const adminUsername = 'superadmin';
  const newPassword = 'SuperAdmin@123';

  console.log(`Looking for user: ${adminUsername}...`);
  const existingAdmin = await db.select().from(users).where(eq(users.username, adminUsername)).get();

  if (!existingAdmin) {
    console.error(`User ${adminUsername} not found! You might need to run the seed script.`);
    return;
  }

  console.log(`User found. Generating new hash for password: ${newPassword}...`);
  const passwordHash = await argon2.hash(newPassword);

  console.log(`Updating user record...`);
  await db.update(users)
    .set({ 
      passwordHash: passwordHash,
      status: 'ACTIVE',
      userType: 'PLATFORM',
      mustChangePassword: false
    })
    .where(eq(users.username, adminUsername))
    .execute();

  console.log(`Password reset successful for ${adminUsername}.`);
}

resetSuperAdmin().catch((err) => {
  console.error('Error resetting super admin:', err);
}).finally(() => {
  process.exit(0);
});
