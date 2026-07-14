import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import FloatingContactButtons from '../components/FloatingContactButtons';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';

const APPLE_STORE_URL = 'https://apps.apple.com/us/app/jedaani-hospitals/id6778514136';
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.jedaani.jedaanihospitals';

export default function MobileAppPage() {
  const { t, i18n } = useTranslation('pages');
  const ResponsiveNavbar = useResponsiveNavbar();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const storeBadges = useMemo(
    () => [
      {
        href: APPLE_STORE_URL,
        imgSrc: '/assets/img/applestore.png',
        alt: 'Applestore',
      },
      {
        href: GOOGLE_PLAY_URL,
        imgSrc: '/assets/img/playstore.png',
        alt: 'Playstore',
      },
    ],
    [],
  );

  return (
    <>
      <FloatingContactButtons />
      {ResponsiveNavbar}

      <div
        style={{
          minHeight: '100vh',
          background: '#C9F3FF',
          paddingTop: '131px',
          paddingBottom: '60px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '33px 36px',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(6,31,66,0.08)',
              borderRadius: 20,
              padding: '28px 42px',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            }}
          >
            {/* Desktop: two columns. Mobile: single column with good visual hierarchy */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 26,
                alignItems: 'center',
                direction: isRTL ? 'rtl' : 'ltr',
              }}
              className="mobile-app-layout"
            >
              {/* Left column: text + badges (stacked vertically) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isRTL ? 'flex-end' : 'flex-start',
                  gap: 14,
                  padding: '8px 6px',
                }}
              >
                <h1
                  style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 900,
                    fontSize: 44,
                    lineHeight: '50px',
                    color: '#061F42',
                    margin: 0,
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  {t('downloadMobileApp')}
                </h1>

                <h2
                  style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: 26,
                    lineHeight: '32px',
                    color: '#061F42',
                    margin: 0,
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  {t('mobileAppSubtitle')}
                </h2>

                {/* Badges stacked: Apple on top, Play under it */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    alignItems: isRTL ? 'flex-end' : 'flex-start',
                    paddingTop: 6,
                  }}
                >
                  {storeBadges.map((badge) => (
                    <a
                      key={badge.href}
                      href={badge.href}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'block',
                        textDecoration: 'none',
                        borderRadius: 14,
                        overflow: 'hidden',
                        boxShadow: '0 12px 28px rgba(0,0,0,2%)',
                        transform: 'translateZ(0)',
                        transition: 'transform 160ms ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0px)';
                      }}
                    >
                      <img
                        src={badge.imgSrc}
                        alt={badge.alt}
                        style={{
                          width: 'min(270px, 44vw)',
                          height: 'auto',
                          display: 'block',
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* Right column: Phone mockup */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isRTL ? 'flex-start' : 'flex-end',
                  padding: '10px 6px',
                }}
              >
                <img
                  src="/assets/img/mobile-img.webp"
                  alt="Mobile App"
                  style={{
                    width: 'min(350px, 48vw)',
                    height: 'auto',
                    objectFit: 'contain',
                    imageRendering: 'auto',
                    filter: 'drop-shadow(0 18px 45px rgba(0, 0, 0, 0.18))',
                  }}
                />
              </div>
            </div>

            {/* Mobile styles */}
            <style>{`
              @media (max-width: 860px) {
                /* Mobile: phone first (top), badges under it for clean eye flow */
                .mobile-app-layout {
                  grid-template-columns: 1fr !important;
                  gap: 18px !important;
                  align-items: center !important;
                }

                /* Phone should be first */
                .mobile-app-layout > :last-child {
                  order: 1 !important;
                }

                /* Badges/text should be second */
                .mobile-app-layout > :first-child {
                  order: 2 !important;
                }

                /* Adjust badge size on mobile (more eye-friendly sizing) */
                .mobile-app-layout img[src*="applestore"] {
                  width: min(240px, 64vw) !important;
                }
                .mobile-app-layout img[src*="playstore"] {
                  width: min(240px, 64vw) !important;
                }

                /* Hide mobile image (phone mockup) in mobile view */
                .mobile-app-layout img[alt="Mobile App"] {
                  display: none !important;
                }
              }
            `}</style>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
