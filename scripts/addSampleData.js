import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

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

async function addSampleData() {
  try {
    console.log('🚀 Adding comprehensive sample data to SafeHaven...');

    // Sample Alerts for Realtime Database
    const alertsData = {
      alert1: {
        id: 'alert1',
        title: 'Flood Warning - Downtown Area',
        description: 'Heavy rainfall has caused flooding in the downtown area. Water levels are rising rapidly. Residents are advised to avoid low-lying areas and seek higher ground immediately.',
        type: 'natural_disaster',
        severity: 'high',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: 'Downtown San Francisco, CA'
        },
        createdAt: Date.now() - (30 * 60 * 1000), // 30 minutes ago
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
        createdBy: 'emergency-coordinator',
        isActive: true,
        radius: 5,
        affectedAreas: ['Financial District', 'Embarcadero', 'North Beach'],
        instructions: 'Evacuate to designated shelters. Do not attempt to drive through flooded areas.'
      },
      alert2: {
        id: 'alert2',
        title: 'Wildfire Alert - North Hills',
        description: 'A wildfire has been reported in the North Hills area. Strong winds are spreading the fire rapidly. Evacuation orders are in effect for zones A and B.',
        type: 'fire',
        severity: 'critical',
        location: {
          latitude: 37.8044,
          longitude: -122.2711,
          address: 'North Hills, Oakland, CA'
        },
        createdAt: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
        expiresAt: Date.now() + (48 * 60 * 60 * 1000), // 48 hours from now
        createdBy: 'fire-department',
        isActive: true,
        radius: 10,
        affectedAreas: ['North Hills', 'Rockridge', 'Temescal'],
        instructions: 'Immediate evacuation required. Follow evacuation routes to designated shelters.'
      },
      alert3: {
        id: 'alert3',
        title: 'Medical Emergency - Hospital Capacity',
        description: 'Local hospitals are at capacity due to increased emergency cases. Non-emergency cases should seek alternative care or telemedicine options.',
        type: 'medical',
        severity: 'medium',
        location: {
          latitude: 37.7849,
          longitude: -122.4094,
          address: 'Mission District, San Francisco, CA'
        },
        createdAt: Date.now() - (30 * 60 * 1000), // 30 minutes ago
        expiresAt: Date.now() + (12 * 60 * 60 * 1000), // 12 hours from now
        createdBy: 'health-department',
        isActive: true,
        radius: 3,
        affectedAreas: ['Mission District', 'Potrero Hill', 'Dogpatch'],
        instructions: 'Use urgent care clinics for non-emergency issues. Call 911 only for life-threatening emergencies.'
      },
      alert4: {
        id: 'alert4',
        title: 'Power Outage - Western District',
        description: 'Major power outage affecting the western district. Estimated restoration time is 4-6 hours. Traffic signals may be affected.',
        type: 'infrastructure',
        severity: 'medium',
        location: {
          latitude: 37.7739,
          longitude: -122.4312,
          address: 'Western Addition, San Francisco, CA'
        },
        createdAt: Date.now() - (45 * 60 * 1000), // 45 minutes ago
        expiresAt: Date.now() + (6 * 60 * 60 * 1000), // 6 hours from now
        createdBy: 'pg&e',
        isActive: true,
        radius: 2,
        affectedAreas: ['Western Addition', 'Hayes Valley', 'Alamo Square'],
        instructions: 'Use flashlights, avoid opening refrigerators. Traffic signals should be treated as 4-way stops.'
      },
      alert5: {
        id: 'alert5',
        title: 'Chemical Spill - Industrial Zone',
        description: 'Chemical spill reported in the industrial zone. Hazmat teams are responding. Avoid the area and follow evacuation instructions.',
        type: 'hazmat',
        severity: 'critical',
        location: {
          latitude: 37.7949,
          longitude: -122.3894,
          address: 'Industrial Zone, San Francisco, CA'
        },
        createdAt: Date.now() - (15 * 60 * 1000), // 15 minutes ago
        expiresAt: Date.now() + (8 * 60 * 60 * 1000), // 8 hours from now
        createdBy: 'hazmat-team',
        isActive: true,
        radius: 1,
        affectedAreas: ['Industrial Zone', 'Bayview'],
        instructions: 'Immediate evacuation. Do not attempt to return to the area until cleared by authorities.'
      }
    };

    // Add alerts to Realtime Database
    await set(ref(database, 'alerts'), alertsData);
    console.log('✅ Sample alerts added to Realtime Database');

    // Sample Shelters for Firestore
    const sheltersData = [
      {
        name: 'Community Center Emergency Shelter',
        address: '123 Main St, San Francisco, CA 94102',
        location: {
          latitude: 37.7849,
          longitude: -122.4194
        },
        capacity: 150,
        currentOccupancy: 45,
        type: 'emergency',
        amenities: ['Food Service', 'Medical Care', 'Pet Friendly', 'Wheelchair Accessible', 'WiFi', 'Showers'],
        contactPhone: '+1-415-555-0123',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Primary emergency shelter with full amenities and medical support.',
        operatingHours: '24/7',
        specialNeeds: ['Wheelchair accessible', 'Pet friendly', 'Medical staff on site']
      },
      {
        name: 'Red Cross Evacuation Center',
        address: '456 Oak Ave, Oakland, CA 94601',
        location: {
          latitude: 37.8044,
          longitude: -122.2711
        },
        capacity: 200,
        currentOccupancy: 78,
        type: 'evacuation',
        amenities: ['Food Service', 'Medical Care', 'Showers', 'Laundry', 'Childcare', 'Security', 'WiFi'],
        contactPhone: '+1-510-555-0456',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Red Cross managed evacuation center with comprehensive support services.',
        operatingHours: '24/7',
        specialNeeds: ['Childcare available', 'Security personnel', 'Medical staff']
      },
      {
        name: 'School Gymnasium Shelter',
        address: '789 Pine St, Berkeley, CA 94704',
        location: {
          latitude: 37.8715,
          longitude: -122.2730
        },
        capacity: 100,
        currentOccupancy: 23,
        type: 'temporary',
        amenities: ['Food Service', 'Wheelchair Accessible', 'Parking', 'WiFi'],
        contactPhone: '+1-510-555-0789',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Temporary shelter in school gymnasium with basic amenities.',
        operatingHours: '6 AM - 10 PM',
        specialNeeds: ['Wheelchair accessible', 'Parking available']
      },
      {
        name: 'Church Emergency Shelter',
        address: '321 Church St, San Francisco, CA 94114',
        location: {
          latitude: 37.7639,
          longitude: -122.4312
        },
        capacity: 75,
        currentOccupancy: 12,
        type: 'emergency',
        amenities: ['Food Service', 'Wheelchair Accessible', 'WiFi', 'Prayer Room'],
        contactPhone: '+1-415-555-0321',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Community church providing emergency shelter with spiritual support.',
        operatingHours: '24/7',
        specialNeeds: ['Wheelchair accessible', 'Spiritual support available']
      },
      {
        name: 'Sports Complex Shelter',
        address: '654 Sports Ave, San Francisco, CA 94103',
        location: {
          latitude: 37.7739,
          longitude: -122.4094
        },
        capacity: 300,
        currentOccupancy: 156,
        type: 'large-scale',
        amenities: ['Food Service', 'Medical Care', 'Showers', 'Laundry', 'WiFi', 'Recreation Area'],
        contactPhone: '+1-415-555-0654',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Large sports complex converted to emergency shelter with extensive facilities.',
        operatingHours: '24/7',
        specialNeeds: ['Large capacity', 'Recreation facilities', 'Medical staff']
      }
    ];

    // Add shelters to Firestore
    for (const shelter of sheltersData) {
      await addDoc(collection(firestore, 'shelters'), shelter);
    }
    console.log('✅ Sample shelters added to Firestore');

    // Sample SOS Messages for Firestore
    const sosMessagesData = [
      {
        message: 'Trapped in building due to flooding, need immediate rescue. Water level rising quickly.',
        location: {
          latitude: 37.7749,
          longitude: -122.4194
        },
        contactInfo: {
          name: 'John Doe',
          phone: '+1-415-555-1234',
          email: 'john.doe@email.com'
        },
        status: 'pending',
        priority: 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emergencyType: 'flooding',
        additionalInfo: 'Second floor apartment, elderly resident with mobility issues'
      },
      {
        message: 'Elderly person needs medical assistance, cannot evacuate due to mobility issues.',
        location: {
          latitude: 37.8044,
          longitude: -122.2711
        },
        contactInfo: {
          name: 'Jane Smith',
          phone: '+1-510-555-5678',
          email: 'jane.smith@email.com'
        },
        status: 'investigating',
        priority: 'high',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        updatedAt: new Date().toISOString(),
        emergencyType: 'medical',
        additionalInfo: '85-year-old with heart condition, needs oxygen'
      },
      {
        message: 'Family of 4 stranded, car broke down during evacuation. No food or water.',
        location: {
          latitude: 37.7849,
          longitude: -122.4094
        },
        contactInfo: {
          name: 'Mike Johnson',
          phone: '+1-415-555-9012',
          email: 'mike.johnson@email.com'
        },
        status: 'pending',
        priority: 'medium',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        updatedAt: new Date().toISOString(),
        emergencyType: 'stranded',
        additionalInfo: 'Two children under 10, need transportation to shelter'
      },
      {
        message: 'Power outage affecting medical equipment. Need backup power or evacuation.',
        location: {
          latitude: 37.7739,
          longitude: -122.4312
        },
        contactInfo: {
          name: 'Sarah Wilson',
          phone: '+1-415-555-3456',
          email: 'sarah.wilson@email.com'
        },
        status: 'investigating',
        priority: 'critical',
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
        updatedAt: new Date().toISOString(),
        emergencyType: 'medical',
        additionalInfo: 'Ventilator dependent, backup battery running low'
      },
      {
        message: 'Chemical smell in apartment building. Multiple residents reporting symptoms.',
        location: {
          latitude: 37.7949,
          longitude: -122.3894
        },
        contactInfo: {
          name: 'David Brown',
          phone: '+1-415-555-7890',
          email: 'david.brown@email.com'
        },
        status: 'pending',
        priority: 'high',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        updatedAt: new Date().toISOString(),
        emergencyType: 'hazmat',
        additionalInfo: '12-unit building, 8 residents reporting headaches and nausea'
      }
    ];

    // Add SOS messages to Firestore
    for (const sosMessage of sosMessagesData) {
      await addDoc(collection(firestore, 'sosMessages'), sosMessage);
    }
    console.log('✅ Sample SOS messages added to Firestore');

    // Sample Incident Reports for Firestore
    const reportsData = [
      {
        type: 'flooding',
        title: 'Basement Flooding in Residential Building',
        description: 'Heavy rainfall caused basement flooding in a 20-unit residential building. Water damage to electrical systems and personal property.',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Market St, San Francisco, CA'
        },
        severity: 'medium',
        status: 'investigating',
        reporter: {
          name: 'Lisa Chen',
          phone: '+1-415-555-1111',
          email: 'lisa.chen@email.com'
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        updatedAt: new Date().toISOString(),
        affectedUnits: 8,
        estimatedDamage: '$50,000',
        actionsTaken: ['Evacuated affected units', 'Called plumber', 'Contacted insurance']
      },
      {
        type: 'fire',
        title: 'Kitchen Fire in Restaurant',
        description: 'Grease fire in commercial kitchen. Fire was contained quickly but caused smoke damage throughout the building.',
        location: {
          latitude: 37.7849,
          longitude: -122.4094,
          address: '456 Mission St, San Francisco, CA'
        },
        severity: 'low',
        status: 'resolved',
        reporter: {
          name: 'Carlos Rodriguez',
          phone: '+1-415-555-2222',
          email: 'carlos.rodriguez@email.com'
        },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        updatedAt: new Date().toISOString(),
        affectedUnits: 1,
        estimatedDamage: '$15,000',
        actionsTaken: ['Fire department responded', 'Restaurant closed for cleanup', 'Insurance claim filed']
      },
      {
        type: 'medical',
        title: 'Multiple Heat-Related Illnesses',
        description: 'Several residents reported heat exhaustion during power outage. Elderly residents most affected.',
        location: {
          latitude: 37.7739,
          longitude: -122.4312,
          address: '789 Western Addition, San Francisco, CA'
        },
        severity: 'medium',
        status: 'investigating',
        reporter: {
          name: 'Dr. Emily Watson',
          phone: '+1-415-555-3333',
          email: 'emily.watson@email.com'
        },
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        updatedAt: new Date().toISOString(),
        affectedUnits: 15,
        estimatedDamage: 'N/A',
        actionsTaken: ['Medical evaluation', 'Cooling center opened', 'Water distribution']
      },
      {
        type: 'infrastructure',
        title: 'Gas Leak in Residential Area',
        description: 'Natural gas leak detected in residential neighborhood. Strong odor reported by multiple residents.',
        location: {
          latitude: 37.7949,
          longitude: -122.3894,
          address: '321 Bayview, San Francisco, CA'
        },
        severity: 'high',
        status: 'investigating',
        reporter: {
          name: 'Robert Kim',
          phone: '+1-415-555-4444',
          email: 'robert.kim@email.com'
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        updatedAt: new Date().toISOString(),
        affectedUnits: 25,
        estimatedDamage: 'TBD',
        actionsTaken: ['Gas company notified', 'Area evacuated', 'Fire department on scene']
      },
      {
        type: 'security',
        title: 'Suspicious Activity Near School',
        description: 'Multiple reports of suspicious individuals loitering near elementary school during dismissal.',
        location: {
          latitude: 37.7639,
          longitude: -122.4312,
          address: '654 School St, San Francisco, CA'
        },
        severity: 'medium',
        status: 'investigating',
        reporter: {
          name: 'Principal Maria Garcia',
          phone: '+1-415-555-5555',
          email: 'maria.garcia@email.com'
        },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        updatedAt: new Date().toISOString(),
        affectedUnits: 1,
        estimatedDamage: 'N/A',
        actionsTaken: ['Police notified', 'School security increased', 'Parents informed']
      }
    ];

    // Add incident reports to Firestore
    for (const report of reportsData) {
      await addDoc(collection(firestore, 'reports'), report);
    }
    console.log('✅ Sample incident reports added to Firestore');

    console.log('\n🎉 All sample data has been successfully added to SafeHaven!');
    console.log('\n📊 Summary:');
    console.log(`   • ${Object.keys(alertsData).length} Emergency Alerts`);
    console.log(`   • ${sheltersData.length} Emergency Shelters`);
    console.log(`   • ${sosMessagesData.length} SOS Messages`);
    console.log(`   • ${reportsData.length} Incident Reports`);
    console.log('\n🚀 Your SafeHaven dashboard is now populated with realistic emergency data!');

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    process.exit(1);
  }
}

// Run the function
addSampleData();
