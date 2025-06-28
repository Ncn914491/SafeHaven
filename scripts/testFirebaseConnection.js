const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9yWrY2xO5oS59_mEaGthe5VnAtDtWpAM",
  authDomain: "safehaven-463909.firebaseapp.com",
  projectId: "safehaven-463909",
  storageBucket: "safehaven-463909.appspot.com",
  messagingSenderId: "441114248968",
  appId: "1:441114248968:web:d4f1d612fa335733380ebd",
  measurementId: "G-WJN6VFZ3CR",
  databaseURL: "https://safehaven-463909-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);

async function testFirebaseConnection() {
  try {
    console.log('🔥 Testing Firebase connection...\n');

    // Test Realtime Database - Alerts
    console.log('📊 Testing Realtime Database (Alerts)...');
    const alertsRef = ref(database, 'alerts');
    const alertsSnapshot = await get(alertsRef);
    
    if (alertsSnapshot.exists()) {
      const alertsData = alertsSnapshot.val();
      const alertsCount = Object.keys(alertsData).length;
      console.log(`✅ Found ${alertsCount} alerts in Realtime Database`);
      
      // Show first alert as example
      const firstAlert = Object.values(alertsData)[0];
      console.log(`   Example: "${firstAlert.title}" (${firstAlert.severity})`);
    } else {
      console.log('❌ No alerts found in Realtime Database');
    }

    // Test Firestore - Shelters
    console.log('\n🏠 Testing Firestore (Shelters)...');
    const sheltersSnapshot = await getDocs(collection(firestore, 'shelters'));
    console.log(`✅ Found ${sheltersSnapshot.size} shelters in Firestore`);
    
    if (sheltersSnapshot.size > 0) {
      const firstShelter = sheltersSnapshot.docs[0].data();
      console.log(`   Example: "${firstShelter.name}" (${firstShelter.capacity} capacity)`);
    }

    // Test Firestore - SOS Messages
    console.log('\n🆘 Testing Firestore (SOS Messages)...');
    const sosSnapshot = await getDocs(collection(firestore, 'sosMessages'));
    console.log(`✅ Found ${sosSnapshot.size} SOS messages in Firestore`);
    
    if (sosSnapshot.size > 0) {
      const firstSOS = sosSnapshot.docs[0].data();
      console.log(`   Example: "${firstSOS.message}" (${firstSOS.status})`);
    }

    // Test Firestore - Reports
    console.log('\n📋 Testing Firestore (Reports)...');
    const reportsSnapshot = await getDocs(collection(firestore, 'reports'));
    console.log(`✅ Found ${reportsSnapshot.size} reports in Firestore`);
    
    if (reportsSnapshot.size > 0) {
      const firstReport = reportsSnapshot.docs[0].data();
      console.log(`   Example: "${firstReport.type}" (${firstReport.status})`);
    }

    console.log('\n🎉 Firebase connection test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Alerts (Realtime DB): ${alertsSnapshot.exists() ? Object.keys(alertsSnapshot.val()).length : 0}`);
    console.log(`   - Shelters (Firestore): ${sheltersSnapshot.size}`);
    console.log(`   - SOS Messages (Firestore): ${sosSnapshot.size}`);
    console.log(`   - Reports (Firestore): ${reportsSnapshot.size}`);

  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
  }
}

// Run the test
testFirebaseConnection();
