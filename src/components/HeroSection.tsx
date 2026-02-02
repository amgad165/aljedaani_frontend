import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomepageData } from '../context/HomepageContext';
import { type Department } from '../services/departmentsService';
import { doctorsService, type Doctor } from '../services/doctorsService';

// Custom Select Component
interface CustomSelectProps {
  options: { id: number; name: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.id.toString() === value);

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
    onChange(optionId.toString());
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        zIndex: isOpen ? 9999 : 1,
      }}
    >
      {/* Select Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="form-select"
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          border: isOpen ? '2px solid #00ABDA' : undefined,
          boxShadow: isOpen ? '0 4px 12px rgba(0, 171, 218, 0.15)' : undefined,
        }}
      >
        {selectedOption ? selectedOption.name : placeholder}
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: `translateY(-50%) ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`,
          transition: 'transform 0.3s ease',
          pointerEvents: 'none',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            marginBottom: '8px',
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
            border: '1px solid #E5E7EB',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
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
            {!value && (
              <div
                onClick={() => handleSelect(0)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  color: '#9CA3AF',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {placeholder}
              </div>
            )}
            {filteredOptions.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#9CA3AF',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
              }}>
                No results found
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
                    background: value === option.id.toString() ? '#E0F7FA' : 'transparent',
                    transition: 'all 0.15s ease',
                    animation: `slideIn 0.2s ease ${index * 0.03}s both`,
                  }}
                  onMouseEnter={(e) => {
                    if (value !== option.id.toString()) {
                      e.currentTarget.style.background = '#F3F4F6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = value === option.id.toString() ? '#E0F7FA' : 'transparent';
                  }}
                >
                  {value === option.id.toString() && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M15 4.5L6.75 12.75L3 9" stroke="#00ABDA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '14px',
                    fontWeight: value === option.id.toString() ? 600 : 400,
                    color: value === option.id.toString() ? '#00838F' : '#374151',
                    flex: 1,
                  }}>
                    {option.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
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

const HeroSection = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const { data: homepageData } = useHomepageData();
  
  // Data states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  // Filter states
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  // Get branches from context
  const branches = homepageData?.branches || [];

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Load departments from context when available
  useEffect(() => {
    if (homepageData?.departments) {
      setDepartments(homepageData.departments);
      setFilteredDepartments(homepageData.departments);
    }
  }, [homepageData]);

  // Filter departments when branch changes
  useEffect(() => {
    if (selectedBranch) {
      const filterDepartmentsByBranch = async () => {
        try {
          const doctorsInBranch = await doctorsService.getDoctors({
            active: true,
            branch_id: parseInt(selectedBranch),
            per_page: 100,
          });
          const deptIds = new Set(doctorsInBranch.data.map(d => d.department_id));
          const filtered = departments.filter(dept => deptIds.has(dept.id));
          setFilteredDepartments(filtered);
          
          // Reset department selection if not in filtered list
          if (selectedDepartment && !filtered.find(d => d.id === parseInt(selectedDepartment))) {
            setSelectedDepartment('');
            setDoctors([]);
            setSelectedDoctor('');
          }
        } catch (err) {
          console.error('Error filtering departments:', err);
        }
      };
      filterDepartmentsByBranch();
    } else {
      setFilteredDepartments(departments);
    }
  }, [selectedBranch, departments]);

  // Load doctors when branch or department changes
  useEffect(() => {
    if (selectedBranch || selectedDepartment) {
      const fetchDoctors = async () => {
        try {
          const doctorsData = await doctorsService.getDoctors({
            active: true,
            branch_id: selectedBranch ? parseInt(selectedBranch) : undefined,
            department_id: selectedDepartment ? parseInt(selectedDepartment) : undefined,
            per_page: 50,
          });
          setDoctors(doctorsData.data);
          
          // Reset doctor selection if not in new list
          if (selectedDoctor && !doctorsData.data.find(d => d.id === parseInt(selectedDoctor))) {
            setSelectedDoctor('');
          }
        } catch (err) {
          console.error('Error loading doctors:', err);
        }
      };
      fetchDoctors();
    } else {
      setDoctors([]);
      setSelectedDoctor('');
    }
  }, [selectedBranch, selectedDepartment]);

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
    setSelectedDepartment('');
    setSelectedDoctor('');
    setDoctors([]);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedDoctor('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoctor) {
      navigate(`/doctors/${selectedDoctor}`);
    } else if (selectedDepartment || selectedBranch) {
      // Navigate to doctors page with filters applied via query params
      const params = new URLSearchParams();
      if (selectedBranch) params.set('branch', selectedBranch);
      if (selectedDepartment) params.set('department', selectedDepartment);
      navigate(`/doctors?${params.toString()}`);
    } else {
      navigate('/doctors');
    }
  };

  return (
    <section style={{ backgroundImage: "url('/assets/img/hero-img.webp')" }} className="hero-sec">
      <div className="container">
        <div 
          className="content-wrapper-1"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div style={{ maxWidth: '440px' }} className="content-wrapper">
            <h1 style={{ fontSize: '48px' }} className="fw-exbold mb-4">
              Trusted care across<br />
              the <span className="fw-exbold main-title text-primary-light">Kingdom</span>
            </h1>
            <a style={{ padding: '12px 20px' }} href="/book-appointment" className="btn btn-primary w-100">
              Book appointment
            </a>
          </div>
        </div>

        <div 
          className="hero-wrapper"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
            justifyContent: 'center'
          }}
        >
          <form className="form" onSubmit={handleSearch}>
            <div className="input-wrapper d-flex flex-column position-relative">
              <CustomSelect
                options={branches.map(b => ({ id: b.id, name: b.name }))}
                value={selectedBranch}
                onChange={handleBranchChange}
                placeholder="Select Branch"
              />
            </div>
            <div className="input-wrapper d-flex flex-column position-relative">
              <CustomSelect
                options={filteredDepartments.map(dept => ({ id: dept.id, name: dept.name }))}
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                placeholder="Select Department"
              />
            </div>
            <div className="input-wrapper d-flex flex-column position-relative">
              <CustomSelect
                options={doctors.map(d => ({ id: d.id, name: d.name }))}
                value={selectedDoctor}
                onChange={(value) => setSelectedDoctor(value)}
                placeholder="Select Doctor"
                disabled={doctors.length === 0}
              />
            </div>
            <button type="submit" className="icon">
              <img src="/assets/img/icons/search.svg" width="24" height="24" alt="Search Icon" />
            </button>
          </form>

          <div className="icon-wrapper">
            <ul className="pagination">
              <li className="active"></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
