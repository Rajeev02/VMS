const https = require('https');

const API_KEY = process.env.FIREBASE_WEB_API_KEY;
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'visitor-management-syste-f6453';

if (!API_KEY) {
  console.error('Missing FIREBASE_WEB_API_KEY. Run with: FIREBASE_WEB_API_KEY=your_key node verifyUsers.js');
  process.exit(1);
}

const users = [
  { email: 'host@company.com', password: 'password123' },
  { email: 'guard@company.com', password: 'password123' },
  { email: 'officer@company.com', password: 'password123' },
  { email: 'admin@company.com', password: 'password123' }
];

async function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function login(email, password) {
  const options = {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/v1/accounts:signInWithPassword?key=${API_KEY}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  return request(options, { email, password, returnSecureToken: true });
}

async function getFirestoreDoc(uid, token) {
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`,
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  return request(options);
}

async function run() {
  console.log('--- Verifying Firebase Users ---');
  for (const u of users) {
    const res = await login(u.email, u.password);
    
    if (res.error) {
      console.log(`❌ [${u.email}]: Auth Failed - ${res.error.message}`);
      continue;
    }
    
    const uid = res.localId;
    const token = res.idToken;
    
    const dbRes = await getFirestoreDoc(uid, token);
    if (dbRes.error) {
      console.log(`❌ [${u.email}]: Firestore Error - ${dbRes.error.message}`);
    } else {
      const fields = dbRes.fields || {};
      const name = fields.name ? fields.name.stringValue : 'N/A';
      const role = fields.role ? fields.role.stringValue : 'N/A';
      console.log(`✅ [${u.email}]: Successfully verified!`);
      console.log(`    -> Name: ${name}`);
      console.log(`    -> Role: ${role}`);
      console.log(`    -> UID : ${uid}`);
    }
    console.log('--------------------------------');
  }
}

run();
