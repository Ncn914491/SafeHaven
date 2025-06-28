const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "safehaven-463909",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

// Initialize Firebase Admin with fallback for local development
if (!admin.apps.length) {
  try {
    // Try to initialize with service account (for production)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://safehaven-463909-default-rtdb.firebaseio.com"
    });
    console.log('Firebase Admin initialized with service account');
  } catch (error) {
    console.log('Service account initialization failed, trying default credentials...');
    try {
      // Fallback to default credentials (for local development with gcloud auth)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: "safehaven-463909",
        databaseURL: "https://safehaven-463909-default-rtdb.firebaseio.com"
      });
      console.log('Firebase Admin initialized with default credentials');
    } catch (fallbackError) {
      console.error('Failed to initialize Firebase Admin:', fallbackError);
      process.exit(1);
    }
  }
}

async function createAdminUser() {
  try {
    const email = 'admin@safehaven.local';
    const password = 'SafeHaven2024!';
    const displayName = 'SafeHaven Administrator';

    console.log('Creating admin user...');

    // Create the user
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 UID:', userRecord.uid);

    // Set custom claims to mark as admin
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'administrator'
    });

    console.log('✅ Admin privileges granted');

    // Add user profile to Firestore
    const userProfile = {
      uid: userRecord.uid,
      email: email,
      displayName: displayName,
      role: 'administrator',
      isAdmin: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null,
      status: 'active'
    };

    await admin.firestore().collection('users').doc(userRecord.uid).set(userProfile);
    console.log('✅ User profile added to Firestore');

    console.log('\n🎉 Setup complete!');
    console.log('\nYou can now log in to the SafeHaven admin dashboard with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email: admin@safehaven.local');
      console.log('🔑 Password: SafeHaven2024!');
      console.log('\nIf you forgot the password, you can reset it in the Firebase Console.');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }
}

// Run the script
createAdminUser().then(() => {
  console.log('\nScript completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
