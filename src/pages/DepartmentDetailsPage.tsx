import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { departmentsService, type Department, type DepartmentTabContent, type Doctor } from '../services/departmentsService';
import Navbar from '../components/Navbar';

type TabType = 'overview' | 'doctors' | 'opd_services' | 'inpatient_services' | 'investigations' | 'success_stories';

const DepartmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<Department | null>(null);
  const [tabContents, setTabContents] = useState<DepartmentTabContent[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('Overview');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'doctors', label: 'Doctors' },
    { key: 'opd_services', label: 'OPD Services' },
    { key: 'inpatient_services', label: 'Inpatient Services' },
    { key: 'investigations', label: 'Investigations' },
    { key: 'success_stories', label: 'Success Stories' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await departmentsService.getDepartmentWithTabs(parseInt(id));
        setDepartment(data);
        setTabContents(data.tab_contents || []);
        setDoctors(data.doctors || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getCurrentTabContent = (): DepartmentTabContent | undefined => {
    if (activeTab === 'doctors' || activeTab === 'success_stories') return undefined;
    return tabContents.find(tc => tc.tab_type === activeTab);
  };

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

  const renderDoctorCard = (doctor: Doctor) => {
    const statusStyle = getStatusStyle(doctor.status);
    return (
      <div
        key={doctor.id}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px',
          gap: '12px',
          width: '270px',
          background: '#FFFFFF',
          border: '1px solid #D8D8D8',
          borderRadius: '12px',
        }}
      >
        {/* Status Badge */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4px 8px',
          gap: '4px',
          background: statusStyle.background,
          borderRadius: '24px',
          alignSelf: 'flex-start',
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
            fontWeight: 600,
            fontSize: '12px',
            color: statusStyle.color,
          }}>
            {statusStyle.text}
          </span>
        </div>

        {/* Doctor Image */}
        <div style={{
          width: '116px',
          height: '116px',
          borderRadius: '50%',
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

        {/* Doctor Name */}
        <div style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '20px',
          textAlign: 'center',
          color: '#061F42',
        }}>
          {doctor.name}
        </div>

        {/* Specialization */}
        <div style={{
          fontFamily: 'Varela Round, sans-serif',
          fontSize: '12px',
          textAlign: 'center',
          color: '#061F42',
        }}>
          {doctor.specialization || 'Registrar'}
        </div>

        {/* Info badges */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '4px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <div style={{
            padding: '4px 8px',
            background: '#FFFFFF',
            border: '1px solid #D9D9D9',
            borderRadius: '24px',
            fontSize: '12px',
            color: '#6A6A6A',
            fontFamily: 'Nunito, sans-serif',
          }}>
            {doctor.branch?.name || doctor.location}
          </div>
          <div style={{
            padding: '4px 8px',
            background: '#A7FAFC',
            borderRadius: '24px',
            fontSize: '12px',
            color: '#061F42',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
          }}>
            {department?.name}
          </div>
        </div>

        {/* Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '12px',
          color: '#061F42',
          fontFamily: 'Varela Round, sans-serif',
        }}>
          <div>• {doctor.experience_years} Years Of Experience</div>
          <div>• {doctor.education}</div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          width: '100%',
        }}>
          <button
            disabled={doctor.status === 'busy'}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: doctor.status === 'busy' ? '#E5E7EA' : '#061F42',
              borderRadius: '8px',
              border: 'none',
              color: doctor.status === 'busy' ? '#9EA2AE' : '#FFFFFF',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              cursor: doctor.status === 'busy' ? 'not-allowed' : 'pointer',
            }}
          >
            Book Now
          </button>
          <Link
            to={`/doctors/${doctor.id}`}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: '#15C9FA',
              borderRadius: '8px',
              border: 'none',
              color: '#FFFFFF',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Learn More
          </Link>
        </div>
      </div>
    );
  };

  const renderSidebar = (items: string[] | undefined) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '8px',
        gap: '8px',
        width: '287px',
        background: '#F3F4F6',
        borderRadius: '12px',
        flexShrink: 0,
      }}>
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveSidebarItem(item)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '12px',
              width: '271px',
              height: '44px',
              background: activeSidebarItem === item ? '#DAF8FF' : '#FFFFFF',
              border: '1px solid #D8D8D8',
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: '20px',
              textAlign: 'center',
              color: '#061F42',
            }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderOverviewTab = (content: DepartmentTabContent | undefined) => {
    if (!content) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6A6A6A' }}>
          No content available for this tab.
        </div>
      );
    }

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '24px',
        gap: '12px',
        background: '#FCFCFC',
        boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
        borderRadius: '0px 12px 12px 12px',
      }}>
        {/* Main Image */}
        {content.main_image && (
          <div style={{
            width: '100%',
            height: '438px',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <img
              src={content.main_image}
              alt="Department"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* Main Description */}
        {content.main_description && (
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '20px',
            lineHeight: '120%',
            color: '#061F42',
            margin: 0,
          }}>
            {content.main_description}
          </p>
        )}

        {/* Divider */}
        <div style={{
          width: '100%',
          height: '1px',
          background: '#E9E9E9',
        }} />

        {/* Sub Sections */}
        {content.sub_sections && content.sub_sections.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            width: '100%',
            padding: '24px 0',
          }}>
            {/* Section Title */}
            {content.sub_sections.length > 0 && (
              <h3 style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '38px',
                textAlign: 'center',
                color: '#061F42',
                margin: 0,
                width: '100%',
              }}>
                We offer a wide range of services, including:
              </h3>
            )}

            {content.sub_sections.map((section, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: section.position === 'right' ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: '24px',
                  width: '100%',
                }}
              >
                {section.image && (
                  <div style={{
                    width: '524px',
                    height: '239px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <img
                      src={section.image}
                      alt={section.title || ''}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}
                <div style={{
                  flex: 1,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '20px',
                  lineHeight: '120%',
                  color: '#061F42',
                }}>
                  {section.title && (
                    <strong>{section.title}: </strong>
                  )}
                  {section.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quote Section */}
        {content.quote_text && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
            width: '100%',
            background: '#BDF1FF',
            borderRadius: '12px',
            boxSizing: 'border-box',
          }}>
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '24px',
              lineHeight: '38px',
              textAlign: 'center',
              color: '#061F42',
              margin: 0,
            }}>
              "{content.quote_text}"
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderServicesTab = (content: DepartmentTabContent | undefined) => {
    if (!content) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6A6A6A' }}>
          No content available for this tab.
        </div>
      );
    }

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '24px',
        gap: '12px',
        background: '#FCFCFC',
        boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
        borderRadius: '0px 12px 12px 12px',
      }}>
        {/* Content Row with Sidebar */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: '16px',
          width: '100%',
        }}>
          {/* Sidebar */}
          {renderSidebar(content.sidebar_items)}

          {/* Main Image */}
          {content.main_image && (
            <div style={{
              flex: 1,
              height: '476px',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              <img
                src={content.main_image}
                alt="Service"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
        </div>

        {/* Service List */}
        {content.service_list && content.service_list.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%',
            marginTop: '24px',
          }}>
            {/* Main Description */}
            {content.main_description && (
              <p style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: '20px',
                color: '#061F42',
                margin: 0,
              }}>
                {content.main_description}
              </p>
            )}

            {content.service_list.map((service, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                {service.title && (
                  <h4 style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '20px',
                    color: '#061F42',
                    margin: '0 0 8px 0',
                  }}>
                    {service.title}
                  </h4>
                )}
                {service.items && service.items.length > 0 && (
                  <ul style={{
                    margin: 0,
                    paddingLeft: '24px',
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#061F42',
                  }}>
                    {service.items.map((item, itemIndex) => (
                      <li key={itemIndex} style={{ marginBottom: '4px' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDoctorsTab = () => {
    if (doctors.length === 0) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#6A6A6A',
          background: '#FCFCFC',
          boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
          borderRadius: '0px 12px 12px 12px',
        }}>
          No doctors available for this department.
        </div>
      );
    }

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '24px',
        gap: '24px',
        background: '#FCFCFC',
        boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
        borderRadius: '0px 12px 12px 12px',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'flex-start',
        }}>
          {doctors.map(doctor => renderDoctorCard(doctor))}
        </div>
        
        <Link
          to={`/doctors?department=${id}`}
          style={{
            alignSelf: 'center',
            padding: '12px 24px',
            background: '#061F42',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            textDecoration: 'none',
          }}
        >
          View All Doctors
        </Link>
      </div>
    );
  };

  if (loading) {
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
          color: '#061F42',
        }}>
          Loading department details...
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#C9F3FF',
      }}>
        <Navbar />
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
            {error || 'Department not found'}
          </span>
          <button
            onClick={() => navigate('/departments')}
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
            Back to Departments
          </button>
        </div>
      </div>
    );
  }

  const currentContent = getCurrentTabContent();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#C9F3FF',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Navbar />

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '200px 20px 40px 20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1120px',
        }}>
          {/* Title Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 24px',
            background: '#FFFFFF',
            borderRadius: '15px',
            marginBottom: '16px',
            height: '80px',
          }}>
            <h1 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '48px',
              lineHeight: '50px',
              color: '#061F42',
              margin: 0,
            }}>
              Departments
            </h1>

            {/* Branch Filter Dropdown */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
            }}>
              <select style={{
                padding: '8px 16px',
                border: '1.5px solid #DADADA',
                borderRadius: '8px',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                color: '#6A6A6A',
                background: 'white',
                minWidth: '200px',
              }}>
                <option>All Branches</option>
              </select>
            </div>
          </div>

          {/* Breadcrumb */}
          <div style={{
            fontFamily: 'Varela Round, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '40px',
            marginBottom: '16px',
          }}>
            <span style={{ color: '#A4A5A5' }}>Displaying results for </span>
            <span style={{ color: '#061F42' }}>
              Departments &gt; {department.name} &gt; All Branches &gt; {tabs.find(t => t.key === activeTab)?.label}
            </span>
          </div>

          {/* Department Name */}
          <h2 style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: '32px',
            lineHeight: '40px',
            color: '#061F42',
            margin: '0 0 16px 0',
          }}>
            {department.name}
          </h2>

          {/* Tabs Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            width: '100%',
          }}>
            {/* Tab Headers */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '12px 16px',
                    height: '40px',
                    background: activeTab === tab.key ? '#FCFCFC' : '#E6E6E6',
                    boxShadow: activeTab === tab.key ? '0px 0px 5px rgba(0, 0, 0, 0.25)' : 'none',
                    borderRadius: '12px 12px 0px 0px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '20px',
                    lineHeight: '20px',
                    color: activeTab === tab.key ? '#061F42' : '#A4A5A5',
                    whiteSpace: 'nowrap',
                  }}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && renderOverviewTab(currentContent)}
            {activeTab === 'doctors' && renderDoctorsTab()}
            {(activeTab === 'opd_services' || activeTab === 'inpatient_services' || activeTab === 'investigations') && 
              renderServicesTab(currentContent)}
            {activeTab === 'success_stories' && (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#6A6A6A',
                background: '#FCFCFC',
                boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
                borderRadius: '0px 12px 12px 12px',
              }}>
                Success stories coming soon...
              </div>
            )}
          </div>

          {/* Our Doctors Section (shown at bottom when not on doctors tab) */}
          {activeTab !== 'doctors' && doctors.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3 style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '32px',
                lineHeight: '40px',
                color: '#061F42',
                margin: '0 0 24px 0',
              }}>
                Our Doctors
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '16px',
              }}>
                {/* Left Arrow */}
                <button style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid #D8D8D8',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  ←
                </button>

                {/* Doctor Cards */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '16px',
                  overflow: 'hidden',
                  flex: 1,
                }}>
                  {doctors.slice(0, 3).map(doctor => renderDoctorCard(doctor))}
                </div>

                {/* Right Arrow */}
                <button style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid #D8D8D8',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailsPage;
