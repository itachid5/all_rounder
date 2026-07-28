import { db } from './src/db/index';
import * as schema from './src/db/schema';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || 'superadmin';
  console.log(`Updating password for ${adminUsername}...`);
  
  const passwordHash = await argon2.hash('mmmm0987');
  
  await db.update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.username, adminUsername))
    .execute();
    
  // Also update 'admin@erp-platform.local' just in case that's the one they are using
  await db.update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.username, 'admin@erp-platform.local'))
    .execute();

  console.log('Password updated successfully!');
}

main().catch(console.error);
