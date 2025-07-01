import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Home, AlertTriangle, Users, Navigation, Filter } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface MapLocation {
  id: string;
  type: 'shelter' | 'alert' | 'user';
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  capacity?: number;
  occupancy?: number;
}

export default function MapScreen() {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    shelters: true,
    alerts: true,
    users: false,
  });

  const mockLocations: MapLocation[] = [
    {
      id: '1',
      type: 'shelter',
      title: 'Community Center Emergency Shelter',
      description: 'Main emergency shelter with full amenities',
      latitude: 37.7749,
      longitude: -122.4194,
      capacity: 200,
      occupancy: 45,
    },
    {
      id: '2',
      type: 'alert',
      title: 'Flash Flood Warning',
      description: 'Heavy rainfall causing flooding',
      latitude: 37.7849,
      longitude: -122.4094,
      severity: 'critical',
    },
    {
      id: '3',
      type: 'shelter',
      title: 'Red Cross Evacuation Center',
      description: 'Temporary evacuation center',
      latitude: 37.7649,
      longitude: -122.4294,
      capacity: 150,
      occupancy: 78,
    },
    {
      id: '4',
      type: 'alert',
      title: 'Road Closure',
      description: 'Highway closed due to accident',
      latitude: 37.7549,
      longitude: -122.4394,
      severity: 'medium',
    },
  ];

  const getLocationIcon = (type: string, severity?: string) => {
    switch (type) {
      case 'shelter':
        return <Home color="#10b981" size={24} strokeWidth={2} />;
      case 'alert':
        const color = severity === 'critical' ? '#dc2626' : severity === 'high' ? '#ea580c' : '#d97706';
        return <AlertTriangle color={color} size={24} strokeWidth={2} />;
      case 'user':
        return <Users color="#3b82f6" size={24} strokeWidth={2} />;
      default:
        return <MapPin color="#6b7280" size={24} strokeWidth={2} />;
    }
  };

  const getLocationColor = (type: string, severity?: string) => {
    switch (type) {
      case 'shelter':
        return '#10b981';
      case 'alert':
        return severity === 'critical' ? '#dc2626' : severity === 'high' ? '#ea580c' : '#d97706';
      case 'user':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const filteredLocations = mockLocations.filter(location => {
    switch (location.type) {
      case 'shelter':
        return filters.shelters;
      case 'alert':
        return filters.alerts;
      case 'user':
        return filters.users;
      default:
        return true;
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Emergency Map</Text>
          <Text style={styles.headerSubtitle}>Find shelters and view alerts</Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter color="#6b7280" size={20} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filters.shelters && styles.filterChipActive]}
            onPress={() => setFilters(prev => ({ ...prev, shelters: !prev.shelters }))}
          >
            <Home color={filters.shelters ? '#ffffff' : '#10b981'} size={16} strokeWidth={2} />
            <Text style={[styles.filterChipText, filters.shelters && styles.filterChipTextActive]}>
              Shelters
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, filters.alerts && styles.filterChipActive]}
            onPress={() => setFilters(prev => ({ ...prev, alerts: !prev.alerts }))}
          >
            <AlertTriangle color={filters.alerts ? '#ffffff' : '#ef4444'} size={16} strokeWidth={2} />
            <Text style={[styles.filterChipText, filters.alerts && styles.filterChipTextActive]}>
              Alerts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, filters.users && styles.filterChipActive]}
            onPress={() => setFilters(prev => ({ ...prev, users: !prev.users }))}
          >
            <Users color={filters.users ? '#ffffff' : '#3b82f6'} size={16} strokeWidth={2} />
            <Text style={[styles.filterChipText, filters.users && styles.filterChipTextActive]}>
              People
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <MapPin color="#9ca3af" size={48} strokeWidth={1} />
          <Text style={styles.mapPlaceholderText}>Interactive Map</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            Google Maps integration would be implemented here
          </Text>
        </View>

        {/* Map Markers Overlay */}
        {filteredLocations.map((location, index) => (
          <TouchableOpacity
            key={location.id}
            style={[
              styles.mapMarker,
              {
                left: 50 + (index * 60) % (width - 100),
                top: 100 + (index * 80) % 200,
              }
            ]}
            onPress={() => setSelectedLocation(location)}
          >
            <View style={[
              styles.markerIcon,
              { backgroundColor: getLocationColor(location.type, location.severity) }
            ]}>
              {getLocationIcon(location.type, location.severity)}
            </View>
          </TouchableOpacity>
        ))}

        {/* Current Location Button */}
        <TouchableOpacity style={styles.currentLocationButton}>
          <Navigation color="#3b82f6" size={20} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Location Details */}
      {selectedLocation && (
        <View style={styles.locationDetails}>
          <View style={styles.locationHeader}>
            <View style={styles.locationTitleContainer}>
              {getLocationIcon(selectedLocation.type, selectedLocation.severity)}
              <Text style={styles.locationTitle}>{selectedLocation.title}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedLocation(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.locationDescription}>{selectedLocation.description}</Text>
          
          {selectedLocation.type === 'shelter' && (
            <View style={styles.shelterInfo}>
              <View style={styles.capacityInfo}>
                <Text style={styles.capacityLabel}>Capacity</Text>
                <Text style={styles.capacityValue}>
                  {selectedLocation.occupancy}/{selectedLocation.capacity}
                </Text>
              </View>
              <View style={styles.capacityBar}>
                <View 
                  style={[
                    styles.capacityFill,
                    { 
                      width: `${((selectedLocation.occupancy || 0) / (selectedLocation.capacity || 1)) * 100}%`,
                      backgroundColor: ((selectedLocation.occupancy || 0) / (selectedLocation.capacity || 1)) > 0.8 ? '#ef4444' : '#10b981'
                    }
                  ]} 
                />
              </View>
            </View>
          )}
          
          {selectedLocation.type === 'alert' && selectedLocation.severity && (
            <View style={styles.alertInfo}>
              <View style={[
                styles.severityBadge,
                { backgroundColor: getLocationColor(selectedLocation.type, selectedLocation.severity) }
              ]}>
                <Text style={styles.severityText}>
                  {selectedLocation.severity.toUpperCase()}
                </Text>
              </View>
            </View>
          )}
          
          <TouchableOpacity style={styles.directionsButton}>
            <Navigation color="#ffffff" size={16} strokeWidth={2} />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Locations List */}
      <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.locationsListTitle}>Nearby Locations</Text>
        {filteredLocations.map((location) => (
          <TouchableOpacity
            key={location.id}
            style={[
              styles.locationCard,
              selectedLocation?.id === location.id && styles.locationCardSelected
            ]}
            onPress={() => setSelectedLocation(location)}
          >
            <View style={styles.locationCardHeader}>
              {getLocationIcon(location.type, location.severity)}
              <View style={styles.locationCardContent}>
                <Text style={styles.locationCardTitle}>{location.title}</Text>
                <Text style={styles.locationCardDescription} numberOfLines={1}>
                  {location.description}
                </Text>
              </View>
            </View>
            
            {location.type === 'shelter' && (
              <View style={styles.locationCardMeta}>
                <Text style={styles.locationCardCapacity}>
                  {location.occupancy}/{location.capacity} capacity
                </Text>
              </View>
            )}
            
            {location.type === 'alert' && location.severity && (
              <View style={styles.locationCardMeta}>
                <View style={[
                  styles.severityBadgeSmall,
                  { backgroundColor: getLocationColor(location.type, location.severity) }
                ]}>
                  <Text style={styles.severityTextSmall}>
                    {location.severity.toUpperCase()}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: '#1f2937',
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#e5e7eb',
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  mapPlaceholderText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#6b7280',
    marginTop: 12,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 40,
  },
  mapMarker: {
    position: 'absolute',
    zIndex: 10,
  },
  markerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationDetails: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    flex: 1,
  },
  closeButton: {
    fontSize: 18,
    color: '#6b7280',
    padding: 4,
  },
  locationDescription: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 20,
  },
  shelterInfo: {
    marginBottom: 16,
  },
  capacityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  capacityLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
  },
  capacityValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  capacityBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 4,
  },
  alertInfo: {
    marginBottom: 16,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  directionsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  locationsList: {
    maxHeight: 200,
    paddingHorizontal: 20,
  },
  locationsListTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationCardSelected: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  locationCardContent: {
    flex: 1,
  },
  locationCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 2,
  },
  locationCardDescription: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  locationCardMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  locationCardCapacity: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Medium',
  },
  severityBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityTextSmall: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
});