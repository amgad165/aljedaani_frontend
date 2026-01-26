import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsService, type Doctor } from '../services/doctorsService';
import type { ServiceItem } from '../services/departmentsService';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import DoctorFilters from '../components/DoctorFilters';
import { LoadingSpinner } from '../components/LoadingComponents';
import { EASINGS } from '../utils/animations';
import FloatingContactButtons from '../components/FloatingContactButtons';

const DoctorDetailsPage: React.FC = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'outpatient' | 'inpatient'>('outpatient');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const doctorData = await doctorsService.getDoctor(parseInt(id));
        setDoctor(doctorData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  const renderServiceItem = (service: ServiceItem, index: number, isLast: boolean) => (
    <div key={index}>
      {/* Service Item - Title Row */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '0px',
        gap: '4px',
        width: '100%',
        height: '20px',
      }}>
        {/* Bullet */}
        <div style={{
          width: '6px',
          height: '6px',
          background: '#061F42',
          borderRadius: '50%',
          flexShrink: 0,
        }} />
        {/* Title */}
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontStyle: 'normal',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '20px',
          color: '#061F42',
        }}>
          {service.title}:
        </span>
      </div>
      
      {/* Description */}
      <div style={{
        width: '100%',
        fontFamily: 'Nunito, sans-serif',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: '16px',
        color: '#061F42',
      }}>
        {service.description}
      </div>

      {/* Divider */}
      {!isLast && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '4px 0px',
          width: '100%',
          height: '8px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            width: '100%',
            height: '0px',
            border: '1px solid #E9E9E9',
          }} />
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#C9F3FF',
      }}>
        {ResponsiveNavbar}
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#C9F3FF',
      }}>
        {ResponsiveNavbar}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          gap: '16px',
        }}>
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '18px',
            color: '#EE443F',
          }}>
            {error || 'Doctor not found'}
          </span>
          <button
            onClick={() => navigate('/doctors')}
            style={{
              padding: '12px 24px',
              background: '#061F42',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(doctor.status);
  
  const currentServices = activeTab === 'outpatient' 
    ? (doctor.outpatient_services || [])
    : (doctor.inpatient_services || []);

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
      
      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: window.innerWidth <= 768 ? '90px 12px 20px 12px' : '180px 20px 40px 20px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%',
          maxWidth: window.innerWidth <= 768 ? '100%' : '1120px',
          boxSizing: 'border-box',
        }}>
          {/* Title Section with Filters */}
          <DoctorFilters 
            showTitle={true}
            initialDepartmentId={doctor.department_id}
            initialBranchId={doctor.branch_id || undefined}
            containerStyle={{ marginBottom: '8px' }}
          />

          {/* Breadcrumb */}
          <div style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: window.innerWidth <= 768 ? '14px' : '16px',
            lineHeight: window.innerWidth <= 768 ? '20px' : '40px',
            marginBottom: '8px',
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
              {' > '}
              <span 
                onClick={() => navigate(`/doctors`)}
                style={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  color: '#061F42',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#00ABDA'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#061F42'}
              >
                {doctor.department?.name || 'Specialty'}
              </span>
              {' > '}
              <span style={{
                color: '#061F42',
              }}>
                {doctor.name}
              </span>
            </span>
          </div>

          {/* White Container - Doctor Card + Services */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: window.innerWidth <= 768 ? '16px' : '24px',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            {/* Main Content Row - Image & Info | Services */}
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
              gap: window.innerWidth <= 768 ? '24px' : '32px',
              width: '100%',
            }}>
              {/* Left Side - Doctor Image and Info */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0px',
                gap: '12px',
                width: window.innerWidth <= 768 ? '100%' : '280px',
                flexShrink: 0,
              }}>
                {/* Status Badge / Pill */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0px',
                  width: '100%',
                  maxWidth: window.innerWidth <= 768 ? '100%' : '280px',
                  height: '24px',
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
                        flexShrink: 0,
                      }} />
                    )}
                    <span style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontSize: '12px',
                      lineHeight: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'center',
                      color: statusStyle.color,
                    }}>
                      {statusStyle.text}
                    </span>
                  </div>
                </div>

                {/* Doctor Photo */}
                <div style={{
                  width: '100%',
                  maxWidth: window.innerWidth <= 768 ? '100%' : '280px',
                  height: window.innerWidth <= 768 ? 'auto' : '362px',
                  aspectRatio: window.innerWidth <= 768 ? '1 / 1' : undefined,
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}>
                  <img
                    src={doctor.image_url || '/assets/images/general/person_template.png'}
                    alt={doctor.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                {/* Title/Sub title */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0px',
                  width: '100%',
                  maxWidth: window.innerWidth <= 768 ? '100%' : '280px',
                }}>
                  {/* Title - Doctor Name */}
                  <div style={{
                    width: '100%',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    fontSize: '20px',
                    lineHeight: '30px',
                    textAlign: 'center',
                    color: '#061F42',
                  }}>
                    {doctor.name}
                  </div>
                  {/* Sub title - Specialization */}
                  <div style={{
                    width: '100%',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    textAlign: 'center',
                    color: '#061F42',
                    whiteSpace: 'pre-wrap' as const,
                    wordWrap: 'break-word' as const,
                  }}>
                    {doctor.specialization || 'Registrar'}
                  </div>
                </div>

                {/* Info Box - Frame 65 */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '8px',
                  gap: '4px',
                  width: '100%',
                  maxWidth: window.innerWidth <= 768 ? '100%' : '280px',
                  background: '#F8F8F8',
                  borderRadius: '12px',
                  boxSizing: 'border-box',
                }}>
                  {/* Pill - Location & Department Badges */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: '0px',
                    gap: '4px',
                    width: '100%',
                    minHeight: '24px',
                    flexWrap: 'wrap',
                  }}>
                    {/* Location Badge */}
                    <div style={{
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '4px 8px',
                      gap: '4px',
                      height: '24px',
                      background: '#FFFFFF',
                      border: '1px solid #D9D9D9',
                      borderRadius: '24px',
                    }}>
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
                        display: 'flex',
                        alignItems: 'center',
                        textAlign: 'center',
                        color: '#6A6A6A',
                      }}>
                        {doctor.branch?.name || doctor.location}
                      </span>
                    </div>

                    {/* Department Badge */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '4px 8px',
                      gap: '4px',
                      height: '24px',
                      background: '#A7FAFC',
                      borderRadius: '24px',
                      flexGrow: 1,
                    }}>
                      <span style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 600,
                        fontSize: '12px',
                        lineHeight: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        textAlign: 'center',
                        color: '#061F42',
                      }}>
                        {doctor.department?.name || 'Department'}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Details Content - Frame 59 */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    padding: '4px 8px',
                    width: '100%',
                    maxHeight: '158px',
                    borderRadius: '12px',
                    boxSizing: 'border-box',
                    overflowY: 'auto',
                  }}>
                    {/* Doctor Details as bullet list */}
                    <ul style={{
                      margin: 0,
                      paddingLeft: '16px',
                      fontFamily: 'Nunito, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '12px',
                      lineHeight: '18px',
                      color: '#061F42',
                      listStyleType: 'disc',
                    }}>
                      {doctor.experience_years !== undefined && doctor.experience_years > 0 && (
                        <li>{doctor.experience_years} Years Of Experience</li>
                      )}
                      {doctor.education && (
                        <li>{doctor.education}</li>
                      )}
                      {doctor.specialization && (
                        <li style={{ whiteSpace: 'pre-wrap' as const, wordWrap: 'break-word' as const }}>
                          {doctor.specialization}
                        </li>
                      )}
   
                      {doctor.bio && (
                        <li>{doctor.bio}</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Book Now Button */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  padding: '0px',
                  gap: '8px',
                  width: '100%',
                  maxWidth: window.innerWidth <= 768 ? '100%' : '280px',
                  height: '32px',
                }}>
                  <button
                    disabled={doctor.status === 'busy'}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '8px 12px',
                      width: '100%',
                      height: '32px',
                      background: doctor.status === 'busy' ? '#E5E7EA' : '#061F42',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: doctor.status === 'busy' ? 'not-allowed' : 'pointer',
                      flexGrow: 1,
                    }}
                  >
                    <span style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontSize: '14px',
                      lineHeight: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'center',
                      color: doctor.status === 'busy' ? '#9EA2AE' : '#FFFFFF',
                    }}>
                      Book Now
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Side - Services */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                paddingTop: '36px', // Offset for status badge (24px height + 12px gap)
                minWidth: 0,
              }}>
                {/* Tab Headers / Switcher */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  padding: '0px',
                  width: '100%',
                  maxWidth: window.innerWidth <= 768 ? '100%' : '440px',
                  height: '40px',
                  gap: window.innerWidth <= 768 ? '4px' : '0',
                }}>
                  {/* Outpatient Services Tab */}
                  <button
                    onClick={() => setActiveTab('outpatient')}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: window.innerWidth <= 768 ? '8px 12px' : '12px 16px',
                      flex: 1,
                      minWidth: 0,
                      height: '40px',
                      background: activeTab === 'outpatient' ? '#FCFCFC' : '#E6E6E6',
                      boxShadow: activeTab === 'outpatient' ? '0px 0px 5px rgba(0, 0, 0, 0.25)' : 'none',
                      borderRadius: '12px 12px 0px 0px',
                      border: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: `all 0.3s ${EASINGS.smooth}`,
                    }}
                  >
                    <span style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontSize: window.innerWidth <= 768 ? '14px' : '20px',
                      lineHeight: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'center',
                      color: activeTab === 'outpatient' ? '#061F42' : '#A4A5A5',
                      transition: `color 0.3s ${EASINGS.smooth}`,
                      whiteSpace: window.innerWidth <= 768 ? 'nowrap' : 'normal',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      Outpatient Services
                    </span>
                  </button>

                  {/* Inpatient Services Tab */}
                  <button
                    onClick={() => setActiveTab('inpatient')}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: window.innerWidth <= 768 ? '8px 12px' : '12px 16px',
                      flex: 1,
                      minWidth: 0,
                      height: '40px',
                      background: activeTab === 'inpatient' ? '#FCFCFC' : '#E6E6E6',
                      boxShadow: activeTab === 'inpatient' ? '0px 0px 5px rgba(0, 0, 0, 0.25)' : 'none',
                      borderRadius: '12px 12px 0px 0px',
                      border: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: `all 0.3s ${EASINGS.smooth}`,
                    }}
                  >
                    <span style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontSize: window.innerWidth <= 768 ? '14px' : '20px',
                      lineHeight: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'center',
                      color: activeTab === 'inpatient' ? '#061F42' : '#A4A5A5',
                      transition: `color 0.3s ${EASINGS.smooth}`,
                      whiteSpace: window.innerWidth <= 768 ? 'nowrap' : 'normal',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      Inpatient Services
                    </span>
                  </button>
                </div>

                {/* Services List Container */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: window.innerWidth <= 768 ? '12px 16px' : '12px 24px',
                  gap: '4px',
                  width: '100%',
                  minHeight: window.innerWidth <= 768 ? '300px' : '400px',
                  maxHeight: window.innerWidth <= 768 ? '500px' : '656px',
                  background: '#FCFCFC',
                  boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
                  borderRadius: '0px 12px 12px 12px',
                  boxSizing: 'border-box',
                  overflowY: 'auto',
                }}>
                  {currentServices.length > 0 ? (
                    currentServices.map((service, index) => 
                      renderServiceItem(service, index, index === currentServices.length - 1)
                    )
                  ) : (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      height: '200px',
                    }}>
                      <span style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        color: '#6A6A6A',
                      }}>
                        No {activeTab === 'outpatient' ? 'outpatient' : 'inpatient'} services listed for this doctor.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsPage;
