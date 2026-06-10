import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { patientExperienceService, type PatientExperience } from '../services/patientExperienceService';
import FloatingContactButtons from '../components/FloatingContactButtons';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/PatientExperiencePage.css';

export default function PatientExperiencePage() {
  const { t } = useTranslation('pages');
  const ResponsiveNavbar = useResponsiveNavbar();
  const { user, isLoading: authLoading } = useAuth();
  const showContact = !authLoading && !user;

  const [experiences, setExperiences] = useState<PatientExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const data = await patientExperienceService.getExperiences({ active: true });
        setExperiences(data);
      } catch (err) {
        console.error('Failed to fetch patient experiences:', err);
        setError(t('errorLoadingData'));
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [t]);

  const PageSkeleton = () => (
    <div className="patient-experience-page">
      <div className="container">
        <div className="page-header">
          <h1>{t('patientExperience')}</h1>
        </div>
        <div className="experiences-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="experience-card skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PageError = () => (
    <div className="patient-experience-page">
      <div className="container">
        <div className="page-header">
          <h1>{t('patientExperience')}</h1>
        </div>
        <div className="error-message">{error}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div>
        {showContact && <FloatingContactButtons />}
        {ResponsiveNavbar}
        <PageSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {showContact && <FloatingContactButtons />}
        {ResponsiveNavbar}
        <PageError />
      </div>
    );
  }

  return (
    <div>
      {showContact && <FloatingContactButtons />}
      {ResponsiveNavbar}

      <div className="patient-experience-page">
        <div className="container">
          <div className="page-header">
            <h1>{t('patientExperience')}</h1>
          </div>

          {experiences.length === 0 ? (
            <div className="no-data">
              <p>{t('noDataAvailable')}</p>
            </div>
          ) : (
            <div className="experiences-grid">
              {experiences.map((experience) => (
                <div key={experience.id} className="experience-card">
                  <h3>{patientExperienceService.getField(experience.title)}</h3>
                  {experience.description && (
                    <p className="description">
                      {patientExperienceService.getField(experience.description)}
                    </p>
                  )}
                  <div className="card-footer">
                    <span className="questions-count">
                      {experience.questions_count || 0} {t('questions')}
                    </span>
                    <Link to={`/patient-experiences/${experience.id}`} className="btn-learn-more">
                      {t('participate')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
