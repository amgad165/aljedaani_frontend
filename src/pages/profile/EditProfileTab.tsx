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
      width: '244px',
      height: '26px',
    }}>
      {icon}
      <span style={{
        width: '218px',
        height: '16px',
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
      width: '260px',
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
    width: '368px',
  }}>
    {/* Label */}
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '0px',
      width: '368px',
      height: '24px',
    }}>
      <span style={{
        width: '368px',
        height: '24px',
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
      width: '368px',
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
    password: '',
    password_confirmation: '',
    phone: profileData.phone || '',
    address: profileData.address || '',
    maritalStatus: profileData.maritalStatus || '',
    religion: profileData.religion || '',
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      
      // Handle password update
      if (formData.password) {
        if (formData.password !== formData.password_confirmation) {
          setNotification({ type: 'error', message: 'Passwords do not match' });
          setSaving(false);
          return;
        }
        formDataToSend.append('password', formData.password);
        formDataToSend.append('password_confirmation', formData.password_confirmation);
      }

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
        setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
        
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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '12px',
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
        flexDirection: 'row',
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
        width: '300px',
        minWidth: '270px',
        maxWidth: '300px',
        background: '#F8F8F8',
        borderRadius: '12px',
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
          width: '276px',
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
          width: '276px',
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
          width: '276px',
          background: '#F8F8F8',
          borderRadius: '12px',
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
        flex: 1,
      }}>
        {/* Form Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '16px',
          gap: '12px',
          width: '100%',
          background: '#F8F8F8',
          borderRadius: '12px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: '0px',
            gap: '16px',
            width: '100%',
          }}>
            {/* Left Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              padding: '0px',
              gap: '12px',
              flex: 1,
            }}>
              {/* Change Email with Verify */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                padding: '0px',
                gap: '4px',
                width: '368px',
              }}>
                <InputField
                  label="Change Email"
                  placeholder="patient@gmail.com"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                />
                <VerifyButton />
              </div>

              {/* Change Password */}
              <InputField
                label="Change Password"
                placeholder="••••••••••••••"
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                type="password"
                hasEyeIcon={true}
              />

              {/* Change Mobile Number with Verify */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                padding: '0px',
                gap: '4px',
                width: '368px',
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
                width="368px"
                options={[
                  { value: 'single', label: 'Single' },
                  { value: 'married', label: 'Married' },
                  { value: 'divorced', label: 'Divorced' },
                  { value: 'widowed', label: 'Widowed' },
                ]}
              />

              {/* Password Confirmation (only shown if password is entered) */}
              {formData.password && (
                <InputField
                  label="Confirm Password"
                  placeholder="Confirm your new password"
                  value={formData.password_confirmation}
                  onChange={(value) => handleInputChange('password_confirmation', value)}
                  type="password"
                  hasEyeIcon={true}
                />
              )}

              {/* Religion */}
              <CustomSelect
                label="Religion"
                placeholder="Select your religion"
                value={formData.religion}
                onChange={(value) => handleInputChange('religion', value)}
                width="368px"
                options={[
                  { value: 'islam', label: 'Islam' },
                  { value: 'christianity', label: 'Christianity' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px 12px',
            width: saving ? '80px' : '71px',
            height: '32px',
            background: '#061F42',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '16px',
            color: '#FFFFFF',
          }}>
            {saving ? 'Saving...' : 'Save'}
          </span>
        </button>
      </div>
      </div>
    </div>
  );
};

export default EditProfileTab;
