// @ts-nocheck
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Assuming Firebase Admin is initialized via env variables in the environment
// or by explicitly providing the service account credentials below:
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!getApps().length) {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    // Fallback if no service account key is provided
    initializeApp();
  }
}

const db = getFirestore();

async function seed() {
  console.log('Seeding demo data to Firestore...');
  const dataPath = path.join(__dirname, 'demo-data.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const demoData = JSON.parse(rawData);

  for (const collection of Object.keys(demoData)) {
    const records = demoData[collection];
    console.log(`Seeding ${records.length} records into collection '${collection}'...`);
    
    const batch = db.batch();
    for (const record of records) {
      const docRef = db.collection(collection).doc(record.id);
      batch.set(docRef, record);
    }
    await batch.commit();
  }

  console.log('Seeding complete!');
}

seed().catch(console.error);
