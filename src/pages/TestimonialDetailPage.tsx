import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import { LoadingSpinner } from '../components/LoadingComponents';
import FloatingContactButtons from '../components/FloatingContactButtons';
import { getTranslatedField } from '../utils/localeHelpers';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  image_url: string | null;
  experience_years?: number;
  education?: string;
  branch?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
}

interface Testimonial {
  id: number;
  doctor_id: number;
  doctor?: Doctor;
  name?: string;
  role?: string | null;
  testimonial_image?: string | null;
  location?: string | null;
  experience?: string | null;
  review_title: string;
  description: string;
  full_story?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// CSS Keyframes for animations
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
`;

const TestimonialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('pages');
  const ResponsiveNavbar = useResponsiveNavbar();
  
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/testimonials/${id}`);
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          setTestimonial(result.data);
          
          // Update SEO meta tags dynamically
          const doctor = result.data.doctor;
          const title = `${getTranslatedField(result.data.review_title, '')} - Dr. ${getTranslatedField(doctor?.name, '')} | Aljedaani Hospitals`;
          const description = `Success story: ${getTranslatedField(result.data.description, '').substring(0, 155)}`;
          
          document.title = title;
          
          // Update meta description
          let metaDescription = document.querySelector('meta[name="description"]');
          if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
          }
          metaDescription.setAttribute('content', description);
          
          // Update Open Graph tags
          let ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) ogTitle.setAttribute('content', title);
          
          let ogDescription = document.querySelector('meta[property="og:description"]');
          if (ogDescription) ogDescription.setAttribute('content', description);
          
          let ogUrl = document.querySelector('meta[property="og:url"]');
          if (ogUrl) ogUrl.setAttribute('content', window.location.href);
          
        } else {
          setError('Testimonial not found');
        }
      } catch (err) {
        console.error('Error fetching testimonial:', err);
        setError('Failed to load testimonial');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTestimonial();
    }
    
    // Cleanup: restore default title when component unmounts
    return () => {
      document.title = 'Aljedaani Hospitals | مستشفى الجدعاني - Leading Healthcare in Saudi Arabia';
    };
  }, [id, API_BASE_URL]);

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

  if (error || !testimonial || !testimonial.doctor) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#C9F3FF',
      }}>
        {ResponsiveNavbar}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          padding: '40px 20px',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '500px',
          }}>
            <h2 style={{
              color: '#061F42',
              fontSize: '24px',
              marginBottom: '16px',
            }}>
              {error || 'Testimonial not found'}
            </h2>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                background: '#15C9FA',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0DB5E3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#15C9FA';
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const doctor = testimonial.doctor;

  return (
    <>
      <style>{animationStyles}</style>
      <div style={{
        minHeight: '100vh',
        background: '#C9F3FF',
      }}>
        {ResponsiveNavbar}
        
        {/* Main Container */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '40px 20px',
        }}>
          {/* Page Title */}
          <div style={{
            marginBottom: '32px',
            animation: 'fadeInUp 0.5s ease-out',
          }}>
            <h1 style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '32px',
              fontWeight: 700,
              color: '#061F42',
              margin: '0 0 8px 0',
            }}>
              Success Story
            </h1>
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '16px',
              color: '#6A6A6A',
              margin: 0,
            }}>
              Discover inspiring stories of healing and hope
            </p>
          </div>

          {/* Content Card */}
          <div style={{
            background: '#FCFCFC',
            boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
            borderRadius: '12px',
            padding: '24px',
            animation: 'fadeInUp 0.5s ease-out 0.1s both',
          }}>
            {/* Back Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '24px',
            }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#FFFFFF',
                  border: '1px solid #061F42',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#061F42',
                  transition: 'all 0.3s ease',
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="#061F42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
            </div>

            {/* Main Content */}
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth > 768 ? 'row' : 'column',
              gap: '24px',
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
            }}>
              {/* Left Side - Doctor Card */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                width: window.innerWidth > 768 ? '280px' : '100%',
                flexShrink: 0,
              }}>
                {/* Doctor Photo */}
                <div style={{
                  width: '100%',
                  maxWidth: '280px',
                  height: '362px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#F8F8F8',
                }}>
                  <img
                    src={doctor.image_url || '/assets/images/testimonials/person_template.png'}
                    alt={`Dr. ${getTranslatedField(doctor.name, '')}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                {/* Doctor Name and Specialty */}
                <div style={{
                  width: '100%',
                  maxWidth: '280px',
                }}>
                  <h3 style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: '20px',
                    lineHeight: '30px',
                    textAlign: 'center',
                    color: '#061F42',
                    margin: 0,
                  }}>
                    Dr. {getTranslatedField(doctor.name, '')}
                  </h3>
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    textAlign: 'center',
                    color: '#061F42',
                    margin: '4px 0 0 0',
                  }}>
                    {getTranslatedField(doctor.specialization, '')}
                  </p>
                </div>

                {/* Doctor Info Box */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '12px',
                  gap: '8px',
                  width: '100%',
                  maxWidth: '280px',
                  background: '#F8F8F8',
                  borderRadius: '12px',
                }}>
                  {/* Badges */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                  }}>
                    {/* Branch Badge */}
                    {doctor.branch && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        gap: '4px',
                        background: '#FFFFFF',
                        border: '1px solid #D9D9D9',
                        borderRadius: '24px',
                      }}>
                        <img
                          src="/assets/images/testimonials/pin-alt.png"
                          alt="location"
                          style={{
                            width: '16px',
                            height: '16px',
                          }}
                        />
                        <span style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 600,
                          fontSize: '12px',
                          color: '#6A6A6A',
                        }}>
                          {getTranslatedField(doctor.branch.name, '')}
                        </span>
                      </div>
                    )}

                    {/* Department Badge */}
                    {doctor.department && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        background: '#A7FAFC',
                        borderRadius: '24px',
                        flex: 1,
                      }}>
                        <span style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 600,
                          fontSize: '12px',
                          color: '#061F42',
                        }}>
                          {getTranslatedField(doctor.department.name, '')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Experience/Details */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '4px 8px',
                  }}>
                    {/* Experience Years */}
                    {doctor.experience_years && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          background: '#061F42',
                          borderRadius: '50%',
                          flexShrink: 0,
                        }} />
                        <span style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontSize: '12px',
                          color: '#061F42',
                        }}>
                          {doctor.experience_years} {t('yearsOfExperience')}
                        </span>
                      </div>
                    )}

                    {/* Specialization */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        background: '#061F42',
                        borderRadius: '50%',
                        flexShrink: 0,
                        marginTop: '4px',
                      }} />
                      <span style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontSize: '12px',
                        color: '#061F42',
                        wordWrap: 'break-word',
                      }}>
                        {getTranslatedField(doctor.specialization, '') || 'Healthcare Professional'}
                      </span>
                    </div>

                    {/* Education */}
                    {doctor.education && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          background: '#061F42',
                          borderRadius: '50%',
                          flexShrink: 0,
                          marginTop: '4px',
                        }} />
                        <p style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontSize: '12px',
                          color: '#061F42',
                          margin: 0,
                          wordWrap: 'break-word',
                        }}>
                          {getTranslatedField(doctor.education, '')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Now Button */}
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      doctor: doctor.id.toString(),
                      ...(doctor.branch?.id && { branch: doctor.branch.id.toString() }),
                      ...(doctor.department?.id && { department: doctor.department.id.toString() }),
                    });
                    navigate(`/book-appointment?${params.toString()}`);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '12px',
                    width: '100%',
                    maxWidth: '280px',
                    background: '#061F42',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#FFFFFF',
                    transition: 'all 0.3s ease',
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
                  {t('bookNow')}
                </button>
              </div>

              {/* Right Side - Success Story */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                flex: 1,
                padding: window.innerWidth > 768 ? '0 16px' : '0',
              }}>
                {/* Title */}
                <h2 style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '24px',
                  lineHeight: '38px',
                  color: '#061F42',
                  margin: 0,
                }}>
                  {getTranslatedField(testimonial.review_title, '')}
                </h2>

                {/* Story Image */}
                {testimonial.testimonial_image && (
                  <div style={{
                    width: '100%',
                    height: window.innerWidth > 768 ? '438px' : '300px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#F8F8F8',
                  }}>
                    <img
                      src={testimonial.testimonial_image}
                      alt={getTranslatedField(testimonial.review_title, '')}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}

                {/* Full Story Text */}
                <div style={{
                  flex: 1,
                }}>
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#061F42',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                  }}>
                    {getTranslatedField(testimonial.full_story, '') || getTranslatedField(testimonial.description, '')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FloatingContactButtons />
      </div>
    </>
  );
};

export default TestimonialDetailPage;
