import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { signInEmergencyMode } from '../../services/auth';
import { Ionicons } from '@expo/vector-icons';

type EmergencyModeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EmergencyMode'>;

const EmergencyModeScreen = () => {
  const navigation = useNavigation<EmergencyModeScreenNavigationProp>();
  const [loading, setLoading] = useState(false);

  const handleEmergencySignIn = async () => {
    try {
      setLoading(true);
      
      // Sign in anonymously
      await signInEmergencyMode();
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      Alert.alert(
        'Sign In Failed',
        'Could not sign in to emergency mode. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007aff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Mode</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={80} color="#ff3b30" />
          </View>
          
          <Text style={styles.title}>Emergency Access</Text>
          
          <Text style={styles.description}>
            Emergency Mode gives you immediate access to critical SafeHaven features without requiring an account.
          </Text>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Available Features:</Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#34c759" />
              <Text style={styles.featureText}>View emergency alerts in your area</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#34c759" />
              <Text style={styles.featureText}>Find nearby shelters and resources</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#34c759" />
              <Text style={styles.featureText}>Send SOS signals to authorities</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#34c759" />
              <Text style={styles.featureText}>Report suspicious activities</Text>
            </View>
          </View>
          
          <View style={styles.limitationsContainer}>
            <Text style={styles.limitationsTitle}>Limitations:</Text>
            <View style={styles.limitationItem}>
              <Ionicons name="close-circle" size={24} color="#ff3b30" />
              <Text style={styles.limitationText}>Cannot create family groups</Text>
            </View>
            <View style={styles.limitationItem}>
              <Ionicons name="close-circle" size={24} color="#ff3b30" />
              <Text style={styles.limitationText}>Cannot save emergency contacts</Text>
            </View>
            <View style={styles.limitationItem}>
              <Ionicons name="close-circle" size={24} color="#ff3b30" />
              <Text style={styles.limitationText}>Limited offline functionality</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleEmergencySignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue in Emergency Mode</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signInButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.signInButtonText}>
              Go Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  limitationsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  limitationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  limitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  limitationText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    padding: 10,
  },
  signInButtonText: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '500',
  },
});

export default EmergencyModeScreen;
