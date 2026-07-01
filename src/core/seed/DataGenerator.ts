import { faker } from '@faker-js/faker';

// Use a fixed seed for deterministic output
faker.seed(12345);

export const DataGenerator = {
  getFaker: () => faker,

  resetSeed: () => {
    faker.seed(12345);
  },

  generateCompany: (idSuffix: string | number) => ({
    id: `seed_company_${idSuffix}`,
    name: faker.company.name(),
    address: faker.location.streetAddress(),
    phone: faker.phone.number(),
    createdAt: new Date().toISOString(),
  }),

  generateBuilding: (idSuffix: string | number, companyId: string) => ({
    id: `seed_building_${idSuffix}`,
    companyId,
    name: `${faker.location.city()} Headquarters`,
    address: faker.location.streetAddress(),
    createdAt: new Date().toISOString(),
  }),

  generateFloor: (idSuffix: string | number, buildingId: string) => ({
    id: `seed_floor_${idSuffix}`,
    buildingId,
    name: `Floor ${faker.number.int({ min: 1, max: 20 })}`,
  }),

  generateDepartment: (idSuffix: string | number, companyId: string) => ({
    id: `seed_dept_${idSuffix}`,
    companyId,
    name: faker.commerce.department(),
  }),

  generateRole: (idSuffix: string | number, name: string) => ({
    id: `seed_role_${idSuffix}`,
    name,
    permissions: ['*'], // Simplified for seed
  }),
};
