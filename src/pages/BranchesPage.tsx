import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { branchesService, type Branch } from '../services/branchesService';
import { departmentsService, type Department } from '../services/departmentsService';
import { doctorsService, type Doctor } from '../services/doctorsService';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import Footer from '../components/Footer';
import { CardSkeleton } from '../components/LoadingComponents';
import { EASINGS } from '../utils/animations';
import FloatingContactButtons from '../components/FloatingContactButtons';

// Doctor Card Component (reused from DoctorsPage)
interface DoctorCardProps {
  doctor: Doctor;
  onLearnMore: (doctorId: number) => void;
  onBookNow: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onLearnMore, onBookNow }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'available_today':
        return { background: '#CFF5FF', color: '#061F42', text: 'Available Today' };
      case 'busy':
        return { background: '#EE443F', color: '#FFFFFF', text: 'Busy' };
      case 'available_soon':
        return { background: '#FFD75D', color: '#061F42', text: 'Available Soon' };
      default:
        return { background: '#CFF5FF', color: '#061F42', text: 'Available Today' };
    }
  };

  const statusStyle = getStatusStyle(doctor.status);

  return (
    <div 
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px',
        gap: '12px',
        width: '100%',
        minWidth: '260px',
        maxWidth: '300px',
        height: '368px',
        background: '#FFFFFF',
        border: '1px solid #D8D8D8',
        borderRadius: '12px',
        flex: '0 0 auto',
        transition: `all 0.3s ${EASINGS.smooth}`,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(0, 171, 218, 0.2)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Badge */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '0px 0px 8px',
        width: '100%',
        height: '32px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4px 8px',
          gap: '4px',
          height: '24px',
          background: statusStyle.background,
          borderRadius: '24px',
        }}>
          {doctor.status === 'available_today' && (
            <div style={{
              width: '10px',
              height: '10px',
              background: '#43B75D',
              borderRadius: '50%',
            }} />
          )}
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: '16px',
            textAlign: 'center',
            color: statusStyle.color,
          }}>
            {statusStyle.text}
          </span>
        </div>
      </div>

      {/* Doctor Image */}
      <div style={{
        width: '116px',
        height: '116px',
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <img
          src={doctor.image_url || '/assets/images/general/person_template.png'}
          alt={doctor.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Doctor Info */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '0px',
        width: '100%',
        height: '36px',
      }}>
        <h3 style={{
          width: '100%',
          height: '20px',
          fontFamily: 'Nunito, sans-serif',
          fontStyle: 'normal',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '20px',
          textAlign: 'center',
          color: '#061F42',
          margin: 0,
        }}>
          {doctor.name}
        </h3>
        <div style={{
          width: '100%',
          height: '16px',
          fontFamily: 'Nunito, sans-serif',
          fontStyle: 'normal',
          fontWeight: 400,
          fontSize: '12px',
          lineHeight: '16px',
          textAlign: 'center',
          color: '#061F42',
          margin: 0,
        }}>
          {doctor.specialization || doctor.department?.name || 'Specialist'}
        </div>
      </div>

      {/* Details Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '8px',
        gap: '4px',
        width: '268px',
        height: '84px',
        background: '#F8F8F8',
        borderRadius: '12px',
      }}>
        {/* Location and Department Pills */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          padding: '0px',
          gap: '4px',
          width: '252px',
          height: '24px',
        }}>
          {/* Location Pill */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (doctor.branch?.id) {
                navigate(`/branches?id=${doctor.branch.id}`);
              }
            }}
            style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4px 8px',
            gap: '4px',
            background: '#FFFFFF',
            border: '1px solid #D9D9D9',
            borderRadius: '24px',
            flex: '0 0 auto',
            cursor: doctor.branch?.id ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (doctor.branch?.id) {
              e.currentTarget.style.background = '#F0F0F0';
              e.currentTarget.style.borderColor = '#0155CB';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = '#D9D9D9';
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="6" r="2.5" stroke="#6A6A6A" strokeWidth="1.5"/>
              <path d="M8 14C8 14 13 9.5 13 6C13 3.23858 10.7614 1 8 1C5.23858 1 3 3.23858 3 6C3 9.5 8 14 8 14Z" stroke="#6A6A6A" strokeWidth="1.5"/>
            </svg>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '16px',
              color: '#6A6A6A',
            }}>
              {doctor.branch?.name || doctor.location}
            </span>
          </div>

          {/* Department Pill */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (doctor.department?.id) {
                navigate(`/departments/${doctor.department.id}`);
              }
            }}
            style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4px 8px',
            gap: '4px',
            background: '#A7FAFC',
            borderRadius: '24px',
            flex: '1 1 auto',
            cursor: doctor.department?.id ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (doctor.department?.id) {
              e.currentTarget.style.background = '#8FF0F2';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#A7FAFC';
          }}>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '16px',
              textAlign: 'center',
              color: '#061F42',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {doctor.department?.name || 'Department'}
            </span>
          </div>
        </div>

        {/* Experience and Education */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4px 8px',
          width: '252px',
          height: '40px',
          borderRadius: '12px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '0px',
            gap: '9px',
            width: '10px',
            height: '20px',
          }}>
            <div style={{ width: '6px', height: '6px', background: '#061F42', borderRadius: '50%' }} />
            <div style={{ width: '6px', height: '6px', background: '#061F42', borderRadius: '50%' }} />
          </div>
          <div style={{
            width: '226px',
            height: '32px',
            fontFamily: 'Nunito, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#061F42',
            marginLeft: '8px',
          }}>
            {doctor.experience_years} Years Of Experience<br />
            {doctor.education}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: '0px',
        gap: '8px',
        width: '268px',
        height: '32px',
      }}>
        <button 
          onClick={() => doctor.status !== 'busy' && onBookNow(doctor)}
          style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '8px 12px',
          width: '130px',
          height: '32px',
          background: doctor.status === 'busy' ? '#E5E7EA' : '#061F42',
          borderRadius: '8px',
          border: 'none',
          cursor: doctor.status === 'busy' ? 'not-allowed' : 'pointer',
          flex: 1,
        }}>
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '16px',
            color: doctor.status === 'busy' ? '#9EA2AE' : '#FFFFFF',
          }}>
            Book Now
          </span>
        </button>

        <button 
          onClick={() => onLearnMore(doctor.id)}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px 12px',
            width: '130px',
            height: '32px',
            background: '#15C9FA',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            flex: 1,
          }}>
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '16px',
            color: '#FFFFFF',
          }}>
            Learn More
          </span>
        </button>
      </div>
    </div>
  );
};

// Specialty Item Component
interface SpecialtyItemProps {
  name: string;
  icon?: string;
}

const SpecialtyItem: React.FC<SpecialtyItemProps> = ({ name, icon }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0px 0px 0px 12px',
    gap: '8px',
    width: '100%',
    minHeight: '32px',
    borderRadius: '12px',
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0px',
      width: '28px',
      height: '28px',
      flexShrink: 0,
    }}>
      {icon ? (
        <img 
          src={icon} 
          alt={name}
          style={{
            width: '20px',
            height: '20px',
            objectFit: 'contain',
          }}
        />
      ) : (
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path d="M9 1L11 7H17L12 11L14 17L9 13L4 17L6 11L1 7H7L9 1Z" stroke="#00ABDA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
    <span style={{
      fontFamily: 'Varela, sans-serif',
      fontStyle: 'normal',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: '#364153',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }}>
      {name}
    </span>
  </div>
);

// Contact Item Component
interface ContactItemProps {
  icon: 'address' | 'phone' | 'email';
  title: string;
  lines: string[];
  isMobile?: boolean;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, title, lines, isMobile = false }) => {
  const renderIcon = () => {
    switch (icon) {
      case 'address':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 11C11.6569 11 13 9.65685 13 8C13 6.34315 11.6569 5 10 5C8.34315 5 7 6.34315 7 8C7 9.65685 8.34315 11 10 11Z" stroke="#00ABDA" strokeWidth="1.67"/>
            <path d="M10 18C14 14 17 11.3137 17 8C17 4.68629 13.866 2 10 2C6.13401 2 3 4.68629 3 8C3 11.3137 6 14 10 18Z" stroke="#00ABDA" strokeWidth="1.67"/>
          </svg>
        );
      case 'phone':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18 14.5V17.5C18 17.7652 17.8946 18.0196 17.7071 18.2071C17.5196 18.3946 17.2652 18.5 17 18.5C13.0993 18.1056 9.42015 16.5192 6.49162 13.9584C3.77231 11.5878 1.78378 8.51774 0.75 5.08333C0.75 4.81812 0.855357 4.56377 1.04289 4.37623C1.23043 4.18869 1.48478 4.08333 1.75 4.08333H4.75C4.97543 4.08333 5.19254 4.16667 5.35714 4.31667C5.52174 4.46667 5.62266 4.67333 5.64 4.89583C5.67 5.31667 5.74 5.73417 5.85 6.1425C5.90799 6.35917 5.89 6.58917 5.8 6.79583C5.71 7.00333 5.55 7.17667 5.35 7.29167L4.04 8.08333C5.04 10.275 6.725 12.0167 8.8 13.0833L9.54 11.75C9.64667 11.55 9.81 11.39 10.0092 11.2992C10.2083 11.2083 10.4308 11.1908 10.6417 11.25C11.0383 11.3625 11.4433 11.4333 11.8533 11.4625C12.0742 11.48 12.2792 11.5825 12.4275 11.7492C12.5767 11.9158 12.6583 12.135 12.6567 12.3617V14.5H18Z" stroke="#00ABDA" strokeWidth="1.67"/>
          </svg>
        );
      case 'email':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5L10 11L17 5" stroke="#00ABDA" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="2" y="4" width="16" height="12" rx="2" stroke="#00ABDA" strokeWidth="1.67"/>
          </svg>
        );
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0px',
      gap: isMobile ? '12px' : '16px',
      flex: 1,
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0px',
        width: '40px',
        height: '40px',
        background: '#E1F9FF',
        borderRadius: '50%',
      }}>
        {renderIcon()}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '0px',
        gap: '4px',
        flex: 1,
      }}>
        <h4 style={{
          fontFamily: 'Nunito, sans-serif',
          fontStyle: 'normal',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '24px',
          color: '#061F42',
          margin: 0,
        }}>
          {title}
        </h4>
        {lines.map((line, i) => (
          <p key={i} style={{
            fontFamily: 'Varela, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '23px',
            color: '#4A5565',
            margin: 0,
          }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

const BranchesPage: React.FC = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Transition states
  const [branchContentKey, setBranchContentKey] = useState(0);
  const [isBranchTransitioning, setIsBranchTransitioning] = useState(false);
  
  // Gallery lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);

  // Mobile branch selector dropdown state
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  // Doctor carousel state
  const [canScrollDoctorLeft, setCanScrollDoctorLeft] = useState(false);
  const [canScrollDoctorRight, setCanScrollDoctorRight] = useState(true);
  const doctorScrollRef = React.useRef<HTMLDivElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = () => {
    const galleries = selectedBranch?.galleries || [];
    setCurrentImageIndex((prev) => (prev === 0 ? galleries.length - 1 : prev - 1));
  };

  const goToNext = () => {
    const galleries = selectedBranch?.galleries || [];
    setCurrentImageIndex((prev) => (prev === galleries.length - 1 ? 0 : prev + 1));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, selectedBranch]);

  // Check doctor scroll position
  useEffect(() => {
    const checkDoctorScroll = () => {
      if (doctorScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = doctorScrollRef.current;
        const canScrollLeft = scrollLeft > 10;
        const canScrollRight = scrollLeft < scrollWidth - clientWidth - 10;
        
        setCanScrollDoctorLeft(canScrollLeft);
        setCanScrollDoctorRight(canScrollRight);
        
        console.log('Scroll Check:', { scrollLeft, scrollWidth, clientWidth, canScrollLeft, canScrollRight, doctorsCount: doctors.length });
      }
    };

    const scrollElement = doctorScrollRef.current;
    if (scrollElement && doctors.length > 0) {
      // Initial check
      checkDoctorScroll();
      // Delayed check after render
      setTimeout(() => checkDoctorScroll(), 100);
      // Another check to be sure
      setTimeout(() => checkDoctorScroll(), 300);
      
      scrollElement.addEventListener('scroll', checkDoctorScroll);
      window.addEventListener('resize', checkDoctorScroll);
      
      return () => {
        scrollElement.removeEventListener('scroll', checkDoctorScroll);
        window.removeEventListener('resize', checkDoctorScroll);
      };
    }
  }, [doctors]);

  const scrollDoctors = (direction: 'left' | 'right') => {
    if (doctorScrollRef.current) {
      const cardWidth = 300;
      const gap = 20;
      const scrollAmount = (cardWidth + gap) * 2;
      
      const currentScroll = doctorScrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      doctorScrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });

      setTimeout(() => {
        if (doctorScrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = doctorScrollRef.current;
          setCanScrollDoctorLeft(scrollLeft > 10);
          setCanScrollDoctorRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
      }, 400);
    }
  };

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const branchesData = await branchesService.getBranches({ 
          active: true,
          with_doctors_count: true,
          with_galleries: true 
        });
        setBranches(branchesData);
        
        // Set initial branch from URL or first branch
        const branchIdFromUrl = searchParams.get('id');
        if (branchIdFromUrl) {
          const branch = branchesData.find(b => b.id === parseInt(branchIdFromUrl));
          if (branch) {
            setSelectedBranch(branch);
          } else if (branchesData.length > 0) {
            setSelectedBranch(branchesData[0]);
          }
        } else if (branchesData.length > 0) {
          setSelectedBranch(branchesData[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load branches');
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch branch details, departments, and doctors when branch changes
  useEffect(() => {
    if (!selectedBranch) return;

    const fetchBranchData = async () => {
      try {
        // Fetch doctors for this branch
        const doctorsData = await doctorsService.getDoctors({
          active: true,
          branch_id: selectedBranch.id,
        });
        setDoctors(doctorsData.data);

        // Get unique departments from doctors
        const deptIds = new Set(doctorsData.data.map(d => d.department_id));
        const allDepartments = await departmentsService.getDepartments({ active: true });
        const branchDepartments = allDepartments.departments.filter((d: Department) => deptIds.has(d.id));
        setDepartments(branchDepartments);

        // Update URL
        setSearchParams({ id: selectedBranch.id.toString() });
      } catch (err) {
        console.error('Error fetching branch data:', err);
      }
    };
    fetchBranchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch]);

  const handleBranchSelect = (branch: Branch) => {
    if (branch.id === selectedBranch?.id) return;
    
    setIsBranchTransitioning(true);
    setTimeout(() => {
      setSelectedBranch(branch);
      setBranchContentKey(prev => prev + 1);
      setIsBranchTransitioning(false);
    }, 200);
  };

  const handleLearnMore = (doctorId: number) => {
    navigate(`/doctors/${doctorId}`);
  };

  const handleBookNow = (doctor: Doctor) => {
    const params = new URLSearchParams({
      doctor_id: doctor.id.toString(),
      branch_id: doctor.branch?.id?.toString() || '',
      department_id: doctor.department?.id?.toString() || '',
    });
    navigate(`/book-appointment?${params.toString()}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#C9F3FF' }}>
        {ResponsiveNavbar}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '170px 20px 20px 20px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            maxWidth: '1400px',
            width: '100%',
          }}>
            {[...Array(6)].map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#C9F3FF' }}>
        {ResponsiveNavbar}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          fontFamily: 'Nunito, sans-serif',
          fontSize: '18px',
          color: '#EE443F',
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#C9F3FF' }}>
      <FloatingContactButtons />
      {ResponsiveNavbar}
      
      {/* Page Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: isMobile ? '90px 16px 0px' : '131px 0px 0px',
        gap: '10px',
        maxWidth: isMobile ? '100%' : '1400px',
        margin: '0 auto',
        background: '#C9F3FF',
      }}>
        {/* Title */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: isMobile ? '8px 12px' : '8px 8px 8px 24px',
          width: '100%',
          height: isMobile ? '56px' : '66px',
          background: '#FFFFFF',
          borderRadius: '15px',
        }}>
          <h1 style={{
            fontFamily: 'Nunito, sans-serif',
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: isMobile ? '28px' : '44px',
            lineHeight: isMobile ? '32px' : '50px',
            color: '#061F42',
            margin: 0,
            flexGrow: 1,
          }}>
            Branches
          </h1>
        </div>

        {/* Subtitle with Back Button */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '0px',
          gap: isMobile ? '8px' : '12px',
          width: '100%',
          minHeight: isMobile ? 'auto' : '40px',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <Link to="/" style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '6px 10px' : '8px 12px',
            gap: '8px',
            height: isMobile ? '28px' : '32px',
            background: '#FFFFFF',
            border: '1px solid #061F42',
            borderRadius: '8px',
            textDecoration: 'none',
            flexShrink: 0,
          }}>
            <svg width={isMobile ? "18" : "24"} height={isMobile ? "18" : "24"} viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: isMobile ? '12px' : '14px',
              lineHeight: '16px',
              color: '#061F42',
            }}>
              Back
            </span>
          </Link>
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 400,
            fontSize: isMobile ? '13px' : '16px',
            lineHeight: isMobile ? '20px' : '40px',
            color: '#A4A5A5',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: isMobile ? 'normal' : 'nowrap',
          }}>
            Displaying results for{' '}
            <span style={{ color: '#061F42' }}>
              <span 
                onClick={() => navigate('/branches')}
                style={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  color: '#061F42',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#00ABDA'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#061F42'}
              >
                Branches
              </span>
              {selectedBranch && ` > ${selectedBranch.name}`}
            </span>
          </span>
        </div>

        {/* Main Content Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '0px',
          width: '100%',
        }}>
          {/* Branch Tabs - Desktop & Mobile */}
          {isMobile ? (
            // Mobile: Custom Dropdown Selector
            <div style={{
              position: 'relative',
              width: '100%',
              marginBottom: '0',
            }}>
              <button
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  width: '100%',
                  height: '48px',
                  background: '#FCFCFC',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                  borderRadius: '12px 12px 0px 0px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5H17M3 10H17M3 15H17" stroke="#061F42" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '20px',
                    color: '#061F42',
                  }}>
                    {selectedBranch?.name || 'Select Branch'}
                  </span>
                </div>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none"
                  style={{
                    transform: isBranchDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="#061F42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isBranchDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    onClick={() => setIsBranchDropdownOpen(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.3)',
                      zIndex: 999,
                    }}
                  />
                  
                  {/* Dropdown List */}
                  <div style={{
                    position: 'absolute',
                    top: '48px',
                    left: 0,
                    right: 0,
                    background: '#FFFFFF',
                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
                    borderRadius: '0px 0px 12px 12px',
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}>
                    {branches.map((branch, index) => (
                      <button
                        key={branch.id}
                        onClick={() => {
                          handleBranchSelect(branch);
                          setIsBranchDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          width: '100%',
                          background: selectedBranch?.id === branch.id ? '#E1F9FF' : '#FFFFFF',
                          border: 'none',
                          borderTop: index > 0 ? '1px solid #F0F0F0' : 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                        }}
                        onTouchStart={(e) => {
                          if (selectedBranch?.id !== branch.id) {
                            e.currentTarget.style.background = '#F5F5F5';
                          }
                        }}
                        onTouchEnd={(e) => {
                          if (selectedBranch?.id !== branch.id) {
                            e.currentTarget.style.background = '#FFFFFF';
                          }
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '2px',
                        }}>
                          <span style={{
                            fontFamily: 'Nunito, sans-serif',
                            fontWeight: 600,
                            fontSize: '15px',
                            lineHeight: '20px',
                            color: '#061F42',
                            textAlign: 'left',
                          }}>
                            {branch.name}
                          </span>
                          {branch.region && (
                            <span style={{
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 400,
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: '#6B7280',
                              textAlign: 'left',
                            }}>
                              {branch.region}
                            </span>
                          )}
                        </div>
                        {selectedBranch?.id === branch.id && (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M16.25 5L7.5 13.75L3.75 10" stroke="#00ABDA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            // Desktop: Original Tab Layout
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '0px',
              gap: '0px',
            }}>
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '12px 16px',
                    height: '40px',
                    background: selectedBranch?.id === branch.id ? '#FCFCFC' : '#E6E6E6',
                    boxShadow: selectedBranch?.id === branch.id ? '0px 0px 5px rgba(0, 0, 0, 0.25)' : 'none',
                    borderRadius: '12px 12px 0px 0px',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBranch?.id !== branch.id) {
                      e.currentTarget.style.background = '#D8D8D8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBranch?.id !== branch.id) {
                      e.currentTarget.style.background = '#E6E6E6';
                    }
                  }}
                >
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: '20px',
                    lineHeight: '20px',
                    textAlign: 'center',
                    color: selectedBranch?.id === branch.id ? '#061F42' : '#A4A5A5',
                  }}>
                    {branch.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Main Content Panel */}
          <div 
            key={branchContentKey}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: isMobile ? '16px' : '24px',
              gap: isMobile ? '16px' : '24px',
              width: '100%',
              background: '#FCFCFC',
              boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
              borderRadius: '0px 12px 12px 12px',
              opacity: isBranchTransitioning ? 0 : 1,
              transform: isBranchTransitioning ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}>
            {selectedBranch && (
              <>
                {/* Branch Hero Image */}
                <div style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '1px',
                  width: '100%',
                  height: isMobile ? '250px' : '402px',
                  background: '#FFFFFF',
                  border: '1px solid #F3F4F6',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
                  borderRadius: '15px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: isMobile ? '248px' : '400px',
                    backgroundImage: `url(${(isMobile && selectedBranch.mobile_image) ? selectedBranch.mobile_image : (selectedBranch.image_url || '/assets/img/branches/default-branch.jpg')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}>
                    {/* Gradient Overlay */}
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(0deg, rgba(6, 31, 66, 0.8) 0%, rgba(0, 0, 0, 0) 100%)',
                    }} />
                    
                    {/* Branch Info */}
                    <div style={{
                      position: 'absolute',
                      left: isMobile ? '16px' : '40px',
                      bottom: isMobile ? '16px' : '24px',
                    }}>
                      <div style={{
                        display: 'inline-block',
                        padding: isMobile ? '3px 10px' : '4px 12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '1000px',
                        marginBottom: isMobile ? '6px' : '8px',
                      }}>
                        <span style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700,
                          fontSize: isMobile ? '11px' : '14px',
                          lineHeight: isMobile ? '16px' : '20px',
                          letterSpacing: '0.55px',
                          textTransform: 'uppercase',
                          color: '#00ABDA',
                        }}>
                          {selectedBranch.region || 'JEDDAH REGION'}
                        </span>
                      </div>
                      <h2 style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 700,
                        fontSize: isMobile ? '24px' : '44px',
                        lineHeight: isMobile ? '32px' : '60px',
                        color: '#FFFFFF',
                        margin: 0,
                        textShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                      }}>
                        {selectedBranch.name}
                      </h2>
                    </div>

  
                  </div>
                </div>

                {/* About Section */}
                <div style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: isMobile ? '20px 20px 1px' : '33px 33px 1px',
                  gap: '16px',
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid #F3F4F6',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
                  borderRadius: isMobile ? '12px' : '20px',
                }}>
                  <h3 style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: isMobile ? '20px' : '24px',
                    lineHeight: isMobile ? '28px' : '36px',
                    color: '#061F42',
                    margin: 0,
                  }}>
                    About {selectedBranch.name}
                  </h3>
                  <p style={{
                    fontFamily: 'Varela, sans-serif',
                    fontWeight: 400,
                    fontSize: isMobile ? '14px' : '16px',
                    lineHeight: isMobile ? '22px' : '26px',
                    color: '#4A5565',
                    margin: 0,
                  }}>
                    {selectedBranch.description || `Located in the historic and vibrant district of ${selectedBranch.region || 'Jeddah'}, our medical center stands as a beacon of advanced healthcare. We are dedicated to serving the local community with a patient-centric approach, ensuring that every individual receives personalized care of the highest standard.`}
                  </p>
                  <p style={{
                    fontFamily: 'Varela, sans-serif',
                    fontWeight: 400,
                    fontSize: isMobile ? '14px' : '16px',
                    lineHeight: isMobile ? '22px' : '26px',
                    color: '#4A5565',
                    margin: isMobile ? '0 0 16px 0' : '0 0 24px 0',
                  }}>
                    Our facility is equipped with the latest diagnostic technology and staffed by a team of experienced consultants and specialists. Whether for routine check-ups or specialized treatments, the {selectedBranch.name} offers a comfortable and welcoming environment for you and your family.
                  </p>
                </div>

                {/* Gallery Section */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: isMobile ? '0 8px' : '0',
                }}>
                  <h3 style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: isMobile ? '20px' : '24px',
                    lineHeight: isMobile ? '28px' : '36px',
                    color: '#061F42',
                    margin: 0,
                    paddingLeft: isMobile ? '8px' : '24px',
                  }}>
                    Gallery
                  </h3>
                  {(selectedBranch.galleries?.length || 0) > 0 && (
                    <button 
                      onClick={() => openLightbox(0)}
                      style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 600,
                        fontSize: isMobile ? '16px' : '20px',
                        lineHeight: isMobile ? '16px' : '20px',
                        textDecoration: 'underline',
                        color: '#0B67E7',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: isMobile ? '0 8px 0 0' : 0,
                      }}>
                      View all
                    </button>
                  )}
                </div>

                {/* Gallery Images */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  padding: '0px',
                  gap: isMobile ? '12px' : '16px',
                  width: '100%',
                }}>
                  {[0, 1, 2].map((i) => {
                    const galleryImage = selectedBranch.galleries?.[i];
                    return (
                      <div 
                        key={i} 
                        onClick={() => galleryImage && openLightbox(i)}
                        style={{
                          flex: 1,
                          height: isMobile ? '180px' : '256px',
                          width: isMobile ? '100%' : 'auto',
                          background: '#E5E7EB',
                          backgroundImage: galleryImage ? `url(${galleryImage.image_url})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: '12px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: galleryImage ? 'pointer' : 'default',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (galleryImage) {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {!galleryImage && (
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <rect x="6" y="10" width="36" height="28" rx="4" stroke="#9CA3AF" strokeWidth="2"/>
                            <circle cx="16" cy="20" r="4" stroke="#9CA3AF" strokeWidth="2"/>
                            <path d="M6 32L16 24L24 30L36 20L42 26" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Services Section */}
                <div style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '24px',
                  gap: '24px',
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid #F3F4F6',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
                  borderRadius: '20px',
                }}>
                  <h3 style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: isMobile ? '20px' : '24px',
                    lineHeight: isMobile ? '28px' : '36px',
                    color: '#061F42',
                    margin: 0,
                  }}>
                    Our Services
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gap: isMobile ? '12px 8px' : '16px 12px',
                    width: '100%',
                  }}>
                    {departments.length > 0 ? (
                      departments.map(dept => (
                        <SpecialtyItem key={dept.id} name={dept.name} icon={dept.icon} />
                      ))
                    ) : (
                      // Fallback if no departments loaded
                      ['Anaesthesia', 'Medical Imaging', 'Breast Care', 'Neonatologist', 'Nephrology', 'Cardiothoracic Surgery', 'Cardiology', 'Neurology'].map((name, i) => (
                        <SpecialtyItem key={i} name={name} />
                      ))
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: isMobile ? '20px 16px' : '24px',
                  gap: isMobile ? '16px' : '24px',
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid #F3F4F6',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
                  borderRadius: isMobile ? '12px' : '20px',
                }}>
                  <h3 style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: isMobile ? '20px' : '24px',
                    lineHeight: isMobile ? '28px' : '36px',
                    color: '#061F42',
                    margin: 0,
                  }}>
                    Contact information
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: '0px',
                    gap: isMobile ? '16px' : '24px',
                    width: '100%',
                  }}>
                    <ContactItem
                      icon="address"
                      title="Address"
                      lines={[
                        selectedBranch.address || 'King Faisal Road, Ghulail District',
                        `Jeddah 21442, Saudi Arabia`
                      ]}
                      isMobile={isMobile}
                    />
                    <ContactItem
                      icon="phone"
                      title="Phone"
                      lines={[selectedBranch.phone || '+966 12 345 6789']}
                      isMobile={isMobile}
                    />
                    <ContactItem
                      icon="email"
                      title="Email"
                      lines={[selectedBranch.email || 'ghulail@medicalcenter.sa']}
                      isMobile={isMobile}
                    />
                  </div>
                </div>

                {/* Our Doctors Section */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0px',
                  gap: '24px',
                  width: '100%',
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: isMobile ? '0px 0px 0px 8px' : '0px 0px 0px 24px',
                    gap: '10px',
                    width: '100%',
                  }}>
                    <h3 style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: isMobile ? '20px' : '24px',
                      lineHeight: isMobile ? '28px' : '38px',
                      color: '#061F42',
                      margin: 0,
                      flexGrow: 1,
                    }}>
                      Our Doctors
                    </h3>
                  </div>

                  {/* Doctors List */}
                  <div style={{
                    position: 'relative',
                    maxWidth: '100%',
                    width: '100%',
                    margin: '0 auto',
                    padding: isMobile ? '0' : '0 60px',
                    overflow: 'hidden',
                  }}>
                    {/* Left Arrow */}
                    {doctors.length > (isMobile ? 1 : 4) && canScrollDoctorLeft && (
                      <button 
                        onClick={() => scrollDoctors('left')}
                        style={{
                          position: 'absolute',
                          left: isMobile ? '-8px' : '0',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: isMobile ? '36px' : '50px',
                          height: isMobile ? '36px' : '50px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          border: '2px solid #1a7a7a',
                          color: '#1a7a7a',
                          cursor: 'pointer',
                          display: isMobile ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 100,
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1a7a7a';
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.color = '#1a7a7a';
                          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                    )}

                    {/* Inner scroll container */}
                    <div style={{
                      position: 'relative',
                      overflow: 'hidden',
                      width: '100%',
                      maxWidth: isMobile ? '100%' : '1180px',
                      margin: '0 auto',
                    }}>
                      <div 
                        ref={doctorScrollRef}
                        style={{
                          display: 'flex',
                          gap: isMobile ? '12px' : '20px',
                          overflowX: 'auto',
                          overflowY: 'hidden',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                          padding: isMobile ? '0 8px' : '0',
                          WebkitOverflowScrolling: 'touch',
                        }}
                      >
                        {doctors.length > 0 ? (
                          doctors.map(doctor => (
                            <div key={doctor.id} style={{ 
                              flex: isMobile ? '0 0 calc(100vw - 48px)' : '0 0 280px',
                              minWidth: isMobile ? 'calc(100vw - 48px)' : '280px',
                              maxWidth: isMobile ? 'calc(100vw - 48px)' : '300px',
                            }}>
                              <DoctorCard doctor={doctor} onLearnMore={handleLearnMore} onBookNow={handleBookNow} />
                            </div>
                          ))
                        ) : (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            height: '200px',
                            fontFamily: 'Nunito, sans-serif',
                            fontSize: '16px',
                            color: '#6A6A6A',
                          }}>
                            No doctors found for this branch.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Arrow */}
                    {doctors.length > (isMobile ? 1 : 4) && (
                      <button 
                        onClick={() => scrollDoctors('right')}
                        disabled={!canScrollDoctorRight}
                        style={{
                          position: 'absolute',
                          right: isMobile ? '-8px' : '0',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: isMobile ? '36px' : '50px',
                          height: isMobile ? '36px' : '50px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          border: '2px solid #1a7a7a',
                          color: '#1a7a7a',
                          cursor: canScrollDoctorRight ? 'pointer' : 'not-allowed',
                          display: isMobile ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 100,
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                          opacity: canScrollDoctorRight ? 1 : 0.4,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1a7a7a';
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.color = '#1a7a7a';
                          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Gallery Lightbox Modal */}
      {lightboxOpen && selectedBranch?.galleries && selectedBranch.galleries.length > 0 && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: isMobile ? '12px' : '24px',
              right: isMobile ? '12px' : '24px',
              width: isMobile ? '40px' : '56px',
              height: isMobile ? '40px' : '56px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              zIndex: 10001,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Image Counter */}
          <div style={{
            position: 'absolute',
            top: isMobile ? '16px' : '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.6)',
            padding: isMobile ? '6px 14px' : '8px 20px',
            borderRadius: '24px',
            zIndex: 10001,
          }}>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: isMobile ? '14px' : '16px',
              color: 'white',
            }}>
              {currentImageIndex + 1} / {selectedBranch.galleries.length}
            </span>
          </div>

          {/* Previous Button */}
          <button
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            style={{
              position: 'absolute',
              left: isMobile ? '8px' : '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: isMobile ? '44px' : '64px',
              height: isMobile ? '44px' : '64px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              zIndex: 10001,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Main Image */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '85vw',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <img
              src={selectedBranch.galleries[currentImageIndex]?.image_url}
              alt={selectedBranch.galleries[currentImageIndex]?.title || `Gallery image ${currentImageIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              }}
            />
            {/* Image Title */}
            {selectedBranch.galleries[currentImageIndex]?.title && (
              <h4 style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '20px',
                color: 'white',
                margin: 0,
                textAlign: 'center',
              }}>
                {selectedBranch.galleries[currentImageIndex].title}
              </h4>
            )}
            {/* Image Description */}
            {selectedBranch.galleries[currentImageIndex]?.description && (
              <p style={{
                fontFamily: 'Varela, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
                textAlign: 'center',
                maxWidth: '600px',
              }}>
                {selectedBranch.galleries[currentImageIndex].description}
              </p>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            style={{
              position: 'absolute',
              right: isMobile ? '8px' : '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: isMobile ? '44px' : '64px',
              height: isMobile ? '44px' : '64px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              zIndex: 10001,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Thumbnail Strip */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '12px' : '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: isMobile ? '8px' : '12px',
            padding: isMobile ? '8px 12px' : '12px 16px',
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '16px',
            maxWidth: '90vw',
            overflowX: 'auto',
          }}>
            {selectedBranch.galleries.map((gallery, index) => (
              <div
                key={gallery.id}
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                style={{
                  width: isMobile ? '60px' : '80px',
                  height: isMobile ? '45px' : '60px',
                  borderRadius: '8px',
                  backgroundImage: `url(${gallery.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  border: currentImageIndex === index ? '3px solid #00ABDA' : '3px solid transparent',
                  opacity: currentImageIndex === index ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (currentImageIndex !== index) {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentImageIndex !== index) {
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hide scrollbar for doctor carousel */}
      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default BranchesPage;
