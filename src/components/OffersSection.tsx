import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';

interface Offer {
  id: number;
  title: string;
  discount: string;
  image: string;
  size?: 'large' | 'small';
}

const OffersSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();
  
  const offers: Offer[] = [
    { 
      id: 1, 
      title: 'Lip Fillers', 
      discount: '50% OFF', 
      image: '/assets/img/service-img1.webp',
      size: 'large'
    },
    { 
      id: 2, 
      title: 'Cesarean\nsection', 
      discount: '25% OFF', 
      image: '/assets/img/service-img2.webp',
      size: 'small'
    },
    { 
      id: 3, 
      title: 'General\ncheck-up', 
      discount: '10% OFF', 
      image: '/assets/img/service-img3.webp',
      size: 'small'
    }
  ];

  return (
    <section className="service-sec pb-0">
      <div className="container">
        <h2 
          ref={titleRef}
          className="text-center fw-exbold mb-4"
          style={getAnimationStyle(titleVisible, 0)}
        >
          Offers
        </h2>
        <div 
          ref={contentRef}
          className="service-wrapper mb-4"
          style={getAnimationStyle(contentVisible, 0.1)}
        >
          {/* Main Large Offer */}
          <div style={{ backgroundImage: `url('${offers[0].image}')` }} className="image-wrapper">
            <div className="content-wrapper resposive-justify-end">
              <div className="icon roboto responsive-d-block">{offers[0].discount}</div>
              <div className="service-card">
                <span className="h3 fw-exbold">{offers[0].title}</span>
                <div className="d-flex align-items-center gap-1">
                  <div className="buttons">
                    <a href="#" className="btn btn-primary">
                      <img src="/assets/img/icons/cart-icon.svg" width="24" height="24" alt="Cart Icon" /> 
                      Add to cart
                    </a>
                    <a href="#" className="btn btn-primary">
                      <img src="/assets/img/icons/buy-icon.svg" width="24" height="24" alt="Buy Icon" /> 
                      Buy now
                    </a>
                  </div>
                  <div className="icon roboto responsive-d-none m-0">{offers[0].discount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Small Offers */}
          <div className="right-side">
            {offers.slice(1).map((offer, index) => (
              <div 
                key={offer.id}
                style={{ backgroundImage: `url('${offer.image}')` }}
                className={`image-wrapper wrapper-1 ${index === 0 ? 'mb-3 m-mb-2' : ''}`}
              >
                <div className="content-wrapper justify-content-end">
                  <div className="service-card">
                    <span className="h3 fw-exbold">{offer.title}</span>
                    <div className="right">
                      <div className="buttons">
                        <a href="#" className="btn btn-primary">
                          <img src="/assets/img/icons/cart-icon.svg" width="24" height="24" alt="Cart Icon" /> 
                          Add to cart
                        </a>
                        <a href="#" className="btn btn-primary">
                          <img src="/assets/img/icons/buy-icon.svg" width="24" height="24" alt="Buy Icon" /> 
                          Buy now
                        </a>
                      </div>
                      <div className="icon roboto">{offer.discount}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <a style={{ textDecoration: 'underline' }} className="fw-semibold fs-5 text-end d-block" href="#">
          See all offers
        </a>
      </div>
    </section>
  );
};

export default OffersSection;
