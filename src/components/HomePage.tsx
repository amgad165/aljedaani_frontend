import { useEffect } from 'react';
import HeroSection from './HeroSection';
import LocationCards from './LocationCards';
// import OffersSection from './OffersSection';
import AppBannerSection from './AppBannerSection';
import StatisticsSection from './StatisticsSection';
import TestimonialSection from './TestimonialSection';
import ExcellenceCentersSection from './ExcellenceCentersSection';
// import BlogSection from './BlogSection';
import Footer from './Footer';
import HomepageLoading from './HomepageLoading';
import FloatingContactButtons from './FloatingContactButtons';
import { animationCSS } from '../hooks/useScrollAnimation';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import { HomepageProvider, useHomepageData } from '../context/HomepageContext';

const HomePageContent = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const { loading } = useHomepageData();

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
      <HomepageLoading isLoading={loading} />
      <FloatingContactButtons />
      {ResponsiveNavbar}
      <div className="main overflow-hidden">
        <HeroSection />
        <section className="main-sec">
          <LocationCards />

          {/* hidden offers section for now don't delete */}
          {/* <OffersSection /> */}
          <AppBannerSection />
          <StatisticsSection />
        </section>
        <TestimonialSection />
        <ExcellenceCentersSection />


        {/* hidden blog section for now don't delete */}
        {/* <BlogSection /> */}
      </div>
      <Footer />
    </>
  );
};

const HomePage = () => {
  return (
    <HomepageProvider>
      <HomePageContent />
    </HomepageProvider>
  );
};

export default HomePage;
