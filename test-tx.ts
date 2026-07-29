import { db } from './src/shared/db/database';
import { users } from './src/platform/db/schema';
import crypto from 'crypto';
import * as argon2 from 'argon2';

async function test() {
  const userId = crypto.randomUUID();
  const passwordHash = await argon2.hash('test');

  try {
    db.transaction((tx) => {
      tx.insert(users).values({
        id: userId,
        username: `test-${Date.now()}`,
        passwordHash,
        firstName: 'Test',
        lastName: 'User',
        userType: 'BUSINESS',
        status: 'ACTIVE',
        mustChangePassword: true,
      }).run();
    });
    console.log('Transaction succeeded!');
  } catch (e) {
    console.error('Transaction failed:', e);
  }
}

test();
