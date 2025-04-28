import { Alert } from '../services/alerts';
import { Shelter } from '../services/shelters';
import { Report } from '../services/reports';
import { Group } from '../services/groups';

// Main Tab Navigator Param List
export type MainTabParamList = {
  Home: undefined;
  Alerts: undefined;
  Map: undefined;
  Profile: undefined;
  SOS: undefined;
};

// Root Stack Navigator Param List
export type RootStackParamList = {
  // Auth Screens
  PhoneAuth: undefined;
  VerifyOTP: { phoneNumber: string; verificationId: string };
  EmergencyMode: undefined;
  
  // Main Tab Navigator
  Main: undefined;
  
  // Detail Screens
  AlertDetail: { alertId: string; alert?: Alert };
  ShelterDetail: { shelterId: string; shelter?: Shelter };
  ReportDetail: { reportId: string; report?: Report };
  GroupDetail: { groupId: string; group?: Group };
  
  // Form Screens
  CreateReport: undefined;
  CreateGroup: undefined;
  AddContact: undefined;
};
