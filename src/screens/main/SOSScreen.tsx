import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Modal,
  TextInput,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendSOS, getUserSOSHistory, SOSMessage, SOSStatus } from '../../services/sos';
import { updateUserStatus, UserStatus } from '../../services/users';
import { processOfflineSOSQueue } from '../../services/sos';
import { useIsFocused } from '@react-navigation/native';

const SOSScreen = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SOSMessage[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (isFocused) {
      loadSOSHistory();
      processOfflineQueue();
    }
  }, [isFocused]);
  
  useEffect(() => {
    // Countdown timer for SOS button
    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [countdown]);
  
  const loadSOSHistory = async () => {
    try {
      const messages = await getUserSOSHistory();
      setHistory(messages);
    } catch (error) {
      console.error('Error loading SOS history:', error);
    }
  };
  
  const processOfflineQueue = async () => {
    try {
      const processed = await processOfflineSOSQueue();
      if (processed > 0) {
        console.log(`Processed ${processed} offline SOS messages`);
        loadSOSHistory();
      }
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  };
  
  const handleSOSPress = () => {
    // Show confirmation dialog
    Alert.alert(
      'Send SOS Alert',
      'Are you sure you want to send an emergency SOS alert?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Send Default SOS',
          onPress: () => sendSOSAlert()
        },
        {
          text: 'Custom Message',
          onPress: () => setModalVisible(true)
        }
      ]
    );
  };
  
  const sendSOSAlert = async (message?: string) => {
    try {
      setLoading(true);
      setCountdown(60); // Set cooldown timer
      
      // Update user status to emergency
      await updateUserStatus(UserStatus.EMERGENCY);
      
      // Send SOS alert
      const result = await sendSOS(message);
      
      if (result) {
        Alert.alert(
          'SOS Alert Sent',
          'Your emergency alert has been sent to authorities and emergency contacts.'
        );
      } else {
        Alert.alert(
          'SOS Alert Queued',
          'You appear to be offline. Your SOS will be sent as soon as you reconnect. SMS messages will be sent to your emergency contacts if configured.'
        );
      }
      
      // Refresh history
      loadSOSHistory();
    } catch (error) {
      console.error('Error sending SOS alert:', error);
      Alert.alert(
        'Error',
        'Failed to send SOS alert. Please try again.'
      );
    } finally {
      setLoading(false);
      setModalVisible(false);
      setCustomMessage('');
    }
  };
  
  const handleCustomSOS = () => {
    if (!customMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    
    sendSOSAlert(customMessage.trim());
  };
  
  const getStatusText = (status: SOSStatus) => {
    switch (status) {
      case SOSStatus.PENDING:
        return 'Pending';
      case SOSStatus.ACKNOWLEDGED:
        return 'Acknowledged';
      case SOSStatus.RESOLVED:
        return 'Resolved';
      default:
        return 'Unknown';
    }
  };
  
  const getStatusColor = (status: SOSStatus) => {
    switch (status) {
      case SOSStatus.PENDING:
        return '#ff9500'; // Orange
      case SOSStatus.ACKNOWLEDGED:
        return '#007aff'; // Blue
      case SOSStatus.RESOLVED:
        return '#34c759'; // Green
      default:
        return '#8e8e93'; // Gray
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
      </View>
      
      <View style={styles.sosContainer}>
        <Text style={styles.sosTitle}>
          Press the SOS button to alert authorities and emergency contacts
        </Text>
        
        <TouchableOpacity
          style={[styles.sosButton, countdown > 0 && styles.sosButtonDisabled]}
          onPress={handleSOSPress}
          disabled={loading || countdown > 0}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Ionicons name="warning" size={40} color="#fff" />
              <Text style={styles.sosButtonText}>
                {countdown > 0 ? `SOS (${countdown}s)` : 'SOS'}
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.sosDescription}>
          This will send your current location and status to emergency services and your emergency contacts.
        </Text>
      </View>
      
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>SOS History</Text>
        
        <ScrollView style={styles.historyList}>
          {history.length > 0 ? (
            history.map((item, index) => (
              <View key={item.id || index} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTime}>
                    {item.timestamp.toDate().toLocaleString()}
                  </Text>
                  <View style={[
                    styles.historyStatus,
                    { backgroundColor: getStatusColor(item.status) }
                  ]}>
                    <Text style={styles.historyStatusText}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.historyMessage}>{item.message}</Text>
                {item.location && (
                  <Text style={styles.historyLocation}>
                    Location: {item.location.latitude.toFixed(6)}, {item.location.longitude.toFixed(6)}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyHistory}>
              <Ionicons name="information-circle" size={40} color="#8e8e93" />
              <Text style={styles.emptyHistoryText}>No SOS alerts sent yet</Text>
            </View>
          )}
        </ScrollView>
      </View>
      
      {/* Custom Message Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom SOS Message</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your emergency message"
              value={customMessage}
              onChangeText={setCustomMessage}
              multiline
              maxLength={200}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  sosContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sosTitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sosButtonDisabled: {
    backgroundColor: '#ff8e86',
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  sosDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTime: {
    fontSize: 14,
    color: '#8e8e93',
  },
  historyStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  historyMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  historyLocation: {
    fontSize: 14,
    color: '#666',
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#8e8e93',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalSendButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ff3b30',
    marginLeft: 8,
    alignItems: 'center',
  },
  modalSendText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default SOSScreen;
