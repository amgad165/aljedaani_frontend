import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorsService, type Doctor, type PaginatedResponse } from '../services/doctorsService';
import { branchesService, type Branch } from '../services/branchesService';
import { departmentsService, type Department } from '../services/departmentsService';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import CustomSelect from '../components/CustomSelect';
import { DoctorCardSkeleton } from '../components/LoadingComponents';
import { EASINGS, getStaggerDelay } from '../utils/animations';
import FloatingContactButtons from '../components/FloatingContactButtons';

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
        maxWidth: '100%',
        height: window.innerWidth <= 768 ? 'auto' : '368px',
        background: '#FFFFFF',
        border: '1px solid #D8D8D8',
        borderRadius: '12px',
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
        maxWidth: '100%',
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
        maxWidth: '100%',
        minHeight: '36px',
      }}>
        <h3 style={{
          width: '100%',
          minHeight: '20px',
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
          minHeight: '16px',
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
        width: '100%',
        minHeight: '84px',
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
          width: '100%',
          minHeight: '24px',
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
            {/* Location icon */}
            <img
              src="/assets/images/doctors/location_icon.png"
              alt="Location"
              style={{
                width: '16px',
                height: '16px',
                objectFit: 'contain',
              }}
            />
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
          width: '100%',
          minHeight: '40px',
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
            <div style={{
              width: '6px',
              height: '6px',
              background: '#061F42',
              borderRadius: '50%',
            }} />
            <div style={{
              width: '6px',
              height: '6px',
              background: '#061F42',
              borderRadius: '50%',
            }} />
          </div>
          <div style={{
            flex: 1,
            fontFamily: 'Nunito, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#061F42',
            marginLeft: '16px',
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
        width: '100%',
        minHeight: '32px',
      }}>
        <button 
          onClick={() => doctor.status !== 'busy' && onBookNow(doctor)}
          style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '8px 12px',
          minWidth: '100px',
          height: '32px',
          background: doctor.status === 'busy' ? '#E5E7EA' : '#061F42',
          borderRadius: '8px',
          border: 'none',
          cursor: doctor.status === 'busy' ? 'not-allowed' : 'pointer',
          flex: 1,
          transition: `all 0.3s ${EASINGS.smooth}`,
        }}
        onMouseEnter={(e) => {
          if (doctor.status !== 'busy') {
            (e.currentTarget as HTMLElement).style.background = '#00ABDA';
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
          }
        }}
        onMouseLeave={(e) => {
          if (doctor.status !== 'busy') {
            (e.currentTarget as HTMLElement).style.background = '#061F42';
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }
        }}
        >
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '16px',
            textAlign: 'center',
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
            minWidth: '100px',
            height: '32px',
            background: '#15C9FA',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            flex: 1,
            transition: `all 0.3s ${EASINGS.smooth}`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#00ABDA';
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#15C9FA';
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '16px',
            textAlign: 'center',
            color: '#FFFFFF',
          }}>
            Learn More
          </span>
        </button>
      </div>
    </div>
  );
};

const DoctorsPage: React.FC = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<PaginatedResponse<Doctor> | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states - initialize from URL params
  const [selectedBranch, setSelectedBranch] = useState<string>(searchParams.get('branch') || '');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(searchParams.get('department') || '');
  
  // Sort state
  const [sortByName, setSortByName] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const handleLearnMore = (doctorId: number) => {
    navigate(`/doctors/${doctorId}`);
  };

  const handleBookNow = (doctor: Doctor) => {
    // Navigate to book appointment page with pre-selected doctor, branch, and department
    const params = new URLSearchParams({
      doctor_id: doctor.id.toString(),
      branch_id: doctor.branch?.id?.toString() || '',
      department_id: doctor.department?.id?.toString() || '',
    });
    navigate(`/book-appointment?${params.toString()}`);
  };

  // Fetch initial data (branches and departments)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [branchesData, departmentsData] = await Promise.all([
          branchesService.getBranches({ active: true }),
          departmentsService.getDepartments({ active: true }),
        ]);
        setBranches(branchesData);
        setDepartments(departmentsData.departments);
        setFilteredDepartments(departmentsData.departments);
      } catch (err) {
        console.error('Error loading filter data:', err);
      }
    };
    fetchInitialData();
  }, []);

  // Filter departments based on selected branch
  useEffect(() => {
    if (selectedBranch) {
      // Filter departments that have doctors in the selected branch
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

  // Fetch doctors based on filters
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const doctorsData = await doctorsService.getDoctors({
        active: true,
        per_page: 8,
        page: currentPage,
        branch_id: selectedBranch ? parseInt(selectedBranch) : undefined,
        department_id: selectedDepartment ? parseInt(selectedDepartment) : undefined,
      });
      setDoctors(doctorsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedBranch, selectedDepartment]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setCurrentPage(1);
  };

  const toggleSortByName = () => {
    setSortByName(!sortByName);
  };

  // Sort doctors by name if sorting is enabled
  const sortedDoctors = React.useMemo(() => {
    if (!doctors || !sortByName) return doctors;
    
    return {
      ...doctors,
      data: [...doctors.data].sort((a, b) => a.name.localeCompare(b.name))
    };
  }, [doctors, sortByName]);

  const renderPaginationButton = (page: number, isActive: boolean = false) => (
    <button
      key={page}
      onClick={() => setCurrentPage(page)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px',
        width: '48px',
        height: isActive ? '44px' : '48px',
        background: isActive ? '#061F42' : 'transparent',
        borderRadius: isActive ? '12px' : '24px',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <span style={{
        fontFamily: 'Nunito, sans-serif',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: '40px',
        textAlign: 'center',
        color: isActive ? '#FFFFFF' : '#061F42',
      }}>
        {page}
      </span>
    </button>
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#C9F3FF',
        overflowX: 'hidden',
        position: 'relative',
      }}>
        {ResponsiveNavbar}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '170px 20px 20px 20px',
        }}>
          <div style={{
            width: '100%',
            maxWidth: window.innerWidth <= 768 ? '100%' : '1170px',
            padding: window.innerWidth <= 768 ? '4px' : '12px',
            boxSizing: 'border-box',
          }}>
            {/* Title Section Skeleton */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px 8px 8px 24px',
              width: '100%',
              height: '80px',
              background: '#FFFFFF',
              borderRadius: '15px',
              gap: '16px',
              marginBottom: '12px',
            }}>
              <div style={{
                width: '200px',
                height: '50px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '8px',
              }} />
            </div>

            {/* Doctors Grid Skeleton */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : window.innerWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: window.innerWidth <= 768 ? '16px' : '12px',
              width: '100%',
              justifyContent: 'center',
            }}>
              {[...Array(8)].map((_, index) => (
                <DoctorCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#C9F3FF',
        overflowX: 'hidden',
        position: 'relative',
      }}>
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
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#C9F3FF',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      <FloatingContactButtons />
      {ResponsiveNavbar}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: window.innerWidth <= 768 ? '90px 12px 20px 12px' : '121px 20px 20px 20px',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        width: '100%',
      }}>
        <div style={{
          width: '100%',
          maxWidth: window.innerWidth <= 768 ? '100%' : '1400px',
          padding: window.innerWidth <= 768 ? '4px' : '12px',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}>
      {/* Title Section */}
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
        padding: window.innerWidth <= 768 ? '8px 12px' : '8px 8px 8px 24px',
        width: '100%',
        height: window.innerWidth <= 768 ? 'auto' : '80px',
        background: '#FFFFFF',
        borderRadius: '15px',
        marginBottom: '5px',
        gap: window.innerWidth <= 768 ? '12px' : '0',
        boxSizing: 'border-box',
      }}>
        <h1 style={{
          fontFamily: 'Nunito, sans-serif',
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: window.innerWidth <= 768 ? '28px' : '44px',
          lineHeight: window.innerWidth <= 768 ? '32px' : '50px',
          color: '#061F42',
          margin: 0,
          flexGrow: 1,
        }}>
          Doctors
        </h1>

        {/* Selection dropdowns */}
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          alignContent: 'flex-start',
          padding: window.innerWidth <= 768 ? '0' : '12px',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.001)',
          borderRadius: '12px',
          width: window.innerWidth <= 768 ? '100%' : 'auto',
        }}>
          {/* Branch Filter */}
          <div style={{ width: window.innerWidth <= 768 ? '100%' : '180px' }}>
            <CustomSelect
              placeholder="Select Branch"
              value={selectedBranch}
              onChange={(value) => handleBranchChange(value)}
              options={branches.map(branch => ({
                value: String(branch.id),
                label: branch.name
              }))}
              searchable={false}
            />
          </div>

          {/* Department Filter */}
          <div style={{ width: window.innerWidth <= 768 ? '100%' : '180px' }}>
            <CustomSelect
              placeholder="Select Department"
              value={selectedDepartment}
              onChange={(value) => handleDepartmentChange(value)}
              options={filteredDepartments.map(dept => ({
                value: String(dept.id),
                label: dept.name
              }))}
              searchable={false}
            />
          </div>

          {/* Sort Button */}
          <button 
            onClick={toggleSortByName}
            style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '12px 16px',
            width: window.innerWidth <= 768 ? '100%' : '200px',
            height: '40px',
            background: sortByName ? '#00ABDA' : '#061F42',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            gap: '8px',
              transition: `all 0.3s ${EASINGS.smooth}`,
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = sortByName ? '#0096C4' : '#00ABDA';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = sortByName ? '#00ABDA' : '#061F42';
            }}
          >
            <img
              src="/assets/images/doctors/sort-up.png"
              alt="Sort"
              style={{
                width: '24px',
                height: '24px',
                objectFit: 'contain',
                transform: sortByName ? 'rotate(0deg)' : 'rotate(0deg)',
                transition: `transform 0.3s ${EASINGS.smooth}`,
              }}
            />
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '20px',
              lineHeight: '20px',
              color: '#FFFFFF',
            }}>
              {sortByName ? 'Unsort' : 'Sort By Name'}
            </span>
          </button>
        </div>
      </div>

      {/* Results Text */}
      <div style={{
        width: '100%',
        minHeight: '40px',
        fontFamily: 'Nunito, sans-serif',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: window.innerWidth <= 768 ? '14px' : '16px',
        lineHeight: window.innerWidth <= 768 ? '20px' : '40px',
        marginBottom: '10px',
        padding: window.innerWidth <= 768 ? '8px 0' : '0',
      }}>
        <span style={{ color: '#A4A5A5' }}>Displaying results for </span>
        <span style={{ color: '#061F42' }}>
          <span 
            onClick={() => navigate('/doctors')}
            style={{
              cursor: 'pointer',
              textDecoration: 'underline',
              color: '#061F42',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#00ABDA'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#061F42'}
          >
            Doctors
          </span>
          {selectedBranch && branches.find(b => b.id === parseInt(selectedBranch)) && (
            <>
              {' > '}
              <span 
                onClick={() => setSelectedBranch('')}
                style={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  color: '#061F42',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#00ABDA'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#061F42'}
              >
                {branches.find(b => b.id === parseInt(selectedBranch))?.name}
              </span>
            </>
          )}
          {selectedDepartment && filteredDepartments.find(d => d.id === parseInt(selectedDepartment)) && (
            <>
              {' > '}
              <span 
                onClick={() => setSelectedDepartment('')}
                style={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  color: '#061F42',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#00ABDA'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#061F42'}
              >
                {filteredDepartments.find(d => d.id === parseInt(selectedDepartment))?.name}
              </span>
            </>
          )}
          {!selectedBranch && !selectedDepartment && ' > All'}
        </span>
      </div>

      {/* Doctors Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth <= 550 ? '1fr' : window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: window.innerWidth <= 768 ? '16px' : '36px',
        width: '100%',
        justifyContent: 'center',
      }}>
        {sortedDoctors?.data.map((doctor, index) => (
          <div
            key={doctor.id}
            style={{
              opacity: 0,
              animation: `fadeIn 0.5s ${EASINGS.smooth} ${getStaggerDelay(index, 80)}ms forwards`,
            }}
          >
            <DoctorCard doctor={doctor} onLearnMore={handleLearnMore} onBookNow={handleBookNow} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {sortedDoctors && sortedDoctors.last_page > 1 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '12px 0px',
          width: '100%',
          height: '72px',
          marginTop: '24px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: '0px',
            gap: '8px',
          }}>
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px',
                width: '48px',
                height: '48px',
                borderRadius: '24px',
                border: 'none',
                background: 'transparent',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 1) {
                  (e.currentTarget as HTMLElement).style.background = '#F0F9FF';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#061F42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, sortedDoctors.last_page) }, (_, i) => {
              let page = i + 1;
              if (sortedDoctors.last_page > 5 && currentPage > 3) {
                page = currentPage - 2 + i;
                if (page > sortedDoctors.last_page) {
                  page = sortedDoctors.last_page - 4 + i;
                }
              }
              return renderPaginationButton(page, page === currentPage);
            })}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(Math.min(sortedDoctors.last_page, currentPage + 1))}
              disabled={currentPage === sortedDoctors.last_page}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px',
                width: '48px',
                height: '48px',
                borderRadius: '24px',
                border: 'none',
                background: 'transparent',
                cursor: currentPage === sortedDoctors.last_page ? 'not-allowed' : 'pointer',
                opacity: currentPage === sortedDoctors.last_page ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (currentPage !== sortedDoctors.last_page) {
                  (e.currentTarget as HTMLElement).style.background = '#F0F9FF';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#061F42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* No results message */}
      {sortedDoctors && sortedDoctors.data.length === 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '200px',
          fontFamily: 'Nunito, sans-serif',
          fontSize: '18px',
          color: '#6A6A6A',
        }}>
          No doctors found matching your criteria.
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage;