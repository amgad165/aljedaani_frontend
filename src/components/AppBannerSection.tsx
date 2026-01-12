import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';

const AppBannerSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();
  
  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .banner-wrapper {
            min-height: 400px !important;
          }
        }

        @media (min-width: 992px) {
          .banner-wrapper {
            min-height: 450px !important;
          }
        }

        @media (max-width: 992px) {
          .banner-title {
            font-size: 32px !important;
            line-height: 38px !important;
          }
          .banner-subtitle {
            font-size: 18px !important;
          }
        }

        @media (max-width: 576px) {
          .banner-title {
            font-size: 28px !important;
            line-height: 34px !important;
          }
          .banner-subtitle {
            font-size: 16px !important;
          }
        }
      `}</style>
      <section ref={sectionRef} className="banner-sec pb-0">
        <div className="container">
          <div 
            style={{ 
              backgroundImage: "url('/assets/img/banner1.png')",
            }} 
            className="banner-wrapper"
          >
            <div 
              className="content-wrapper"
              style={{
                ...getAnimationStyle(sectionVisible, 0)
              }}
            >
              <h2 
                className="banner-title"
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 800,
                  fontSize: '48px',
                  lineHeight: '50px',
                  color: '#061F42',
                  marginBottom: '8px'
                }}
              >
                Download our mobile app
              </h2>
              <h3 
                className="banner-subtitle"
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '20px',
                  color: '#061F42',
                  marginBottom: '16px'
                }}
              >
                For a more personalised experience!
              </h3>
            </div>
            <div 
              className="image-wrapper"
              style={{
                ...getAnimationStyle(sectionVisible, 0.15)
              }}
            >
              <img 
                style={{ 
                  maxWidth: '215px',
                  filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))'
                }} 
                src="/assets/img/mobile-img.webp" 
                className="img-fluid d-block"
                width="115" 
                height="454" 
                alt="Mobile Image" 
              />
            </div>
            <div 
              className="d-flex align-center flex-wrap gap-3 store" 
              style={{ 
                position: 'absolute', 
                bottom: '30px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                zIndex: 10
              }}
            >
              <a 
                href="#"
                style={{
                  ...getAnimationStyle(sectionVisible, 0.25),
                  display: 'inline-block'
                }}
              >
                <img src="/assets/img/playstore.webp" width="120" height="40" alt="Playstore" />
              </a>
              <a 
                href="#"
                style={{
                  ...getAnimationStyle(sectionVisible, 0.35),
                  display: 'inline-block'
                }}
              >
                <img src="/assets/img/applestore.webp" width="120" height="40" alt="Applestore" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AppBannerSection;
