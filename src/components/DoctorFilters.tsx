import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { branchesService, type Branch } from '../services/branchesService';
import { departmentsService, type Department } from '../services/departmentsService';
import { doctorsService, type Doctor } from '../services/doctorsService';

interface DoctorFiltersProps {
  /** Initial selected branch ID */
  initialBranchId?: number;
  /** Initial selected department ID */
  initialDepartmentId?: number;
  /** Initial selected doctor ID */
  initialDoctorId?: number;
  /** Callback when filters change (for parent component to react) */
  onFilterChange?: (filters: FilterState) => void;
  /** Whether to navigate to doctor details on search (default: true) */
  navigateOnSearch?: boolean;
  /** Custom styles for the container */
  containerStyle?: React.CSSProperties;
  /** Show/hide title "Doctors" (default: false) */
  showTitle?: boolean;
}

export interface FilterState {
  branchId: number | null;
  departmentId: number | null;
  doctorId: number | null;
}

// Custom Select Component
interface CustomSelectProps {
  options: { id: number; name: string }[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  emptyMessage?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  loading = false,
  icon,
  emptyMessage = 'No options available',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionId: number) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm('');
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: window.innerWidth <= 768 ? '100%' : '220px',
      }}
    >
      {/* Select Trigger */}
      <div
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '12px 16px',
          height: '52px',
          background: disabled ? '#F5F5F5' : '#FFFFFF',
          border: isOpen ? '2px solid #00ABDA' : '1.5px solid #E0E0E0',
          borderRadius: '12px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 4px 12px rgba(0, 171, 218, 0.15)' : 'none',
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isOpen) {
            e.currentTarget.style.borderColor = '#00ABDA';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 171, 218, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#E0E0E0';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {/* Icon */}
        {icon && (
          <div style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
            {icon}
          </div>
        )}

        {/* Text */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '15px',
            fontWeight: selectedOption ? 600 : 400,
            color: selectedOption ? '#061F42' : '#9CA3AF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
          }}>
            {loading ? 'Loading...' : selectedOption ? selectedOption.name : placeholder}
          </span>
        </div>

        {/* Clear Button */}
        {selectedOption && !disabled && (
          <div
            onClick={handleClear}
            style={{
              marginRight: '8px',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F0F0F0'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {/* Arrow */}
        <div style={{
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
          border: '1px solid #E5E7EB',
          zIndex: 1000,
          overflow: 'hidden',
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.98)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'top center',
        }}
      >
        {/* Search Input */}
        <div style={{
          padding: '12px',
          borderBottom: '1px solid #F3F4F6',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 14px',
            background: '#F9FAFB',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginRight: '10px' }}>
              <path d="M16.5 16.5L12.375 12.375M14.25 8.25C14.25 11.5637 11.5637 14.25 8.25 14.25C4.93629 14.25 2.25 11.5637 2.25 8.25C2.25 4.93629 4.93629 2.25 8.25 2.25C11.5637 2.25 14.25 4.93629 14.25 8.25Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                color: '#374151',
              }}
            />
          </div>
        </div>

        {/* Options List */}
        <div style={{
          maxHeight: '240px',
          overflowY: 'auto',
          padding: '8px',
        }}>
          {filteredOptions.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#9CA3AF',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
            }}>
              {options.length === 0 ? emptyMessage : 'No results found'}
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option.id}
                onClick={() => handleSelect(option.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: value === option.id ? '#E0F7FA' : 'transparent',
                  transition: 'all 0.15s ease',
                  animation: `slideIn 0.2s ease ${index * 0.03}s both`,
                }}
                onMouseEnter={(e) => {
                  if (value !== option.id) {
                    e.currentTarget.style.background = '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = value === option.id ? '#E0F7FA' : 'transparent';
                }}
              >
                {/* Check Icon for Selected */}
                {value === option.id && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M15 4.5L6.75 12.75L3 9" stroke="#00ABDA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  fontWeight: value === option.id ? 600 : 400,
                  color: value === option.id ? '#00838F' : '#374151',
                  flex: 1,
                }}>
                  {option.name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

const DoctorFilters: React.FC<DoctorFiltersProps> = ({
  initialBranchId,
  initialDepartmentId,
  initialDoctorId,
  onFilterChange,
  navigateOnSearch = true,
  containerStyle,
  showTitle = false,
}) => {
  const navigate = useNavigate();

  // Data states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

  // Selection states
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(initialBranchId || null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(initialDepartmentId || null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(initialDoctorId || null);

  // Loading states
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const data = await branchesService.getBranches({ active: true });
        setBranches(data);
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const data = await departmentsService.getDepartments({ active: true, with_doctors: true });
        setDepartments(data.departments);
        setFilteredDepartments(data.departments);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Filter departments when branch changes
  useEffect(() => {
    if (!selectedBranchId) {
      // No branch selected - show all departments
      setFilteredDepartments(departments);
    } else {
      // Filter departments that have doctors in the selected branch
      const departmentsWithDoctorsInBranch = departments.filter(dept => {
        if (!dept.doctors) return false;
        return dept.doctors.some(doctor => doctor.branch_id === selectedBranchId);
      });
      setFilteredDepartments(departmentsWithDoctorsInBranch);
      
      // Reset department selection if current selection is not in filtered list
      if (selectedDepartmentId && !departmentsWithDoctorsInBranch.find(d => d.id === selectedDepartmentId)) {
        setSelectedDepartmentId(null);
        setSelectedDoctorId(null);
      }
    }
  }, [selectedBranchId, departments, selectedDepartmentId]);

  // Fetch doctors when branch or department changes
  const fetchDoctors = useCallback(async () => {
    // Only fetch if at least one filter is selected
    if (!selectedBranchId && !selectedDepartmentId) {
      setFilteredDoctors([]);
      return;
    }

    try {
      setLoadingDoctors(true);
      const response = await doctorsService.getDoctors({
        active: true,
        branch_id: selectedBranchId || undefined,
        department_id: selectedDepartmentId || undefined,
        per_page: 100, // Get all matching doctors
      });
      setFilteredDoctors(response.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      setFilteredDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  }, [selectedBranchId, selectedDepartmentId]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Reset doctor selection when filters change
  useEffect(() => {
    if (selectedDoctorId && !filteredDoctors.find(d => d.id === selectedDoctorId)) {
      setSelectedDoctorId(null);
    }
  }, [filteredDoctors, selectedDoctorId]);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange?.({
      branchId: selectedBranchId,
      departmentId: selectedDepartmentId,
      doctorId: selectedDoctorId,
    });
  }, [selectedBranchId, selectedDepartmentId, selectedDoctorId, onFilterChange]);

  const handleSearch = () => {
    if (selectedDoctorId && navigateOnSearch) {
      navigate(`/doctors/${selectedDoctorId}`);
    }
  };

  // Icons for each select
  const BranchIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 11C11.6569 11 13 9.65685 13 8C13 6.34315 11.6569 5 10 5C8.34315 5 7 6.34315 7 8C7 9.65685 8.34315 11 10 11Z" stroke="#6B7280" strokeWidth="1.5"/>
      <path d="M10 18C14 14 17 11.3137 17 8C17 4.68629 13.866 2 10 2C6.13401 2 3 4.68629 3 8C3 11.3137 6 14 10 18Z" stroke="#6B7280" strokeWidth="1.5"/>
    </svg>
  );

  const DepartmentIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3.33334 17.5H16.6667" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4.16666 17.5V5.83333L10 2.5L15.8333 5.83333V17.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.5 17.5V12.5H12.5V17.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.5 9.16667H7.50833M12.5 9.16667H12.5083" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  const DoctorIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6.66667" r="3.33333" stroke="#6B7280" strokeWidth="1.5"/>
      <path d="M3.33334 17.5C3.33334 14.2783 6.31811 11.6667 10 11.6667C13.6819 11.6667 16.6667 14.2783 16.6667 17.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  const defaultContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
    justifyContent: showTitle ? 'space-between' : 'flex-end',
    alignItems: window.innerWidth <= 768 ? 'stretch' : 'center',
    padding: window.innerWidth <= 768 ? '12px 16px' : '12px 16px 12px 24px',
    width: '100%',
    minHeight: window.innerWidth <= 768 ? 'auto' : '80px',
    background: '#FFFFFF',
    borderRadius: '16px',
    boxSizing: 'border-box',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    gap: window.innerWidth <= 768 ? '12px' : '0',
  };

  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      {showTitle && (
        <h1 style={{
          fontFamily: 'Nunito, sans-serif',
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: window.innerWidth <= 768 ? '32px' : '48px',
          lineHeight: window.innerWidth <= 768 ? '36px' : '50px',
          color: '#061F42',
          margin: 0,
        }}>
          Doctors
        </h1>
      )}

      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
        alignItems: window.innerWidth <= 768 ? 'stretch' : 'center',
        gap: '12px',
        width: '100%',
        flex: window.innerWidth <= 768 ? undefined : 1,
      }}>
        {/* Branch Filter */}
        <CustomSelect
          options={branches.map(b => ({ id: b.id, name: b.name }))}
          value={selectedBranchId}
          onChange={(value) => setSelectedBranchId(value)}
          placeholder="Select Branch"
          loading={loadingBranches}
          icon={BranchIcon}
          emptyMessage="No branches available"
        />

        {/* Department Filter */}
        <CustomSelect
          options={filteredDepartments.map(d => ({ id: d.id, name: d.name }))}
          value={selectedDepartmentId}
          onChange={(value) => {
            setSelectedDepartmentId(value);
            setSelectedDoctorId(null);
          }}
          placeholder="Select Department"
          loading={loadingDepartments}
          icon={DepartmentIcon}
          emptyMessage="No departments available"
        />

        {/* Doctor Filter */}
        <CustomSelect
          options={filteredDoctors.map(d => ({ id: d.id, name: d.name }))}
          value={selectedDoctorId}
          onChange={(value) => setSelectedDoctorId(value)}
          placeholder={
            !selectedBranchId && !selectedDepartmentId 
              ? "Select branch or department first" 
              : "Select Doctor"
          }
          loading={loadingDoctors}
          disabled={!selectedBranchId && !selectedDepartmentId}
          icon={DoctorIcon}
          emptyMessage={
            !selectedBranchId && !selectedDepartmentId 
              ? "Select a branch or department first" 
              : "No doctors found"
          }
        />

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!selectedDoctorId}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: window.innerWidth <= 768 ? '100%' : '52px',
            height: '52px',
            background: selectedDoctorId 
              ? 'linear-gradient(135deg, #00ABDA 0%, #0088B0 100%)' 
              : '#E5E7EB',
            borderRadius: '12px',
            border: 'none',
            cursor: selectedDoctorId ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            boxShadow: selectedDoctorId ? '0 4px 12px rgba(0, 171, 218, 0.3)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (selectedDoctorId) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 171, 218, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = selectedDoctorId ? '0 4px 12px rgba(0, 171, 218, 0.3)' : 'none';
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DoctorFilters;
