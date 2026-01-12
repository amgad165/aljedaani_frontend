import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';
import { useHomepageData } from '../context/HomepageContext';

const OffersSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: contentRef } = useScrollAnimation();
  const { data } = useHomepageData();

  const offers = data?.offers || [];

  console.log('OffersSection - data:', data);
  console.log('OffersSection - offers:', offers);

  // If no offers, don't render section
  if (offers.length === 0) {
    console.log('OffersSection - No offers, returning null');
    return null;
  }

  // Split into main offer and side offers
  const mainOffer = offers[0];
  const sideOffers = offers.slice(1, 3); // Show max 2 side offers

  const calculateFinalPrice = (price: any, discount: any) => {
    const numPrice = Number(price);
    const numDiscount = Number(discount);
    return numPrice - (numPrice * (numDiscount / 100));
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 992px) {
            .offers-title {
              font-size: 32px !important;
              line-height: 38px !important;
                            marginBottom: '40px',

            }
          }
          @media (max-width: 576px) {
            .offers-title {
              font-size: 28px !important;
              line-height: 34px !important;
                            marginBottom: '40px',

            }
          }
        `}
      </style>
      <section className="service-sec pb-0">
        <div className="container">
          <h2 
            ref={titleRef}
            className="offers-title"
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: '48px',
              lineHeight: '50px',
              textAlign: 'center',
              color: '#061F42',
              marginBottom: '60px',
              ...getAnimationStyle(titleVisible, 0),
              opacity: 1
            }}
          >
            Offers
          </h2>
        <div 
          ref={contentRef}
          className="service-wrapper mb-4"
        >
          {/* Main Large Offer */}
          {mainOffer && (
            <div style={{ backgroundImage: `url('${mainOffer.image_url}')` }} className="image-wrapper">
              <div className="content-wrapper resposive-justify-end">
                <div className="icon roboto responsive-d-block">{Math.floor(Number(mainOffer.discount))}%
                  <br />OFF</div>
                <div className="service-card">
                  <span className="h3 fw-exbold">{mainOffer.title}</span>
                  <div className="d-flex align-items-center gap-1">
                    <div className="buttons">
                      <div style={{
                        background: 'linear-gradient(135deg, #0155CB 0%, #00ABDA 100%)',
                        borderRadius: '12px',
                        padding: '12px 24px',
                        display: 'inline-block'
                      }}>
                        <div style={{ 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          fontSize: '14px',
                          textDecoration: 'line-through',
                          marginBottom: '2px'
                        }}>
                          {Number(mainOffer.price).toFixed(2)} SAR
                        </div>
                        <div style={{ 
                          color: '#fff', 
                          fontSize: '24px',
                          fontWeight: 800
                        }}>
                          {calculateFinalPrice(mainOffer.price, mainOffer.discount).toFixed(2)} SAR
                        </div>
                      </div>
                    </div>
                    <div className="icon roboto responsive-d-none m-0">{mainOffer.discount}% OFF</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Side Small Offers */}
          {sideOffers.length > 0 && (
            <div className="right-side">
              {sideOffers.map((offer, index) => (
                <div 
                  key={offer.id}
                  style={{ backgroundImage: `url('${offer.image_url}')` }}
                  className={`image-wrapper wrapper-1 ${index === 0 ? 'mb-3 m-mb-2' : ''}`}
                >
                  <div className="content-wrapper justify-content-end">
                    <div className="service-card">
                      <span className="h3 fw-exbold">{offer.title}</span>
                      <div className="right">
                        <div className="buttons">
                          <div style={{
                            background: 'linear-gradient(135deg, #0155CB 0%, #00ABDA 100%)',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            display: 'inline-block'
                          }}>
                            <div style={{ 
                              color: 'rgba(255, 255, 255, 0.8)', 
                              fontSize: '12px',
                              textDecoration: 'line-through',
                              marginBottom: '2px'
                            }}>
                              {Number(offer.price).toFixed(2)} SAR
                            </div>
                            <div style={{ 
                              color: '#fff', 
                              fontSize: '18px',
                              fontWeight: 800
                            }}>
                              {calculateFinalPrice(offer.price, offer.discount).toFixed(2)} SAR
                            </div>
                          </div>
                        </div>
                        <div className="icon roboto">{Math.floor(Number(offer.discount))}%
                          <br />OFF</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {offers.length > 0 && (
          <a style={{ textDecoration: 'underline' }} className="fw-semibold fs-5 text-end d-block" href="#">
            See all offers
          </a>
        )}
      </div>
    </section>
    </>
  );
};

export default OffersSection;
