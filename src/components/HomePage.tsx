import { useEffect, useState } from 'react';
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

const CRITICAL_HOME_IMAGES = [
  '/assets/img/hero-img.webp',
  '/assets/img/banner2.png',
];

const HomePageContent = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const { loading } = useHomepageData();
  const [criticalImagesLoaded, setCriticalImagesLoaded] = useState(false);

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

  // Preload critical above-the-fold homepage images while overlay is visible.
  useEffect(() => {
    let isMounted = true;

    const preloadLinks: HTMLLinkElement[] = [];
    CRITICAL_HOME_IMAGES.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      preloadLinks.push(link);
    });

    const preloadPromises = CRITICAL_HOME_IMAGES.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });
    });

    Promise.all(preloadPromises).then(() => {
      if (isMounted) {
        setCriticalImagesLoaded(true);
      }
    });

    return () => {
      isMounted = false;
      preloadLinks.forEach((link) => link.remove());
    };
  }, []);

  const isHomepageLoading = loading || !criticalImagesLoaded;

  return (
    <>
      <HomepageLoading isLoading={isHomepageLoading} />
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
