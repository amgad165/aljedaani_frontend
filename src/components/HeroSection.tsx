import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomepageData } from '../context/HomepageContext';
import { type Department } from '../services/departmentsService';
import { doctorsService, type Doctor } from '../services/doctorsService';
import { getTranslatedField } from '../utils/localeHelpers';
import { useTranslation } from 'react-i18next';

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
  const [isMobileViewport, setIsMobileViewport] = useState(() => window.innerWidth <= 768);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.id.toString() === value);

  const filteredOptions = options.filter(opt => {
    const name = getTranslatedField(opt.name, '');
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

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

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          opacity: disabled ? 0.75 : 1,
          background: 'rgba(255, 255, 255, 0.14)',
          backgroundColor: 'rgba(255, 255, 255, 0.14)',
          border: isOpen ? '2px solid #15C9FA' : 'none',
          boxShadow: isOpen ? '0 4px 12px rgba(0, 171, 218, 0.15)' : undefined,
          color: selectedOption ? '#061F42' : 'rgba(6, 31, 66, 0.92)',
          fontWeight: 400,
          minHeight: isMobileViewport ? '38px' : '44px',
          padding: isMobileViewport ? '8px 36px 8px 12px' : '12px 40px 12px 16px',
          borderRadius: isMobileViewport ? '8px' : '10px',
          fontSize: isMobileViewport ? '13px' : '14px',
        }}
      >
        {selectedOption ? getTranslatedField(selectedOption.name, '') : placeholder}
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: `translateY(-50%) ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`,
          transition: 'transform 0.3s ease',
          pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobileViewport ? '16px' : '20px',
            height: isMobileViewport ? '16px' : '20px',
        }}>
          <svg width={isMobileViewport ? '16' : '20'} height={isMobileViewport ? '16' : '20'} viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="rgba(6, 31, 66, 0.92)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: isMobileViewport ? '100%' : undefined,
            bottom: isMobileViewport ? undefined : '100%',
            left: 0,
            right: 0,
            marginTop: isMobileViewport ? '8px' : 0,
            marginBottom: isMobileViewport ? 0 : '8px',
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
            border: '1px solid #E5E7EB',
            zIndex: 10010,
            overflow: 'hidden',
            animation: `${isMobileViewport ? 'slideDown' : 'slideUp'} 0.25s cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          {/* Search Input */}
          <div style={{
            padding: isMobileViewport ? '8px' : '12px',
            borderBottom: '1px solid #F3F4F6',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: isMobileViewport ? '8px 10px' : '10px 14px',
              background: '#F9FAFB',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
            }}>
              <svg width={isMobileViewport ? '16' : '18'} height={isMobileViewport ? '16' : '18'} viewBox="0 0 18 18" fill="none" style={{ marginRight: isMobileViewport ? '8px' : '10px' }}>
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
                  fontSize: isMobileViewport ? '13px' : '14px',
                  color: '#374151',
                }}
              />
            </div>
          </div>

          {/* Options List */}
          <div style={{
            maxHeight: isMobileViewport ? '200px' : '240px',
            overflowY: 'auto',
            padding: isMobileViewport ? '6px' : '8px',
          }}>
            {!value && (
              <div
                onClick={() => handleSelect(0)}
                style={{
                  padding: isMobileViewport ? '9px 10px' : '12px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: isMobileViewport ? '13px' : '14px',
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
                padding: isMobileViewport ? '14px' : '20px',
                textAlign: 'center',
                color: '#9CA3AF',
                fontFamily: 'Nunito, sans-serif',
                fontSize: isMobileViewport ? '13px' : '14px',
              }}>
                No results found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  style={{
                    padding: isMobileViewport ? '9px 10px' : '12px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobileViewport ? '8px' : '10px',
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
                    <svg width={isMobileViewport ? '16' : '18'} height={isMobileViewport ? '16' : '18'} viewBox="0 0 18 18" fill="none">
                      <path d="M15 4.5L6.75 12.75L3 9" stroke="#00ABDA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: isMobileViewport ? '13px' : '14px',
                    fontWeight: value === option.id.toString() ? 600 : 400,
                    color: value === option.id.toString() ? '#00838F' : '#374151',
                    flex: 1,
                  }}>
                    {getTranslatedField(option.name, '')}
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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displaySlide, setDisplaySlide] = useState(0);
  const [incomingSlide, setIncomingSlide] = useState<number | null>(null);
  const { data: homepageData } = useHomepageData();
  const { t, i18n } = useTranslation('pages');
  
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
  const heroSlides = (homepageData?.hero_sliders || []).filter((slide: any) => Boolean(slide?.image_url));

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentSlide(0);
    setDisplaySlide(0);
    setIncomingSlide(null);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 2000);

    return () => window.clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    if (currentSlide === displaySlide) return;

    setIncomingSlide(currentSlide);

    const settle = window.setTimeout(() => {
      setDisplaySlide(currentSlide);
      setIncomingSlide(null);
    }, 650);

    return () => {
      window.clearTimeout(settle);
    };
  }, [currentSlide, displaySlide]);

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

  const getSlideImage = (slideIndex: number) => {
    const slide = heroSlides[slideIndex];
    if (window.innerWidth <= 768 && slide?.mobile_image_url) {
      return slide.mobile_image_url;
    }
    return slide?.image_url || '/assets/img/hero-img.webp';
  };

  const displayImage = getSlideImage(displaySlide);
  const incomingImage = incomingSlide !== null ? getSlideImage(incomingSlide) : null;

  const mobileTitleStyle = {
    fontSize: i18n.language === 'ar' ? '28px' : '30px',
    lineHeight: i18n.language === 'ar' ? '34px' : '36px',
    marginBottom: '12px',
    color: '#FFFFFF',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
  } as const;

  const desktopFilterForm = (
    <form className="form" onSubmit={handleSearch}>
      <div className="input-wrapper d-flex flex-column position-relative">
        <CustomSelect
          options={branches.map(b => ({ id: b.id, name: b.name }))}
          value={selectedBranch}
          onChange={handleBranchChange}
          placeholder={t('selectBranch')}
        />
      </div>
      <div className="input-wrapper d-flex flex-column position-relative">
        <CustomSelect
          options={filteredDepartments.map(dept => ({ id: dept.id, name: dept.name }))}
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          placeholder={t('selectDepartment')}
        />
      </div>
      <div className="input-wrapper d-flex flex-column position-relative">
        <CustomSelect
          options={doctors.map(d => ({ id: d.id, name: d.name }))}
          value={selectedDoctor}
          onChange={(value) => setSelectedDoctor(value)}
          placeholder={t('selectDoctor')}
          disabled={doctors.length === 0}
        />
      </div>
      <button type="submit" className="icon">
        <img src="/assets/img/icons/search.svg" width="24" height="24" alt="Search Icon" />
      </button>
    </form>
  );

  const mobileFilterForm = (
    <form
      onSubmit={handleSearch}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div>
        <CustomSelect
          options={branches.map(b => ({ id: b.id, name: b.name }))}
          value={selectedBranch}
          onChange={handleBranchChange}
          placeholder={t('selectBranch')}
        />
      </div>
      <div>
        <CustomSelect
          options={filteredDepartments.map(dept => ({ id: dept.id, name: dept.name }))}
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          placeholder={t('selectDepartment')}
        />
      </div>
      <div>
        <CustomSelect
          options={doctors.map(d => ({ id: d.id, name: d.name }))}
          value={selectedDoctor}
          onChange={(value) => setSelectedDoctor(value)}
          placeholder={t('selectDoctor')}
          disabled={doctors.length === 0}
        />
      </div>
      <button
        type="submit"
        style={{
          height: '38px',
          border: 'none',
          borderRadius: '10px',
          background: '#061F42',
          color: '#FFFFFF',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {i18n.language === 'ar' ? 'بحث' : 'Search'}
      </button>
    </form>
  );

  if (isMobile) {
    return (
      <section
        style={{
          position: 'relative',
          overflow: 'visible',
          marginTop: '70px',
          paddingTop: 0,
          paddingBottom: 0,
          background: '#8FF5F7',
        }}
        className="hero-sec"
      >
        <style>{`
          @keyframes heroSlideIn {
            from {
              opacity: 0;
              transform: translateX(5%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>

        <div
          style={{
            position: 'relative',
            height: '460px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url('${displayImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              zIndex: 0,
            }}
          />
          {incomingImage && (
            <div
              key={`incoming-${incomingSlide}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url('${incomingImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                zIndex: 1,
                animation: 'heroSlideIn 0.65s ease forwards',
                willChange: 'opacity, transform',
              }}
            />
          )}

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(6,31,66,0.16) 0%, rgba(6,31,66,0.45) 100%)',
              zIndex: 2,
            }}
          />

          <div
            className="container"
            style={{
              position: 'relative',
              zIndex: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              paddingTop: '18px',
              paddingBottom: '14px',
            }}
          >
            <div
              className="icon-wrapper"
              style={{
                position: 'absolute',
                left: '10px',
                top: '56%',
                transform: 'translateY(-50%)',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <ul
                className="pagination"
                style={{
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {(heroSlides.length > 0 ? heroSlides : [null]).map((_, index) => (
                  <li
                    key={index}
                    className={index === currentSlide ? 'active' : ''}
                    onClick={() => setCurrentSlide(index)}
                    style={{
                      cursor: 'pointer',
                      width: '8px',
                      height: index === currentSlide ? '22px' : '8px',
                      borderRadius: '999px',
                      listStyle: 'none',
                      background: index === currentSlide ? '#15C9FA' : 'rgba(255, 255, 255, 0.75)',
                      transition: 'all 0.25s ease',
                      border: '1px solid rgba(6, 31, 66, 0.25)',
                    }}
                    aria-label={`Slide ${index + 1}`}
                  ></li>
                ))}
              </ul>
            </div>

            <div
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                maxWidth: '320px',
              }}
            >
              <h1 style={mobileTitleStyle} className="fw-exbold">
                {t('trustedCareAcross')}<br />
                <span className="fw-exbold main-title text-primary-light">{t('theKingdom')}</span>
              </h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '60px' }}>
              <a
                href="/book-appointment"
                className="btn btn-primary w-100"
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  width: '100%',
                }}
              >
                {t('bookAppointment')}
              </a>
            </div>
          </div>
        </div>

        <div
          className="container"
          style={{
            paddingTop: 0,
            paddingBottom: '12px',
            marginTop: '-60px',
            position: 'relative',
            zIndex: 30,
            overflow: 'visible',
          }}
        >
          <div
            style={{
              background: 'rgba(6, 31, 66, 0.16)',
              border: '1px solid rgba(255, 255, 255, 0.24)',
              borderRadius: '12px',
              padding: '8px',
              boxShadow: '0 8px 24px rgba(6, 31, 66, 0.2)',
              backdropFilter: 'blur(8px)',
              overflow: 'visible',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
            }}
          >
            {mobileFilterForm}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ position: 'relative', overflow: 'hidden' }} className="hero-sec">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('${displayImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      {incomingImage && (
        <div
          key={`incoming-${incomingSlide}`}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${incomingImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 1,
            animation: 'heroSlideIn 0.65s ease forwards',
            willChange: 'opacity, transform',
          }}
        />
      )}
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <style>{`
          @keyframes heroSlideIn {
            from {
              opacity: 0;
              transform: translateX(5%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
        <div 
          className="content-wrapper-1"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            marginLeft: 0,
            marginRight: 'auto',
          }}
        >
          <div style={{ maxWidth: '440px' }} className="content-wrapper">
            <h1 style={{ fontSize: '48px' }} className="fw-exbold mb-4">
              {t('trustedCareAcross')}<br />
              <span className="fw-exbold main-title text-primary-light">{t('theKingdom')}</span>
            </h1>
            <a style={{ padding: '12px 20px' }} href="/book-appointment" className="btn btn-primary w-100">
              {t('bookAppointment')}
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
          {desktopFilterForm}

          <div className="icon-wrapper">
            <ul className="pagination">
              {(heroSlides.length > 0 ? heroSlides : [null]).map((_, index) => (
                <li
                  key={index}
                  className={index === currentSlide ? 'active' : ''}
                  onClick={() => setCurrentSlide(index)}
                  style={{ cursor: 'pointer' }}
                  aria-label={`Slide ${index + 1}`}
                ></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
