import { useState, useRef, useEffect } from 'react';
import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';
import { useHomepageData } from '../context/HomepageContext';

interface ExcellenceCenter {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  map_url: string | null;
  sort_order: number;
}

const LeftArrowIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="white" fillOpacity="0.95"/>
    <path d="M28 16L20 24L28 32" stroke="#061F42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RightArrowIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="white" fillOpacity="0.95"/>
    <path d="M20 16L28 24L20 32" stroke="#061F42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ExcellenceCentersSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();
  const { data } = useHomepageData();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const centers: ExcellenceCenter[] = data?.excellence_centers || [];

  console.log('ExcellenceCentersSection - data:', data);
  console.log('ExcellenceCentersSection - centers:', centers);

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 10);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [centers]);

  // Show section even if loading or empty for debugging
  // if (!data) {
  //   return null;
  // }

  // if (centers.length === 0) {
  //   return null;
  // }

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Scroll by 5 cards width (5 * 280px) + gaps (5 * 24px)
    const scrollAmount = (280 * 5) + (24 * 4);
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Disable drag on mobile for native scrolling
    if (window.innerWidth <= 992) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    container.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const container = scrollContainerRef.current;
    if (container) {
      container.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      const container = scrollContainerRef.current;
      if (container) {
        container.style.cursor = 'grab';
      }
    }
  };

  const handleTouchStart = () => {
    // Let native mobile scrolling handle touch events
    return;
  };

  const handleTouchMove = () => {
    // Let native mobile scrolling handle touch events
    return;
  };

  const handleTouchEnd = () => {
    // Let native mobile scrolling handle touch events
    return;
  };
  
  return (
    <>
      <style>
        {`
          @media (max-width: 992px) {
            .excellence-title {
              font-size: 32px !important;
              line-height: 38px !important;
            }
            .excellence-carousel-container {
              position: relative;
            }
            .excellence-carousel-container button {
              display: none !important;
            }
            .excellence-grid {
              padding: 0 20px !important;
              scroll-snap-type: x mandatory;
              -webkit-overflow-scrolling: touch;
              scroll-padding: 0 20px;
              justify-content: flex-start !important;
            }
            .excellence-card {
              scroll-snap-align: center;
              min-width: 280px !important;
              max-width: 280px !important;
            }
          }
          @media (max-width: 576px) {
            .excellence-title {
              font-size: 28px !important;
              line-height: 34px !important;
            }
            .excellence-grid {
              padding: 0 16px !important;
              scroll-padding: 0 16px;
            }
            .excellence-card {
              min-width: 260px !important;
              max-width: 260px !important;
            }
          }
          @media (max-width: 400px) {
            .excellence-grid {
              padding: 0 12px !important;
              scroll-padding: 0 12px;
            }
            .excellence-card {
              min-width: calc(100vw - 48px) !important;
              max-width: calc(100vw - 48px) !important;
            }
          }
        `}
      </style>
      <section className="" style={{ backgroundColor: '#F3F3F3', paddingTop: '40px', paddingBottom: '80px' }}>
        <section className="card-sec" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: '1600px' }}>
            {/* Title */}
            <div 
              ref={titleRef}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '40px',
                ...getAnimationStyle(titleVisible, 0)
              }}
            >
              <h2 
                className="excellence-title"
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 800,
                  fontSize: '48px',
                  lineHeight: '50px',
                  textAlign: 'center',
                  color: '#061F42',
                  margin: 0
                }}
              >
                Excellence Centers
              </h2>
          </div>

          {/* Carousel Container */}
          <div className="excellence-carousel-container" style={{ position: 'relative' }}>
            {/* Left Arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                  opacity: 1,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  e.currentTarget.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))';
                }}
              >
                <LeftArrowIcon />
              </button>
            )}

            {/* Scrollable Grid */}
            <div 
              className="excellence-grid hide-scrollbar"
              ref={(el) => {
                scrollContainerRef.current = el;
                gridRef.current = el;
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                display: 'flex',
                justifyContent: window.innerWidth > 992 ? 'center' : 'flex-start',
                gap: '24px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                cursor: window.innerWidth <= 992 ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                userSelect: window.innerWidth <= 992 ? 'auto' : 'none',
                scrollBehavior: 'smooth',
                paddingBottom: '10px',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {centers.map((center, index) => (
                <div
                  key={center.id}
                  className="excellence-card"
                  style={{
                    minWidth: '280px',
                    maxWidth: '280px',
                    flex: '0 0 auto',
                    ...getAnimationStyle(gridVisible, index * 0.1)
                  }}
                >
                  <div 
                    style={{ 
                      backgroundImage: `url('${center.image_url || '/assets/img/card-img-1.webp'}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      height: '380px',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.18)';
                      const overlay = e.currentTarget.querySelector('.hover-overlay') as HTMLElement;
                      if (overlay) overlay.style.opacity = '1';
                      const name = e.currentTarget.querySelector('.center-name') as HTMLElement;
                      if (name) name.style.transform = 'translateY(-4px)';
                      const button = e.currentTarget.querySelector('.view-location-btn') as HTMLElement;
                      if (button) {
                        // Show button but dimmed if no map_url
                        button.style.opacity = center.map_url ? '1' : '0.5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                      const overlay = e.currentTarget.querySelector('.hover-overlay') as HTMLElement;
                      if (overlay) overlay.style.opacity = '0';
                      const name = e.currentTarget.querySelector('.center-name') as HTMLElement;
                      if (name) name.style.transform = 'translateY(0)';
                      const button = e.currentTarget.querySelector('.view-location-btn') as HTMLElement;
                      if (button) button.style.opacity = '0';
                    }}
                  >
                    {/* Hover Overlay */}
                    <div className="hover-overlay" style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(6, 31, 66, 0.7)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none'
                    }} />
                    
                    {/* Gradient for text readability at bottom */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '50%',
                      background: 'linear-gradient(180deg, rgba(6, 31, 66, 0) 0%, rgba(6, 31, 66, 0.6) 100%)',
                      pointerEvents: 'none'
                    }} />

                    {/* Content at Bottom */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: 0,
                      right: 0,
                      padding: '0 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      {/* Center Name */}
                      <span className="center-name" style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 800,
                        fontSize: '22px',
                        lineHeight: '30px',
                        color: '#FFFFFF',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                        display: 'block',
                        textAlign: 'left',
                        transition: 'transform 0.3s ease'
                      }}>
                        {center.name}
                      </span>

                      {/* View Location Button - Hidden by default */}
                      <a 
                        href={center.map_url || '#'}
                        target={center.map_url ? '_blank' : undefined}
                        rel={center.map_url ? 'noopener noreferrer' : undefined}
                        onClick={(e) => {
                          if (!center.map_url || isDragging) {
                            e.preventDefault();
                          }
                        }}
                        className="view-location-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: 600,
                          fontFamily: 'Nunito, sans-serif',
                          color: '#061F42',
                          textDecoration: 'none',
                          alignSelf: 'flex-start',
                          opacity: 0,
                          cursor: center.map_url ? 'pointer' : 'not-allowed',
                          pointerEvents: center.map_url ? 'auto' : 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }}
                        onMouseEnter={(e) => {
                          if (center.map_url) {
                            e.currentTarget.style.backgroundColor = '#15C9FA';
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(21, 201, 250, 0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (center.map_url) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                            e.currentTarget.style.color = '#061F42';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                          }
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                        </svg>
                        View location
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                style={{
                  position: 'absolute',
                  right: '-24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                  opacity: 1,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  e.currentTarget.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))';
                }}
              >
                <RightArrowIcon />
              </button>
            )}
          </div>
        </div>
      </section>
    </section>
    </>
  );
};

export default ExcellenceCentersSection;
