import apiClient from './apiClient';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  marital_status?: string;
  nationality: string;
  religion?: string;
  medical_record_number?: string;
  national_id?: string;
  id_type?: 'medical_record' | 'national_id';
  identifier?: string;
  address?: string;
  phone: string;
  verification_token?: string;
  profile_photo?: File;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'doctor' | 'staff' | 'patient';
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    full_name?: string;
    nationality?: string;
    medical_record_number?: string;
    national_id?: string;
    marital_status?: string;
    religion?: string;
    address?: string;
    profile_photo?: string;
    is_his_patient?: boolean;
    his_patient_file_number?: string;
  };
  token: string;
}

export interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Use FormData to support file uploads
    const formData = new FormData();
    
    // Add all fields to FormData
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.password_confirmation);
    formData.append('first_name', data.first_name);
    if (data.middle_name) formData.append('middle_name', data.middle_name);
    formData.append('last_name', data.last_name);
    formData.append('gender', data.gender);
    formData.append('date_of_birth', data.date_of_birth);
    if (data.marital_status) formData.append('marital_status', data.marital_status);
    formData.append('nationality', data.nationality);
    if (data.religion) formData.append('religion', data.religion);
    if (data.medical_record_number) formData.append('medical_record_number', data.medical_record_number);
    if (data.national_id) formData.append('national_id', data.national_id);
    if (data.address) formData.append('address', data.address);
    formData.append('phone', data.phone);
    
    // Add verification_token if provided (required for secure registration)
    if (data.verification_token) {
      formData.append('verification_token', data.verification_token);
    }
    
    if (data.profile_photo && data.profile_photo instanceof File) {
      formData.append('profile_photo', data.profile_photo, data.profile_photo.name);
    }

    return apiClient.upload<AuthResponse>('/auth/register/secure', formData, 'POST');
  },

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    return apiClient.get('/user');
  },

  /**
   * Send OTP for registration (OLD - deprecated, use sendPhoneVerificationOtp)
   */
  async sendRegistrationOtp(phone: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/register/otp/send', { phone });
  },

  /**
   * Verify OTP for registration (OLD - deprecated, use verifyPhoneOtp)
   */
  async verifyRegistrationOtp(phone: string, otp: string): Promise<{ message: string; verified: boolean; verification_token?: string }> {
    const data = await apiClient.post<{ message: string; success: boolean; verification_token?: string }>('/auth/register/otp/verify', { phone, otp });
    // Backend returns 'success', frontend expects 'verified'
    return {
      ...data,
      verified: data.success,
    };
  },

  /**
   * ========================================================================
   * NEW SECURE PHONE VERIFICATION FLOW
   * ========================================================================
   */

  /**
   * Step 1: Send OTP for phone verification (NEW SECURE)
   */
  async sendPhoneVerificationOtp(phone: string, purpose: 'registration' | 'password_reset' = 'registration'): Promise<{
    success: boolean;
    message: string;
    phone_masked: string;
    verification_id: number;
    expires_in: number;
    otp?: string;
    debug?: boolean;
  }> {
    return apiClient.post('/auth/phone/verify/send-otp', { phone, purpose });
  },

  /**
   * Step 2: Verify OTP and get verification token (NEW SECURE)
   */
  async verifyPhoneOtp(phone: string, otpCode: string, verificationId: number): Promise<{
    success: boolean;
    message: string;
    verification_token: string;
    phone: string;
    expires_in: number;
    expires_at: string;
  }> {
    return apiClient.post('/auth/phone/verify/otp', {
      phone,
      otp_code: otpCode,
      verification_id: verificationId,
    });
  },

  /**
   * Step 3: Check HIS patient with phone validation (NEW SECURE)
   */
  async checkHisPatientWithPhone(
    idType: 'medical_record' | 'national_id',
    identifier: string,
    phone: string,
    verificationToken: string
  ): Promise<{
    success: boolean;
    exists_in_his: boolean;
    user_exists?: boolean;
    phone_verified: boolean;
    phone_matches_his?: boolean;
    phone_mismatch?: boolean;
    message: string;
    patient_data?: {
      name: string;
      file_number: string;
      national_id: string;
    };
    his_phone_masked?: string;
    verified_phone_masked?: string;
  }> {
    return apiClient.post('/auth/check-his-patient-with-phone', {
      id_type: idType,
      identifier,
      phone,
      verification_token: verificationToken,
    });
  },

  /**
   * Step 4: Secure registration with verification token (NEW SECURE)
   */
  async secureRegister(data: RegisterData, verificationToken: string): Promise<AuthResponse> {
    // Use FormData to support file uploads
    const formData = new FormData();
    
    // Add all fields to FormData - send medical_record_number and national_id directly
    formData.append('phone', data.phone);
    formData.append('verification_token', verificationToken);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.password_confirmation);
    formData.append('first_name', data.first_name);
    if (data.middle_name) formData.append('middle_name', data.middle_name);
    formData.append('last_name', data.last_name);
    formData.append('gender', data.gender);
    formData.append('date_of_birth', data.date_of_birth);
    if (data.marital_status) formData.append('marital_status', data.marital_status);
    formData.append('nationality', data.nationality);
    if (data.religion) formData.append('religion', data.religion);
    if (data.address) formData.append('address', data.address);
    
    // Send both medical_record_number and national_id if provided
    if (data.medical_record_number) {
      formData.append('medical_record_number', data.medical_record_number);
    }
    if (data.national_id) {
      formData.append('national_id', data.national_id);
    }
    
    if (data.profile_photo && data.profile_photo instanceof File) {
      formData.append('profile_photo', data.profile_photo, data.profile_photo.name);
    }

    return apiClient.upload<AuthResponse>('/auth/register/secure', formData, 'POST');
  },
};
