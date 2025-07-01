import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Share, 
  Navigation,
  Phone
} from 'lucide-react-native';

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams();

  // Mock alert data - in a real app, this would be fetched based on the ID
  const alert = {
    id: id as string,
    title: 'Flash Flood Warning',
    description: 'Heavy rainfall has caused flooding in the downtown area. Water levels are rising rapidly. Residents are advised to avoid low-lying areas and seek higher ground immediately. Emergency services are responding to multiple incidents.',
    severity: 'critical' as const,
    type: 'Weather',
    location: 'Downtown District',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    isActive: true,
    affectedAreas: ['Financial District', 'Embarcadero', 'North Beach'],
    instructions: [
      'Evacuate to designated shelters immediately',
      'Do not attempt to drive through flooded areas',
      'Stay away from storm drains and waterways',
      'Keep emergency supplies ready',
    ],
    emergencyContacts: [
      { name: 'Emergency Services', number: '911' },
      { name: 'Local Emergency Management', number: '(555) 123-4567' },
      { name: 'Red Cross Shelter Info', number: '(555) 234-5678' },
    ],
    image: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800',
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
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const formatExpiryTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Expires in ${diffInMinutes} minutes`;
    } else if (diffInMinutes < 1440) {
      return `Expires in ${Math.floor(diffInMinutes / 60)} hours`;
    } else {
      return `Expires in ${Math.floor(diffInMinutes / 1440)} days`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#1f2937" size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share color="#1f2937" size={24} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Alert Image */}
        <Image source={{ uri: alert.image }} style={styles.alertImage} />

        {/* Alert Header */}
        <View style={[styles.alertHeader, { backgroundColor: getSeverityBgColor(alert.severity) }]}>
          <View style={styles.alertTitleRow}>
            <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(alert.severity) }]} />
            <View style={styles.alertTitleContainer}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <View style={styles.alertMeta}>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                  <Text style={styles.severityText}>{alert.severity.toUpperCase()}</Text>
                </View>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{alert.type}</Text>
                </View>
                {alert.isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeText}>ACTIVE</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Alert Info */}
        <View style={styles.alertInfo}>
          <View style={styles.infoRow}>
            <Clock color="#6b7280" size={16} strokeWidth={2} />
            <Text style={styles.infoText}>Issued {formatTimeAgo(alert.timestamp)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock color="#6b7280" size={16} strokeWidth={2} />
            <Text style={styles.infoText}>{formatExpiryTime(alert.expiresAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin color="#6b7280" size={16} strokeWidth={2} />
            <Text style={styles.infoText}>{alert.location}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{alert.description}</Text>
        </View>

        {/* Affected Areas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Affected Areas</Text>
          <View style={styles.areasList}>
            {alert.affectedAreas.map((area, index) => (
              <View key={index} style={styles.areaItem}>
                <Text style={styles.areaText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Safety Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Instructions</Text>
          {alert.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.instructionBullet} />
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          {alert.emergencyContacts.map((contact, index) => (
            <TouchableOpacity key={index} style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Phone color="#ef4444" size={20} strokeWidth={2} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.directionsButton}>
            <Navigation color="#ffffff" size={20} strokeWidth={2} />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareAlertButton}>
            <Share color="#ef4444" size={20} strokeWidth={2} />
            <Text style={styles.shareAlertButtonText}>Share Alert</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
  },
  shareButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  alertImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  alertHeader: {
    padding: 20,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  severityIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginRight: 16,
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 32,
  },
  alertMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  typeText: {
    color: '#1f2937',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  activeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#10b981',
  },
  activeText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  alertInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  areasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  areaItem: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  areaText: {
    fontSize: 14,
    color: '#1e40af',
    fontFamily: 'Inter-SemiBold',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginTop: 8,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#4b5563',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  callButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  directionsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  shareAlertButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareAlertButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});