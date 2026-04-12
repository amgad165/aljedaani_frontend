import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import FloatingContactButtons from '../components/FloatingContactButtons';
import Footer from '../components/Footer';
import { careersService, type Career } from '../services/careersService';

const MetaIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      width: 24,
      height: 24,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#E7F7FF',
      border: '1px solid #BEE8F8',
      color: '#0D5E88',
      flexShrink: 0,
    }}
    aria-hidden="true"
  >
    {children}
  </span>
);

const MetaPill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 10px',
      borderRadius: 999,
      background: '#F8FBFF',
      border: '1px solid #E2E8F0',
      fontFamily: 'Varela, sans-serif',
      fontSize: '14px',
      lineHeight: '21px',
      color: '#4A5565',
      whiteSpace: 'nowrap',
    }}
  >
    {icon}
    <span>{text}</span>
  </span>
);

const CareersPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('pages');
  const ResponsiveNavbar = useResponsiveNavbar();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    careersService
      .getCareers()
      .then((data) => setCareers(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#C9F3FF', display: 'flex', flexDirection: 'column' }}>
      <FloatingContactButtons />
      {ResponsiveNavbar}

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: isMobile ? '92px 12px 36px' : '132px 20px 48px',
          direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
        }}
      >
        <div style={{ width: '100%', maxWidth: '1120px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: isMobile ? '10px 16px' : '8px 8px 8px 24px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '15px',
              minHeight: isMobile ? '60px' : '66px',
            }}
          >
            <h1
              style={{
                width: '100%',
                margin: 0,
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: isMobile ? '34px' : '48px',
                lineHeight: isMobile ? '40px' : '50px',
                color: '#061F42',
              }}
            >
              {t('careers')}
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: isMobile ? '8px' : '12px',
              gap: '12px',
              width: '100%',
              borderRadius: '12px',
              background: 'rgba(201, 243, 255, 0.25)',
            }}
          >
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '100%',
                    height: '74px',
                    borderRadius: '12px',
                    background: 'linear-gradient(90deg, #e8edf0 25%, #dfe9ef 50%, #e8edf0 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'careersShimmer 1.2s infinite',
                  }}
                />
              ))
            ) : careers.length === 0 ? (
              <div
                style={{
                  width: '100%',
                  padding: '24px',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  textAlign: 'center',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#4A5565',
                }}
              >
                No open positions right now.
              </div>
            ) : (
              careers.map((career) => (
                <div
                  key={career.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '12px 16px',
                    width: '100%',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #F3F4F6',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      justifyContent: 'space-between',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      width: '100%',
                      gap: isMobile ? '10px' : '16px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700,
                          fontSize: '12px',
                          lineHeight: '16px',
                          letterSpacing: '0.6px',
                          textTransform: 'uppercase',
                          color: '#00ABDA',
                        }}
                      >
                        {careersService.getField(career.department, i18n.language === 'ar' ? 'ar' : 'en') || 'General'}
                      </span>
                      <h3
                        style={{
                          margin: 0,
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 700,
                          fontSize: '20px',
                          lineHeight: '25px',
                          color: '#061F42',
                        }}
                      >
                        {careersService.getField(career.title, i18n.language === 'ar' ? 'ar' : 'en')}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '24px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: isMobile ? '100%' : '560px' }}>
                        <MetaPill
                          icon={(
                            <MetaIcon>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M12 22C16 17.8 19 14.8 19 11C19 7.13 15.87 4 12 4C8.13 4 5 7.13 5 11C5 14.8 8 17.8 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="2" />
                              </svg>
                            </MetaIcon>
                          )}
                          text={career.location}
                        />
                        <MetaPill
                          icon={(
                            <MetaIcon>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M5 8V6.8C5 5.25 6.25 4 7.8 4H16.2C17.75 4 19 5.25 19 6.8V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <rect x="4" y="8" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </MetaIcon>
                          )}
                          text={careersService.getEmploymentTypeLabel(career.employment_type)}
                        />
                        {career.experience_level && (
                          <MetaPill
                            icon={(
                              <MetaIcon>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <path d="M3 12H7L10 5L14 19L17 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </MetaIcon>
                            )}
                            text={career.experience_level}
                          />
                        )}
                      </div>

                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/careers/${career.id}`);
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          color: '#061F42',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          fontSize: '20px',
                        }}
                        aria-label="Apply"
                      >
                        →
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style>
        {`@keyframes careersShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}
      </style>
    </div>
  );
};

export default CareersPage;
