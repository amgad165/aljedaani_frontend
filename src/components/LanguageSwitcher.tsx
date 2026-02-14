import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  
  const currentLanguage = i18n.language || 'en';
  const isArabic = currentLanguage === 'ar';

  useEffect(() => {
    // Set HTML dir attribute
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [isArabic, currentLanguage]);

  const toggleLanguage = async () => {
    if (isChanging) return;
    
    setIsChanging(true);
    const startTime = Date.now();
    const newLang = isArabic ? 'en' : 'ar';
    
    try {
      await i18n.changeLanguage(newLang);
      
      // Ensure minimum loading time for visible feedback
      const elapsed = Date.now() - startTime;
      const minLoadingTime = 500; // 500ms minimum
      
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
    } catch (error) {
      console.error('Language change error:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isChanging}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        backgroundColor: 'white',
        cursor: isChanging ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        transition: 'all 0.2s',
        opacity: isChanging ? 0.7 : 1,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isChanging) {
          e.currentTarget.style.backgroundColor = '#F9FAFB';
          e.currentTarget.style.borderColor = '#0155CB';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'white';
        e.currentTarget.style.borderColor = '#E5E7EB';
      }}
    >
      {isChanging ? (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: 'spin 1s linear infinite',
            }}
          >
            <circle cx="12" cy="12" r="10" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"/>
          </svg>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )}
      <span>{isArabic ? 'EN' : 'عربي'}</span>
    </button>
  );
};

export default LanguageSwitcher;
