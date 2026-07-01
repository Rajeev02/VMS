import 'module-alias/register';
import * as path from 'path';

// Alias React Native Firebase to our Node-compatible Admin mock
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@react-native-firebase/firestore', path.join(__dirname, 'mockFirestore'));
moduleAlias.addAlias('react-native', path.join(__dirname, 'mockReactNative.js'));

import { SeedManager } from '../core/seed/SeedManager';
import { SeedMode, SeedSize } from '../core/seed/SeedConfig';

const run = async () => {
  console.log('Starting Seeder Script...');
  
  const args = process.argv.slice(2);
  let size = SeedSize.SMALL;
  
  if (args.includes('--medium')) size = SeedSize.MEDIUM;
  if (args.includes('--large')) size = SeedSize.LARGE;
  if (args.includes('--stress') || args.includes('--full')) size = SeedSize.STRESS;

  let mode = SeedMode.UPSERT;
  if (args.includes('--reset')) mode = SeedMode.RESET_AND_SEED;
  if (args.includes('--append')) mode = SeedMode.APPEND;

  await SeedManager.execute(mode, size);
  console.log('Seeder Script Finished.');
};

run().catch(console.error);
