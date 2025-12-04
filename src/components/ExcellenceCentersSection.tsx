import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';

interface Center {
  id: number;
  name: string;
  image: string;
}

const RightArrowIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="none"/>
    <path d="M18 24H30M30 24L24 18M30 24L24 30" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ExcellenceCentersSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();
  
  const centers: Center[] = [
    { id: 1, name: 'Al Safa Hospital', image: '/assets/img/gallery-img.webp' },
    { id: 2, name: 'Al Safa Hospital', image: '/assets/img/gallery-img.webp' },
    { id: 3, name: 'Al Safa Hospital', image: '/assets/img/gallery-img.webp' }
  ];

  return (
    <section 
      style={{ 
        backgroundColor: '#F3F3F3',
        padding: '80px 0',
        position: 'relative',
        width: '100%'
      }}
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
            height: '70px',
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
              color: '#061F42',
              margin: 0,
              flex: 1
            }}
          >
            Excellence Centers
          </h2>
        </div>

        {/* Centers Grid */}
        <div 
          ref={gridRef}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 0,
            gap: '24px',
            width: '100%',
            height: '200px'
          }}
        >
          {centers.map((center, index) => (
            <div
              key={center.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
                padding: 0,
                margin: '0 auto',
                width: '300px',
                minWidth: '300px',
                height: '200px',
                minHeight: '200px',
                background: '#FFFFFF',
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden',
                ...getAnimationStyle(gridVisible, index * 0.1)
              }}
            >
              {/* Background Image */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${center.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '12px',
                  zIndex: 1
                }}
              />

              {/* Headline with semi-transparent background */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  padding: '12px',
                  gap: '8px',
                  width: '100%',
                  height: '62px',
                  background: 'rgba(79, 79, 79, 0.6)',
                  borderRadius: '0px 32px 12px 12px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                <h3
                  style={{
                    width: '276px',
                    height: '38px',
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    fontSize: '24px',
                    lineHeight: '38px',
                    color: '#FFFFFF',
                    margin: 0,
                    flex: 'none'
                  }}
                >
                  {center.name}
                </h3>
              </div>
            </div>
          ))}

          {/* Navigation Button */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '16px',
              margin: '0 auto',
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              background: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <RightArrowIcon />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExcellenceCentersSection;
