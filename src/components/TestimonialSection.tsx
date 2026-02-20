import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomepageData } from '../context/HomepageContext';
import { getTranslatedField } from '../utils/localeHelpers';
import { useTranslation } from 'react-i18next';

interface DoctorCard {
  id: number;
  doctorId: number;
  branchId: number;
  departmentId: number;
  title: string;
  subtitle: string;
  image: string;
  badge1: string;
  badge2: string;
  reviewTitle: string;
  description: string;
}

// Navigation Icon - defined outside component
const RightArrowIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="#FFFFFF"/>
    <path d="M20 18L28 26L20 34" stroke="#061F42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LeftArrowIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="#FFFFFF"/>
    <path d="M28 18L20 26L28 34" stroke="#061F42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TestimonialSection = () => {
  const { data, loading, error } = useHomepageData();
  const { t } = useTranslation('pages');
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const allDoctors: DoctorCard[] = (data?.testimonials || [])
    .filter((testimonial: any) => testimonial.doctor)
    .map((testimonial: any) => ({
      id: testimonial.id,
      doctorId: testimonial.doctor?.id,
      branchId: testimonial.doctor?.branch?.id,
      departmentId: testimonial.doctor?.department?.id,
      title: ` ${getTranslatedField(testimonial.doctor?.name, '')}`,
      subtitle: getTranslatedField(testimonial.doctor?.specialization, ''),
      image: testimonial.doctor?.image_url || '',
      badge1: getTranslatedField(testimonial.doctor?.branch?.name, ''),
      badge2: getTranslatedField(testimonial.doctor?.department?.name, ''),
      reviewTitle: getTranslatedField(testimonial.review_title, ''),
      description: getTranslatedField(testimonial.description, '')
    }));

  const handleNext = useCallback(() => {
    if (isAnimating || currentIndex + 3 >= allDoctors.length) return;
    setIsAnimating(true);
    setCurrentIndex(prev => prev + 1);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, currentIndex, allDoctors.length]);

  const handlePrev = useCallback(() => {
    if (isAnimating || currentIndex === 0) return;
    setIsAnimating(true);
    setCurrentIndex(prev => prev - 1);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, currentIndex]);

  const canGoNext = currentIndex + 3 < allDoctors.length;
  const canGoPrev = currentIndex > 0;

  if (loading) {
    return (
      <section style={{ padding: '80px 0' }}>
        <div style={{ textAlign: 'center', fontSize: '18px', color: '#061F42' }}>
          {t('loadingTestimonials')}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: '80px 0' }}>
        <div style={{ textAlign: 'center', fontSize: '18px', color: '#dc3545' }}>
          {error}
        </div>
      </section>
    );
  }

  return (
    <>
      <style>
        {`
          @media (max-width: 992px) {
            .testimonial-container {
              padding: 0 16px !important;
            }
            .testimonial-title {
              font-size: 32px !important;
              line-height: 38px !important;
            }
            .testimonial-carousel {
              padding: 0 !important;
              overflow: visible !important;
            }
            .testimonial-viewport {
              width: 100% !important;
              overflow-x: auto !important;
              overflow-y: hidden !important;
              -webkit-overflow-scrolling: touch !important;
              scroll-snap-type: x mandatory !important;
              height: auto !important;
            }
            .testimonial-slider {
              transform: none !important;
              width: auto !important;
              display: flex !important;
              gap: 16px !important;
              padding: 0 20px;
            }
            .testimonial-card {
              scroll-snap-align: center !important;
              min-width: 300px !important;
              max-width: 300px !important;
              flex: 0 0 auto !important;
            }
            .nav-button {
              display: none !important;
            }
          }
          @media (max-width: 576px) {
            .testimonial-section {
              padding: 60px 0 !important;
            }
            .testimonial-title {
              font-size: 28px !important;
              line-height: 34px !important;
            }
            .testimonial-card {
              min-width: 280px !important;
              max-width: 280px !important;
              height: auto !important;
              min-height: 380px !important;
              flex: 0 0 auto !important;
            }
            .testimonial-slider {
              padding: 0 16px;
            }
          }
          @media (max-width: 400px) {
            .testimonial-card {
              min-width: calc(100vw - 48px) !important;
              max-width: calc(100vw - 48px) !important;
            }
            .testimonial-slider {
              padding: 0 12px;
            }
          }
        `}
      </style>
      <section className="testimonial-section" style={{ padding: '40px 0' }}>
        <div
          className="testimonial-container"
          style={{
            maxWidth: '1228px',
            margin: '0 auto',
            padding: '0 9px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '24px'
          }}
        >
        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px 32px',
            width: '100%'
          }}
        >
          <h2
            className="testimonial-title"
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'normal',
              fontWeight: 800,
              fontSize: '48px',
              lineHeight: '50px',
              textAlign: 'center',
              color: '#061F42',
              margin: 0,
              flex: 1
            }}
          >
            {t('testimonials')}
          </h2>
        </div>

        {/* Cards Container */}
        <div
          className="testimonial-carousel"
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 120px',
            width: '100%',
            maxWidth: '1368px',
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {/* Sliding Container */}
          <div
            className="testimonial-viewport"
            style={{
              width: `${3 * (300 + 24)}px`,
              height: '376px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
          <div
            className="testimonial-slider"
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '24px',
              transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: `translateX(-${currentIndex * (300 + 24)}px)`,
              width: `${allDoctors.length * (300 + 24)}px`
            }}
          >
            {allDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="testimonial-card"
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px',
                gap: '12px',
                margin: '0 auto',
                width: '300px',
                minWidth: '270px',
                maxWidth: '300px',
                height: '376px',
                background: '#FFFFFF',
                border: '1px solid #D8D8D8',
                borderRadius: '12px',
                flex: 1
              }}
            >
              {/* Image */}
              <div
                style={{
                  width: '116px',
                  height: '116px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={doctor.image || '/assets/images/testimonials/person_template.png'}
                  alt={doctor.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Title/Subtitle */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 0,
                  width: '276px'
                }}
              >
                <h3
                  style={{
                    width: '276px',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '20px',
                    textAlign: 'center',
                    color: '#061F42',
                    margin: 0,
                    marginBottom: '4px'
                  }}
                >
                  {doctor.title}
                </h3>
                <p
                  style={{
                    width: '276px',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    textAlign: 'center',
                    color: '#061F42',
                    margin: 0
                  }}
                >
                  {doctor.subtitle}
                </p>
              </div>

              {/* Badges Section */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '8px',
                  gap: '8px',
                  width: '276px',
                  background: '#F8F8F8',
                  borderRadius: '12px'
                }}
              >
                {/* Badge Row */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: 0,
                    gap: '4px',
                    width: '100%'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '4px 8px',
                      gap: '4px',
                      background: '#FFFFFF',
                      border: '1px solid #D9D9D9',
                      borderRadius: '24px',
                      flex: 'none'
                    }}
                  >
                    <img
                      src="/assets/images/testimonials/pin-alt.png"
                      alt="location"
                      style={{
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 600,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#6A6A6A'
                      }}
                    >
                      {doctor.badge1}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '4px 8px',
                      gap: '4px',
                      background: '#A7FAFC',
                      borderRadius: '24px',
                      flex: 1
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 600,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#061F42'
                      }}
                    >
                      {doctor.badge2}
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <h4
                  style={{
                    width: '260px',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '20px',
                    color: '#061F42',
                    margin: 0,
                    marginBottom: '8px'
                  }}
                >
                  {doctor.reviewTitle}
                </h4>

                {/* Description */}
                <p
                  style={{
                    width: '260px',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#061F42',
                    margin: 0
                  }}
                >
                  {getTranslatedField(doctor.description, '')}
                </p>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  padding: 0,
                  gap: '8px',
                  width: '276px'
                }}
              >
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      doctor_id: doctor.doctorId.toString(),
                      branch_id: doctor.branchId?.toString() || '',
                      department_id: doctor.departmentId?.toString() || '',
                    });
                    navigate(`/book-appointment?${params.toString()}`);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 12px',
                    flex: 1,
                    height: '32px',
                    background: '#061F42',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#FFFFFF'
                  }}
                >
                  {t('bookNow')}
                </button>
                <button
                  onClick={() => navigate(`/doctors/${doctor.doctorId}`)}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 12px',
                    flex: 1,
                    height: '32px',
                    background: '#15C9FA',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#FFFFFF'
                  }}
                >
                  {t('readMore')}
                </button>
              </div>
            </div>
            ))}
          </div>
          </div>

          {/* Navigation Button - Left */}
          <button
            onClick={handlePrev}
            className="nav-button"
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: canGoPrev ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canGoPrev ? (isAnimating ? 0.5 : 1) : 0.3,
              transition: 'opacity 0.3s ease',
              zIndex: 10
            }}
            disabled={!canGoPrev}
          >
            <LeftArrowIcon />
          </button>

          {/* Navigation Button - Right */}
          <button
            onClick={handleNext}
            className="nav-button"
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: canGoNext ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canGoNext ? (isAnimating ? 0.5 : 1) : 0.3,
              transition: 'opacity 0.3s ease',
              zIndex: 10
            }}
            disabled={!canGoNext}
          >
            <RightArrowIcon />
          </button>
        </div>
      </div>
    </section>
    </>
  );
};

export default TestimonialSection;
