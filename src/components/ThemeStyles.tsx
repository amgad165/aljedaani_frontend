import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that dynamically loads/unloads theme CSS files
 * Only loads the WordPress theme CSS on non-admin pages
 */
const ThemeStyles: React.FC = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const themeStyleIds = [
      'theme-bootstrap',
      'theme-main',
      'theme-header',
      'theme-footer',
      'theme-home'
    ];

    const themeCssFiles = [
      { id: 'theme-bootstrap', href: '/assets/css/components/boostrap.css' },
      { id: 'theme-main', href: '/assets/css/components/theme.css' },
      { id: 'theme-header', href: '/assets/css/components/header.css' },
      { id: 'theme-footer', href: '/assets/css/components/footer.css' },
      { id: 'theme-home', href: '/assets/css/pages/home.css' }
    ];

    if (isAdminPage) {
      // Remove theme CSS on admin pages
      themeStyleIds.forEach(id => {
        const existingLink = document.getElementById(id);
        if (existingLink) {
          existingLink.remove();
        }
      });
    } else {
      // Add theme CSS on non-admin pages
      themeCssFiles.forEach(({ id, href }) => {
        if (!document.getElementById(id)) {
          const link = document.createElement('link');
          link.id = id;
          link.rel = 'stylesheet';
          link.href = href;
          document.head.appendChild(link);
        }
      });
    }

    // Cleanup function
    return () => {
      // Don't remove on cleanup - let the next effect handle it
    };
  }, [isAdminPage]);

  return null;
};

export default ThemeStyles;
