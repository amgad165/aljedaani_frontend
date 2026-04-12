import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import FloatingContactButtons from '../components/FloatingContactButtons';
import Footer from '../components/Footer';

const CareerApplicationSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation('pages');
  const ResponsiveNavbar = useResponsiveNavbar();

  const isArabic = i18n.language === 'ar';

  return (
    <div style={{ minHeight: '100vh', background: '#C9F3FF', display: 'flex', flexDirection: 'column' }}>
      <FloatingContactButtons />
      {ResponsiveNavbar}

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '132px 20px 48px',
          direction: isArabic ? 'rtl' : 'ltr',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '30px 24px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(6, 31, 66, 0.08)',
          }}
        >
          <div
            style={{
              width: 74,
              height: 74,
              margin: '0 auto 14px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#dcfce7',
              border: '1px solid #bbf7d0',
            }}
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 7L10 17L4 11" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 style={{ margin: '0 0 10px', color: '#061F42', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 34 }}>
            {isArabic ? 'تم إرسال طلب التوظيف بنجاح' : 'Application Submitted Successfully'}
          </h1>
          <p style={{ margin: '0 auto 20px', maxWidth: 520, color: '#475569', fontFamily: 'Varela, sans-serif', lineHeight: '24px' }}>
            {isArabic
              ? 'شكرًا لتقديمك. تم استلام طلبك وسيتواصل فريق التوظيف معك قريبًا في حال مطابقة الملف للمتطلبات.'
              : 'Thank you for applying. Your application has been received and our recruitment team will contact you if your profile matches the role.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/careers')}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isArabic ? 'العودة للوظائف' : 'Back to Careers'}
            </button>
            {id && (
              <button
                onClick={() => navigate(`/careers/${id}`)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#061F42',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isArabic ? 'عرض تفاصيل الوظيفة' : 'View Job Details'}
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CareerApplicationSuccessPage;
