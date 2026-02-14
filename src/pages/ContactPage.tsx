import React, { useState, useEffect } from 'react';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import { branchesService, type Branch } from '../services/branchesService';
import { getTranslatedField } from '../utils/localeHelpers';
import FloatingContactButtons from '../components/FloatingContactButtons';
import Footer from '../components/Footer';

const ContactPage: React.FC = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<number | null>(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: ''
  });

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
        padding: window.innerWidth <= 768 ? '90px 16px 40px' : '131px 20px 40px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Page Title */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: window.innerWidth <= 768 ? '8px 12px' : '10px 32px',
            background: '#FFFFFF',
            borderRadius: '15px',
            height: window.innerWidth <= 768 ? 'auto' : '58px',
          }}>
            <h1 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: window.innerWidth <= 768 ? '24px' : '44px',
              lineHeight: '50px',
              textAlign: 'left',
              color: '#061F42',
              margin: 0,
              flexGrow: 1,
            }}>
              Contact us
            </h1>
          </div>

          {/* Our Branches Title */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px 32px',
            height: '58px',
          }}>
            <h2 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '24px',
              lineHeight: '38px',
              textAlign: 'center',
              color: '#061F42',
              margin: 0,
              flexGrow: 1,
            }}>
              Our Branches
            </h2>
          </div>

          {/* Branch Cards */}
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
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
                  }}>
                    {/* Bottom Overlay - Always visible */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '20%',
                      background: 'rgba(79, 79, 79, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      opacity: hoveredBranch === branch.id ? 0 : 1,
                      transition: 'opacity 0.3s ease',
                    }}>
                      <h3 style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 700,
                        fontSize: '18px',
                        lineHeight: '24px',
                        color: '#FFFFFF',
                        margin: 0,
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
                      padding: '12px',
                      gap: '8px',
                      width: '100%',
                      height: '100%',
                      background: 'rgba(79, 79, 79, 0.8)',
                      borderRadius: '12px',
                      opacity: hoveredBranch === branch.id ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }}>
                      {/* Branch Name */}
                      <h3 style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 700,
                        fontSize: '24px',
                        lineHeight: '38px',
                        color: '#FFFFFF',
                        margin: 0,
                        alignSelf: 'stretch',
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
                              padding: '6px 8px',
                              height: '24px',
                              background: '#15C9FA',
                              borderRadius: '8px',
                              border: 'none',
                              cursor: 'pointer',
                              flex: 1,
                              gap: '4px',
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M11 3L13 5L11 7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5 13L3 11L5 9" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 600,
                              fontSize: '10px',
                              lineHeight: '12px',
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
                              padding: '6px 8px',
                              height: '24px',
                              background: '#15C9FA',
                              borderRadius: '8px',
                              border: 'none',
                              cursor: 'pointer',
                              flex: 1,
                              gap: '4px',
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M14.5 11.5V13.5C14.5 13.7652 14.3946 14.0196 14.2071 14.2071C14.0196 14.3946 13.7652 14.5 13.5 14.5C10.3993 14.2056 7.42015 12.9192 5.11162 10.7584C2.97231 8.75878 1.50378 6.25774 0.875 3.58333C0.875 3.31812 0.980357 3.06377 1.16789 2.87623C1.35543 2.68869 1.60978 2.58333 1.875 2.58333H3.875C4.10043 2.58333 4.31754 2.66667 4.48214 2.81667C4.64674 2.96667 4.74766 3.17333 4.765 3.39583C4.795 3.81667 4.865 4.23417 4.975 4.6425C5.03299 4.85917 5.015 5.08917 4.925 5.29583C4.835 5.50333 4.675 5.67667 4.475 5.79167L3.165 6.58333C4.165 8.775 5.85 10.5167 7.925 11.5833L8.665 10.25C8.77167 10.05 8.935 9.89 9.13417 9.79917C9.33333 9.70833 9.55583 9.69083 9.76667 9.75C10.1633 9.8625 10.5683 9.93333 10.9783 9.9625C11.2042 9.98 11.4092 10.0825 11.5575 10.2492C11.7067 10.4158 11.7883 10.635 11.7867 10.8617V13.5H14.5Z" stroke="#FFFFFF" strokeWidth="1.5"/>
                            </svg>
                            <span style={{
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 600,
                              fontSize: '10px',
                              lineHeight: '12px',
                              color: '#FFFFFF',
                            }}>
                              Call Now
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
                          {branch.address || 'Jeddah, Saudi Arabia'}
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
              flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
              alignItems: 'flex-start',
              padding: '16px',
              gap: '24px',
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
                }}>
                  Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Type your name"
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
                }}>
                  Mobile Number*
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  placeholder="Type your mobile number"
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
                }}>
                  Email*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Type your email"
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
                }}>
                  Message*
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Type your message"
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
                  {submitting ? 'Sending...' : 'Send'}
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
