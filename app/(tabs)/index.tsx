import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  AlertTriangle, 
  MapPin, 
  Shield, 
  Users, 
  Clock,
  ChevronRight,
  Activity,
  Bell
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  location: string;
  timestamp: Date;
}

interface QuickStat {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [userStatus, setUserStatus] = useState<'safe' | 'help' | 'emergency'>('safe');

  const quickStats: QuickStat[] = [
    {
      icon: <AlertTriangle color="#ef4444" size={24} strokeWidth={2} />,
      label: 'Active Alerts',
      value: '3',
      color: '#ef4444',
      bgColor: '#fef2f2',
    },
    {
      icon: <MapPin color="#3b82f6" size={24} strokeWidth={2} />,
      label: 'Nearby Shelters',
      value: '12',
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
    {
      icon: <Users color="#10b981" size={24} strokeWidth={2} />,
      label: 'Safe Contacts',
      value: '8/10',
      color: '#10b981',
      bgColor: '#f0fdf4',
    },
    {
      icon: <Activity color="#f59e0b" size={24} strokeWidth={2} />,
      label: 'System Status',
      value: 'Online',
      color: '#f59e0b',
      bgColor: '#fffbeb',
    },
  ];

  const mockAlerts: Alert[] = [
    {
      id: '1',
      title: 'Flash Flood Warning',
      description: 'Heavy rainfall expected in downtown area',
      severity: 'high',
      type: 'Weather',
      location: 'Downtown District',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Road Closure',
      description: 'Main highway closed due to accident',
      severity: 'medium',
      type: 'Traffic',
      location: 'Highway 101',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Power Outage',
      description: 'Scheduled maintenance affecting 2000 homes',
      severity: 'low',
      type: 'Utility',
      location: 'North Side',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ];

  useEffect(() => {
    setRecentAlerts(mockAlerts);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return '#10b981';
      case 'help': return '#f59e0b';
      case 'emergency': return '#ef4444';
      default: return '#6b7280';
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#ef4444', '#dc2626']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Good morning</Text>
                <Text style={styles.appName}>SafeHaven</Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Bell color="#ffffff" size={24} strokeWidth={2} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>3</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusTitle}>Your Status</Text>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(userStatus) }]}>
                  <Text style={styles.statusText}>
                    {userStatus === 'safe' ? 'Safe' : userStatus === 'help' ? 'Need Help' : 'Emergency'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.markSafeButton}>
                <Shield color="#10b981" size={20} strokeWidth={2} />
                <Text style={styles.markSafeText}>Mark as Safe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          {quickStats.map((stat, index) => (
            <TouchableOpacity key={index} style={[styles.statCard, { backgroundColor: stat.bgColor }]}>
              <View style={styles.statIcon}>
                {stat.icon}
              </View>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, styles.sosCard]}
              onPress={() => router.push('/sos')}
            >
              <Shield color="#ffffff" size={32} strokeWidth={2} />
              <Text style={styles.actionTitle}>SOS Alert</Text>
              <Text style={styles.actionSubtitle}>Send emergency signal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, styles.mapCard]}
              onPress={() => router.push('/map')}
            >
              <MapPin color="#ffffff" size={32} strokeWidth={2} />
              <Text style={styles.actionTitle}>Find Shelter</Text>
              <Text style={styles.actionSubtitle}>Locate safe zones</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            <TouchableOpacity onPress={() => router.push('/alerts')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentAlerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={styles.alertCard}
              onPress={() => router.push(`/alert/${alert.id}`)}
            >
              <View style={styles.alertHeader}>
                <View style={[styles.severityDot, { backgroundColor: getSeverityColor(alert.severity) }]} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertDescription} numberOfLines={2}>
                    {alert.description}
                  </Text>
                  <View style={styles.alertMeta}>
                    <Text style={styles.alertLocation}>{alert.location}</Text>
                    <Text style={styles.alertTime}>{formatTimeAgo(alert.timestamp)}</Text>
                  </View>
                </View>
                <ChevronRight color="#9ca3af" size={20} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <View style={styles.tipCard}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/6980523/pexels-photo-6980523.jpeg?auto=compress&cs=tinysrgb&w=400' }}
              style={styles.tipImage}
            />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Emergency Preparedness</Text>
              <Text style={styles.tipDescription}>
                Keep an emergency kit ready with water, food, flashlight, and first aid supplies.
              </Text>
              <TouchableOpacity style={styles.tipButton}>
                <Text style={styles.tipButtonText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#fca5a5',
    fontFamily: 'Inter-Medium',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  markSafeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  markSafeText: {
    color: '#10b981',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 56) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#ef4444',
    fontFamily: 'Inter-SemiBold',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sosCard: {
    backgroundColor: '#ef4444',
  },
  mapCard: {
    backgroundColor: '#3b82f6',
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginTop: 12,
    marginBottom: 4,
  },
  actionSubtitle: {
    color: '#fca5a5',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  severityDot: {
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
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    lineHeight: 20,
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertLocation: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'Inter-Medium',
  },
  alertTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'Inter-Medium',
  },
  tipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipImage: {
    width: '100%',
    height: 160,
  },
  tipContent: {
    padding: 16,
  },
  tipTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  tipButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tipButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});