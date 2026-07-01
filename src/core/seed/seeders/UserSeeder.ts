import { SeedSizeConfig, SeedSize } from '../SeedConfig';
import { DataGenerator } from '../DataGenerator';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { RoleRepository } from '../../../domain/repositories/RoleRepository';
import Logger from '../../logger/Logger';
import { getAuth } from 'firebase-admin/auth';

export class UserSeeder {
  static async run(size: SeedSize) {
    Logger.info(`[UserSeeder] Starting User Seeding (Size: ${size})`);
    
    // Create Roles
    const roles = ['Super Admin', 'Company Admin', 'Receptionist', 'Security Guard', 'Host', 'Standard Employee'];
    for (let i = 0; i < roles.length; i++) {
      const roleData = DataGenerator.generateRole(i, roles[i]);
      await RoleRepository.create(roleData);
    }
    
    const config = SeedSizeConfig[size];
    const faker = DataGenerator.getFaker();

    // 1. Create fixed test users for every role in Firebase Auth and Firestore
    const testUsers = [
      { email: 'superadmin@vms.com', role: 'Super Admin', name: 'Test Super Admin' },
      { email: 'companyadmin@vms.com', role: 'Company Admin', name: 'Test Company Admin' },
      { email: 'receptionist@vms.com', role: 'Receptionist', name: 'Test Receptionist' },
      { email: 'security@vms.com', role: 'Security Guard', name: 'Test Security Guard' },
      { email: 'host@vms.com', role: 'Host', name: 'Test Host' },
      { email: 'employee@vms.com', role: 'Standard Employee', name: 'Test Employee' }
    ];

    const auth = getAuth();
    for (const testUser of testUsers) {
      let uid = '';
      try {
        // Check if user already exists in Firebase Auth
        const existingUser = await auth.getUserByEmail(testUser.email);
        uid = existingUser.uid;
        // Optionally update password to ensure it's always 'password'
        await auth.updateUser(uid, { password: 'password' });
        Logger.info(`[UserSeeder] Updated Auth for ${testUser.email}`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create new user in Firebase Auth
          const newUser = await auth.createUser({
            email: testUser.email,
            password: 'password',
            displayName: testUser.name,
          });
          uid = newUser.uid;
          Logger.info(`[UserSeeder] Created Auth for ${testUser.email}`);
        } else {
          Logger.error(`[UserSeeder] Error checking auth for ${testUser.email}`, error);
          continue;
        }
      }

      // Sync Firestore document
      const userDoc = {
        id: uid,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        organizationId: 'seed_company_1',
        permissions: [],
      };
      await UserRepository.create(userDoc);
    }

    // 2. Generate random bulk users if needed
    for (let i = 1; i <= config.users; i++) {
      const roleName = faker.helpers.arrayElement(roles);
      const user = {
        id: `seed_user_${i}`,
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: roleName,
        organizationId: `seed_company_${faker.number.int({ min: 1, max: config.companies })}`,
        permissions: [],
      };
      await UserRepository.create(user);
    }
    Logger.info(`[UserSeeder] Completed.`);
  }
}
