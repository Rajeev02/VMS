import { SeedMode, SeedSize } from './SeedConfig';
import { DataGenerator } from './DataGenerator';
import { CompanySeeder } from './seeders/CompanySeeder';
import { UserSeeder } from './seeders/UserSeeder';
import { VisitorSeeder } from './seeders/VisitorSeeder';
import { VisitSeeder } from './seeders/VisitSeeder';
import { AuditSeeder } from './seeders/AuditSeeder';
import Logger from '../logger/Logger';

export class SeedManager {
  static async execute(mode: SeedMode, size: SeedSize) {
    Logger.info(`[SeedManager] Starting Seed Execution. Mode: ${mode}, Size: ${size}`);
    
    if (mode === SeedMode.RESET_AND_SEED) {
      Logger.warn(`[SeedManager] Database reset requested. (In a real environment, this would wipe the Firestore collections).`);
      // Implement wipe logic here if strictly needed.
    }

    DataGenerator.resetSeed();

    try {
      await CompanySeeder.run(size);
      await UserSeeder.run(size);
      await VisitorSeeder.run(size);
      await VisitSeeder.run(size);
      await AuditSeeder.run(size);
      
      Logger.info(`[SeedManager] Seed Execution Completed Successfully!`);
    } catch (error) {
      Logger.error(`[SeedManager] Seed Execution Failed:`, error);
    }
  }
}
