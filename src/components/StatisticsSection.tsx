import { useEffect, useState } from 'react';
import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';
import { useTranslation } from 'react-i18next';

interface Stat {
  id: number;
  number: number;
  labelKey: string;
  icon: string;
}

const Counter = ({ target, isVisible }: { target: number; isVisible: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    const increment = target / 100;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current < target) {
        setCount(Math.floor(current));
      } else {
        setCount(target);
        clearInterval(timer);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [target, isVisible]);

  return <>{count}</>;
};

const StatisticsSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation();
  const { t } = useTranslation('pages');
  
  const stats: Stat[] = [
    { id: 1, number: 300, labelKey: 'beds', icon: '/assets/images/care_section/bed.png' },
    { id: 2, number: 22, labelKey: 'specialties', icon: '/assets/images/care_section/plus.png' },
    { id: 3, number: 216, labelKey: 'doctors', icon: '/assets/images/care_section/doctor_plus.png' },
    { id: 4, number: 3500, labelKey: 'patients', icon: '/assets/images/care_section/lying_person.png' }
  ];

  return (
    <>
      <style>
        {`
          @media (max-width: 992px) {
            .care-section-title {
              font-size: 32px !important;
              line-height: 38px !important;
              padding: 10px 16px !important;
            }
            .stats-grid {
              flex-wrap: wrap !important;
              gap: 12px !important;
            }
            .stat-card {
              width: calc(50% - 10px) !important;
              height: 200px !important;
              padding: 24px 20px !important;
            }
            .stat-number {
              font-size: 32px !important;
              line-height: 38px !important;
              height: 60px !important;
            }
            .stat-icon {
              width: 48px !important;
              height: 33px !important;
            }
            .stat-label {
              font-size: 34px !important;
              line-height: 38px !important;
            }
          }
          @media (max-width: 576px) {
            .care-section {
              padding: 60px 0 !important;
            }
            .care-section-container {
              padding: 0 16px !important;
            }
            .care-section-title {
              font-size: 28px !important;
              line-height: 34px !important;
            }
            .stats-grid {
              flex-direction: column !important;
            }
            .stat-card {
              width: 100% !important;
              height: 180px !important;
              padding: 24px 20px !important;
            }
            .stat-number {
              font-size: 28px !important;
              line-height: 34px !important;
              height: 50px !important;
            }
            .stat-icon {
              width: 44px !important;
              height: 30px !important;
            }
            .stat-label {
              font-size: 30px !important;
              line-height: 34px !important;
            }
            .stat-number-container {
              width: 100% !important;
              height: auto !important;
              padding: 8px 4px !important;
            }
            .stat-icon-label-container {
              width: 100% !important;
              height: auto !important;
              padding: 8px 4px !important;
            }
          }
              height: 50px !important;
            }
            .stat-icon {
              width: 35px !important;
              height: 24px !important;
            }

          }
        `}
      </style>
      <section 
        className="care-section"
        style={{ 
          backgroundColor: '#1F57A4',
          padding: '80px 0'
        }} 
      >
      <div 
        className="care-section-container"
        style={{
          maxWidth: '1128px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '24px'
        }}
      >
        {/* Title */}
        <div 
          ref={titleRef}
          className="care-section-title"
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px 32px',
            width: '100%',
            ...getAnimationStyle(titleVisible, 0)
          }}
        >
          <h2 
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'normal',
              fontWeight: 800,
              fontSize: '48px',
              lineHeight: '50px',
              textAlign: 'center',
              color: '#FFFFFF',
              margin: 0,
              flex: 1
            }}
          >
            {t('careYouCanCount')}
          </h2>
        </div>

        {/* Stats Grid */}
        <div 
          ref={statsRef}
          className="stats-grid"
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center',
            alignContent: 'flex-start',
            gap: '20px',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          {stats.map((stat, index) => (
            <div 
              key={stat.id}
              className="stat-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 28px',
                width: '280px',
                height: '220px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1.5px solid rgba(143, 245, 247, 0.35)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                flex: 'none',
                order: 0,
                flexGrow: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                ...getAnimationStyle(statsVisible, index * 0.1)
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(143, 245, 247, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(143, 245, 247, 0.35)';
              }}
            >
              {/* Number */}
              <div 
                className="stat-number-container"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px',
                  width: '100%',
                  height: '70px',
                  flex: 'none',
                  order: 0,
                  alignSelf: 'stretch',
                  flexGrow: 0
                }}
              >
                <span 
                  className="stat-number"
                  style={{
                    width: '100%',
                    height: '60px',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 800,
                    fontSize: '35px',
                    lineHeight: '44px',
                    color: '#FFFFFF',
                    flex: 'none',
                    order: 0,
                    alignSelf: 'stretch',
                    flexGrow: 0,
                    textAlign: 'center'
                  }}
                >
                  <Counter target={stat.number} isVisible={statsVisible} />
                </span>
              </div>

              {/* Icon */}
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px',
                  width: '100%',
                  height: '70px',
                  flex: 'none',
                  order: 1,
                  flexGrow: 0
                }}
              >
                <img 
                  src={stat.icon} 
                  alt={stat.labelKey}
                  className="stat-icon"
                  style={{
                    width: '60px',
                    height: '41px',
                    flex: 'none',
                    order: 0,
                    flexGrow: 0,
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Label */}
              <div 
                className="stat-icon-label-container"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px',
                  width: '100%',
                  height: '70px',
                  flex: 'none',
                  order: 2,
                  flexGrow: 0
                }}
              >
                <span 
                  className="stat-label"
                  style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 800,
                    fontSize: '33px',
                    lineHeight: '46px',
                    color: '#8FF5F7',
                    flex: 'none',
                    order: 0,
                    flexGrow: 0,
                    whiteSpace: 'nowrap',
                    textAlign: 'center'
                  }}
                >
                  {t(stat.labelKey)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};

export default StatisticsSection;
