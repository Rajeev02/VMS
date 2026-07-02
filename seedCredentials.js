const https = require('https');

const API_KEY = process.env.FIREBASE_WEB_API_KEY;
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'visitor-management-syste-f6453';

if (!API_KEY) {
  console.error('Missing FIREBASE_WEB_API_KEY. Run with: FIREBASE_WEB_API_KEY=your_key node seedCredentials.js');
  process.exit(1);
}

const users = [
  { email: 'host@company.com', password: 'password123', role: 'Host', name: 'Demo Host' },
  { email: 'guard@company.com', password: 'password123', role: 'Security Guard', name: 'Demo Guard' },
  { email: 'officer@company.com', password: 'password123', role: 'Security Officer', name: 'Demo Officer' },
  { email: 'admin@company.com', password: 'password123', role: 'Receptionist', name: 'Demo Receptionist' }
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

async function signUp(email, password) {
  const options = {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/v1/accounts:signUp?key=${API_KEY}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  return request(options, { email, password, returnSecureToken: true });
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

async function setFirestoreDoc(uid, token, user) {
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`,
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  const payload = {
    fields: {
      email: { stringValue: user.email },
      role: { stringValue: user.role },
      name: { stringValue: user.name },
      organizationId: { stringValue: 'DefaultOrg' }
    }
  };
  
  return request(options, payload);
}

async function run() {
  for (const u of users) {
    console.log(`Processing ${u.email}...`);
    let res = await signUp(u.email, u.password);
    
    if (res.error && res.error.message === 'EMAIL_EXISTS') {
      console.log(`User exists, logging in...`);
      res = await login(u.email, u.password);
    }
    
    if (res.error) {
      console.error('Auth error:', res.error);
      continue;
    }
    
    const uid = res.localId;
    const token = res.idToken;
    console.log(`User UID: ${uid}`);
    
    const dbRes = await setFirestoreDoc(uid, token, u);
    if (dbRes.error) {
      console.error('Firestore error:', dbRes.error);
    } else {
      console.log(`Successfully seeded ${u.email}`);
    }
  }
}

run();
