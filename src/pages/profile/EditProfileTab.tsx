import { useState } from 'react';
import type { ProfileData } from './types';
import CustomSelect from '../../components/CustomSelect';
import { 
  IdCardIcon, 
  BirthdayIcon, 
  EyeIcon, 
  ChevronDownIcon 
} from './icons';

interface EditProfileTabProps {
  profileData: ProfileData;
  onSave?: (data: Partial<ProfileData>) => void;
  onUpdate?: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// User Info Row Component for the left panel
const UserInfoRow = ({ 
  icon, 
  value, 
  color = '#A4A5A5' 
}: { 
  icon: React.ReactNode; 
  value: string;
  color?: string;
}) => (
  <>
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '0px',
      gap: '8px',
      width: '100%',
      minHeight: '26px',
    }}>
      {icon}
      <span style={{
        flex: 1,
        minHeight: '16px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: '16px',
        color: color,
      }}>
        {value}
      </span>
    </div>
    {/* Divider */}
    <div style={{
      width: '100%',
      height: '0px',
      border: '1px solid #DADADA',
    }} />
  </>
);

// Input Field Component
const InputField = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  hasDropdown = false,
  hasEyeIcon = false,
  multiline = false,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  hasDropdown?: boolean;
  hasEyeIcon?: boolean;
  multiline?: boolean;
  disabled?: boolean;
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px',
    gap: '8px',
    width: '100%',
    maxWidth: window.innerWidth <= 768 ? '100%' : '368px',
  }}>
    {/* Label */}
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '0px',
      width: '100%',
      minHeight: '24px',
    }}>
      <span style={{
        width: '100%',
        minHeight: '24px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '24px',
        display: 'flex',
        alignItems: 'center',
        color: '#061F42',
      }}>
        {label}
      </span>
    </div>
    {/* Input */}
    <div style={{
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '12px',
      gap: '12px',
      width: '100%',
      height: multiline ? '72px' : '40px',
      border: '1.5px solid #A4A5A5',
      borderRadius: hasDropdown || hasEyeIcon ? '8px' : '12px',
      background: disabled ? '#F5F5F5' : '#FFFFFF',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '0px',
        gap: '12px',
        flex: 1,
      }}>
        {multiline ? (
          <textarea
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            style={{
              width: '100%',
              height: '48px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '16px',
              color: value ? '#061F42' : '#9EA2AE',
              border: 'none',
              outline: 'none',
              resize: 'none',
              background: 'transparent',
            }}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            style={{
              width: '100%',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '16px',
              color: value ? '#061F42' : '#9EA2AE',
              border: 'none',
              outline: 'none',
              background: 'transparent',
            }}
          />
        )}
      </div>
      {hasEyeIcon && <EyeIcon />}
      {hasDropdown && <ChevronDownIcon />}
    </div>
  </div>
);

// Verify Button Component
const VerifyButton = () => (
  <button style={{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '6px 8px',
    width: '59px',
    height: '24px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  }}>
    <span style={{
      fontFamily: 'Nunito, sans-serif',
      fontWeight: 600,
      fontSize: '10px',
      lineHeight: '12px',
      color: '#9EA2AE',
    }}>
      Verify
    </span>
  </button>
);

const EditProfileTab = ({ profileData, onSave, onUpdate }: EditProfileTabProps) => {
  const [formData, setFormData] = useState({
    email: profileData.email || '',
    phone: profileData.phone || '',
    address: profileData.address || '',
    maritalStatus: profileData.maritalStatus || '',
    religion: profileData.religion || '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Are you sure you want to delete your profile photo?')) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const formDataToSend = new FormData();
      formDataToSend.append('profile_photo', '');
      formDataToSend.append('_method', 'PUT');

      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({ type: 'success', message: 'Profile photo deleted successfully' });
        
        // Refresh user data first
        if (onUpdate) await onUpdate();
        
        // Clear preview and temp photo after refresh
        setPhotoPreview(null);
        setProfilePhoto(null);
      } else {
        throw new Error(result.message || 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      setNotification({ type: 'error', message: 'Failed to delete profile photo' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const formDataToSend = new FormData();

      // Laravel requires _method field for PUT with FormData
      formDataToSend.append('_method', 'PUT');

      // Add profile photo if selected
      if (profilePhoto) {
        formDataToSend.append('profile_photo', profilePhoto);
      }

      // Add other fields only if they have values
      if (formData.phone) formDataToSend.append('phone', formData.phone);
      if (formData.address) formDataToSend.append('address', formData.address);
      if (formData.maritalStatus) formDataToSend.append('marital_status', formData.maritalStatus);
      if (formData.religion) formDataToSend.append('religion', formData.religion);

      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({ type: 'success', message: 'Profile updated successfully' });
        
        // Refresh user data first to get updated photo URL
        if (onUpdate) await onUpdate();
        
        // Clear preview and temp photo after refresh
        setProfilePhoto(null);
        setPhotoPreview(null);
        
        if (onSave) onSave(formData);
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({ type: 'error', message: 'Failed to update profile' });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.current_password || !passwordData.password || !passwordData.password_confirmation) {
      setNotification({ type: 'error', message: 'All password fields are required' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (passwordData.password !== passwordData.password_confirmation) {
      setNotification({ type: 'error', message: 'New passwords do not match' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (passwordData.password.length < 8) {
      setNotification({ type: 'error', message: 'Password must be at least 8 characters' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      setChangingPassword(true);
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/user/change-password`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({ type: 'success', message: 'Password changed successfully. Other sessions logged out.' });
        setPasswordData({
          current_password: '',
          password: '',
          password_confirmation: '',
        });
      } else {
        throw new Error(result.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Failed to change password' });
    } finally {
      setChangingPassword(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: window.innerWidth <= 768 ? '8px' : '12px',
      gap: '12px',
      width: '100%',
      position: 'relative',
    }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 24px',
          borderRadius: '12px',
          background: notification.type === 'success' ? '#10B981' : '#EF4444',
          color: '#FFFFFF',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          zIndex: 2000,
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 500,
        }}>
          {notification.message}
        </div>
      )}
      
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
        alignItems: 'flex-start',
        gap: '12px',
        width: '100%',
      }}>
      {/* Left Panel - Profile Card */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px',
        gap: '12px',
        width: window.innerWidth <= 768 ? '100%' : '300px',
        minWidth: window.innerWidth <= 768 ? '100%' : '270px',
        maxWidth: window.innerWidth <= 768 ? '100%' : '300px',
        background: '#F8F8F8',
        borderRadius: '12px',
        boxSizing: 'border-box',
        border: '1px solid #E0E0E0'
      }}>
        {/* Profile Avatar */}
        <div style={{
          width: '116px',
          height: '116px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#F0F0F0',
        }}>
          <img 
            src={photoPreview || profileData.avatar || '/assets/images/general/person_template.png'} 
            alt={profileData.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/general/person_template.png';
            }}
          />
        </div>

        {/* Photo Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          padding: '0px',
          gap: '8px',
          width: '100%',
          height: '32px',
        }}>
          <label style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px 12px',
            flex: 1,
            height: '32px',
            background: '#FFFFFF',
            border: '1px solid #061F42',
            borderRadius: '8px',
            cursor: 'pointer',
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#061F42',
            }}>
              Change Photo
            </span>
          </label>
          <button
            onClick={handleDeletePhoto}
            disabled={saving}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px 12px',
              flex: 1,
              height: '32px',
              background: '#FFFFFF',
              border: '1px solid #061F42',
              borderRadius: '8px',
              cursor: 'pointer',
              opacity: saving ? 0.5 : 1,
            }}>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#061F42',
            }}>
              Delete Photo
            </span>
          </button>
        </div>

        {/* Name */}
        <div style={{
          width: '100%',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '20px',
          textAlign: 'center',
          color: '#061F42',
        }}>
          {profileData.name}
        </div>

        {/* User Info Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '8px',
          gap: '4px',
          width: '100%',
          background: '#F8F8F8',
          borderRadius: '12px',
          boxSizing: 'border-box',
        }}>
          <UserInfoRow 
            icon={<IdCardIcon color="#A4A5A5" />} 
            value={`MR: ${profileData.medicalRecordNumber || 'N/A'}`} 
          />
          <UserInfoRow 
            icon={<IdCardIcon color="#A4A5A5" />} 
            value={`National ID: ${profileData.nationalId || 'N/A'}`} 
          />
          <UserInfoRow 
            icon={<BirthdayIcon color="#A4A5A5" />} 
            value={profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '08/12/1988'} 
          />
        </div>
      </div>

      {/* Right Panel - Edit Form */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        padding: '0px',
        gap: '16px',
        width: '100%'
      }}>
        {/* Form Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: window.innerWidth <= 768 ? '12px' : '16px',
          gap: '12px',
          width: '100%',
          background: '#F8F8F8',
          borderRadius: '12px',
          border: '1px solid #E0E0E0'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            alignItems: 'flex-start',
            padding: '0px',
            gap: window.innerWidth <= 768 ? '12px' : '16px',
            width: '100%',
          }}>
            {/* Left Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: window.innerWidth <= 768 ? 'flex-start' : 'flex-end',
              padding: '0px',
              gap: '12px',
              flex: 1,
            }}>
              {/* Change Email with Verify */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: window.innerWidth <= 768 ? 'flex-start' : 'flex-end',
                padding: '0px',
                gap: '4px',
                width: '100%',
                maxWidth: window.innerWidth <= 768 ? '100%' : '368px',
              }}>
                <InputField
                  label="Change Email"
                  placeholder="patient@gmail.com"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  disabled={true}
                />
                <VerifyButton />
              </div>

              {/* Change Mobile Number with Verify */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: window.innerWidth <= 768 ? 'flex-start' : 'flex-end',
                padding: '0px',
                gap: '4px',
                width: '100%',
                maxWidth: window.innerWidth <= 768 ? '100%' : '368px',
              }}>
                <InputField
                  label="Change Mobile Number"
                  placeholder="+966 58 667 8356"
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                />
                <VerifyButton />
              </div>
            </div>

            {/* Right Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
              gap: '12px',
              flex: 1,
            }}>
              {/* Change Address */}
              <InputField
                label="Change Address"
                placeholder="3885 Al Bandariyyah Street Al Falah
Riyadh 13314
SAU"
                value={formData.address}
                onChange={(value) => handleInputChange('address', value)}
                multiline={true}
              />

              {/* Marital Status */}
              <CustomSelect
                label="Marital Status"
                placeholder="Select your marital status"
                value={formData.maritalStatus}
                onChange={(value) => handleInputChange('maritalStatus', value)}
                width={window.innerWidth <= 768 ? '100%' : '368px'}
                options={[
                  { value: 'single', label: 'Single' },
                  { value: 'married', label: 'Married' },
                  { value: 'divorced', label: 'Divorced' },
                  { value: 'widowed', label: 'Widowed' },
                ]}
              />

              {/* Religion */}
              <CustomSelect
                label="Religion"
                placeholder="Select your religion"
                value={formData.religion}
                onChange={(value) => handleInputChange('religion', value)}
                width={window.innerWidth <= 768 ? '100%' : '368px'}
                options={[
                  { value: 'islam', label: 'Islam' },
                  { value: 'christianity', label: 'Christianity' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Save Profile Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '12px 32px',
            height: '44px',
            background: '#061F42',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.2s ease',
            alignSelf: 'center',
          }}
          onMouseEnter={(e) => {
            if (!saving) e.currentTarget.style.background = '#0A2E5C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#061F42';
          }}
        >
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: '16px',
            lineHeight: '20px',
            color: '#FFFFFF',
          }}>
            {saving ? 'Saving Profile...' : 'Update Profile'}
          </span>
        </button>

        {/* Password Change Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: window.innerWidth <= 768 ? '12px' : '16px',
          gap: '12px',
          width: '100%',
          background: '#F8F8F8',
          borderRadius: '12px',
          border: '1px solid #E0E0E0'
        }}>
          {/* Section Title */}
          <div style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: window.innerWidth <= 768 ? '16px' : '18px',
            lineHeight: '24px',
            color: '#061F42',
            marginBottom: '4px',
          }}>
            Change Password
          </div>

          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            alignItems: 'flex-start',
            padding: '0px',
            gap: window.innerWidth <= 768 ? '12px' : '16px',
            width: '100%'
          }}>
            {/* Current Password */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
              gap: '8px',
              flex: 1
            }}>
              <div style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: '24px',
                color: '#061F42',
              }}>
                Current Password
              </div>
              <div style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '12px',
                gap: '12px',
                width: '100%',
                height: '40px',
                border: '1.5px solid #A4A5A5',
                borderRadius: '8px',
                background: '#FFFFFF',
              }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={passwordData.current_password}
                  onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                  style={{
                    width: '100%',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: passwordData.current_password ? '#061F42' : '#9EA2AE',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showCurrentPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3L21 21M10.5 10.677A2 2 0 1013.323 13.5M7.362 7.561C5.68 8.74 4.279 10.42 3 12c1.889 3.733 5.043 6 9 6 1.55 0 3.046-.354 4.417-.991m2.183-1.574C20.521 13.827 21.72 12.175 22.5 10.5c-1.889-3.733-5.043-6-9-6a9.706 9.706 0 00-2.538.331" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
              gap: '8px',
              flex: 1
            }}>
              <div style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: '24px',
                color: '#061F42',
              }}>
                New Password
              </div>
              <div style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '12px',
                gap: '12px',
                width: '100%',
                height: '40px',
                border: '1.5px solid #A4A5A5',
                borderRadius: '8px',
                background: '#FFFFFF',
              }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={passwordData.password}
                  onChange={(e) => handlePasswordChange('password', e.target.value)}
                  style={{
                    width: '100%',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: passwordData.password ? '#061F42' : '#9EA2AE',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showNewPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3L21 21M10.5 10.677A2 2 0 1013.323 13.5M7.362 7.561C5.68 8.74 4.279 10.42 3 12c1.889 3.733 5.043 6 9 6 1.55 0 3.046-.354 4.417-.991m2.183-1.574C20.521 13.827 21.72 12.175 22.5 10.5c-1.889-3.733-5.043-6-9-6a9.706 9.706 0 00-2.538.331" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
              gap: '8px',
              flex: 1
            }}>
              <div style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: '24px',
                color: '#061F42',
              }}>
                Confirm Password
              </div>
              <div style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '12px',
                gap: '12px',
                width: '100%',
                height: '40px',
                border: '1.5px solid #A4A5A5',
                borderRadius: '8px',
                background: '#FFFFFF',
              }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => handlePasswordChange('password_confirmation', e.target.value)}
                  style={{
                    width: '100%',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: passwordData.password_confirmation ? '#061F42' : '#9EA2AE',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3L21 21M10.5 10.677A2 2 0 1013.323 13.5M7.362 7.561C5.68 8.74 4.279 10.42 3 12c1.889 3.733 5.043 6 9 6 1.55 0 3.046-.354 4.417-.991m2.183-1.574C20.521 13.827 21.72 12.175 22.5 10.5c-1.889-3.733-5.043-6-9-6a9.706 9.706 0 00-2.538.331" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Change Password Button */}
          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px 16px',
              height: '32px',
              background: '#00ABDA',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              opacity: changingPassword ? 0.7 : 1,
              alignSelf: 'flex-end',
            }}
          >
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#FFFFFF',
            }}>
              {changingPassword ? 'Changing...' : 'Change Password'}
            </span>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EditProfileTab;
