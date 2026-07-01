import { SeedSizeConfig, SeedSize } from '../SeedConfig';
import { DataGenerator } from '../DataGenerator';
import { VisitorRepository } from '../../../features/visitor/VisitorRepository';
import { Visitor } from '../../../domain/models/Visitor';
import { VisitorStatus } from '../../../domain/models/enums';
import Logger from '../../logger/Logger';

export class VisitorSeeder {
  static async run(size: SeedSize) {
    Logger.info(`[VisitorSeeder] Starting Visitor Seeding (Size: ${size})`);
    
    const config = SeedSizeConfig[size];
    const faker = DataGenerator.getFaker();

    for (let i = 1; i <= config.visitors; i++) {
      const visitor: Partial<Visitor> = {
        id: `seed_visitor_${i}`,
        name: faker.person.fullName(),
        company: faker.company.name(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        totalVisits: faker.number.int({ min: 0, max: 20 }),
        status: faker.number.int({ min: 1, max: 100 }) > 95 ? VisitorStatus.BLACKLISTED : VisitorStatus.ACTIVE,
        createdAt: faker.date.past({ years: 1 }).toISOString(),
      };
      
      // Need to use the internal datasource for seeding since registerWalkInVisitor creates a visit too.
      // We just want to seed raw visitors right now. 
      // We will access the underlying data source methods if they are public.
      if ('createVisitor' in VisitorRepository) {
         await VisitorRepository.createVisitor(visitor);
      }
    }
    Logger.info(`[VisitorSeeder] Completed.`);
  }
}
