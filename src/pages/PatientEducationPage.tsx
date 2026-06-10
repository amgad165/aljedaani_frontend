import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FloatingContactButtons from '../components/FloatingContactButtons';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import { patientEducationService, type PatientEducation } from '../services/patientEducationService';

export default function PatientEducationPage() {
  const ResponsiveNavbar = useResponsiveNavbar();
  const { t } = useTranslation('pages');

  const [educations, setEducations] = useState<PatientEducation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEducations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await patientEducationService.getEducations({ active: true });
        setEducations(data);
      } catch (err) {
        console.error('Failed to fetch patient educations:', err);
        setError(t('errorLoadingData'));
      } finally {
        setLoading(false);
      }
    };

    fetchEducations();
  }, [t]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#C9F3FF',
          paddingTop: '0px',
        }}
      >
        {ResponsiveNavbar}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            marginTop: '124px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '1400px',
              padding: '24px',
              background: '#C9F3FF',
              borderRadius: '15px',
              paddingTop: '10px',
              isolation: 'isolate',
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  width: 320,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 150,
                    borderRadius: 16,
                    border: '1px solid #E5F4FF',
                    background: '#FFFFFF',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0, 171, 218, 0.08)',
                  }}
                >
                  <div
                    style={{
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: '60%',
                        height: 22,
                        borderRadius: 10,
                        background:
                          'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                    <div
                      style={{
                        width: '90%',
                        height: 12,
                        borderRadius: 10,
                        background:
                          'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                    <div
                      style={{
                        width: '80%',
                        height: 12,
                        borderRadius: 10,
                        background:
                          'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <style>{`
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#C9F3FF',
          paddingTop: '0px',
        }}
      >
        {ResponsiveNavbar}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            fontFamily: 'Nunito, sans-serif',
            fontSize: '18px',
            color: '#EE443F',
          }}
        >
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#C9F3FF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <FloatingContactButtons />
      {ResponsiveNavbar}

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          marginTop: '124px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1400px',
            padding: '24px',
            background: '#C9F3FF',
            borderRadius: '15px',
            paddingTop: '10px',
            isolation: 'isolate',
          }}
        >
          {/* Title */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '15px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 24px',
              marginBottom: '24px',
            }}
          >
            <h1
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: 44,
                lineHeight: '50px',
                color: '#061F42',
                margin: 0,
              }}
            >
              {/* Try existing i18n key; fallback to plain text */}
              {t('patientEducation') || 'Patient Education'}
            </h1>
          </div>

          {educations.length === 0 ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '200px',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '18px',
                color: '#6A6A6A',
              }}
            >
              {t('noDataAvailable') || 'No data available'}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
              }}
            >
              {educations
                .slice()
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((education) => (
                  <div
                    key={education.id}
                    style={{
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: 24,
                      gap: 14,
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FCFF 100%)',
                      border: '1px solid #E5F4FF',
                      borderRadius: '16px',
                      cursor: 'default',
                      transition: 'all 0.4s ease',
                      boxShadow: '0 2px 8px rgba(0, 171, 218, 0.08)',
                      minHeight: 140,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #E8F8FF 100%)';
                      el.style.transform = 'translateY(-6px)';
                      el.style.boxShadow = '0 12px 24px rgba(0, 171, 218, 0.18)';
                      el.style.borderColor = '#00ABDA';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #F8FCFF 100%)';
                      el.style.transform = 'translateY(0)';
                      el.style.boxShadow = '0 2px 8px rgba(0, 171, 218, 0.08)';
                      el.style.borderColor = '#E5F4FF';
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 700,
                        fontSize: 20,
                        lineHeight: '26px',
                        color: '#061F42',
                        margin: 0,
                      }}
                    >
                      {education.name}
                    </h3>

                    {education.description ? (
                      <p
                        style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontSize: 14,
                          lineHeight: '22px',
                          color: '#6A6A6A',
                          margin: 0,
                        }}
                      >
                        {education.description}
                      </p>
                    ) : (
                      <div
                        style={{
                          height: 22,
                          width: '70%',
                          borderRadius: 10,
                          background: 'rgba(0, 0, 0, 0.03)',
                        }}
                      />
                    )}

                    {/* PDF view/download */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {(() => {
                        const pdfUrl = education.pdf_url
                          ? education.pdf_url
                          : education.pdf_path?.startsWith('http')
                            ? education.pdf_path
                            : null;

                        if (!pdfUrl) {
                          return (
                            <span
                              style={{
                                fontFamily: 'Nunito, sans-serif',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#6A6A6A',
                              }}
                            >
                              PDF not available
                            </span>
                          );
                        }

                        return (
                          <>
                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn"
                              style={{
                                textDecoration: 'none',
                                background: '#00ABDA',
                                color: '#fff',
                                padding: '10px 14px',
                                borderRadius: 12,
                                fontSize: 13,
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              {t('viewPdf') ?? 'View PDF'}
                            </a>
                            <a
                              href={patientEducationService.getDownloadPdfUrl(education.id)}
                              className="btn"
                              style={{
                                textDecoration: 'none',
                                background: 'rgba(0, 171, 218, 0.08)',
                                color: '#00ABDA',
                                padding: '10px 14px',
                                borderRadius: 12,
                                fontSize: 13,
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                border: '1px solid rgba(0, 171, 218, 0.35)',
                              }}
                            >
                              {t('downloadPdf') ?? 'Download'}
                            </a>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
