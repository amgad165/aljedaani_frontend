import { useEffect, useState } from 'react';
import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';

interface Stat {
  id: number;
  number: number;
  label: string;
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
  
  const stats: Stat[] = [
    { id: 1, number: 2250, label: 'Beds', icon: '/assets/images/care_section/bed.png' },
    { id: 2, number: 60, label: 'Specialties', icon: '/assets/images/care_section/plus.png' },
    { id: 3, number: 216, label: 'Doctors', icon: '/assets/images/care_section/doctor_plus.png' },
    { id: 4, number: 3500, label: 'Patients', icon: '/assets/images/care_section/lying_person.png' }
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
              width: calc(50% - 6px) !important;
              height: 160px !important;
              padding: 16px !important;
            }
            .stat-number {
              font-size: 36px !important;
              line-height: 42px !important;
              height: 60px !important;
            }
            .stat-icon {
              width: 40px !important;
              height: 28px !important;
            }
            .stat-label {
              font-size: 16px !important;
              line-height: 18px !important;
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
              height: 140px !important;
              padding: 16px 12px !important;
            }
            .stat-number {
              font-size: 32px !important;
              line-height: 38px !important;
              height: 50px !important;
            }
            .stat-icon {
              width: 36px !important;
              height: 26px !important;
            }
            .stat-label {
              font-size: 16px !important;
              line-height: 20px !important;
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
            .stat-label {
              font-size: 14px !important;
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
            Care you can count on
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
            gap: '18px',
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
                padding: '24px',
                width: '268.5px',
                height: '188px',
                background: 'rgba(0, 0, 0, 0.001)',
                borderRadius: '12px',
                border: '1px solid rgba(143, 245, 247, 0.3)',
                flex: 'none',
                order: 0,
                flexGrow: 1,
                ...getAnimationStyle(statsVisible, index * 0.1)
              }}
            >
              {/* Number */}
              <div 
                className="stat-number-container"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '10px 4px',
                  width: '100%',
                  height: '86px',
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
                    height: '66px',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 800,
                    fontSize: '48px',
                    lineHeight: '50px',
                    color: '#FFFFFF',
                    flex: 'none',
                    order: 0,
                    alignSelf: 'stretch',
                    flexGrow: 0
                  }}
                >
                  <Counter target={stat.number} isVisible={statsVisible} />
                </span>
              </div>

              {/* Icon and Label */}
              <div 
                className="stat-icon-label-container"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '10px 4px',
                  gap: '10px',
                  width: '100%',
                  height: '54px',
                  flex: 'none',
                  order: 1,
                  flexGrow: 0
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 0,
                    width: '50px',
                    height: '34px',
                    flex: 'none',
                    order: 0,
                    flexGrow: 0
                  }}
                >
                  <img 
                    src={stat.icon} 
                    alt={stat.label}
                    className="stat-icon"
                    style={{
                      width: '50px',
                      height: '34px',
                      flex: 'none',
                      order: 0,
                      flexGrow: 0
                    }}
                  />
                </div>
                <span 
                  className="stat-label"
                  style={{
                    width: '46px',
                    height: '20px',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: '20px',
                    lineHeight: '20px',
                    color: '#8FF5F7',
                    flex: 'none',
                    order: 1,
                    flexGrow: 0
                  }}
                >
                  {stat.label}
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
