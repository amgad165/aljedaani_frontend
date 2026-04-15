import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import { branchesService, type Branch } from '../services/branchesService';
import { getTranslatedField } from '../utils/localeHelpers';
import FloatingContactButtons from '../components/FloatingContactButtons';
import Footer from '../components/Footer';

const MapPinIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 22C12 22 19 15.5 19 10.5C19 6.35786 15.866 3 12 3C8.13401 3 5 6.35786 5 10.5C5 15.5 12 22 12 22Z"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10.5" r="2.5" stroke="#FFFFFF" strokeWidth="1.8" />
  </svg>
);

const PhoneCallIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M22 16.92V20.5C22 21.0523 21.5523 21.5 21 21.5C10.2304 21.5 2.5 13.7696 2.5 3C2.5 2.44772 2.94772 2 3.5 2H7.09C7.58076 2 7.99924 2.35555 8.07855 2.83986L8.68887 6.56032C8.74892 6.92633 8.6032 7.2948 8.30992 7.51773L5.944 9.31595C7.12044 12.1851 9.3149 14.3796 12.1841 15.556L13.9823 13.1901C14.2052 12.8968 14.5737 12.7511 14.9397 12.8111L18.6601 13.4214C19.1444 13.5008 19.5 13.9192 19.5 14.41V16.92"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ContactPage: React.FC = () => {
  const { t, i18n } = useTranslation('pages');
  const ResponsiveNavbar = useResponsiveNavbar();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesData = await branchesService.getBranches({ 
          active: true,
          with_doctors_count: true,
        });
        setBranches(branchesData.slice(0, 3)); // Only show first 3 branches
      } catch (err) {
        console.error('Error fetching branches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/contact-submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setSubmitSuccess(true);
      setFormData({
        name: '',
        mobile: '',
        email: '',
        message: ''
      });

      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewLocation = (branch: Branch) => {
    // TODO: Implement Google Maps navigation
    console.log('View location for:', branch.name);
  };

  const handleCallNow = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#C9F3FF',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <FloatingContactButtons />
      {ResponsiveNavbar}

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: isMobile ? '90px 16px 40px' : '131px 20px 40px',
        direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {/* Page Title */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '10px 16px' : '10px 32px',
            background: '#FFFFFF',
            borderRadius: '15px',
            height: isMobile ? 'auto' : '80px',
          }}>
            <h1 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: isMobile ? '28px' : '44px',
              lineHeight: isMobile ? '32px' : '50px',
              textAlign: i18n.language === 'ar' ? 'right' : 'left',
              color: '#061F42',
              margin: 0,
              flexGrow: 1,
            }}>
              {t('contactUs')}
            </h1>
          </div>

          {/* Our Branches Title */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '6px 16px' : '10px 32px',
            minHeight: isMobile ? 'auto' : '58px',
          }}>
            <h2 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: isMobile ? '22px' : '24px',
              lineHeight: isMobile ? '30px' : '38px',
              textAlign: 'center',
              color: '#061F42',
              margin: 0,
              flexGrow: 1,
            }}>
              {t('ourBranches')}
            </h2>
          </div>

          {/* Branch Cards */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            gap: '24px',
            width: '100%',
          }}>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} style={{
                  flex: 1,
                  minWidth: '300px',
                  height: '259px',
                  background: '#E5E7EB',
                  borderRadius: '12px',
                }} />
              ))
            ) : (
              branches.map((branch) => (
                <div
                  key={branch.id}
                  onMouseEnter={() => setHoveredBranch(branch.id)}
                  onMouseLeave={() => setHoveredBranch(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-start',
                    minWidth: '300px',
                    minHeight: '200px',
                    height: '259px',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    flex: 1,
                    alignSelf: 'stretch',
                  }}
                >
                  {/* Image with Overlay */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    width: '100%',
                    height: '259px',
                    backgroundImage: `url(${branch.image_url || '/assets/img/branches/default-branch.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '2px solid #FFFFFF',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.32s ease, box-shadow 0.32s ease, border-color 0.32s ease',
                    boxShadow: hoveredBranch === branch.id
                      ? '0 14px 32px rgba(6, 31, 66, 0.28)'
                      : '0 7px 18px rgba(6, 31, 66, 0.18)',
                    borderColor: hoveredBranch === branch.id ? '#BAEEFF' : '#FFFFFF',
                    transform: hoveredBranch === branch.id ? 'translateY(-6px)' : 'translateY(0)',
                  }}>
                    {/* Bottom Overlay - Always visible */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '35%',
                      background: 'linear-gradient(180deg, rgba(6, 31, 66, 0) 0%, rgba(6, 31, 66, 0.82) 100%)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '12px 14px',
                      opacity: isMobile ? 0 : (hoveredBranch === branch.id ? 0 : 1),
                      transition: 'opacity 0.3s ease',
                    }}>
                      <h3 style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 700,
                        fontSize: '20px',
                        lineHeight: '24px',
                        color: '#FFFFFF',
                        margin: 0,
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
                      }}>
                        {getTranslatedField(branch.name, '')}
                      </h3>
                    </div>

                    {/* Full Overlay with Content - Only visible on hover */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      padding: '14px',
                      gap: '12px',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(180deg, rgba(6, 31, 66, 0.25) 0%, rgba(6, 31, 66, 0.86) 100%)',
                      borderRadius: '12px',
                      opacity: hoveredBranch === branch.id || isMobile ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }}>
                      {/* Branch Name */}
                      <h3 style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 700,
                        fontSize: '22px',
                        lineHeight: '30px',
                        color: '#FFFFFF',
                        margin: 0,
                        alignSelf: 'stretch',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
                      }}>
                        {getTranslatedField(branch.name, '')}
                      </h3>

                      {/* Bottom Section */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '8px',
                        alignSelf: 'stretch',
                      }}>
                        {/* Buttons Row */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          gap: '8px',
                          width: '100%',
                        }}>
                          {/* View Location Button */}
                          <button
                            onClick={() => handleViewLocation(branch)}
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: '8px 10px',
                              height: '34px',
                              background: 'linear-gradient(135deg, #0CA8D5 0%, #0A7ECB 100%)',
                              borderRadius: '10px',
                              border: '1px solid rgba(255, 255, 255, 0.35)',
                              cursor: 'pointer',
                              flex: 1,
                              gap: '6px',
                              boxShadow: '0 6px 16px rgba(4, 20, 43, 0.35)',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 9px 18px rgba(4, 20, 43, 0.42)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(4, 20, 43, 0.35)';
                            }}
                          >
                            <MapPinIcon />
                            <span style={{
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 600,
                              fontSize: '11px',
                              lineHeight: '13px',
                              color: '#FFFFFF',
                            }}>
                              View Location
                            </span>
                          </button>

                          {/* Call Now Button */}
                          <button
                            onClick={() => handleCallNow(branch.phone || '')}
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: '8px 10px',
                              height: '34px',
                              background: 'linear-gradient(135deg, #12B6E6 0%, #0B89D3 100%)',
                              borderRadius: '10px',
                              border: '1px solid rgba(255, 255, 255, 0.35)',
                              cursor: 'pointer',
                              flex: 1,
                              gap: '6px',
                              boxShadow: '0 6px 16px rgba(4, 20, 43, 0.35)',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 9px 18px rgba(4, 20, 43, 0.42)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(4, 20, 43, 0.35)';
                            }}
                          >
                            <PhoneCallIcon />
                            <span style={{
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 600,
                              fontSize: '11px',
                              lineHeight: '13px',
                              color: '#FFFFFF',
                            }}>
                              {t('callNow')}
                            </span>
                          </button>
                        </div>

                        {/* Address */}
                        <p style={{
                          fontFamily: 'Varela, sans-serif',
                          fontWeight: 400,
                          fontSize: '16px',
                          lineHeight: '20px',
                          color: '#FFFFFF',
                          margin: 0,
                          alignSelf: 'stretch',
                        }}>
                          {getTranslatedField(branch.address, '') || 'Jeddah, Saudi Arabia'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'flex-start',
              padding: '16px',
              gap: isMobile ? '16px' : '24px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '12px',
            }}
          >
            {/* Left Column - Name, Mobile, Email */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '10px',
              flex: 1,
              alignSelf: 'stretch',
            }}>
              {/* Name Input */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                alignSelf: 'stretch',
              }}>
                <label style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#061F42',
                  textAlign: i18n.language === 'ar' ? 'right' : 'left',
                  width: '100%',
                }}>
                  {t('name')}*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={t('typeYourName')}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '40px',
                    padding: '12px',
                    border: '1.5px solid #A4A5A5',
                    borderRadius: '12px',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#061F42',
                  }}
                />
              </div>

              {/* Mobile Number Input */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                alignSelf: 'stretch',
              }}>
                <label style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#061F42',
                  textAlign: i18n.language === 'ar' ? 'right' : 'left',
                  width: '100%',
                }}>
                  {t('mobileNumber')}*
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  placeholder={t('typeYourMobile')}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '40px',
                    padding: '12px',
                    border: '1.5px solid #A4A5A5',
                    borderRadius: '12px',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#061F42',
                  }}
                />
              </div>

              {/* Email Input */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                alignSelf: 'stretch',
              }}>
                <label style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#061F42',
                  textAlign: i18n.language === 'ar' ? 'right' : 'left',
                  width: '100%',
                }}>
                  {t('email')}*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder={t('typeYourEmail')}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '40px',
                    padding: '12px',
                    border: '1.5px solid #A4A5A5',
                    borderRadius: '12px',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#061F42',
                  }}
                />
              </div>
            </div>

            {/* Right Column - Message and Submit */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '10px',
              flex: 1,
              alignSelf: 'stretch',
            }}>
              {/* Message Textarea */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                alignSelf: 'stretch',
                flexGrow: 1,
              }}>
                <label style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#061F42',
                  textAlign: i18n.language === 'ar' ? 'right' : 'left',
                  width: '100%',
                }}>
                  {t('message')}*
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder={t('typeYourMessage')}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    minHeight: '162px',
                    padding: '12px',
                    border: '1.5px solid #A4A5A5',
                    borderRadius: '12px',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#061F42',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '8px 12px',
                  height: '32px',
                  background: submitting ? '#A4A5A5' : '#061F42',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: submitting ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.background = '#0A2D5C';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.background = '#061F42';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  lineHeight: '16px',
                  color: '#FFFFFF',
                  padding: '0 8px',
                }}>
                  {submitting ? t('sending') : t('send')}
                </span>
              </button>

              {/* Success Message */}
              {submitSuccess && (
                <div style={{
                  padding: '12px',
                  background: '#D4EDDA',
                  borderRadius: '8px',
                  border: '1px solid #C3E6CB',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#155724',
                  textAlign: 'center',
                  marginTop: '12px',
                }}>
                  Thank you for contacting us! We'll get back to you soon.
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div style={{
                  padding: '12px',
                  background: '#F8D7DA',
                  borderRadius: '8px',
                  border: '1px solid #F5C6CB',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#721C24',
                  textAlign: 'center',
                  marginTop: '12px',
                }}>
                  {submitError}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
