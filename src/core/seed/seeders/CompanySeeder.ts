import { SeedSizeConfig, SeedSize } from '../SeedConfig';
import { DataGenerator } from '../DataGenerator';
import { CompanyRepository } from '../../../domain/repositories/CompanyRepository';
import { BuildingRepository } from '../../../domain/repositories/BuildingRepository';
import { FloorRepository } from '../../../domain/repositories/FloorRepository';
import { DepartmentRepository } from '../../../domain/repositories/DepartmentRepository';
import Logger from '../../logger/Logger';

export class CompanySeeder {
  static async run(size: SeedSize) {
    Logger.info(`[CompanySeeder] Starting Company Seeding (Size: ${size})`);
    const config = SeedSizeConfig[size];

    for (let i = 1; i <= config.companies; i++) {
      // 1. Create Company
      const companyData = DataGenerator.generateCompany(i);
      await CompanyRepository.create(companyData);
      
      // 2. Create Building
      const buildingData = DataGenerator.generateBuilding(i, companyData.id);
      await BuildingRepository.create(buildingData);
      
      // 3. Create Floors (e.g. 5 floors per building)
      for (let f = 1; f <= 5; f++) {
        const floorData = DataGenerator.generateFloor(`${i}_${f}`, buildingData.id);
        await FloorRepository.create(floorData);
      }
      
      // 4. Create Departments
      const depts = ['HR', 'Engineering', 'Sales', 'Marketing', 'Executive'];
      for (let d = 0; d < depts.length; d++) {
        const deptData = DataGenerator.generateDepartment(`${i}_${d}`, companyData.id);
        deptData.name = depts[d];
        await DepartmentRepository.create(deptData);
      }
    }
    Logger.info(`[CompanySeeder] Completed.`);
  }
}
