import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile, markAsSafe, UserStatus } from '../../services/users';
import { subscribeToNearbyAlerts, Alert as AlertType } from '../../services/alerts';
import { getNearbyShelters, Shelter } from '../../services/shelters';
import { getCurrentLocation } from '../../utils/location';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [nearbyAlerts, setNearbyAlerts] = useState<AlertType[]>([]);
  const [nearbyShelters, setNearbyShelters] = useState<Shelter[]>([]);
  
  useEffect(() => {
    loadData();
    
    // Subscribe to nearby alerts
    let alertsUnsubscribe: (() => void) | null = null;
    
    const setupAlertSubscription = async () => {
      try {
        alertsUnsubscribe = await subscribeToNearbyAlerts((alerts) => {
          setNearbyAlerts(alerts);
        });
      } catch (error) {
        console.error('Error subscribing to alerts:', error);
      }
    };
    
    setupAlertSubscription();
    
    // Cleanup subscription
    return () => {
      if (alertsUnsubscribe) {
        alertsUnsubscribe();
      }
    };
  }, []);
  
  const loadData = async () => {
    try {
      setRefreshing(true);
      
      // Get user profile
      const profile = await getUserProfile();
      setUserProfile(profile);
      
      // Get current location
      const location = await getCurrentLocation();
      
      if (location) {
        // Get nearby shelters
        const shelters = await getNearbyShelters(location, 10);
        setNearbyShelters(shelters);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleMarkSafe = async () => {
    try {
      await markAsSafe();
      Alert.alert(
        'Status Updated',
        'You have been marked as safe. Your family and emergency contacts will be notified.'
      );
      
      // Refresh user profile
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error marking as safe:', error);
      Alert.alert(
        'Update Failed',
        'Could not update your status. Please try again.'
      );
    }
  };
  
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.SAFE:
        return '#34c759'; // Green
      case UserStatus.NEED_HELP:
        return '#ff9500'; // Orange
      case UserStatus.EMERGENCY:
        return '#ff3b30'; // Red
      default:
        return '#8e8e93'; // Gray
    }
  };
  
  const getStatusText = (status: UserStatus) => {
    switch (status) {
      case UserStatus.SAFE:
        return 'Safe';
      case UserStatus.NEED_HELP:
        return 'Needs Help';
      case UserStatus.EMERGENCY:
        return 'Emergency';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SafeHaven</Text>
          <Text style={styles.headerSubtitle}>Your safety companion</Text>
        </View>
        
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Your Status</Text>
            {userProfile && (
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(userProfile.status) }
              ]}>
                <Text style={styles.statusBadgeText}>
                  {getStatusText(userProfile.status)}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.safeButton}
            onPress={handleMarkSafe}
          >
            <Ionicons name="shield-checkmark" size={24} color="#fff" />
            <Text style={styles.safeButtonText}>I'm Safe</Text>
          </TouchableOpacity>
          
          <Text style={styles.statusInfo}>
            Let your family and emergency contacts know you're safe
          </Text>
        </View>
        
        {/* Alerts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Alerts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {nearbyAlerts.length > 0 ? (
            nearbyAlerts.slice(0, 3).map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={styles.alertItem}
                onPress={() => navigation.navigate('AlertDetail', { alertId: alert.id!, alert })}
              >
                <View style={[
                  styles.alertSeverity,
                  { backgroundColor: alert.severity === 'critical' ? '#ff3b30' : 
                                    alert.severity === 'high' ? '#ff9500' : 
                                    alert.severity === 'medium' ? '#ffcc00' : '#34c759' }
                ]} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertDescription} numberOfLines={2}>
                    {alert.description}
                  </Text>
                  <Text style={styles.alertTime}>
                    {new Date(alert.createdAt).toLocaleString()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8e8e93" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={40} color="#34c759" />
              <Text style={styles.emptyStateText}>No alerts in your area</Text>
            </View>
          )}
        </View>
        
        {/* Shelters Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Shelters</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Map')}>
              <Text style={styles.seeAllText}>View Map</Text>
            </TouchableOpacity>
          </View>
          
          {nearbyShelters.length > 0 ? (
            nearbyShelters.slice(0, 3).map((shelter) => (
              <TouchableOpacity
                key={shelter.id}
                style={styles.shelterItem}
                onPress={() => navigation.navigate('ShelterDetail', { shelterId: shelter.id, shelter })}
              >
                <View style={styles.shelterIcon}>
                  <Ionicons 
                    name={
                      shelter.type === 'medical' ? 'medical' :
                      shelter.type === 'food' ? 'restaurant' :
                      shelter.type === 'water' ? 'water' :
                      'home'
                    } 
                    size={24} 
                    color="#007aff" 
                  />
                </View>
                <View style={styles.shelterContent}>
                  <Text style={styles.shelterTitle}>{shelter.name}</Text>
                  <Text style={styles.shelterAddress} numberOfLines={1}>
                    {shelter.address}
                  </Text>
                  <View style={styles.shelterCapacity}>
                    <Text style={styles.shelterCapacityText}>
                      Capacity: {shelter.currentOccupancy || '?'}/{shelter.capacity}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8e8e93" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="home" size={40} color="#8e8e93" />
              <Text style={styles.emptyStateText}>No shelters found nearby</Text>
            </View>
          )}
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('CreateReport')}
          >
            <Ionicons name="alert-circle" size={24} color="#007aff" />
            <Text style={styles.quickActionText}>Report Activity</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('SOS')}
          >
            <Ionicons name="warning" size={24} color="#ff3b30" />
            <Text style={styles.quickActionText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007aff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8e8e93',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  safeButton: {
    backgroundColor: '#34c759',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 10,
  },
  safeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  statusInfo: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007aff',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  alertSeverity: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#8e8e93',
  },
  shelterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  shelterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5f1ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shelterContent: {
    flex: 1,
  },
  shelterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  shelterAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  shelterCapacity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shelterCapacityText: {
    fontSize: 12,
    color: '#8e8e93',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8e8e93',
    marginTop: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
  },
});

export default HomeScreen;
