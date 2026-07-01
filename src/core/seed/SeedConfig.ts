export enum SeedMode {
  APPEND = 'APPEND',
  UPSERT = 'UPSERT',
  RESET_AND_SEED = 'RESET_AND_SEED',
}

export enum SeedSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  STRESS = 'STRESS',
}

export interface SeedConfig {
  mode: SeedMode;
  size: SeedSize;
}

export const SeedSizeConfig = {
  [SeedSize.SMALL]: {
    companies: 1,
    users: 20,
    visitors: 50,
    visits: 100,
  },
  [SeedSize.MEDIUM]: {
    companies: 3,
    users: 50,
    visitors: 500,
    visits: 1000,
  },
  [SeedSize.LARGE]: {
    companies: 5,
    users: 200,
    visitors: 5000,
    visits: 10000,
  },
  [SeedSize.STRESS]: {
    companies: 10,
    users: 500,
    visitors: 20000,
    visits: 50000,
  },
};
