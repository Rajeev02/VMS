const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./config/serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function getPasses() {
  const passesSnapshot = await db.collection('visitor_passes').limit(15).get();
  
  if (passesSnapshot.empty) {
    console.log("No passes found in the database.");
    process.exit(0);
  }

  passesSnapshot.forEach(doc => {
    const data = doc.data();
    // exclude the mock passes I just created
    if (!data.id.startsWith('mock-pass-')) {
      console.log(`Token: ${data.qrToken} | Status: ${data.status} | ID: ${data.id}`);
    }
  });
  
  process.exit(0);
}

getPasses().catch(console.error);
