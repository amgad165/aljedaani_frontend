import { useEffect } from 'react';
import HeroSection from './HeroSection';
import LocationCards from './LocationCards';
import OffersSection from './OffersSection';
import AppBannerSection from './AppBannerSection';
import StatisticsSection from './StatisticsSection';
import TestimonialSection from './TestimonialSection';
import ExcellenceCentersSection from './ExcellenceCentersSection';
import BlogSection from './BlogSection';
import Footer from './Footer';
import { animationCSS } from '../hooks/useScrollAnimation';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';

const HomePage = () => {
  const ResponsiveNavbar = useResponsiveNavbar();

  // Inject animation CSS once on mount
  useEffect(() => {
    const styleId = 'scroll-animation-styles';
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement('style');
      styleSheet.id = styleId;
      styleSheet.textContent = animationCSS;
      document.head.appendChild(styleSheet);
    }
  }, []);

  return (
    <>
      {ResponsiveNavbar}
      <div className="main overflow-hidden">
        <HeroSection />
        <section className="main-sec">
          <LocationCards />
          <OffersSection />
          <AppBannerSection />
          <StatisticsSection />
        </section>
        <TestimonialSection />
        <ExcellenceCentersSection />
        <BlogSection />
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
