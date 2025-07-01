import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  MapPin, 
  Users, 
  Phone,
  ChevronRight,
  Edit3,
  LogOut,
  HelpCircle
} from 'lucide-react-native';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'safe' | 'help' | 'emergency';
  avatar?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export default function ProfileScreen() {
  const [userProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    status: 'safe',
  });

  const [emergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Jane Doe', phone: '+1 (555) 234-5678', relation: 'Spouse' },
    { id: '2', name: 'Mike Smith', phone: '+1 (555) 345-6789', relation: 'Brother' },
    { id: '3', name: 'Sarah Johnson', phone: '+1 (555) 456-7890', relation: 'Friend' },
  ]);

  const [notifications, setNotifications] = useState({
    emergencyAlerts: true,
    weatherUpdates: true,
    trafficAlerts: false,
    communityUpdates: true,
  });

  const [privacy, setPrivacy] = useState({
    shareLocation: true,
    allowContacts: true,
    publicProfile: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return '#10b981';
      case 'help': return '#f59e0b';
      case 'emergency': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe': return 'Safe';
      case 'help': return 'Need Help';
      case 'emergency': return 'Emergency';
      default: return 'Unknown';
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {
          // Handle logout logic
          console.log('User logged out');
        }},
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || <ChevronRight color="#9ca3af" size={20} strokeWidth={2} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editButton}>
            <Edit3 color="#ef4444" size={20} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {userProfile.avatar ? (
                <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User color="#6b7280" size={32} strokeWidth={2} />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile.name}</Text>
              <Text style={styles.profileEmail}>{userProfile.email}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(userProfile.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(userProfile.status) }]}>
                  {getStatusText(userProfile.status)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.profileDetailItem}>
              <Phone color="#6b7280" size={16} strokeWidth={2} />
              <Text style={styles.profileDetailText}>{userProfile.phone}</Text>
            </View>
            <View style={styles.profileDetailItem}>
              <MapPin color="#6b7280" size={16} strokeWidth={2} />
              <Text style={styles.profileDetailText}>{userProfile.location}</Text>
            </View>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <TouchableOpacity>
              <Text style={styles.addButton}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <Users color="#ef4444" size={20} strokeWidth={2} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRelation}>{contact.relation}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <TouchableOpacity style={styles.contactEditButton}>
                <Edit3 color="#9ca3af" size={16} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingItem
            icon={<Bell color="#ef4444" size={20} strokeWidth={2} />}
            title="Emergency Alerts"
            subtitle="Critical emergency notifications"
            rightElement={
              <Switch
                value={notifications.emergencyAlerts}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, emergencyAlerts: value }))}
                trackColor={{ false: '#f3f4f6', true: '#fecaca' }}
                thumbColor={notifications.emergencyAlerts ? '#ef4444' : '#9ca3af'}
              />
            }
          />
          
          <SettingItem
            icon={<Bell color="#3b82f6" size={20} strokeWidth={2} />}
            title="Weather Updates"
            subtitle="Weather-related alerts"
            rightElement={
              <Switch
                value={notifications.weatherUpdates}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, weatherUpdates: value }))}
                trackColor={{ false: '#f3f4f6', true: '#dbeafe' }}
                thumbColor={notifications.weatherUpdates ? '#3b82f6' : '#9ca3af'}
              />
            }
          />
          
          <SettingItem
            icon={<Bell color="#f59e0b" size={20} strokeWidth={2} />}
            title="Traffic Alerts"
            subtitle="Road closures and traffic updates"
            rightElement={
              <Switch
                value={notifications.trafficAlerts}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, trafficAlerts: value }))}
                trackColor={{ false: '#f3f4f6', true: '#fef3c7' }}
                thumbColor={notifications.trafficAlerts ? '#f59e0b' : '#9ca3af'}
              />
            }
          />
          
          <SettingItem
            icon={<Bell color="#10b981" size={20} strokeWidth={2} />}
            title="Community Updates"
            subtitle="Local community notifications"
            rightElement={
              <Switch
                value={notifications.communityUpdates}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, communityUpdates: value }))}
                trackColor={{ false: '#f3f4f6', true: '#d1fae5' }}
                thumbColor={notifications.communityUpdates ? '#10b981' : '#9ca3af'}
              />
            }
          />
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <SettingItem
            icon={<MapPin color="#ef4444" size={20} strokeWidth={2} />}
            title="Share Location"
            subtitle="Allow emergency contacts to see your location"
            rightElement={
              <Switch
                value={privacy.shareLocation}
                onValueChange={(value) => setPrivacy(prev => ({ ...prev, shareLocation: value }))}
                trackColor={{ false: '#f3f4f6', true: '#fecaca' }}
                thumbColor={privacy.shareLocation ? '#ef4444' : '#9ca3af'}
              />
            }
          />
          
          <SettingItem
            icon={<Users color="#3b82f6" size={20} strokeWidth={2} />}
            title="Allow Contact Requests"
            subtitle="Let others add you as emergency contact"
            rightElement={
              <Switch
                value={privacy.allowContacts}
                onValueChange={(value) => setPrivacy(prev => ({ ...prev, allowContacts: value }))}
                trackColor={{ false: '#f3f4f6', true: '#dbeafe' }}
                thumbColor={privacy.allowContacts ? '#3b82f6' : '#9ca3af'}
              />
            }
          />
          
          <SettingItem
            icon={<Shield color="#10b981" size={20} strokeWidth={2} />}
            title="Public Profile"
            subtitle="Make your profile visible to community"
            rightElement={
              <Switch
                value={privacy.publicProfile}
                onValueChange={(value) => setPrivacy(prev => ({ ...prev, publicProfile: value }))}
                trackColor={{ false: '#f3f4f6', true: '#d1fae5' }}
                thumbColor={privacy.publicProfile ? '#10b981' : '#9ca3af'}
              />
            }
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <SettingItem
            icon={<Settings color="#6b7280" size={20} strokeWidth={2} />}
            title="General Settings"
            subtitle="App preferences and configuration"
            onPress={() => console.log('General settings')}
          />
          
          <SettingItem
            icon={<HelpCircle color="#6b7280" size={20} strokeWidth={2} />}
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => console.log('Help & support')}
          />
          
          <SettingItem
            icon={<LogOut color="#ef4444" size={20} strokeWidth={2} />}
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={handleLogout}
          />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  editButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  profileDetails: {
    gap: 8,
  },
  profileDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileDetailText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
  addButton: {
    fontSize: 16,
    color: '#ef4444',
    fontFamily: 'Inter-SemiBold',
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
  contactRelation: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#4b5563',
    fontFamily: 'Inter-Regular',
  },
  contactEditButton: {
    padding: 8,
  },
  settingItem: {
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
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Inter-Regular',
  },
});