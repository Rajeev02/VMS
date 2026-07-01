import { SeedSizeConfig, SeedSize } from '../SeedConfig';
import { DataGenerator } from '../DataGenerator';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { VisitorPassRepository } from '../../../domain/repositories/VisitorPassRepository';
import { VisitStatus, PassStatus } from '../../../domain/models/enums';
import Logger from '../../logger/Logger';

export class VisitSeeder {
  static async run(size: SeedSize) {
    Logger.info(`[VisitSeeder] Starting Visit Seeding (Size: ${size})`);
    
    const config = SeedSizeConfig[size];
    const faker = DataGenerator.getFaker();

    const statuses = [
      VisitStatus.DRAFT, VisitStatus.PENDING, VisitStatus.APPROVED, 
      VisitStatus.CHECKED_IN, VisitStatus.CHECKED_OUT, VisitStatus.CANCELLED
    ];

    for (let i = 1; i <= config.visits; i++) {
      const status = faker.helpers.arrayElement(statuses);
      const visitorId = `seed_visitor_${faker.number.int({ min: 1, max: config.visitors })}`;
      const hostId = `seed_user_${faker.number.int({ min: 1, max: config.users })}`;
      
      const visit = await VisitRepository.createVisit({
        visitorId,
        hostId,
        purpose: faker.lorem.sentence(),
        scheduledDate: faker.date.recent({ days: 30 }).toISOString(),
        status,
        expectedExitTime: faker.date.soon().toISOString(),
      });

      // Create a pass for APPROVED, CHECKED_IN, CHECKED_OUT visits
      if ([VisitStatus.APPROVED, VisitStatus.CHECKED_IN, VisitStatus.CHECKED_OUT].includes(status)) {
        let passStatus = PassStatus.GENERATED;
        if (status === VisitStatus.CHECKED_OUT) passStatus = PassStatus.EXPIRED;
        
        await VisitorPassRepository.createPass({
          visitId: visit.id,
          visitorId: visitorId,
          qrToken: `seed_qr_${visit.id}`,
          token: `seed_qr_${visit.id}`,
          visitorName: `Seed Visitor ${visitorId}`,
          hostName: "Seed Host",
          publicUrl: `https://vms.company.com/pass/${visit.id}`,
          status: passStatus,
          validUntil: faker.date.future().toISOString(),
        });
      }
    }
    Logger.info(`[VisitSeeder] Completed.`);
  }
}
