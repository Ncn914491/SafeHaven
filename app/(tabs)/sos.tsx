import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Shield, 
  Phone, 
  MapPin, 
  Clock, 
  Users, 
  MessageSquare,
  AlertTriangle,
  CheckCircle
} from 'lucide-react-native';

interface SOSMessage {
  id: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'acknowledged' | 'resolved';
  location?: string;
}

export default function SOSScreen() {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showCustomMessage, setShowCustomMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [sosHistory, setSOSHistory] = useState<SOSMessage[]>([]);
  const [emergencyContacts] = useState([
    { name: 'Emergency Services', number: '911' },
    { name: 'Local Police', number: '(555) 123-4567' },
    { name: 'Fire Department', number: '(555) 234-5678' },
    { name: 'Medical Emergency', number: '(555) 345-6789' },
  ]);

  const mockSOSHistory: SOSMessage[] = [
    {
      id: '1',
      message: 'Emergency assistance needed at current location',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'resolved',
      location: 'Downtown District',
    },
    {
      id: '2',
      message: 'Medical emergency - need immediate help',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'acknowledged',
      location: 'North Side',
    },
  ];

  useEffect(() => {
    setSOSHistory(mockSOSHistory);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleSOSPress = () => {
    if (countdown > 0) return;

    Alert.alert(
      'Send SOS Alert',
      'This will send an emergency alert to authorities and your emergency contacts. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quick SOS', onPress: () => sendSOS() },
        { text: 'Custom Message', onPress: () => setShowCustomMessage(true) },
      ]
    );
  };

  const sendSOS = (message?: string) => {
    setIsSOSActive(true);
    setCountdown(60); // 60 second cooldown
    Vibration.vibrate([0, 500, 200, 500]);

    const sosMessage: SOSMessage = {
      id: Date.now().toString(),
      message: message || 'Emergency assistance needed at current location',
      timestamp: new Date(),
      status: 'pending',
      location: 'Current Location',
    };

    setSOSHistory(prev => [sosMessage, ...prev]);
    setShowCustomMessage(false);
    setCustomMessage('');

    // Simulate SOS processing
    setTimeout(() => {
      setIsSOSActive(false);
      Alert.alert(
        'SOS Sent Successfully',
        'Your emergency alert has been sent to authorities and emergency contacts.'
      );
    }, 3000);
  };

  const handleCustomSOS = () => {
    if (!customMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    sendSOS(customMessage.trim());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'acknowledged': return '#3b82f6';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock color="#f59e0b" size={16} strokeWidth={2} />;
      case 'acknowledged': return <AlertTriangle color="#3b82f6" size={16} strokeWidth={2} />;
      case 'resolved': return <CheckCircle color="#10b981" size={16} strokeWidth={2} />;
      default: return <Clock color="#6b7280" size={16} strokeWidth={2} />;
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Emergency SOS</Text>
          <Text style={styles.headerSubtitle}>
            Press the SOS button to alert authorities and emergency contacts
          </Text>
        </View>

        {/* SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity
            style={[
              styles.sosButton,
              isSOSActive && styles.sosButtonActive,
              countdown > 0 && styles.sosButtonDisabled
            ]}
            onPress={handleSOSPress}
            disabled={countdown > 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isSOSActive 
                  ? ['#f59e0b', '#d97706']
                  : countdown > 0
                  ? ['#9ca3af', '#6b7280']
                  : ['#ef4444', '#dc2626']
              }
              style={styles.sosButtonGradient}
            >
              <Shield 
                color="#ffffff" 
                size={48} 
                strokeWidth={2} 
              />
              <Text style={styles.sosButtonText}>
                {isSOSActive 
                  ? 'SENDING...' 
                  : countdown > 0 
                  ? `WAIT ${countdown}s`
                  : 'SOS'
                }
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.sosDescription}>
            This will send your location and alert message to emergency services and your emergency contacts
          </Text>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity key={index} style={styles.contactCard}>
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard}>
              <MapPin color="#3b82f6" size={24} strokeWidth={2} />
              <Text style={styles.quickActionText}>Share Location</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <Users color="#10b981" size={24} strokeWidth={2} />
              <Text style={styles.quickActionText}>Contact Family</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <MessageSquare color="#f59e0b" size={24} strokeWidth={2} />
              <Text style={styles.quickActionText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SOS History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOS History</Text>
          {sosHistory.length > 0 ? (
            sosHistory.map((sos) => (
              <View key={sos.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyStatus}>
                    {getStatusIcon(sos.status)}
                    <Text style={[styles.historyStatusText, { color: getStatusColor(sos.status) }]}>
                      {sos.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.historyTime}>{formatTimeAgo(sos.timestamp)}</Text>
                </View>
                
                <Text style={styles.historyMessage}>{sos.message}</Text>
                
                {sos.location && (
                  <View style={styles.historyLocation}>
                    <MapPin color="#6b7280" size={14} strokeWidth={2} />
                    <Text style={styles.historyLocationText}>{sos.location}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyHistory}>
              <Shield color="#9ca3af" size={48} strokeWidth={1} />
              <Text style={styles.emptyHistoryText}>No SOS alerts sent yet</Text>
              <Text style={styles.emptyHistorySubtext}>
                Your emergency alerts will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Custom Message Modal */}
      <Modal
        visible={showCustomMessage}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomMessage(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom SOS Message</Text>
            
            <TextInput
              style={styles.messageInput}
              placeholder="Describe your emergency..."
              value={customMessage}
              onChangeText={setCustomMessage}
              multiline
              numberOfLines={4}
              maxLength={200}
              textAlignVertical="top"
            />
            
            <Text style={styles.characterCount}>
              {customMessage.length}/200 characters
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCustomMessage(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSendButton}
                onPress={handleCustomSOS}
              >
                <Text style={styles.modalSendText}>Send SOS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    lineHeight: 24,
  },
  sosContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  sosButtonActive: {
    transform: [{ scale: 0.95 }],
  },
  sosButtonDisabled: {
    opacity: 0.6,
  },
  sosButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: 12,
    textAlign: 'center',
  },
  sosDescription: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginTop: 8,
    textAlign: 'center',
  },
  historyCard: {
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  historyTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'Inter-Regular',
  },
  historyMessage: {
    fontSize: 14,
    color: '#1f2937',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    lineHeight: 20,
  },
  historyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyLocationText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#4b5563',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: 'Inter-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 100,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
  },
  modalSendButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSendText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});