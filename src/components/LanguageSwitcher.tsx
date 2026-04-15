import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher(): JSX.Element {
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentLanguage = i18n.language || 'en';
  const isArabic = currentLanguage === 'ar';

  const withLanguagePrefix = (pathname: string, lang: string): string => {
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length > 0 && (segments[0] === 'en' || segments[0] === 'ar')) {
      segments[0] = lang;
      return `/${segments.join('/')}`;
    }

    return pathname === '/' ? `/${lang}` : `/${lang}${pathname}`;
  };

  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [isArabic, currentLanguage]);

  const toggleLanguage = async (lang: 'en' | 'ar') => {
    if (isChanging || lang === currentLanguage) return;

    setIsChanging(true);

    try {
      await i18n.changeLanguage(lang);
      const localizedPath = withLanguagePrefix(location.pathname, lang);
      navigate(`${localizedPath}${location.search}${location.hash}`, { replace: true });
    } catch (error) {
      console.error('Language change error:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div
      onClick={() => {
        if (!isChanging) {
          const newLang = isArabic ? 'en' : 'ar';
          toggleLanguage(newLang);
        }
      }}
      onMouseEnter={() => !isChanging && setIsHovering(true)}
      onMouseLeave={() => !isChanging && setIsHovering(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isHovering ? '12px' : '0',
          padding: '8px 14px',
          cursor: isChanging ? 'wait' : 'pointer',
          fontFamily: 'Nunito, sans-serif',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.8px',
          textDecoration: 'none',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          opacity: isChanging ? 0.6 : 1,
          userSelect: 'none',
          transition: 'all 0.3s ease',
          whiteSpace: 'nowrap',
          minWidth: isHovering ? 'auto' : '40px',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          if (!isChanging) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.border = '1px solid rgba(20, 200, 249, 0.5)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(20, 200, 249, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
        }}
      >
        {/* English Option */}
        <div
          style={{
            color: '#FFFFFF',
            fontWeight: 700,
            transition: 'all 0.3s ease',
            opacity: isArabic && !isHovering ? 0 : isArabic && isHovering ? 0.6 : 1,
            width: isHovering ? 'auto' : isArabic ? '0px' : '20px',
            cursor: isChanging ? 'wait' : 'pointer',
            textAlign: 'center',
            minWidth: isHovering && isArabic ? '25px' : '0px',
            fontSize: '13px',
            pointerEvents: 'none',
          }}
        >
          EN
        </div>

        {/* Separator - Only show when hovering */}
        {isHovering && (
          <span
            style={{
              color: '#FFFFFF',
              fontWeight: 300,
              opacity: 0.3,
              fontSize: '13px',
              pointerEvents: 'none',
            }}
          >
            |
          </span>
        )}

        {/* Arabic Option */}
        <div
          style={{
            color: '#FFFFFF',
            fontWeight: 700,
            transition: 'all 0.3s ease',
            opacity: !isArabic && !isHovering ? 0 : !isArabic && isHovering ? 0.6 : 1,
            width: isHovering ? 'auto' : !isArabic ? '0px' : '20px',
            cursor: isChanging ? 'wait' : 'pointer',
            textAlign: 'center',
            minWidth: isHovering && !isArabic ? '25px' : '0px',
            fontSize: '15px',
            pointerEvents: 'none',
          }}
        >
          ع
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
