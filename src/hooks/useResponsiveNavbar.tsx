import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MobileNavbar from '../components/MobileNavbar';

export const useResponsiveNavbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileNavbar /> : <Navbar />;
};
