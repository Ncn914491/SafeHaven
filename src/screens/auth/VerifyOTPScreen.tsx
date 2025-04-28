import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { confirmPhoneAuth } from '../../services/auth';

type VerifyOTPScreenRouteProp = RouteProp<RootStackParamList, 'VerifyOTP'>;
type VerifyOTPScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VerifyOTP'>;

const VerifyOTPScreen = () => {
  const navigation = useNavigation<VerifyOTPScreenNavigationProp>();
  const route = useRoute<VerifyOTPScreenRouteProp>();
  const { phoneNumber, verificationId } = route.params;
  
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  
  useEffect(() => {
    // Countdown timer for resend code
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [timer]);
  
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter a valid verification code');
      return;
    }
    
    try {
      setLoading(true);
      
      // Confirm the verification code
      await confirmPhoneAuth(verificationId, verificationCode);
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error verifying code:', error);
      Alert.alert(
        'Verification Failed',
        'Invalid verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendCode = () => {
    // Navigate back to phone auth screen
    navigation.goBack();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Verify Your Number</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to {phoneNumber}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              value={verificationCode}
              onChangeText={setVerificationCode}
              maxLength={6}
              editable={!loading}
            />
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend code in {timer} seconds
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendCode}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Change Phone Number</Text>
          </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
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
    textAlign: 'center',
    letterSpacing: 8,
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
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#666',
  },
  resendText: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '600',
  },
  backButton: {
    marginTop: 30,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'underline',
  },
});

export default VerifyOTPScreen;
