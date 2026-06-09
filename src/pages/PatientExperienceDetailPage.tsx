import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { patientExperienceService, type PatientExperience } from '../services/patientExperienceService';
import '../styles/pages/PatientExperienceDetailPage.css';

export default function PatientExperienceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('pages');
  const { i18n } = useTranslation();

  const [experience, setExperience] = useState<PatientExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    answers: {} as Record<string, any>,
  });

  useEffect(() => {
    const fetchExperience = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await patientExperienceService.getExperience(Number(id));
        setExperience(data);
        // Initialize answers object
        const answers: Record<string, any> = {};
        data.questions?.forEach((q: any) => {
          answers[q.field_name] = '';
        });
        setFormData((prev) => ({ ...prev, answers }));
      } catch (err) {
        console.error('Failed to fetch experience:', err);
        setError(t('errorLoadingData'));
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id, t]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;

    if (name in formData && name !== 'answers') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (name.startsWith('question_')) {
      const fieldName = name.replace('question_', '');
      setFormData((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [fieldName]: value,
        },
      }));
    }
  };

  const handleCheckboxChange = (fieldName: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentValue = prev.answers[fieldName] || [];
      if (Array.isArray(currentValue)) {
        return {
          ...prev,
          answers: {
            ...prev.answers,
            [fieldName]: checked
              ? [...currentValue, value]
              : currentValue.filter((v: string) => v !== value),
          },
        };
      }
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!experience || !id) return;

    // Validate required fields
    let isValid = true;
    if (!formData.full_name.trim()) {
      setError(t('fullNameRequired'));
      isValid = false;
    }

    if (experience.questions) {
      for (const question of experience.questions) {
        if (question.is_required && !formData.answers[question.field_name]) {
          setError(`${patientExperienceService.getField(question.question)} ${t('required')}`);
          isValid = false;
          break;
        }
      }
    }

    if (!isValid) return;

    try {
      setSubmitting(true);
      await patientExperienceService.submitExperience(Number(id), formData);
      navigate(`/patient-experiences/${id}/success`);
    } catch (err) {
      console.error('Failed to submit experience:', err);
      setError(t('errorSubmittingForm'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="patient-experience-detail">
        <div className="container">
          <div className="skeleton-header"></div>
          <div className="skeleton-form"></div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="patient-experience-detail">
        <div className="container">
          <div className="error-message">{t('experienceNotFound')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-experience-detail">
      <div className="container">
        <div className="detail-header">
          <h1>{patientExperienceService.getField(experience.title)}</h1>
          {experience.description && (
            <p className="description">
              {patientExperienceService.getField(experience.description)}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="experience-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h2>{t('contactInformation')}</h2>
            <div className="form-group">
              <label htmlFor="full_name" className="required">
                {t('fullName')}
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder={t('enterFullName')}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('enterEmail')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">{t('phone')}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t('enterPhone')}
              />
            </div>
          </div>

          {experience.questions && experience.questions.length > 0 && (
            <div className="form-section">
              <h2>{t('questions')}</h2>
              {experience.questions.map((question) => (
                <div key={question.id} className="form-group">
                  <label htmlFor={`question_${question.field_name}`}>
                    {patientExperienceService.getField(question.question)}
                    {question.is_required && <span className="required-mark">*</span>}
                  </label>

                  {question.question_type === 'text' && (
                    <input
                      type="text"
                      id={`question_${question.field_name}`}
                      name={`question_${question.field_name}`}
                      value={formData.answers[question.field_name] || ''}
                      onChange={handleInputChange}
                      placeholder={patientExperienceService.getField(question.placeholder)}
                      required={question.is_required}
                    />
                  )}

                  {question.question_type === 'email' && (
                    <input
                      type="email"
                      id={`question_${question.field_name}`}
                      name={`question_${question.field_name}`}
                      value={formData.answers[question.field_name] || ''}
                      onChange={handleInputChange}
                      placeholder={patientExperienceService.getField(question.placeholder)}
                      required={question.is_required}
                    />
                  )}

                  {question.question_type === 'phone' && (
                    <input
                      type="tel"
                      id={`question_${question.field_name}`}
                      name={`question_${question.field_name}`}
                      value={formData.answers[question.field_name] || ''}
                      onChange={handleInputChange}
                      placeholder={patientExperienceService.getField(question.placeholder)}
                      required={question.is_required}
                    />
                  )}

                  {question.question_type === 'number' && (
                    <input
                      type="number"
                      id={`question_${question.field_name}`}
                      name={`question_${question.field_name}`}
                      value={formData.answers[question.field_name] || ''}
                      onChange={handleInputChange}
                      placeholder={patientExperienceService.getField(question.placeholder)}
                      required={question.is_required}
                    />
                  )}

                  {question.question_type === 'date' && (
                    <input
                      type="date"
                      id={`question_${question.field_name}`}
                      name={`question_${question.field_name}`}
                      value={formData.answers[question.field_name] || ''}
                      onChange={handleInputChange}
                      required={question.is_required}
                    />
                  )}

                  {question.question_type === 'textarea' && (
                    <textarea
                      id={`question_${question.field_name}`}
                      name={`question_${question.field_name}`}
                      value={formData.answers[question.field_name] || ''}
                      onChange={handleInputChange}
                      placeholder={patientExperienceService.getField(question.placeholder)}
                      rows={4}
                      required={question.is_required}
                    />
                  )}

                  {question.question_type === 'select' && (
                    <select
                      id={`question_${question.field_name}`}
                      name={`question_${question.field_name}`}
                      value={formData.answers[question.field_name] || ''}
                      onChange={handleInputChange}
                      required={question.is_required}
                    >
                      <option value="">{t('selectOption')}</option>
                      {question.options?.map((option: any, index: number) => (
                        <option key={index} value={typeof option === 'string' ? option : option.value || ''}>
                          {typeof option === 'string' ? option : option[i18n.language] || option.en || ''}
                        </option>
                      ))}
                    </select>
                  )}

                  {question.question_type === 'radio' && (
                    <div className="radio-group">
                      {question.options?.map((option: any, index: number) => (
                        <div key={index} className="radio-item">
                          <input
                            type="radio"
                            id={`question_${question.field_name}_${index}`}
                            name={`question_${question.field_name}`}
                            value={typeof option === 'string' ? option : option.value || ''}
                            checked={formData.answers[question.field_name] === (typeof option === 'string' ? option : option.value || '')}
                            onChange={handleInputChange}
                            required={question.is_required}
                          />
                          <label htmlFor={`question_${question.field_name}_${index}`}>
                            {typeof option === 'string' ? option : option[i18n.language] || option.en || ''}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.question_type === 'checkbox' && (
                    <div className="checkbox-group">
                      {question.options?.map((option: any, index: number) => (
                        <div key={index} className="checkbox-item">
                          <input
                            type="checkbox"
                            id={`question_${question.field_name}_${index}`}
                            value={typeof option === 'string' ? option : option.value || ''}
                            checked={(formData.answers[question.field_name] || []).includes(
                              typeof option === 'string' ? option : option.value || ''
                            )}
                            onChange={(e) =>
                              handleCheckboxChange(
                                question.field_name,
                                typeof option === 'string' ? option : option.value || '',
                                e.target.checked
                              )
                            }
                          />
                          <label htmlFor={`question_${question.field_name}_${index}`}>
                            {typeof option === 'string' ? option : option[i18n.language] || option.en || ''}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn-submit">
              {submitting ? t('submitting') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
