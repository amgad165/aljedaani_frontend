import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorsService, type Doctor, type PaginatedResponse } from '../services/doctorsService';
import { branchesService, type Branch } from '../services/branchesService';
import { departmentsService, type Department } from '../services/departmentsService';
import Navbar from '../components/Navbar';
import CustomSelect from '../components/CustomSelect';
import { DoctorCardSkeleton } from '../components/LoadingComponents';
import { EASINGS, getStaggerDelay } from '../utils/animations';

interface DoctorCardProps {
  doctor: Doctor;
  onLearnMore: (doctorId: number) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onLearnMore }) => {
  const [isHovered, setIsHovered] = useState(false);
  
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
        width: '271px',
        maxWidth: '300px',
        height: '368px',
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
        width: '251px',
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
        width: '251px',
        height: '36px',
      }}>
        <h3 style={{
          width: '251px',
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
          width: '251px',
          height: '16px',
          fontFamily: 'Varela Round, sans-serif',
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
        width: '251px',
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
          width: '235px',
          height: '24px',
        }}>
          {/* Location Pill */}
          <div style={{
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
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4px 8px',
            gap: '4px',
            background: '#A7FAFC',
            borderRadius: '24px',
            flex: '1 1 auto',
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
          width: '235px',
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
            width: '209px',
            height: '32px',
            fontFamily: 'Varela Round, sans-serif',
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
        width: '251px',
        height: '32px',
      }}>
        <button style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '8px 12px',
          width: '121.5px',
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
            width: '121.5px',
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
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const handleLearnMore = (doctorId: number) => {
    navigate(`/doctors/${doctorId}`);
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
        fontFamily: 'Varela Round, sans-serif',
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
        background: '#C9F3FF',
      }}>
        <Navbar />
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '170px 20px 20px 20px',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '1170px',
            padding: '12px',
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
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
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
        background: '#C9F3FF',
      }}>
        <Navbar />
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
      background: '#C9F3FF',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Navbar />
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '170px 20px 20px 20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1170px',
          padding: '12px',
        }}>
      {/* Title Section */}
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
        marginBottom: '5px',
      }}>
        <h1 style={{
          fontFamily: 'Nunito, sans-serif',
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: '48px',
          lineHeight: '50px',
          color: '#061F42',
          margin: 0,
          flexGrow: 1,
        }}>
          Doctors
        </h1>

        {/* Selection dropdowns */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          alignContent: 'flex-start',
          padding: '12px',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.001)',
          borderRadius: '12px',
        }}>
          {/* Branch Filter */}
          <div style={{ width: '180px' }}>
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
          <div style={{ width: '180px' }}>
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
          <button style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '12px 16px',
            width: '200px',
            height: '40px',
            background: '#061F42',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            gap: '8px',
          }}>
            <img
              src="/assets/images/doctors/sort-up.png"
              alt="Sort"
              style={{
                width: '24px',
                height: '24px',
                objectFit: 'contain',
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
              Sort By Name
            </span>
          </button>
        </div>
      </div>

      {/* Results Text */}
      <div style={{
        width: '1120px',
        height: '40px',
        fontFamily: 'Varela Round, sans-serif',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: '40px',
        marginBottom: '10px',
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
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        width: '100%',
        justifyContent: 'center',
      }}>
        {doctors?.data.map((doctor, index) => (
          <div
            key={doctor.id}
            style={{
              opacity: 0,
              animation: `fadeIn 0.5s ${EASINGS.smooth} ${getStaggerDelay(index, 80)}ms forwards`,
            }}
          >
            <DoctorCard doctor={doctor} onLearnMore={handleLearnMore} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {doctors && doctors.last_page > 1 && (
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
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  left: '37.5%',
                  right: '37.5%',
                  top: '25%',
                  bottom: '25%',
                  background: '#061F42',
                  border: '1.5px solid #061F42',
                }} />
              </div>
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, doctors.last_page) }, (_, i) => {
              let page = i + 1;
              if (doctors.last_page > 5 && currentPage > 3) {
                page = currentPage - 2 + i;
                if (page > doctors.last_page) {
                  page = doctors.last_page - 4 + i;
                }
              }
              return renderPaginationButton(page, page === currentPage);
            })}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(Math.min(doctors.last_page, currentPage + 1))}
              disabled={currentPage === doctors.last_page}
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
                cursor: currentPage === doctors.last_page ? 'not-allowed' : 'pointer',
                opacity: currentPage === doctors.last_page ? 0.5 : 1,
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  left: '37.5%',
                  right: '37.5%',
                  top: '25%',
                  bottom: '25%',
                  background: '#061F42',
                  border: '1.5px solid #061F42',
                  transform: 'matrix(-1, 0, 0, 1, 0, 0)',
                }} />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* No results message */}
      {doctors && doctors.data.length === 0 && (
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