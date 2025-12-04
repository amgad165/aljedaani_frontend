import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';

interface LocationCard {
  id: number;
  title: string;
  image: string;
}

const LocationCards = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  const locations: LocationCard[] = [
    { id: 1, title: 'Al Safa Hospital', image: '/assets/img/card-img-1.webp' },
    { id: 2, title: 'Al Safa Hospital', image: '/assets/img/card-img-2.webp' },
    { id: 3, title: 'Al Safa Hospital', image: '/assets/img/card-img-3.webp' }
  ];

  return (
    <section className="card-sec pb-0" ref={ref}>
      <div className="container">
        <div className="row g-3">
          {locations.map((location, index) => (
            <div 
              key={location.id} 
              className="col-lg-4 col-sm-6"
              style={getAnimationStyle(isVisible, index * 0.1)}
            >
              <div style={{ backgroundImage: `url('${location.image}')` }} className="main-wrapper">
                <div className="content-bar">
                  <span className="title">{location.title}</span>
                  <a href="#" className="button">
                    <img src="/assets/img/icons/view-icon.png" width="12" height="12" alt="Icon" /> 
                    View location
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationCards;
