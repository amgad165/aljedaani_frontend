import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface HomepageData {
  branches: any[];
  testimonials: any[];
  departments: any[];
  excellence_centers: any[];
  offers: any[];
}

interface HomepageContextType {
  data: HomepageData | null;
  loading: boolean;
  error: string | null;
}

const HomepageContext = createContext<HomepageContextType | undefined>(undefined);

export const HomepageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/homepage`);
        const result = await response.json();
        
        if (result.status === 'success') {
          setData(result.data);
        }
      } catch (err) {
        setError('Failed to load homepage data');
        console.error('Homepage API error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <HomepageContext.Provider value={{ data, loading, error }}>
      {children}
    </HomepageContext.Provider>
  );
};

export const useHomepageData = () => {
  const context = useContext(HomepageContext);
  if (!context) {
    throw new Error('useHomepageData must be used within HomepageProvider');
  }
  return context;
};
