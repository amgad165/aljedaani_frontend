import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentsService, type Department } from '../services/departmentsService';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import { DepartmentCardSkeleton } from '../components/LoadingComponents';
import { EASINGS, getStaggerDelay } from '../utils/animations';
import FloatingContactButtons from '../components/FloatingContactButtons';

const DepartmentsPage: React.FC = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const navigate = useNavigate();
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const branchesInitialized = useRef(false);
  const fetchInProgress = useRef(false);

  useEffect(() => {
    // Prevent duplicate fetches
    if (fetchInProgress.current) return;

    const fetchData = async () => {
      try {
        fetchInProgress.current = true;
        setLoading(true);
        
        // Fetch departments with branch filter
        const params: {
          active: boolean;
          with_doctors: boolean;
          with_branches?: boolean;
          branch_id?: number;
        } = {
          active: true,
          with_doctors: true,
          with_branches: !branchesInitialized.current, // Only fetch branches once
        };
        
        if (selectedBranchId !== null) {
          params.branch_id = selectedBranchId;
        }
        
        const result = await departmentsService.getDepartments(params);
        setFilteredDepartments(result.departments);
        
        // Set branches only on first load
        if (result.branches && !branchesInitialized.current) {
          setBranches(result.branches);
          branchesInitialized.current = true;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
      }
    };

    fetchData();
  }, [selectedBranchId]);



  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#C9F3FF',
        paddingTop: '0px',
      }}>
        {ResponsiveNavbar}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
            paddingTop: '170px',
          
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            isolation: 'isolate',
            position: 'relative',
            width: '100%',
            maxWidth: '1400px',
            background: '#C9F3FF',
            borderRadius: '15px',
            padding: '24px',
            paddingTop: '10px',
          }}>
            {/* Title Section Skeleton */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px 8px 8px 24px',
              width: '1400px',
              height: '80px',
              background: '#FFFFFF',
              borderRadius: '15px',
              gap: '16px',
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

            {/* Results Text Skeleton */}
            <div style={{
              width: '1400px',
              height: '40px',
            }}>
              <div style={{
                width: '300px',
                height: '20px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '4px',
                marginTop: '10px',
              }} />
            </div>

            {/* Section Title Skeleton */}
            <div style={{
              width: '250px',
              height: '40px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '8px',
              marginBottom: '12px',
              alignSelf: 'flex-start',
            }} />

            {/* Departments Grid Skeleton */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
              width: '100%',
              marginBottom: '40px',
            }}>
              {[...Array(9)].map((_, index) => (
                <DepartmentCardSkeleton key={index} />
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
        paddingTop: '0px',
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
      background: '#C9F3FF',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <FloatingContactButtons />
      {ResponsiveNavbar}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginTop: '170px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          isolation: 'isolate',
          position: 'relative',
          width: '100%',
          maxWidth: '1400px',
          background: '#C9F3FF',
          borderRadius: '15px',
          padding: '24px',
          paddingTop: '10px',
        }}>
      {/* Title Section */}
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
        padding: window.innerWidth <= 768 ? '8px 12px' : '8px 8px 8px 24px',
        width: window.innerWidth <= 768 ? '100%' : '1400px',
        maxWidth: '100%',
        height: window.innerWidth <= 768 ? 'auto' : '80px',
        background: '#FFFFFF',
        borderRadius: '15px',
        gap: '16px',
      }}>
        <h1 style={{
          fontFamily: 'Nunito, sans-serif',
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: window.innerWidth <= 768 ? '28px' : '48px',
          lineHeight: window.innerWidth <= 768 ? '32px' : '50px',
          color: '#061F42',
          margin: 0,
          flexGrow: 1,
        }}>
          Departments
        </h1>

        {/* Search and Sort Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          alignContent: 'flex-end',
          padding: '12px',
          gap: '8px',
          width: '780px',
          height: '64px',
          background: 'rgba(0, 0, 0, 0.001)',
          borderRadius: '12px',
          flex: 'none',
          order: 1,
          flexGrow: 0,
        }}>
          {/* Branch Filter Dropdown */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '0px',
            gap: '8px',
            width: '708px',
            height: '40px',
            borderRadius: '0px',
            flex: 'none',
            order: 0,
            flexGrow: 1,
            position: 'relative',
          }}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '8px 12px',
                gap: '12px',
                width: '708px',
                height: '40px',
                border: '1.5px solid #DADADA',
                borderRadius: '8px',
                cursor: 'pointer',
                background: '#FFFFFF',
                flex: 'none',
                order: 1,
                alignSelf: 'stretch',
                flexGrow: 0,
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '0px',
                gap: '12px',
                width: '648px',
                height: '16px',
                flex: 'none',
                order: 0,
                flexGrow: 1,
              }}>
                <span style={{
                  width: '648px',
                  height: '16px',
                  fontFamily: 'Nunito, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6A6A6A',
                  flex: 'none',
                  order: 1,
                  flexGrow: 1,
                }}>
                  {selectedBranchId === null 
                    ? 'All Branches' 
                    : branches.find(b => b.id === selectedBranchId)?.name || 'All Branches'
                  }
                </span>
              </div>
              {/* Dropdown arrow */}
              <img
                src="/assets/images/departments/nav-arrow-down.png"
                alt="Dropdown arrow"
                style={{
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain',
                  flex: 'none',
                  order: 1,
                  flexGrow: 0,
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}
              />
            </div>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '44px',
                left: 0,
                width: '100%',
                maxHeight: '300px',
                overflowY: 'auto',
                background: '#FFFFFF',
                border: '1.5px solid #DADADA',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
              }}>
                <div
                  onClick={() => {
                    setSelectedBranchId(null);
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '14px',
                    color: selectedBranchId === null ? '#00ABDA' : '#000000',
                    fontWeight: selectedBranchId === null ? 600 : 500,
                    background: selectedBranchId === null ? '#F0F9FF' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBranchId !== null) {
                      (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBranchId !== null) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  All Branches
                </div>
                {branches.map(branch => (
                  <div
                    key={branch.id}
                    onClick={() => {
                      setSelectedBranchId(branch.id);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: '14px',
                      color: selectedBranchId === branch.id ? '#00ABDA' : '#000000',
                      fontWeight: selectedBranchId === branch.id ? 600 : 500,
                      background: selectedBranchId === branch.id ? '#F0F9FF' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedBranchId !== branch.id) {
                        (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedBranchId !== branch.id) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }
                    }}
                  >
                    {branch.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort Button */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: '0px',
            gap: '10px',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            flex: 'none',
            order: 1,
            flexGrow: 0,
          }}>
            <button style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0px',
              width: '40px',
              height: '40px',
              background: '#FFFFFF',
              border: '1px solid #061F42',
              borderRadius: '8px',
              cursor: 'pointer',
              flex: 'none',
              order: 0,
              flexGrow: 0,
            }}>
              <img
                src="/assets/images/departments/sort.svg"
                alt="Sort"
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'contain',
                  flex: 'none',
                  order: 2,
                  flexGrow: 0,
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Results Text */}
      <div style={{
        width: '1330px',
        height: '40px',
        fontFamily: 'Nunito, sans-serif',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '16px',
        lineHeight: '40px',
      }}>
        <span style={{ color: '#A4A5A5' }}>Displaying results for </span>
        <span style={{ color: '#061F42' }}>
          <span 
            onClick={() => {
              navigate('/departments');
              setSelectedBranchId(null);
            }}
            style={{
              cursor: 'pointer',
              textDecoration: 'underline',
              color: '#061F42',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#00ABDA'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#061F42'}
          >
            Departments
          </span>
        </span>
      </div>

      {/* Section Title */}
      <h2 style={{
        width: '100%',
        height: '40px',
        fontFamily: 'Nunito, sans-serif',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '32px',
        lineHeight: '40px',
        color: '#061F42',
        margin: 0,
      }}>
        Select Department
      </h2>

      {/* Departments Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        width: '100%',
        marginBottom: '40px',
      }}>
        {filteredDepartments.map((department, index) => (
          <div
            key={department.id}
            onClick={() => navigate(`/departments/${department.id}`)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '32px 24px',
              gap: '16px',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FCFF 100%)',
              border: '1px solid #E5F4FF',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: `all 0.4s ${EASINGS.smooth}`,
              opacity: 0,
              animation: `fadeIn 0.5s ${EASINGS.smooth} ${getStaggerDelay(index, 60)}ms forwards`,
              boxShadow: '0 2px 8px rgba(0, 171, 218, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              const element = e.currentTarget as HTMLElement;
              element.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #E8F8FF 100%)';
              element.style.transform = 'translateY(-8px)';
              element.style.boxShadow = '0 12px 24px rgba(0, 171, 218, 0.18)';
              element.style.borderColor = '#00ABDA';
            }}
            onMouseLeave={(e) => {
              const element = e.currentTarget as HTMLElement;
              element.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #F8FCFF 100%)';
              element.style.transform = 'translateY(0)';
              element.style.boxShadow = '0 2px 8px rgba(0, 171, 218, 0.08)';
              element.style.borderColor = '#E5F4FF';
            }}
          >
            {/* Decorative Corner Element */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(0, 171, 218, 0.08) 0%, rgba(0, 171, 218, 0.02) 100%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />

            {/* Icon Container */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '80px',
              height: '80px',
              position: 'relative',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.stopPropagation();
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.1) rotate(5deg)';
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              (e.currentTarget as HTMLElement).style.transform = 'scale(1) rotate(0deg)';
            }}
            >
              {/* Department Icon */}
              <img 
                src={department.icon || '/assets/images/departments/icon.png'} 
                alt={`${department.name} Icon`} 
                style={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 171, 218, 0.2))',
                }} 
              />
            </div>

            {/* Department Title */}
            <h3 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '26px',
              color: '#061F42',
              margin: 0,
              textAlign: 'center',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {department.name}
            </h3>

            {/* Doctor Count Badge */}
            {department.doctors_count !== undefined && department.doctors_count > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                background: 'rgba(0, 171, 218, 0.08)',
                borderRadius: '20px',
                fontSize: '13px',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                color: '#00ABDA',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>{department.doctors_count} {department.doctors_count === 1 ? 'Doctor' : 'Doctors'}</span>
              </div>
            )}

            {/* View Details Arrow */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
              fontSize: '14px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              color: '#00ABDA',
              transition: 'gap 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.stopPropagation();
              (e.currentTarget as HTMLElement).style.gap = '10px';
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              (e.currentTarget as HTMLElement).style.gap = '6px';
            }}
            >
              <span>View Details</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* No results message */}
      {filteredDepartments.length === 0 && (
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
          No departments found matching your search.
        </div>
      )}
      </div>
      </div>
    </div>
  );
};

export default DepartmentsPage;