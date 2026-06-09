import { useEffect, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import FloatingContactButtons from '../components/FloatingContactButtons';
import Footer from '../components/Footer';

const PrivacyPolicyPage = () => {
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
      title: t('privacyPolicyScopeTitle'),
      body: [t('privacyPolicyScopeBody')],
    },
    {
      title: t('privacyPolicyInfoCollectTitle'),
      body: [t('privacyPolicyInfoCollectIntro')],
      subsections: [
        {
          title: t('privacyPolicyPersonalInfoTitle'),
          items: [
            t('privacyPolicyPersonalInfoItem1'),
            t('privacyPolicyPersonalInfoItem2'),
            t('privacyPolicyPersonalInfoItem3'),
            t('privacyPolicyPersonalInfoItem4'),
            t('privacyPolicyPersonalInfoItem5'),
          ],
        },
        {
          title: t('privacyPolicyAccountInfoTitle'),
          items: [
            t('privacyPolicyAccountInfoItem1'),
            t('privacyPolicyAccountInfoItem2'),
            t('privacyPolicyAccountInfoItem3'),
          ],
        },
        {
          title: t('privacyPolicyHealthcareInfoTitle'),
          items: [
            t('privacyPolicyHealthcareInfoItem1'),
            t('privacyPolicyHealthcareInfoItem2'),
            t('privacyPolicyHealthcareInfoItem3'),
            t('privacyPolicyHealthcareInfoItem4'),
            t('privacyPolicyHealthcareInfoItem5'),
            t('privacyPolicyHealthcareInfoItem6'),
          ],
        },
        {
          title: t('privacyPolicyPaymentInfoTitle'),
          items: [
            t('privacyPolicyPaymentInfoItem1'),
            t('privacyPolicyPaymentInfoItem2'),
          ],
        },
        {
          title: t('privacyPolicyTechnicalInfoTitle'),
          items: [
            t('privacyPolicyTechnicalInfoItem1'),
            t('privacyPolicyTechnicalInfoItem2'),
            t('privacyPolicyTechnicalInfoItem3'),
            t('privacyPolicyTechnicalInfoItem4'),
            t('privacyPolicyTechnicalInfoItem5'),
            t('privacyPolicyTechnicalInfoItem6'),
          ],
        },
      ],
    },
    {
      title: t('privacyPolicyUseTitle'),
      body: [t('privacyPolicyUseIntro')],
      items: [
        t('privacyPolicyUseItem1'),
        t('privacyPolicyUseItem2'),
        t('privacyPolicyUseItem3'),
        t('privacyPolicyUseItem4'),
        t('privacyPolicyUseItem5'),
        t('privacyPolicyUseItem6'),
        t('privacyPolicyUseItem7'),
        t('privacyPolicyUseItem8'),
        t('privacyPolicyUseItem9'),
      ],
    },
    {
      title: t('privacyPolicyDiagnosticsTitle'),
      body: [
        t('privacyPolicyDiagnosticsBody1'),
        t('privacyPolicyDiagnosticsBody2'),
      ],
      items: [
        t('privacyPolicyDiagnosticsItem1'),
        t('privacyPolicyDiagnosticsItem2'),
        t('privacyPolicyDiagnosticsItem3'),
        t('privacyPolicyDiagnosticsItem4'),
        t('privacyPolicyDiagnosticsItem5'),
      ],
      footer: t('privacyPolicyDiagnosticsFooter'),
    },
    {
      title: t('privacyPolicyNotificationsTitle'),
      body: [t('privacyPolicyNotificationsBody')],
      items: [
        t('privacyPolicyNotificationsItem1'),
        t('privacyPolicyNotificationsItem2'),
        t('privacyPolicyNotificationsItem3'),
        t('privacyPolicyNotificationsItem4'),
        t('privacyPolicyNotificationsItem5'),
      ],
      footer: t('privacyPolicyNotificationsFooter'),
    },
    {
      title: t('privacyPolicyShareTitle'),
      body: [t('privacyPolicyShareIntro')],
      items: [
        t('privacyPolicyShareItem1'),
        t('privacyPolicyShareItem2'),
        t('privacyPolicyShareItem3'),
        t('privacyPolicyShareItem4'),
        t('privacyPolicyShareItem5'),
        t('privacyPolicyShareItem6'),
      ],
      footer: t('privacyPolicyShareFooter'),
    },
    {
      title: t('privacyPolicySecurityTitle'),
      body: [t('privacyPolicySecurityBody1'), t('privacyPolicySecurityBody2')],
      items: [
        t('privacyPolicySecurityItem1'),
        t('privacyPolicySecurityItem2'),
        t('privacyPolicySecurityItem3'),
        t('privacyPolicySecurityItem4'),
        t('privacyPolicySecurityItem5'),
      ],
      footer: t('privacyPolicySecurityFooter'),
    },
    {
      title: t('privacyPolicyPortalTitle'),
      body: [t('privacyPolicyPortalBody1'), t('privacyPolicyPortalBody2')],
    },
    {
      title: t('privacyPolicyCookiesTitle'),
      body: [t('privacyPolicyCookiesBody')],
      items: [
        t('privacyPolicyCookiesItem1'),
        t('privacyPolicyCookiesItem2'),
        t('privacyPolicyCookiesItem3'),
        t('privacyPolicyCookiesItem4'),
      ],
      footer: t('privacyPolicyCookiesFooter'),
    },
    {
      title: t('privacyPolicyChildrenTitle'),
      body: [t('privacyPolicyChildrenBody')],
    },
    {
      title: t('privacyPolicyRetentionTitle'),
      body: [t('privacyPolicyRetentionBody')],
      items: [
        t('privacyPolicyRetentionItem1'),
        t('privacyPolicyRetentionItem2'),
        t('privacyPolicyRetentionItem3'),
        t('privacyPolicyRetentionItem4'),
      ],
      footer: t('privacyPolicyRetentionFooter'),
    },
    {
      title: t('privacyPolicyAccountDeletionTitle'),
      body: [t('privacyPolicyAccountDeletionBody1'), t('privacyPolicyAccountDeletionBody2')],
    },
    {
      title: t('privacyPolicyRightsTitle'),
      body: [t('privacyPolicyRightsIntro')],
      items: [
        t('privacyPolicyRightsItem1'),
        t('privacyPolicyRightsItem2'),
        t('privacyPolicyRightsItem3'),
        t('privacyPolicyRightsItem4'),
        t('privacyPolicyRightsItem5'),
        t('privacyPolicyRightsItem6'),
        t('privacyPolicyRightsItem7'),
      ],
      footer: t('privacyPolicyRightsFooter'),
    },
    {
      title: t('privacyPolicyInternationalTitle'),
      body: [t('privacyPolicyInternationalBody')],
    },
    {
      title: t('privacyPolicyChangesTitle'),
      body: [t('privacyPolicyChangesBody1'), t('privacyPolicyChangesBody2')],
    },
    {
      title: t('privacyPolicyContactTitle'),
      body: [t('privacyPolicyContactBody1'), t('privacyPolicyContactBody2'), t('privacyPolicyContactBody3'), t('privacyPolicyContactBody4')],
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
              {t('privacyPolicyTitle')}
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
            <p style={{
              ...bodyStyle,
              fontWeight: 600,
              color: '#6B7280',
            }}>
              {t('privacyPolicyUpdated')}
            </p>
            <p style={bodyStyle}>{t('privacyPolicyIntro')}</p>

            {sections.map((section) => (
              <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h2 style={sectionTitleStyle}>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} style={bodyStyle}>{paragraph}</p>
                ))}
                {section.subsections && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                    {section.subsections.map((subsection) => (
                      <div key={subsection.title} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h3 style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 600,
                          fontSize: isMobile ? '16px' : '18px',
                          lineHeight: isMobile ? '24px' : '26px',
                          color: '#1F2937',
                          margin: '0 0 4px 0',
                          textAlign: isRTL ? 'right' : 'left',
                        }}>
                          {subsection.title}
                        </h3>
                        <ul style={listStyle}>
                          {subsection.items.map((item) => (
                            <li key={item} style={{ ...bodyStyle, marginBottom: '6px' }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {section.items && !section.subsections && (
                  <ul style={listStyle}>
                    {section.items.map((item) => (
                      <li key={item} style={{ ...bodyStyle, marginBottom: '6px' }}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.footer && (
                  <p style={bodyStyle}>{section.footer}</p>
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

export default PrivacyPolicyPage;
