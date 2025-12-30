import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { departmentsService, type Department, type DepartmentTabContent, type Doctor, type SidebarItem } from '../services/departmentsService';
import { type Testimonial } from '../services/testimonialsService';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import { LoadingSpinner } from '../components/LoadingComponents';
import { EASINGS } from '../utils/animations';

type TabType = 'overview' | 'doctors' | 'opd_services' | 'inpatient_services' | 'investigations' | 'success_stories';

// CSS Keyframes for animations - Using consistent timing from animations.ts
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes fadeInLeft {
    from { 
      opacity: 0; 
      transform: translateX(-20px); 
    }
    to { 
      opacity: 1; 
      transform: translateX(0); 
    }
  }
  
  @keyframes fadeInRight {
    from { 
      opacity: 0; 
      transform: translateX(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateX(0); 
    }
  }
  
  @keyframes scaleIn {
    from { 
      opacity: 0; 
      transform: scale(0.95); 
    }
    to { 
      opacity: 1; 
      transform: scale(1); 
    }
  }
  
  @keyframes slideDown {
    from { 
      opacity: 0; 
      transform: translateY(-10px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  
  .tab-content-enter {
    animation: fadeInUp 0.4s ${EASINGS.smooth} forwards;
  }
  
  .sidebar-item-hover {
    transition: all 0.3s ${EASINGS.smooth};
  }
  
  .sidebar-item-hover:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 171, 218, 0.15);
  }
  
  .card-hover {
    transition: all 0.3s ${EASINGS.smooth};
  }
  
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 171, 218, 0.2);
  }
  
  .image-zoom img {
    transition: transform 0.5s ${EASINGS.smooth};
  }
  
  .image-zoom:hover img {
    transform: scale(1.05);
  }
`;

const DepartmentDetailsPage: React.FC = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleBookNow = (doctor: Doctor) => {
    const params = new URLSearchParams({
      doctor_id: doctor.id.toString(),
      branch_id: doctor.branch?.id?.toString() || '',
      department_id: doctor.department?.id?.toString() || '',
    });
    navigate(`/book-appointment?${params.toString()}`);
  };
  const [department, setDepartment] = useState<Department | null>(null);
  const [tabContents, setTabContents] = useState<DepartmentTabContent[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeSidebarItem, setActiveSidebarItem] = useState<SidebarItem | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isTestimonialTransitioning, setIsTestimonialTransitioning] = useState(false);
  
  // Animation states
  const [tabContentKey, setTabContentKey] = useState(0);
  const [sidebarContentKey, setSidebarContentKey] = useState(0);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [isSidebarTransitioning, setIsSidebarTransitioning] = useState(false);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'doctors', label: 'Doctors' },
    { key: 'opd_services', label: 'OPD Services' },
    { key: 'inpatient_services', label: 'Inpatient Services' },
    { key: 'investigations', label: 'Investigations' },
    { key: 'success_stories', label: 'Success Stories' },
  ];

  // Handle tab change with animation
  const handleTabChange = useCallback((newTab: TabType) => {
    if (newTab === activeTab) return;
    
    setIsTabTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setTabContentKey(prev => prev + 1);
      setIsTabTransitioning(false);
    }, 150);
  }, [activeTab]);

  // Handle sidebar item change with animation
  const handleSidebarItemChange = useCallback((item: SidebarItem) => {
    if (activeSidebarItem?.id === item.id) return;
    
    setIsSidebarTransitioning(true);
    setTimeout(() => {
      setActiveSidebarItem(item);
      setSidebarContentKey(prev => prev + 1);
      setIsSidebarTransitioning(false);
    }, 150);
  }, [activeSidebarItem]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await departmentsService.getDepartmentWithTabs(parseInt(id));
        setDepartment(data);
        setTabContents(data.tab_contents || []);
        setDoctors(data.doctors || []);
        
        // Fetch testimonials for this department using the new backend endpoint
        try {
          const departmentTestimonials = await departmentsService.getDepartmentTestimonials(parseInt(id));
          setTestimonials(departmentTestimonials);
        } catch (testimonialsError) {
          console.error('Error fetching testimonials:', testimonialsError);
          setTestimonials([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Reset sidebar item when tab changes
  useEffect(() => {
    setActiveSidebarItem(null);
    setSidebarContentKey(prev => prev + 1);
  }, [activeTab]);

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

  const renderDoctorCard = (doctor: Doctor, index: number = 0) => {
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
          animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)';
          e.currentTarget.style.borderColor = '#15C9FA';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = '#D8D8D8';
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
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(21, 201, 250, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <img
            src={doctor.image_url || '/assets/images/general/person_template.png'}
            alt={doctor.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
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
          fontFamily: 'Nunito, sans-serif',
          fontSize: '12px',
          textAlign: 'center',
          color: '#061F42',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
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
          fontFamily: 'Nunito, sans-serif',
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
            onClick={() => doctor.status !== 'busy' && handleBookNow(doctor)}
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
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (doctor.status !== 'busy') {
                e.currentTarget.style.background = '#0A2D5C';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (doctor.status !== 'busy') {
                e.currentTarget.style.background = '#061F42';
                e.currentTarget.style.transform = 'scale(1)';
              }
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
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0DB5E3';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#15C9FA';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Learn More
          </Link>
        </div>
      </div>
    );
  };

  // Helper to normalize sidebar items (handle both old string format and new object format)
  // For opd_services, inpatient_services, and investigations, Overview is now included in sidebar_items from backend
  const normalizeSidebarItems = (items: (string | SidebarItem)[] | undefined, includeOverview: boolean = false, tabType?: string): SidebarItem[] => {
    const result: SidebarItem[] = [];
    
    // Check if this is a tab type where backend includes Overview in sidebar_items
    const backendIncludesOverview = tabType && ['opd_services', 'inpatient_services', 'investigations'].includes(tabType);
    
    // Add Overview as first item if requested and not already included by backend
    if (includeOverview && !backendIncludesOverview) {
      result.push({ id: 'overview_main', title: 'Overview', sort_order: -1 });
    }
    
    if (!items || items.length === 0) return result;
    
    // Handle if items is actually an object with numeric keys (corrupted data format)
    if (!Array.isArray(items)) {
      const itemsArray = Object.values(items).filter(
        (v): v is string | SidebarItem => typeof v === 'string' || (typeof v === 'object' && v !== null && 'title' in v)
      );
      items = itemsArray;
    }
    
    items.forEach((item, idx) => {
      // Handle string format
      if (typeof item === 'string') {
        result.push({ id: `legacy_${idx}`, title: item, sort_order: idx });
        return;
      }
      
      // Handle array of characters (corrupted data)
      if (Array.isArray(item)) {
        const title = item.join('');
        if (title.trim()) {
          result.push({ id: `recovered_${idx}`, title, sort_order: idx });
        }
        return;
      }
      
      // Handle object format
      if (typeof item === 'object' && item !== null) {
        // Check for corrupted data with numeric string keys
        const hasNumericKeys = Object.keys(item).some(key => /^\d+$/.test(key));
        
        let title = item.title || '';
        
        // If no title but has numeric keys, reconstruct from those
        if (!title && hasNumericKeys) {
          const chars = Object.keys(item)
            .filter(key => /^\d+$/.test(key))
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(key => (item as unknown as Record<string, string>)[key]);
          title = chars.join('');
        }
        
        if (title.trim()) {
          const sidebarItem: SidebarItem = {
            id: item.id || `item_${idx}`,
            title: title,
            image: item.image,
            description: item.description,
            service_list: Array.isArray(item.service_list) ? item.service_list : [],
            sort_order: item.sort_order ?? idx
          };
          result.push(sidebarItem);
        }
      }
    });
    
    return result;
  };

  const renderSidebar = (items: (string | SidebarItem)[] | undefined, includeOverview: boolean = false, tabType?: string) => {
    const normalizedItems = normalizeSidebarItems(items, includeOverview, tabType);
    if (normalizedItems.length === 0) return null;
    
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
        {normalizedItems.map((item, index) => {
          // Determine if this item is selected
          let isSelected = false;
          if (item.id === 'overview_main' || item.title === 'Overview') {
            // Overview is selected if nothing is selected or if activeSidebarItem is Overview
            isSelected = !activeSidebarItem || activeSidebarItem.id === 'overview_main' || activeSidebarItem.title === 'Overview';
          } else {
            // For other items, compare by id
            isSelected = activeSidebarItem?.id === item.id;
          }
          
          return (
            <div
              key={item.id || `sidebar-${index}`}
              onClick={() => handleSidebarItemChange(item)}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px',
                width: '271px',
                height: '44px',
                background: isSelected ? '#DAF8FF' : '#FFFFFF',
                border: isSelected ? '2px solid #15C9FA' : '1px solid #D8D8D8',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSelected ? 'translateX(4px)' : 'translateX(0)',
                boxShadow: isSelected ? '0 4px 12px rgba(21, 201, 250, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                animation: `fadeInLeft 0.3s ease-out ${index * 0.05}s both`,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#15C9FA';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = '#D8D8D8';
                }
              }}
            >
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: isSelected ? 700 : 600,
                fontSize: '16px',
                lineHeight: '20px',
                textAlign: 'center',
                color: '#061F42',
                transition: 'font-weight 0.2s ease',
              }}>
                {item.title}
              </span>
            </div>
          );
        })}
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
        animation: 'fadeInUp 0.4s ease-out',
      }}>
        {/* Main Image */}
        {content.main_image && (
          <div style={{
            width: '100%',
            height: '438px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            transition: 'box-shadow 0.3s ease',
            animation: 'fadeIn 0.5s ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
          }}
          >
            <img
              src={content.main_image}
              alt="Department"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </div>
        )}

        {/* Main Description */}
        {content.main_description && (
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            lineHeight: '120%',
            color: '#061F42',
            margin: 0,
            animation: 'fadeInUp 0.4s ease-out 0.1s both',
          }}>
            {content.main_description}
          </p>
        )}

        {/* Divider */}
        <div style={{
          width: '100%',
          height: '1px',
          background: '#E9E9E9',
          animation: 'fadeIn 0.4s ease-out 0.2s both',
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
                animation: 'fadeInUp 0.4s ease-out 0.2s both',
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
                  animation: `${section.position === 'right' ? 'fadeInRight' : 'fadeInLeft'} 0.5s ease-out ${0.3 + index * 0.1}s both`,
                }}
              >
                {section.image && (
                  <div style={{
                    width: '524px',
                    height: '239px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1)';
                  }}
                  >
                    <img
                      src={section.image}
                      alt={section.title || ''}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                    />
                  </div>
                )}
                <div style={{
                  flex: 1,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
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
            animation: 'scaleIn 0.5s ease-out 0.4s both',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.01)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '20px',
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

    // Check if this is a tab type where backend includes Overview in sidebar_items
    const backendIncludesOverview = ['opd_services', 'inpatient_services', 'investigations'].includes(content.tab_type);
    
    // Check if Overview (main content) is selected or no selection
    const isOverviewSelected = !activeSidebarItem || activeSidebarItem.id === 'overview_main' || activeSidebarItem.title === 'Overview';
    
    // Find the actual sidebar item data from content.sidebar_items if it's a real item
    // This handles the case where activeSidebarItem might be a normalized/reconstructed item
    let actualSidebarItem: SidebarItem | undefined;
    if (!isOverviewSelected && content.sidebar_items) {
      const normalizedItems = normalizeSidebarItems(content.sidebar_items, false, content.tab_type);
      actualSidebarItem = normalizedItems.find(item => item.id === activeSidebarItem?.id);
    } else if (isOverviewSelected && backendIncludesOverview && content.sidebar_items) {
      // For special tab types, Overview data is in the first sidebar item
      const normalizedItems = normalizeSidebarItems(content.sidebar_items, false, content.tab_type);
      actualSidebarItem = normalizedItems.find(item => item.title === 'Overview');
    }
    
    // Determine what content to display
    let displayImage: string | undefined;
    let displayDescription: string | undefined;
    let displayServiceList: typeof content.service_list;
    
    if (isOverviewSelected && backendIncludesOverview && actualSidebarItem) {
      // For special tab types, use the Overview sidebar item data
      displayImage = actualSidebarItem.image;
      displayDescription = actualSidebarItem.description;
      displayServiceList = actualSidebarItem.service_list;
    } else if (isOverviewSelected) {
      // Show main tab content for other tab types
      displayImage = content.main_image;
      displayDescription = content.main_description;
      displayServiceList = content.service_list;
    } else if (actualSidebarItem) {
      // Show selected sidebar item content (use item's own content, don't fall back to main)
      displayImage = actualSidebarItem.image;
      displayDescription = actualSidebarItem.description;
      displayServiceList = actualSidebarItem.service_list;
    } else {
      // Fallback to main content if sidebar item not found
      displayImage = content.main_image;
      displayDescription = content.main_description;
      displayServiceList = content.service_list;
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
        animation: 'fadeInUp 0.4s ease-out',
      }}>
        {/* Top Row: Sidebar + Image */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: '16px',
          width: '100%',
        }}>
          {/* Sidebar - with Overview as first item (or from backend for special tab types) */}
          {renderSidebar(content.sidebar_items, true, content.tab_type)}

          {/* Image - takes remaining space with transition */}
          <div 
            key={sidebarContentKey}
            style={{
              flex: 1,
              opacity: isSidebarTransitioning ? 0 : 1,
              transform: isSidebarTransitioning ? 'translateX(20px)' : 'translateX(0)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            {displayImage && (
              <div style={{
                height: '400px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                transition: 'box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
              }}
              >
                <img
                  src={displayImage}
                  alt={isOverviewSelected ? 'Overview' : (activeSidebarItem?.title || 'Service')}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Description + Service List */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Description */}
          {displayDescription && (
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#061F42',
              margin: 0,
              textAlign: 'left',
            }}>
              {displayDescription}
            </p>
          )}

          {/* Service List with Cyan Bullet Points */}
          {displayServiceList && displayServiceList.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              width: '100%',
            }}>
              {displayServiceList.map((service, index) => (
                <div key={index}>
                  {service.title && (
                    <h4 style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: '17px',
                      lineHeight: '20px',
                      color: '#061F42',
                      margin: '0 0 4px 0',
                      textAlign: 'left',
                    }}>
                      {service.title}
                    </h4>
                  )}
                  {service.items && service.items.length > 0 && (
                    <ul style={{
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: '16px',
                      lineHeight: '24px',
                      color: '#061F42',
                    }}>
                      {service.items.map((item, itemIndex) => (
                        <li key={itemIndex} style={{ 
                          marginBottom: '5px',
                          listStyle: 'none',
                        }}>
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
          animation: 'fadeInUp 0.4s ease-out',
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
        animation: 'fadeInUp 0.4s ease-out',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'flex-start',
        }}>
          {doctors.map((doctor, index) => renderDoctorCard(doctor, index))}
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
            transition: 'all 0.3s ease',
            animation: 'fadeInUp 0.4s ease-out 0.3s both',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0A2D5C';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(6, 31, 66, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#061F42';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          View All Doctors
        </Link>
      </div>
    );
  };

  const renderTestimonialDetail = () => {
    if (!selectedTestimonial || !selectedTestimonial.doctor) {
      return null;
    }

    const testimonial = selectedTestimonial;
    const doctor = testimonial.doctor;

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
        animation: isTestimonialTransitioning ? 'none' : 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      }}>
        {/* Back Button (Top Right) */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
          marginBottom: '12px'
        }}>
          <button
            onClick={() => {
              setIsTestimonialTransitioning(true);
              setTimeout(() => {
                setSelectedTestimonial(null);
                setIsTestimonialTransitioning(false);
              }, 150);
            }}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px 12px',
              width: '95px',
              height: '32px',
              background: '#FFFFFF',
              border: '1px solid #061F42',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#061F42',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F5F5F5';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ← Back
          </button>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          padding: '24px',
          gap: '12px',
          width: '100%',
          background: '#FFFFFF',
          borderRadius: '12px',
          minHeight: '600px'
        }}>
          {/* Left Side - Doctor Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0px',
            gap: '12px',
            width: '280px',
            flexShrink: 0
          }}>
            {/* Doctor Photo */}
            <div style={{
              width: '280px',
              height: '362px',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#F8F8F8'
            }}>
              <img
                src={doctor?.image_url || '/assets/images/testimonials/person_template.png'}
                alt={`Dr. ${doctor?.name}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Doctor Name and Specialty */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
              width: '280px'
            }}>
              <h3 style={{
                width: '280px',
                fontFamily: 'Nunito, sans-serif',
                fontStyle: 'normal',
                fontWeight: 700,
                fontSize: '20px',
                lineHeight: '30px',
                textAlign: 'center',
                color: '#061F42',
                margin: 0
              }}>
                Dr. {doctor?.name}
              </h3>
              <p style={{
                width: '280px',
                fontFamily: 'Nunito, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                textAlign: 'center',
                color: '#061F42',
                margin: 0
              }}>
                {doctor?.specialization}
              </p>
            </div>

            {/* Doctor Info Box */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '8px',
              gap: '4px',
              width: '280px',
              background: '#F8F8F8',
              borderRadius: '12px'
            }}>
              {/* Badges */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                padding: '0px',
                gap: '4px',
                width: '100%'
              }}>
                {/* Branch Badge */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '4px 8px',
                  gap: '4px',
                  background: '#FFFFFF',
                  border: '1px solid #D9D9D9',
                  borderRadius: '24px'
                }}>
                  <img
                    src="/assets/images/testimonials/pin-alt.png"
                    alt="location"
                    style={{
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#6A6A6A'
                  }}>
                    {doctor?.branch?.name}
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
                  background: '#A7FAFC',
                  borderRadius: '24px',
                  flex: 1
                }}>
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#061F42'
                  }}>
                    {doctor?.department?.name}
                  </span>
                </div>
              </div>

              {/* Experience/Details - Bullet Points */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                padding: '4px 8px',
                gap: '8px',
                width: '100%'
              }}>
                {/* Experience Years */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    background: '#061F42',
                    borderRadius: '50%',
                    flexShrink: 0
                  }} />
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#061F42'
                  }}>
                    {doctor?.experience_years ? `${doctor.experience_years} Years of Experience` : 'Experienced professional'}
                  </span>
                </div>

                {/* Specialization */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    background: '#061F42',
                    borderRadius: '50%',
                    flexShrink: 0,
                    marginTop: '4px'
                  }} />
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#061F42',
                    maxWidth: '220px',
                    wordWrap: 'break-word'
                  }}>
                    {doctor?.specialization || 'Healthcare Professional'}
                  </span>
                </div>

                {/* Education */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    background: '#061F42',
                    borderRadius: '50%',
                    flexShrink: 0,
                    marginTop: '4px'
                  }} />
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '15px',
                    color: '#061F42',
                    margin: 0,
                    maxWidth: '220px',
                    maxHeight: '60px',
                    overflowY: 'auto',
                    wordWrap: 'break-word'
                  }}>
                    {doctor?.education || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Button */}
            <button
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '8px 12px',
                width: '280px',
                height: '32px',
                background: '#061F42',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '16px',
                color: '#FFFFFF',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0A2D5C';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#061F42';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Book Now
            </button>
          </div>

          {/* Right Side - Success Story */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '0px 16px',
            gap: '16px',
            flex: 1,
            minHeight: '550px'
          }}>
            {/* Title - Directly Above Image */}
            <h2 style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'normal',
              fontWeight: 700,
              fontSize: '24px',
              lineHeight: '38px',
              color: '#061F42',
              margin: 0,
              width: '100%'
            }}>
              {testimonial.review_title}
            </h2>

            {/* Story Image */}
            {testimonial.testimonial_image && (
              <div style={{
                width: '100%',
                height: '438px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#F8F8F8'
              }}>
                <img
                  src={testimonial.testimonial_image}
                  alt={testimonial.review_title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}

            {/* Full Story Text */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
              gap: '12px',
              flex: 1
            }}>
              <p style={{
                fontFamily: 'Nunito, sans-serif',
                fontStyle: 'normal',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '20px',
                color: '#061F42',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                maxHeight: '500px',
                overflowY: 'auto',
                paddingRight: '12px'
              }}>
                {testimonial.full_story || testimonial.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSuccessStoriesTab = () => {
    if (testimonials.length === 0) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#6A6A6A',
          background: '#FCFCFC',
          boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
          borderRadius: '0px 12px 12px 12px',
          animation: 'fadeInUp 0.4s ease-out',
        }}>
          No success stories available yet.
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
        animation: isTestimonialTransitioning ? 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'fadeInUp 0.4s ease-out',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'flex-start',
        }}>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px',
                gap: '12px',
                width: '300px',
                minWidth: '270px',
                maxWidth: '300px',
                height: '376px',
                background: '#FFFFFF',
                border: '1px solid #D8D8D8',
                borderRadius: '12px',
                flex: 1,
                animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 171, 218, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 0 transparent';
              }}
            >
              {/* Doctor Image */}
              <div
                style={{
                  width: '116px',
                  height: '116px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={testimonial.doctor?.image_url || '/assets/images/testimonials/person_template.png'}
                  alt={`Dr. ${testimonial.doctor?.name}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Doctor Info */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 0,
                  width: '276px'
                }}
              >
                <h3
                  style={{
                    width: '276px',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '20px',
                    textAlign: 'center',
                    color: '#061F42',
                    margin: 0,
                    marginBottom: '4px'
                  }}
                >
                  Dr. {testimonial.doctor?.name}
                </h3>
                <p
                  style={{
                    width: '276px',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    textAlign: 'center',
                    color: '#061F42',
                    margin: 0
                  }}
                >
                  {testimonial.doctor?.specialization}
                </p>
              </div>

              {/* Badges Section */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '8px',
                  gap: '8px',
                  width: '276px',
                  background: '#F8F8F8',
                  borderRadius: '12px'
                }}
              >
                {/* Badge Row */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: 0,
                    gap: '4px',
                    width: '100%'
                  }}
                >
                  {/* Branch Badge */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '4px 8px',
                      gap: '4px',
                      background: '#FFFFFF',
                      border: '1px solid #D9D9D9',
                      borderRadius: '24px',
                      flex: 'none'
                    }}
                  >
                    <img
                      src="/assets/images/testimonials/pin-alt.png"
                      alt="location"
                      style={{
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 600,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#6A6A6A'
                      }}
                    >
                      {testimonial.doctor?.branch?.name}
                    </span>
                  </div>
                  {/* Department Badge */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '4px 8px',
                      gap: '4px',
                      background: '#A7FAFC',
                      borderRadius: '24px',
                      flex: 1
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 600,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#061F42'
                      }}
                    >
                      {testimonial.doctor?.department?.name}
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <h4
                  style={{
                    width: '260px',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    fontSize: '17px',
                    lineHeight: '20px',
                    color: '#061F42',
                    margin: 0,
                    marginBottom: '3px'
                  }}
                >
                  {testimonial.review_title}
                </h4>

                {/* Description */}
                <p
                  style={{
                    width: '260px',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#061F42',
                    margin: 0
                  }}
                >
                  {testimonial.description}
                </p>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  padding: 0,
                  gap: '8px',
                  width: '276px'
                }}
              >
                <button
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 12px',
                    flex: 1,
                    height: '32px',
                    background: '#061F42',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#FFFFFF',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0A2D5C';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#061F42';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Book Now
                </button>
                <button
                  onClick={() => {
                    setIsTestimonialTransitioning(true);
                    setTimeout(() => {
                      setSelectedTestimonial(testimonial);
                      setIsTestimonialTransitioning(false);
                    }, 150);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 12px',
                    flex: 1,
                    height: '32px',
                    background: '#15C9FA',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#FFFFFF',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0FA8D4';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#15C9FA';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

  if (error || !department) {
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
      {ResponsiveNavbar}

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: window.innerWidth <= 768 ? '90px 16px 20px 16px' : '180px 20px 40px 20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1400px',
        }}>
          {/* Title Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: window.innerWidth <= 768 ? '8px 12px' : '8px 24px',
            background: '#FFFFFF',
            borderRadius: '15px',
            marginBottom: '8px',
            height: window.innerWidth <= 768 ? '60px' : '80px',
          }}>
            <h1 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: window.innerWidth <= 768 ? '28px' : '48px',
              lineHeight: window.innerWidth <= 768 ? '32px' : '50px',
              color: '#061F42',
              margin: 0,
            }}>
              Departments
            </h1>
          </div>

          {/* Breadcrumb */}
          <div style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '40px',
            marginBottom: '8px',
          }}>
            <span style={{ color: '#A4A5A5' }}>Displaying results for </span>
            <span style={{ color: '#061F42' }}>
              <span 
                onClick={() => navigate('/departments')}
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
              {' > '}
              <span style={{
                color: '#061F42',
              }}>
                {department.name}
              </span>
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
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              gap: '2px',
            }}>
              {tabs.map((tab, index) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: window.innerWidth <= 768 ? '10px 12px' : '12px 16px',
                    height: window.innerWidth <= 768 ? '36px' : '40px',
                    background: activeTab === tab.key ? '#FCFCFC' : '#E6E6E6',
                    boxShadow: activeTab === tab.key ? '0px 0px 5px rgba(0, 0, 0, 0.25)' : 'none',
                    borderRadius: '12px 12px 0px 0px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: activeTab === tab.key ? 'translateY(-2px)' : 'translateY(0)',
                    position: 'relative',
                    zIndex: activeTab === tab.key ? 2 : 1,
                    animation: `slideDown 0.3s ease-out ${index * 0.05}s both`,
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.key) {
                      e.currentTarget.style.background = '#F0F0F0';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.key) {
                      e.currentTarget.style.background = '#E6E6E6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: activeTab === tab.key ? 700 : 600,
                    fontSize: window.innerWidth <= 768 ? '14px' : '20px',
                    lineHeight: window.innerWidth <= 768 ? '14px' : '20px',
                    color: activeTab === tab.key ? '#061F42' : '#A4A5A5',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.3s ease, font-weight 0.2s ease',
                  }}>
                    {tab.label}
                  </span>
                  {/* Active indicator line */}
                  {activeTab === tab.key && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60%',
                      height: '3px',
                      background: 'linear-gradient(90deg, #15C9FA 0%, #0EA5E9 100%)',
                      borderRadius: '3px 3px 0 0',
                      animation: 'scaleIn 0.3s ease-out',
                    }} />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content with transition */}
            <div 
              key={tabContentKey}
              style={{
                opacity: isTabTransitioning ? 0 : 1,
                transform: isTabTransitioning ? 'translateY(10px)' : 'translateY(0)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
              }}
            >
              {activeTab === 'overview' && renderOverviewTab(currentContent)}
              {activeTab === 'doctors' && renderDoctorsTab()}
              {(activeTab === 'opd_services' || activeTab === 'inpatient_services' || activeTab === 'investigations') && 
                renderServicesTab(currentContent)}
              {activeTab === 'success_stories' && (selectedTestimonial ? renderTestimonialDetail() : renderSuccessStoriesTab())}
            </div>
          </div>

          {/* Our Doctors Section (shown at bottom when not on doctors tab) */}
          {activeTab !== 'doctors' && doctors.length > 0 && (
            <div style={{ 
              marginTop: '40px',
              animation: 'fadeInUp 0.5s ease-out 0.2s both',
            }}>
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
                <button 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid #D8D8D8',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#061F42';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#061F42';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.color = '#000000';
                    e.currentTarget.style.borderColor = '#D8D8D8';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
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
                  {doctors.slice(0, 3).map((doctor, index) => renderDoctorCard(doctor, index))}
                </div>

                {/* Right Arrow */}
                <button 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid #D8D8D8',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#061F42';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#061F42';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.color = '#000000';
                    e.currentTarget.style.borderColor = '#D8D8D8';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Animation Styles */}
      <style>{animationStyles}</style>
    </div>
  );
};

export default DepartmentDetailsPage;
