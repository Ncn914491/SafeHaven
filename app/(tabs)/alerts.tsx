import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, Filter, AlertTriangle, Clock, MapPin, ChevronRight } from 'lucide-react-native';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  location: string;
  timestamp: Date;
  isActive: boolean;
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'critical'>('all');

  const mockAlerts: Alert[] = [
    {
      id: '1',
      title: 'Flash Flood Warning',
      description: 'Heavy rainfall expected in downtown area. Water levels rising rapidly. Avoid low-lying areas and seek higher ground immediately.',
      severity: 'critical',
      type: 'Weather',
      location: 'Downtown District',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isActive: true,
    },
    {
      id: '2',
      title: 'Wildfire Alert',
      description: 'Fire reported in North Hills area. Evacuation orders in effect for zones A and B.',
      severity: 'high',
      type: 'Fire',
      location: 'North Hills',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      id: '3',
      title: 'Road Closure',
      description: 'Main highway closed due to accident. Use alternate routes.',
      severity: 'medium',
      type: 'Traffic',
      location: 'Highway 101',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      isActive: true,
    },
    {
      id: '4',
      title: 'Power Outage',
      description: 'Scheduled maintenance affecting 2000 homes in North Side area.',
      severity: 'low',
      type: 'Utility',
      location: 'North Side',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isActive: false,
    },
    {
      id: '5',
      title: 'Severe Weather Warning',
      description: 'Strong winds and hail expected. Secure outdoor items and stay indoors.',
      severity: 'high',
      type: 'Weather',
      location: 'City Wide',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  useEffect(() => {
    setAlerts(mockAlerts);
    setFilteredAlerts(mockAlerts);
  }, []);

  useEffect(() => {
    let filtered = alerts;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(alert => alert.isActive);
        break;
      case 'critical':
        filtered = filtered.filter(alert => alert.severity === 'critical');
        break;
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchQuery, selectedFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#fef2f2';
      case 'high': return '#fff7ed';
      case 'medium': return '#fffbeb';
      case 'low': return '#f7fee7';
      default: return '#f9fafb';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const FilterButton = ({ filter, label, count }: { filter: typeof selectedFilter, label: string, count: number }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Alerts</Text>
        <Text style={styles.headerSubtitle}>Stay informed about local emergencies</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#9ca3af" size={20} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search alerts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterButton 
            filter="all" 
            label="All" 
            count={alerts.length} 
          />
          <FilterButton 
            filter="active" 
            label="Active" 
            count={alerts.filter(a => a.isActive).length} 
          />
          <FilterButton 
            filter="critical" 
            label="Critical" 
            count={alerts.filter(a => a.severity === 'critical').length} 
          />
        </ScrollView>
      </View>

      {/* Alerts List */}
      <ScrollView
        style={styles.alertsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[
                styles.alertCard,
                { backgroundColor: getSeverityBgColor(alert.severity) },
                !alert.isActive && styles.inactiveAlert
              ]}
              onPress={() => router.push(`/alert/${alert.id}`)}
            >
              <View style={styles.alertHeader}>
                <View style={styles.alertTitleRow}>
                  <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(alert.severity) }]} />
                  <View style={styles.alertTitleContainer}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <View style={styles.alertMeta}>
                      <Text style={styles.alertType}>{alert.type}</Text>
                      <Text style={styles.alertSeverity}>
                        {alert.severity.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  {!alert.isActive && (
                    <View style={styles.inactiveIndicator}>
                      <Text style={styles.inactiveText}>Inactive</Text>
                    </View>
                  )}
                </View>
                <ChevronRight color="#9ca3af" size={20} strokeWidth={2} />
              </View>

              <Text style={styles.alertDescription} numberOfLines={2}>
                {alert.description}
              </Text>

              <View style={styles.alertFooter}>
                <View style={styles.locationContainer}>
                  <MapPin color="#6b7280" size={16} strokeWidth={2} />
                  <Text style={styles.alertLocation}>{alert.location}</Text>
                </View>
                <View style={styles.timeContainer}>
                  <Clock color="#6b7280" size={16} strokeWidth={2} />
                  <Text style={styles.alertTime}>{formatTimeAgo(alert.timestamp)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <AlertTriangle color="#9ca3af" size={64} strokeWidth={1} />
            <Text style={styles.emptyStateTitle}>No alerts found</Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'No emergency alerts match your current filters'
              }
            </Text>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1f2937',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filters: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  alertsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  inactiveAlert: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  severityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  alertMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  alertType: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Medium',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertSeverity: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ef4444',
  },
  inactiveIndicator: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-SemiBold',
  },
  alertDescription: {
    fontSize: 14,
    color: '#4b5563',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertLocation: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Medium',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertTime: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Medium',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#4b5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
});