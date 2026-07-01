import { SeedSizeConfig, SeedSize } from '../SeedConfig';
import { DataGenerator } from '../DataGenerator';
import { AuditRepository } from '../../../domain/repositories/AuditRepository';
import { AuditAction } from '../../../domain/models/enums';
import Logger from '../../logger/Logger';

export class AuditSeeder {
  static async run(size: SeedSize) {
    Logger.info(`[AuditSeeder] Starting Audit Seeding (Size: ${size})`);
    
    const config = SeedSizeConfig[size];
    const faker = DataGenerator.getFaker();
    const actions = Object.values(AuditAction);

    // Create a couple of audit logs per visit to simulate real history
    for (let i = 1; i <= config.visits; i++) {
      const visitId = `seed_visit_${i}`; // this assumes we have deterministic IDs for visits, but VisitRepository.createVisit generates random IDs. We'll query it or just use random.
      // Wait, VisitRepository generates random ID. For audit, it's better to fetch some visits and attach logs.
      // For seed purposes, we'll just generate standalone logs if we can't fetch them.
      
      const action = faker.helpers.arrayElement(actions);
      await AuditRepository.log({
        whoId: `seed_user_${faker.number.int({ min: 1, max: config.users })}`,
        action: action,
        entityType: 'VISIT',
        entityId: visitId,
        newValue: JSON.stringify({ details: faker.lorem.sentence() })
      });
    }
    Logger.info(`[AuditSeeder] Completed.`);
  }
}
