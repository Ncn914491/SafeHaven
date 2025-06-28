const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
const { getFirestore, collection, addDoc, doc, setDoc, Timestamp } = require('firebase/firestore');

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

// Indian states and districts data
const indianLocations = [
  { state: 'Maharashtra', district: 'Mumbai', lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
  { state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567, city: 'Pune' },
  { state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lng: 79.0882, city: 'Nagpur' },
  { state: 'Delhi', district: 'New Delhi', lat: 28.6139, lng: 77.2090, city: 'New Delhi' },
  { state: 'Delhi', district: 'South Delhi', lat: 28.5355, lng: 77.2090, city: 'South Delhi' },
  { state: 'Karnataka', district: 'Bangalore Urban', lat: 12.9716, lng: 77.5946, city: 'Bangalore' },
  { state: 'Karnataka', district: 'Mysore', lat: 12.2958, lng: 76.6394, city: 'Mysore' },
  { state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707, city: 'Chennai' },
  { state: 'Tamil Nadu', district: 'Coimbatore', lat: 11.0168, lng: 76.9558, city: 'Coimbatore' },
  { state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lng: 88.3639, city: 'Kolkata' },
  { state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714, city: 'Ahmedabad' },
  { state: 'Gujarat', district: 'Surat', lat: 21.1702, lng: 72.8311, city: 'Surat' },
  { state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lng: 75.7873, city: 'Jaipur' },
  { state: 'Rajasthan', district: 'Jodhpur', lat: 26.2389, lng: 73.0243, city: 'Jodhpur' },
  { state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lng: 80.9462, city: 'Lucknow' },
  { state: 'Uttar Pradesh', district: 'Kanpur', lat: 26.4499, lng: 80.3319, city: 'Kanpur' },
  { state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lng: 77.4126, city: 'Bhopal' },
  { state: 'Madhya Pradesh', district: 'Indore', lat: 22.7196, lng: 75.8577, city: 'Indore' },
  { state: 'Telangana', district: 'Hyderabad', lat: 17.3850, lng: 78.4867, city: 'Hyderabad' },
  { state: 'Andhra Pradesh', district: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, city: 'Visakhapatnam' },
  { state: 'Kerala', district: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, city: 'Thiruvananthapuram' },
  { state: 'Kerala', district: 'Kochi', lat: 9.9312, lng: 76.2673, city: 'Kochi' },
  { state: 'Punjab', district: 'Ludhiana', lat: 30.9010, lng: 75.8573, city: 'Ludhiana' },
  { state: 'Haryana', district: 'Gurgaon', lat: 28.4595, lng: 77.0266, city: 'Gurgaon' },
  { state: 'Bihar', district: 'Patna', lat: 25.5941, lng: 85.1376, city: 'Patna' }
];

// Alert types and severities
const alertTypes = ['natural_disaster', 'fire', 'medical', 'security', 'infrastructure', 'other'];
const severities = ['low', 'medium', 'high', 'critical'];
const shelterTypes = ['emergency', 'evacuation', 'temporary', 'permanent'];
const reportStatuses = ['pending', 'investigating', 'resolved'];
const sosStatuses = ['pending', 'investigating', 'resolved', 'closed'];

// Helper function to get random element from array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random date within last 30 days
const getRandomDate = (daysBack = 30) => {
  const now = Date.now();
  const randomTime = Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return now - randomTime;
};

// Generate Indian emergency alerts
const generateAlerts = () => {
  const alerts = {};
  const alertTitles = [
    'Cyclone Warning', 'Flood Alert', 'Earthquake Tremors', 'Heavy Rainfall Warning',
    'Heatwave Alert', 'Landslide Warning', 'Fire Outbreak', 'Gas Leak Emergency',
    'Building Collapse Risk', 'Traffic Accident', 'Power Grid Failure', 'Water Contamination',
    'Terrorist Threat', 'Riot Control', 'Medical Emergency', 'Chemical Spill',
    'Bridge Closure', 'Airport Shutdown', 'Railway Disruption', 'Curfew Imposed',
    'Evacuation Order', 'Shelter-in-Place', 'Air Quality Alert', 'Monsoon Flooding'
  ];

  for (let i = 0; i < 25; i++) {
    const location = getRandomElement(indianLocations);
    const alertId = `alert_${i + 1}`;
    const title = getRandomElement(alertTitles);
    const type = getRandomElement(alertTypes);
    const severity = getRandomElement(severities);
    const createdAt = getRandomDate(7); // Within last 7 days
    
    alerts[alertId] = {
      id: alertId,
      title: `${title} - ${location.city}`,
      description: `Emergency alert for ${location.city}, ${location.district}, ${location.state}. Immediate attention required for ${type} situation.`,
      type,
      severity,
      location: {
        latitude: location.lat,
        longitude: location.lng,
        address: `${location.city}, ${location.district}, ${location.state}`,
        state: location.state,
        district: location.district
      },
      createdAt,
      expiresAt: createdAt + (Math.random() * 48 + 12) * 60 * 60 * 1000, // 12-60 hours
      createdBy: 'emergency-coordinator',
      isActive: Math.random() > 0.2, // 80% active
      radius: Math.floor(Math.random() * 15) + 5 // 5-20 km radius
    };
  }
  
  return alerts;
};

// Generate Indian emergency shelters
const generateShelters = () => {
  const shelters = [];
  const shelterNames = [
    'Community Center', 'School Gymnasium', 'Government Building', 'Religious Center',
    'Sports Complex', 'Convention Hall', 'Municipal Building', 'College Campus',
    'Hospital Annex', 'Red Cross Center', 'NGO Facility', 'Corporate Office',
    'Shopping Mall', 'Hotel Conference Hall', 'Marriage Hall', 'Cultural Center',
    'Stadium', 'Library Building', 'Police Station', 'Fire Station',
    'District Collectorate', 'Panchayat Office', 'Youth Hostel', 'Guest House'
  ];

  const amenitiesList = [
    'Food Service', 'Medical Care', 'Wheelchair Accessible', 'Pet Friendly',
    'WiFi', 'Showers', 'Laundry', 'Childcare', 'Security', 'Parking',
    'Generator Backup', 'Water Supply', 'Sanitation', 'First Aid',
    'Communication Center', 'Transportation', 'Counseling', 'Recreation Area'
  ];

  for (let i = 0; i < 25; i++) {
    const location = getRandomElement(indianLocations);
    const name = getRandomElement(shelterNames);
    const type = getRandomElement(shelterTypes);
    const capacity = Math.floor(Math.random() * 400) + 50; // 50-450 capacity
    const occupancy = Math.floor(Math.random() * capacity * 0.8); // Up to 80% occupied
    
    // Random amenities (3-8 amenities per shelter)
    const numAmenities = Math.floor(Math.random() * 6) + 3;
    const selectedAmenities = [];
    const shuffledAmenities = [...amenitiesList].sort(() => 0.5 - Math.random());
    for (let j = 0; j < numAmenities; j++) {
      selectedAmenities.push(shuffledAmenities[j]);
    }

    shelters.push({
      name: `${name} Emergency Shelter - ${location.city}`,
      address: `${Math.floor(Math.random() * 999) + 1} Main Road, ${location.city}, ${location.district}, ${location.state}`,
      location: {
        latitude: location.lat + (Math.random() - 0.5) * 0.01, // Small random offset
        longitude: location.lng + (Math.random() - 0.5) * 0.01,
        state: location.state,
        district: location.district
      },
      capacity,
      currentOccupancy: occupancy,
      type,
      amenities: selectedAmenities,
      contactPhone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      isActive: Math.random() > 0.1, // 90% active
      lastUpdated: getRandomDate(1),
      operationalStatus: Math.random() > 0.2 ? 'operational' : 'maintenance'
    });
  }
  
  return shelters;
};

// Generate Indian SOS messages
const generateSOSMessages = () => {
  const sosMessages = [];
  const emergencyTypes = [
    'Medical Emergency', 'Fire Emergency', 'Accident', 'Natural Disaster',
    'Crime in Progress', 'Missing Person', 'Building Collapse', 'Gas Leak',
    'Flood Rescue', 'Earthquake Rescue', 'Traffic Accident', 'Heart Attack',
    'Stroke', 'Breathing Difficulty', 'Severe Injury', 'Domestic Violence',
    'Robbery', 'Kidnapping', 'Terrorist Activity', 'Chemical Exposure'
  ];

  const indianNames = [
    'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Devi', 'Vikram Patel',
    'Kavita Gupta', 'Ravi Verma', 'Meera Joshi', 'Suresh Reddy', 'Anita Nair',
    'Deepak Agarwal', 'Pooja Mishra', 'Manoj Yadav', 'Rekha Sinha', 'Ashok Tiwari',
    'Geeta Rao', 'Sanjay Pandey', 'Usha Bhatt', 'Ramesh Iyer', 'Shanti Pillai'
  ];

  for (let i = 0; i < 25; i++) {
    const location = getRandomElement(indianLocations);
    const emergencyType = getRandomElement(emergencyTypes);
    const name = getRandomElement(indianNames);
    const status = getRandomElement(sosStatuses);
    const timestamp = getRandomDate(3); // Within last 3 days

    sosMessages.push({
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      userName: name,
      phoneNumber: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      message: `${emergencyType} - Need immediate assistance in ${location.city}. Please send help urgently.`,
      location: {
        latitude: location.lat + (Math.random() - 0.5) * 0.01,
        longitude: location.lng + (Math.random() - 0.5) * 0.01,
        address: `${location.city}, ${location.district}, ${location.state}`,
        state: location.state,
        district: location.district
      },
      timestamp: new Date(timestamp),
      status,
      priority: getRandomElement(['low', 'medium', 'high', 'critical']),
      emergencyType,
      responseTime: status !== 'pending' ? Math.floor(Math.random() * 30) + 5 : null // 5-35 minutes
    });
  }

  return sosMessages;
};

// Generate Indian incident reports
const generateReports = () => {
  const reports = [];
  const reportTypes = [
    'Infrastructure Damage', 'Power Outage', 'Water Supply Issue', 'Road Blockage',
    'Building Damage', 'Environmental Hazard', 'Public Safety', 'Traffic Issue',
    'Medical Facility Issue', 'Communication Breakdown', 'Supply Shortage',
    'Evacuation Issue', 'Shelter Problem', 'Transportation Disruption',
    'Utility Failure', 'Security Breach', 'Fire Incident', 'Flood Damage',
    'Earthquake Damage', 'Cyclone Damage', 'Landslide', 'Industrial Accident'
  ];

  for (let i = 0; i < 25; i++) {
    const location = getRandomElement(indianLocations);
    const reportType = getRandomElement(reportTypes);
    const status = getRandomElement(reportStatuses);
    const timestamp = getRandomDate(7); // Within last 7 days

    reports.push({
      type: reportType,
      title: `${reportType} Report - ${location.city}`,
      description: `Incident reported in ${location.city}, ${location.district}, ${location.state}. ${reportType} requires immediate attention and assessment.`,
      location: {
        latitude: location.lat + (Math.random() - 0.5) * 0.01,
        longitude: location.lng + (Math.random() - 0.5) * 0.01,
        address: `${location.city}, ${location.district}, ${location.state}`,
        state: location.state,
        district: location.district
      },
      reporterId: `reporter_${Math.floor(Math.random() * 1000)}`,
      contactInfo: {
        name: getRandomElement(['Local Authority', 'Citizen Report', 'Emergency Services', 'Government Official']),
        phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        email: `report${i}@safehaven.gov.in`
      },
      status,
      priority: getRandomElement(['low', 'medium', 'high', 'critical']),
      timestamp: new Date(timestamp),
      lastUpdated: new Date(timestamp + Math.random() * 24 * 60 * 60 * 1000),
      assignedTo: status !== 'pending' ? `officer_${Math.floor(Math.random() * 50)}` : null,
      estimatedResolution: status === 'investigating' ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null
    });
  }

  return reports;
};

async function addIndianSampleData() {
  try {
    console.log('🇮🇳 Adding comprehensive Indian sample data to Firebase...');

    // Generate and add alerts
    const alerts = generateAlerts();
    await set(ref(database, 'alerts'), alerts);
    console.log(`✅ ${Object.keys(alerts).length} Indian emergency alerts added to Realtime Database`);

    // Generate and add shelters
    const shelters = generateShelters();
    for (const shelter of shelters) {
      await addDoc(collection(firestore, 'shelters'), shelter);
    }
    console.log(`✅ ${shelters.length} Indian emergency shelters added to Firestore`);

    // Generate and add SOS messages
    const sosMessages = generateSOSMessages();
    for (const sosMessage of sosMessages) {
      await addDoc(collection(firestore, 'sos_messages'), sosMessage);
    }
    console.log(`✅ ${sosMessages.length} Indian SOS messages added to Firestore`);

    // Generate and add reports
    const reports = generateReports();
    for (const report of reports) {
      await addDoc(collection(firestore, 'reports'), report);
    }
    console.log(`✅ ${reports.length} Indian incident reports added to Firestore`);

    console.log('\n🎉 All Indian sample data has been successfully added to Firebase!');
    console.log('\nSample data includes:');
    console.log(`- ${Object.keys(alerts).length} Emergency alerts (Realtime Database)`);
    console.log(`- ${shelters.length} Emergency shelters (Firestore)`);
    console.log(`- ${sosMessages.length} SOS messages (Firestore)`);
    console.log(`- ${reports.length} Incident reports (Firestore)`);
    console.log('\nAll data uses realistic Indian locations with state and district information.');

  } catch (error) {
    console.error('❌ Error adding Indian sample data:', error);
  }
}

// Run the script
addIndianSampleData();
