import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

// Initialize admin if not already initialized
if (!getApps().length) {
  const serviceAccountPath = path.resolve(__dirname, '../../config/serviceAccountKey.json');
  let credential = undefined;
  
  if (fs.existsSync(serviceAccountPath)) {
    const key = require(serviceAccountPath);
    credential = cert(key);
    initializeApp({ credential });
  } else {
    initializeApp({ projectId: 'demo-project' });
  }
}

// We need to support firestore().collection(...) usage but also attach properties like FieldValue.
const mockFirestore: any = () => getFirestore();
mockFirestore.FieldValue = FieldValue;

if (process.env.FIRESTORE_EMULATOR_HOST) {
  getFirestore().settings({
    host: process.env.FIRESTORE_EMULATOR_HOST,
    ssl: false,
  });
}

export default mockFirestore;
