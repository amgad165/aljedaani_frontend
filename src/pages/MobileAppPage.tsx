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
        imgSrc: '/assets/img/applestore.webp',
        alt: 'Applestore',
      },
      {
        href: GOOGLE_PLAY_URL,
        imgSrc: '/assets/img/playstore.webp',
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
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
          }}
        >
          {/* Phone thumbnail (focal point) */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 8,
            }}
          >
            <img
              src="/assets/img/mobile-img.webp"
              alt="Mobile App"
              style={{
                width: 'min(330px, 82vw)',
                height: 'auto',
                objectFit: 'contain',
                imageRendering: 'auto',
                filter: 'drop-shadow(0 12px 30px rgba(0, 0, 0, 0.15))',
              }}
            />
          </div>

          {/* Optional heading + subtext (reusing existing copy) */}
          <div
            style={{
              width: '100%',
              textAlign: isRTL ? 'right' : 'left',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isRTL ? 'flex-end' : 'flex-start',
              gap: 6,
              padding: '0 6px',
              marginTop: -8,
            }}
          >
            <h1
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 800,
                fontSize: 44,
                lineHeight: '48px',
                color: '#061F42',
                margin: 0,
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
              }}
            >
              {t('mobileAppSubtitle')}
            </h2>
          </div>

          {/* Store badges in exact order: App Store first, Google Play second */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
              justifyContent: isRTL ? 'flex-start' : 'flex-start',
              paddingTop: 6,
              paddingBottom: 8,
            }}
          >
            {storeBadges.map((badge) => (
              <a
                key={badge.href}
                href={badge.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-block',
                }}
              >
                <img
                  src={badge.imgSrc}
                  alt={badge.alt}
                  style={{
                    width: 160,
                    height: 'auto',
                  }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
