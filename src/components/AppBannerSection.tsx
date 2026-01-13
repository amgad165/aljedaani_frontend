import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';

const AppBannerSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();
  
  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .banner-sec .banner-wrapper {
            min-height: 400px !important;
          }
        }

        @media (min-width: 992px) {
          .banner-sec .banner-wrapper {
            min-height: 450px !important;
          }
        }

        @media (max-width: 992px) {
          .banner-sec .banner-title {
            font-size: 32px !important;
            line-height: 38px !important;
          }
          .banner-sec .banner-subtitle {
            font-size: 18px !important;
          }
        }

        @media (max-width: 768px) {
          .banner-sec .banner-wrapper {
            background-position: left center !important;
            background-size: cover !important;
            min-height: 420px !important;
            padding: 30px 20px !important;
            position: relative !important;
          }
          
          .banner-sec .content-wrapper {
            padding-right: 150px !important;
          }
          
          .banner-sec .image-wrapper {
            position: absolute !important;
            right: 10px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            width: 140px !important;
          }
          
          .banner-sec .image-wrapper img {
            width: 100% !important;
            max-width: 140px !important;
            height: auto !important;
          }
          
          .banner-sec .banner-wrapper .store {
            bottom: 20px !important;
            flex-wrap: nowrap !important;
            gap: 8px !important;
          }
          
          .banner-sec .banner-wrapper .store img {
            width: 100px !important;
            height: auto !important;
          }
        }

        @media (max-width: 576px) {
          .banner-sec .banner-title {
            font-size: 24px !important;
            line-height: 30px !important;
            text-align: left !important;
            margin-bottom: 6px !important;
          }
          .banner-sec .banner-subtitle {
            font-size: 15px !important;
            text-align: left !important;
            margin-bottom: 12px !important;
          }
          
          .banner-sec .banner-wrapper {
            min-height: 380px !important;
            padding: 25px 15px !important;
          }
          
          .banner-sec .content-wrapper {
            padding-right: 130px !important;
          }
          
          .banner-sec .image-wrapper {
            width: 120px !important;
          }
          
          .banner-sec .image-wrapper img {
            max-width: 120px !important;
          }
          
          .banner-sec .banner-wrapper .store {
            gap: 6px !important;
          }
          
          .banner-sec .banner-wrapper .store img {
            width: 90px !important;
          }
        }

        @media (max-width: 400px) {
          .banner-sec .banner-title {
            font-size: 20px !important;
            line-height: 26px !important;
          }
          .banner-sec .banner-subtitle {
            font-size: 13px !important;
          }
          
          .banner-sec .content-wrapper {
            padding-right: 110px !important;
          }
          
          .banner-sec .image-wrapper {
            width: 100px !important;
          }
          
          .banner-sec .image-wrapper img {
            max-width: 100px !important;
          }
          
          .banner-sec .banner-wrapper .store img {
            width: 80px !important;
          }
        }
      `}</style>
      <section ref={sectionRef} className="banner-sec pb-0">
        <div className="container">
          <div 
            style={{ 
              backgroundImage: "url('/assets/img/banner2.png')",
              backgroundPosition: 'center center',
              backgroundSize: 'cover'
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
                  fontSize: '62px',
                  lineHeight: '50px',
                  color: '#061F42',
                  marginBottom: '8px',
                  textAlign: 'center'
                }}
              >
                Download our mobile app
              </h2>
              <h3 
                className="banner-subtitle"
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '27px',
                  color: '#061F42',
                  marginBottom: '16px',
                   textAlign: 'center'

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
