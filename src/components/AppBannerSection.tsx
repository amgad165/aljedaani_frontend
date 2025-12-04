import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';

const AppBannerSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <section ref={ref} className="banner-sec pb-0">
      <div className="container">
        <div 
          style={{ 
            backgroundImage: "url('/assets/img/banner-img.webp')",
            ...getAnimationStyle(isVisible, 0)
          }} 
          className="banner-wrapper"
        >
          <div className="content-wrapper">
            <h2 className="mb-2 fw-bold">Download our mobile app</h2>
            <h3 className="fw-semibold fs-4 mb-4">For a more personalised experience!</h3>
            <div className="d-flex align-center flex-wrap gap-3 store">
              <a href="#">
                <img src="/assets/img/playstore.webp" width="120" height="40" alt="Playstore" />
              </a>
              <a href="#">
                <img src="/assets/img/applestore.webp" width="120" height="40" alt="Applestore" />
              </a>
            </div>
          </div>
          <div className="image-wrapper">
            <img 
              style={{ maxWidth: '215px' }} 
              src="/assets/img/mobile-img.webp" 
              className="img-fluid d-block" 
              width="215" 
              height="454" 
              alt="Mobile Image" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppBannerSection;
