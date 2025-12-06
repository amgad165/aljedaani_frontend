// Profile Tab Types
export type TabType = 'dashboard' | 'edit-profile' | 'appointments' | 'lab-reports' | 'rad-reports' | 'medical-reports';

export interface TabInfo {
  id: TabType;
  label: string;
  width: string;
}

export interface ProfileData {
  name: string;
  avatar: string;
  email: string;
  phone: string;
  medicalRecordNumber: string;
  nationalId: string;
  dateOfBirth: string;
  address: string;
  maritalStatus: string;
  religion: string;
  appointments: {
    new: number;
    old: number;
  };
  documents: {
    new: number;
    old: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
}
