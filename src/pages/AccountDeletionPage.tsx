import { useEffect, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import FloatingContactButtons from '../components/FloatingContactButtons';
import Footer from '../components/Footer';

const AccountDeletionPage = () => {
  const { t, i18n } = useTranslation('pages');
  const ResponsiveNavbar = useResponsiveNavbar();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sectionTitleStyle: CSSProperties = {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 700,
    fontSize: isMobile ? '20px' : '24px',
    lineHeight: isMobile ? '28px' : '32px',
    color: '#061F42',
    margin: '0 0 8px 0',
    textAlign: isRTL ? 'right' : 'left',
  };

  const bodyStyle: CSSProperties = {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 400,
    fontSize: isMobile ? '14px' : '16px',
    lineHeight: isMobile ? '22px' : '26px',
    color: '#2B3A4A',
    margin: 0,
    textAlign: isRTL ? 'right' : 'left',
  };

  const listStyle: CSSProperties = {
    margin: isMobile ? '8px 0 0 0' : '10px 0 0 0',
    paddingInlineStart: isRTL ? 0 : '20px',
    paddingInlineEnd: isRTL ? '20px' : 0,
    direction: isRTL ? 'rtl' : 'ltr',
  };

  const sections = [
    {
      title: t('accountDeletionHowTitle'),
      body: [t('accountDeletionHowIntro')],
      items: [
        t('accountDeletionHowStep1'),
        t('accountDeletionHowStep2'),
        t('accountDeletionHowStep3'),
        t('accountDeletionHowStep4'),
      ],
      footer: t('accountDeletionHowAlternative'),
      contactSection: true,
    },
    {
      title: t('accountDeletionWhatTitle'),
      body: [t('accountDeletionWhatIntro')],
      items: [
        t('accountDeletionWhatItem1'),
        t('accountDeletionWhatItem2'),
        t('accountDeletionWhatItem3'),
      ],
    },
    {
      title: t('accountDeletionRetainedTitle'),
      body: [t('accountDeletionRetainedBody')],
    },
    {
      title: t('accountDeletionContactTitle'),
      body: [t('accountDeletionContactBody1'), t('accountDeletionContactBody2'), t('accountDeletionContactBody3')],
    },
  ];

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
        padding: isMobile ? '90px 16px 40px' : '131px 20px 40px',
        direction: isRTL ? 'rtl' : 'ltr',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '10px 16px' : '10px 32px',
            background: '#FFFFFF',
            borderRadius: '15px',
            minHeight: isMobile ? 'auto' : '80px',
          }}>
            <h1 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: isMobile ? '28px' : '44px',
              lineHeight: isMobile ? '32px' : '50px',
              textAlign: isRTL ? 'right' : 'left',
              color: '#061F42',
              margin: 0,
              flexGrow: 1,
            }}>
              {t('accountDeletionTitle')}
            </h1>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: isMobile ? '14px' : '24px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '20px',
          }}>
            <p style={bodyStyle}>{t('accountDeletionIntro')}</p>

            {sections.map((section) => (
              <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h2 style={sectionTitleStyle}>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} style={bodyStyle}>{paragraph}</p>
                ))}
                {section.items && !section.contactSection && (
                  <ul style={listStyle}>
                    {section.items.map((item) => (
                      <li key={item} style={{ ...bodyStyle, marginBottom: '6px' }}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.contactSection && section.items && (
                  <ol style={listStyle}>
                    {section.items.map((item) => (
                      <li key={item} style={{ ...bodyStyle, marginBottom: '6px' }}>{item}</li>
                    ))}
                  </ol>
                )}
                {section.footer && (
                  <div>
                    <p style={bodyStyle}>{section.footer}</p>
                    {section.contactSection && (
                      <div style={{ marginTop: '10px', paddingInlineStart: isRTL ? 0 : '20px', paddingInlineEnd: isRTL ? '20px' : 0 }}>
                        <p style={bodyStyle}>
                          {t('accountDeletionContactEmail')}: <a href="mailto:contact@jedaanihospitals.com" style={{ color: '#0284C7', textDecoration: 'none' }}>contact@jedaanihospitals.com</a>
                        </p>
                        <p style={bodyStyle}>
                          {t('accountDeletionContactPhone')}: 920022404
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccountDeletionPage;
