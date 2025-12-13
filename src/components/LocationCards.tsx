import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';
import { useState, useEffect } from 'react';

interface Branch {
  id: number;
  name: string;
  image_url: string;
  map_url: string | null;
}

const LocationCards = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/branches?active=true`);
        const result = await response.json();
        
        if (result.success && result.data) {
          // Get only first 3 branches or less if not enough
          setBranches(result.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  if (loading) {
    return (
      <section className="card-sec pb-0" ref={ref}>
        <div className="container">
          <div className="row g-3">
            <div style={{ textAlign: 'center', width: '100%', padding: '40px' }}>
              Loading locations...
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card-sec pb-0" ref={ref}>
      <div className="container">
        <div className="row g-3">
          {branches.map((branch, index) => (
            <div 
              key={branch.id} 
              className="col-lg-4 col-sm-6"
              style={getAnimationStyle(isVisible, index * 0.1)}
            >
              <div style={{ backgroundImage: `url('${branch.image_url || '/assets/img/card-img-1.webp'}')` }} className="main-wrapper">
                <div className="content-bar">
                  <span className="title">{branch.name}</span>
                  <a 
                    href={branch.map_url || '#'}
                    target={branch.map_url ? '_blank' : undefined}
                    rel={branch.map_url ? 'noopener noreferrer' : undefined}
                    onClick={(e) => {
                      if (!branch.map_url) {
                        e.preventDefault();
                      }
                    }}
                    className="button"
                    style={{
                      fontSize: '14px',
                      padding: '6px 10px',
                      opacity: branch.map_url ? 1 : 0.5,
                      cursor: branch.map_url ? 'pointer' : 'not-allowed',
                      pointerEvents: branch.map_url ? 'auto' : 'none'
                    }}
                  >
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
