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
    <section 
      style={{ 
        backgroundColor: '#1F57A4',
        padding: '80px 0'
      }} 
      className="counter-sec"
    >
      <div 
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
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '10px 4px',
                  width: '220.5px',
                  height: '86px',
                  flex: 'none',
                  order: 0,
                  alignSelf: 'stretch',
                  flexGrow: 0
                }}
              >
                <span 
                  style={{
                    width: '212.5px',
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
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '10px 4px',
                  gap: '10px',
                  width: '238px',
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
  );
};

export default StatisticsSection;
