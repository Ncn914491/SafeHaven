import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { sendPhoneVerification } from '../../services/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { app } from '../../config/firebase';

type PhoneAuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhoneAuth'>;

const PhoneAuthScreen = () => {
  const navigation = useNavigation<PhoneAuthScreenNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const recaptchaVerifier = useRef(null);

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      
      // Format phone number with country code if not provided
      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${phoneNumber}`; // Default to US (+1)
      
      // Send verification code
      const verificationId = await sendPhoneVerification(
        formattedPhoneNumber,
        recaptchaVerifier.current
      );
      
      // Navigate to OTP verification screen
      navigation.navigate('VerifyOTP', {
        phoneNumber: formattedPhoneNumber,
        verificationId
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      Alert.alert(
        'Verification Failed',
        'Could not send verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyMode = () => {
    navigation.navigate('EmergencyMode');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={app.options}
          attemptInvisibleVerification={true}
        />
        
        <View style={styles.content}>
          <Text style={styles.title}>SafeHaven</Text>
          <Text style={styles.subtitle}>Your safety companion in emergencies</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={!loading}
            />
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.emergencyContainer}>
            <Text style={styles.emergencyText}>In an emergency?</Text>
            <TouchableOpacity onPress={handleEmergencyMode}>
              <Text style={styles.emergencyLink}>
                Continue without signing in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007aff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007aff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  emergencyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  emergencyLink: {
    fontSize: 16,
    color: '#ff3b30',
    fontWeight: '600',
  },
});

export default PhoneAuthScreen;
