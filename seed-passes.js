const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./config/serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function seed() {
  const visitorsRef = db.collection('visitors');
  const visitsRef = db.collection('visits');
  const passesRef = db.collection('visitor_passes');
  
  const combos = [
    { name: "John Doe (Valid)", status: "GENERATED", token: "valid-123", validForMs: 86400000 },
    { name: "Jane Smith (Valid)", status: "GENERATED", token: "valid-456", validForMs: 86400000 },
    { name: "Bob Expired (Expired)", status: "EXPIRED", token: "expired-123", validForMs: -3600000 },
    { name: "Alice Used (Scanned)", status: "SCANNED", token: "scanned-123", validForMs: 86400000 },
    { name: "Eve Revoked (Revoked)", status: "REVOKED", token: "revoked-123", validForMs: 86400000 },
  ];

  for (let i = 0; i < combos.length; i++) {
    const combo = combos[i];
    
    // Create Visitor
    const visitorId = "mock-visitor-" + i;
    await visitorsRef.doc(visitorId).set({
      id: visitorId,
      name: combo.name,
      company: "Mock Corp",
      status: "ACTIVE",
      totalVisits: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create Visit
    const visitId = "mock-visit-" + i;
    await visitsRef.doc(visitId).set({
      id: visitId,
      visitorId: visitorId,
      hostId: "mock-host-1",
      purpose: "Meeting",
      status: combo.status === "GENERATED" ? "APPROVED" : "COMPLETED",
      scheduledDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin"
    });

    // Create Pass
    const passId = combo.token;
    await passesRef.doc(passId).set({
      id: passId,
      visitId: visitId,
      visitorId: visitorId,
      passId: "VX-" + Math.floor(Math.random() * 10000),
      qrToken: combo.token,
      token: combo.token,
      visitorName: combo.name,
      hostName: "Rajeev Joshi",
      company: "Acme Corp",
      department: "Engineering",
      purpose: "Meeting",
      status: combo.status,
      validFrom: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      validUntil: new Date(Date.now() + combo.validForMs).toISOString(),
      gracePeriodMinutes: 30,
      publicUrl: `https://rajeev02.github.io/vms/pass.html?token=${combo.token}`,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`Created pass: ${combo.token} for ${combo.name}`);
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
