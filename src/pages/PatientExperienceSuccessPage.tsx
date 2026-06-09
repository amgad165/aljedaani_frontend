import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import '../styles/pages/PatientExperienceSuccessPage.css';

export default function PatientExperienceSuccessPage() {
  const { t } = useTranslation('pages');

  return (
    <div className="patient-experience-success">
      <div className="container">
        <div className="success-content">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1>{t('submissionSuccessful')}</h1>
          <p>{t('submissionSuccessMessage')}</p>
          <div className="success-actions">
            <Link to="/patient-experiences" className="btn btn-primary">
              {t('backToExperiences')}
            </Link>
            <Link to="/" className="btn btn-secondary">
              {t('home')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
