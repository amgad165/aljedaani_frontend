import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  patientExperienceService,
  type PatientExperience,
  type PatientExperienceQuestion,
} from '../services/patientExperienceService';
import FloatingContactButtons from '../components/FloatingContactButtons';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/PatientExperienceDetailPage.css';

export default function PatientExperienceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('pages');

  const ResponsiveNavbar = useResponsiveNavbar();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const showContactForm = authLoading ? true : !user;

  const [experience, setExperience] = useState<PatientExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    full_name: string;
    email: string;
    phone: string;
    answers: Record<string, string | string[]>;
  }>({
    full_name: '',
    email: '',
    phone: '',
    answers: {},
  });

  useEffect(() => {
    const fetchExperience = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await patientExperienceService.getExperience(Number(id));
        setExperience(data);

        const questions = data?.questions ?? [];
        const answers: Record<string, string | string[]> = {};
        questions.forEach((q: PatientExperienceQuestion) => {
          // Default to string for required validation; checkbox/radio will be handled by handlers
          answers[q.field_name] = q.question_type === 'checkbox' ? [] : '';
        });

        setFormData((prev) => ({
          ...prev,
          answers,
          ...(showContactForm
            ? {}
            : {
                full_name: user?.name ?? prev.full_name,
                email: user?.email ?? prev.email,
                phone: user?.phone ?? prev.phone,
              }),
        }));
      } catch (err) {
        console.error('Failed to fetch experience:', err);
        setError(t('errorLoadingData'));
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id, t, user, showContactForm]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Contact fields
    if (name === 'full_name' || name === 'email' || name === 'phone') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      return;
    }

    // Experience question fields (non-checkbox)
    if (name.startsWith('question_')) {
      const fieldName = name.replace('question_', '');
      const input = e.target as HTMLInputElement;

      // Don't overwrite checkbox answers; they use handleCheckboxChange
      if (input.type === 'checkbox') return;

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
      const currentValue = prev.answers[fieldName];
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [fieldName]: checked
            ? [...currentArray, value]
            : currentArray.filter((v) => v !== value),
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!experience || !id) return;

    // Validate required fields (only when showing contact form)
    let isValid = true;
    if (showContactForm && !formData.full_name.trim()) {
      setError(t('fullNameRequired'));
      isValid = false;
    }

    if (experience.questions) {
      for (const question of experience.questions) {
        const value = formData.answers[question.field_name];

        const isEmpty =
          question.question_type === 'checkbox'
            ? !Array.isArray(value) || value.length === 0
            : typeof value !== 'string' || value.trim() === '';

        if (question.is_required && isEmpty) {
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
      <div>
        {!isAuthenticated && <FloatingContactButtons />}
        {ResponsiveNavbar}
        <div className="patient-experience-detail">
          <div className="container">
            <div className="skeleton-header"></div>
            <div className="skeleton-form"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div>
        {!isAuthenticated && <FloatingContactButtons />}
        {ResponsiveNavbar}
        <div className="patient-experience-detail">
          <div className="container">
            <div className="error-message">{t('experienceNotFound')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!isAuthenticated && <FloatingContactButtons />}
      {ResponsiveNavbar}
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


          {showContactForm && (
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
          )}

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
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          answers: {
                            ...prev.answers,
                            [question.field_name]: value,
                          },
                        }));
                      }}
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
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          answers: {
                            ...prev.answers,
                            [question.field_name]: value,
                          },
                        }));
                      }}
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
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          answers: {
                            ...prev.answers,
                            [question.field_name]: value,
                          },
                        }));
                      }}
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
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          answers: {
                            ...prev.answers,
                            [question.field_name]: value,
                          },
                        }));
                      }}
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
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          answers: {
                            ...prev.answers,
                            [question.field_name]: value,
                          },
                        }));
                      }}
                      required={question.is_required}
                    />
                  )}

                  {question.question_type === 'textarea' && (
                    <textarea
                      id={`question_${question.field_name}`}
                      name={`question_${question.field_name}`}
                      value={formData.answers[question.field_name] || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          answers: {
                            ...prev.answers,
                            [question.field_name]: value,
                          },
                        }));
                      }}
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
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          answers: {
                            ...prev.answers,
                            [question.field_name]: value,
                          },
                        }));
                      }}
                      required={question.is_required}
                    >
                      <option value="">{t('selectOption')}</option>
                      {(question.options ?? []).map((option: unknown, index: number) => {
                        const optionValue =
                          typeof option === 'string' ? option : (option as Record<string, string>).value ?? '';
                        const optionLabel =
                          typeof option === 'string' ? option : patientExperienceService.getField(option as Record<string, string>);
                        return (
                          <option key={index} value={optionValue}>
                            {optionLabel}
                          </option>
                        );
                      })}
                    </select>
                  )}

                  {question.question_type === 'radio' && (
                    <div className="radio-group">
                      {(question.options ?? []).map((option: unknown, index: number) => {
                        const optionValue =
                          typeof option === 'string'
                            ? option
                            : (option as Record<string, string>).value ?? '';

                        const optionLabel =
                          typeof option === 'string'
                            ? option
                            : patientExperienceService.getField(option as Record<string, string>);

                        return (
                          <div key={index} className="radio-item">
                            <input
                              type="radio"
                              id={`question_${question.field_name}_${index}`}
                              name={`question_${question.field_name}`}
                              value={optionValue}
                              checked={formData.answers[question.field_name] === optionValue}
                              onChange={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  answers: {
                                    ...prev.answers,
                                    [question.field_name]: optionValue,
                                  },
                                }));
                              }}
                              required={question.is_required}
                            />
                            <label htmlFor={`question_${question.field_name}_${index}`}>{optionLabel}</label>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {question.question_type === 'checkbox' && (
                    <div className="checkbox-group">
                      {(question.options ?? []).map((option: unknown, index: number) => {
                        const optionValue =
                          typeof option === 'string'
                            ? option
                            : (option as Record<string, string>).value ?? '';

                        const optionLabel =
                          typeof option === 'string'
                            ? option
                            : patientExperienceService.getField(option as Record<string, string>);

                        const checkedValues = Array.isArray(formData.answers[question.field_name])
                          ? (formData.answers[question.field_name] as string[])
                          : [];

                        return (
                          <div key={index} className="checkbox-item">
                            <input
                              type="checkbox"
                              id={`question_${question.field_name}_${index}`}
                              value={optionValue}
                              checked={checkedValues.includes(optionValue)}
                              onChange={(e) => handleCheckboxChange(question.field_name, optionValue, e.target.checked)}
                            />
                            <label htmlFor={`question_${question.field_name}_${index}`}>{optionLabel}</label>
                          </div>
                        );
                      })}
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
    </div>
  );
}
