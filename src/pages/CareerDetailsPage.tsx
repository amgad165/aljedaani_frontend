import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import FloatingContactButtons from '../components/FloatingContactButtons';
import Footer from '../components/Footer';
import { careersService, type Career, type CareerQuestion } from '../services/careersService';

type AnswerMap = Record<string, string | string[]>;

const MetaIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      width: 24,
      height: 24,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#E7F7FF',
      border: '1px solid #BEE8F8',
      color: '#0D5E88',
      flexShrink: 0,
    }}
    aria-hidden="true"
  >
    {children}
  </span>
);

const MetaPill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: '#F8FBFF', border: '1px solid #E2E8F0' }}>
    {icon}
    <span>{text}</span>
  </span>
);

const CareerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('pages');
  const ResponsiveNavbar = useResponsiveNavbar();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [fileAnswers, setFileAnswers] = useState<Record<string, File>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const locale = i18n.language === 'ar' ? 'ar' : 'en';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!id) {
      navigate('/careers');
      return;
    }

    careersService
      .getCareer(id)
      .then((data) => {
        if (!data) {
          navigate('/careers');
          return;
        }
        setCareer(data);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const questions = useMemo(() => (career?.questions ?? []).filter((q) => q.is_active), [career]);

  const getQuestionLabel = (question: CareerQuestion): string => careersService.getField(question.question, locale);
  const getPlaceholder = (question: CareerQuestion): string => careersService.getField(question.placeholder, locale);

  const setSingleAnswer = (fieldName: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldName]: value }));
  };

  const toggleCheckboxAnswer = (fieldName: string, value: string) => {
    setAnswers((prev) => {
      const existing = prev[fieldName];
      const list = Array.isArray(existing) ? existing : [];
      return {
        ...prev,
        [fieldName]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  };

  const validateBeforeSubmit = (): string | null => {
    if (!career) return 'Career not found';
    if (!fullName.trim() || !email.trim() || !phone.trim()) return 'Name, email and phone are required';
    if (!cvFile) return 'Please attach your CV';

    const missingQuestion = questions.find((q) => {
      if (!q.is_required) return false;
      const answer = answers[q.field_name];
      if (Array.isArray(answer)) return answer.length === 0;
      return !answer || !String(answer).trim();
    });

    if (missingQuestion) {
      return `Please answer required question: ${getQuestionLabel(missingQuestion)}`;
    }

    return null;
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationError = validateBeforeSubmit();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    if (!career || !cvFile) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('full_name', fullName.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      if (coverLetter.trim()) formData.append('cover_letter', coverLetter.trim());
      formData.append('cv', cvFile);
      formData.append('answers', JSON.stringify(answers));

      // Support file-type dynamic questions by sending files in dedicated form fields.
      questions
        .filter((q) => q.question_type === 'file')
        .forEach((q) => {
          const file = fileAnswers[q.field_name];
          if (file) {
            formData.append(q.field_name, file);
          }
        });

      await careersService.submitApplication(career.id, formData);
      const langPrefix = i18n.language === 'ar' ? '/ar' : '/en';
      navigate(`${langPrefix}/careers/${career.id}/success`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#C9F3FF', display: 'flex', flexDirection: 'column' }}>
        <FloatingContactButtons />
        {ResponsiveNavbar}
      </div>
    );
  }

  if (!career) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#C9F3FF', display: 'flex', flexDirection: 'column' }}>
      <FloatingContactButtons />
      {ResponsiveNavbar}

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: isMobile ? '92px 12px 36px' : '132px 20px 48px',
          direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
        }}
      >
        <div style={{ width: '100%', maxWidth: '1120px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '15px', padding: isMobile ? '14px 16px' : '10px 24px' }}>
            <button
              onClick={() => navigate('/careers')}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#061F42', fontFamily: 'Nunito, sans-serif', marginBottom: 6 }}
            >
              ← {t('back')}
            </button>
            <h1 style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: isMobile ? '28px' : '42px', lineHeight: isMobile ? '34px' : '48px', color: '#061F42' }}>
              {careersService.getField(career.title, locale)}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10, color: '#4A5565', fontFamily: 'Varela, sans-serif', fontSize: 14 }}>
              <MetaPill
                icon={(
                  <MetaIcon>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22C16 17.8 19 14.8 19 11C19 7.13 15.87 4 12 4C8.13 4 5 7.13 5 11C5 14.8 8 17.8 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </MetaIcon>
                )}
                text={career.location}
              />
              <MetaPill
                icon={(
                  <MetaIcon>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 8V6.8C5 5.25 6.25 4 7.8 4H16.2C17.75 4 19 5.25 19 6.8V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <rect x="4" y="8" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </MetaIcon>
                )}
                text={careersService.getEmploymentTypeLabel(career.employment_type)}
              />
              {career.experience_level && (
                <MetaPill
                  icon={(
                    <MetaIcon>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M3 12H7L10 5L14 19L17 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </MetaIcon>
                  )}
                  text={career.experience_level}
                />
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px' }}>
              <h2 style={{ margin: '0 0 8px', fontFamily: 'Nunito, sans-serif', color: '#061F42' }}>Job Description</h2>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'Varela, sans-serif', lineHeight: '24px', color: '#4A5565' }}>
                {careersService.getField(career.description, locale) || 'No description provided.'}
              </p>

              {career.requirements && career.requirements.length > 0 && (
                <>
                  <h3 style={{ margin: '14px 0 6px', fontFamily: 'Nunito, sans-serif', color: '#061F42' }}>Requirements</h3>
                  <ul style={{ margin: 0, paddingInlineStart: 18, fontFamily: 'Varela, sans-serif', color: '#4A5565' }}>
                    {career.requirements.map((req, index) => (
                      <li key={index} style={{ marginBottom: 5 }}>{req}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <form onSubmit={submitApplication} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h2 style={{ margin: 0, fontFamily: 'Nunito, sans-serif', color: '#061F42' }}>Apply for this job</h2>

              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #d1d5db' }} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #d1d5db' }} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" required style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #d1d5db' }} />
              <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Cover Letter (optional)" style={{ minHeight: 88, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #d1d5db' }} />

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontFamily: 'Nunito, sans-serif', color: '#061F42', fontWeight: 700 }}>Attach CV (PDF/DOC/DOCX)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} required />
              </div>

              {questions.length > 0 && (
                <div style={{ marginTop: 6, borderTop: '1px solid #e5e7eb', paddingTop: 10 }}>
                  <h3 style={{ margin: '0 0 10px', fontFamily: 'Nunito, sans-serif', color: '#061F42' }}>Additional Questions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {questions.map((q) => {
                      const label = getQuestionLabel(q);
                      const placeholder = getPlaceholder(q);
                      const current = answers[q.field_name];

                      if (q.question_type === 'textarea') {
                        return (
                          <div key={q.id}>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#061F42' }}>{label}{q.is_required ? ' *' : ''}</label>
                            <textarea
                              value={typeof current === 'string' ? current : ''}
                              onChange={(e) => setSingleAnswer(q.field_name, e.target.value)}
                              placeholder={placeholder}
                              required={q.is_required}
                              style={{ width: '100%', minHeight: 86, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #d1d5db' }}
                            />
                          </div>
                        );
                      }

                      if (q.question_type === 'select') {
                        return (
                          <div key={q.id}>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#061F42' }}>{label}{q.is_required ? ' *' : ''}</label>
                            <select
                              value={typeof current === 'string' ? current : ''}
                              onChange={(e) => setSingleAnswer(q.field_name, e.target.value)}
                              required={q.is_required}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #d1d5db' }}
                            >
                              <option value="">Select an option</option>
                              {(q.options ?? []).map((opt, idx) => (
                                <option key={idx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        );
                      }

                      if (q.question_type === 'radio') {
                        return (
                          <div key={q.id}>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#061F42' }}>{label}{q.is_required ? ' *' : ''}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {(q.options ?? []).map((opt, idx) => (
                                <label key={idx} style={{ color: '#4A5565' }}>
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    checked={current === opt}
                                    onChange={() => setSingleAnswer(q.field_name, opt)}
                                    required={q.is_required && idx === 0 && !current}
                                  />{' '}
                                  {opt}
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (q.question_type === 'checkbox') {
                        const list = Array.isArray(current) ? current : [];
                        return (
                          <div key={q.id}>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#061F42' }}>{label}{q.is_required ? ' *' : ''}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {(q.options ?? []).map((opt, idx) => (
                                <label key={idx} style={{ color: '#4A5565' }}>
                                  <input
                                    type="checkbox"
                                    checked={list.includes(opt)}
                                    onChange={() => toggleCheckboxAnswer(q.field_name, opt)}
                                  />{' '}
                                  {opt}
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (q.question_type === 'file') {
                        return (
                          <div key={q.id}>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#061F42' }}>{label}{q.is_required ? ' *' : ''}</label>
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setFileAnswers((prev) => ({ ...prev, [q.field_name]: file }));
                                  setAnswers((prev) => ({ ...prev, [q.field_name]: file.name }));
                                }
                              }}
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={q.id}>
                          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#061F42' }}>{label}{q.is_required ? ' *' : ''}</label>
                          <input
                            type={q.question_type === 'email' || q.question_type === 'phone' || q.question_type === 'number' || q.question_type === 'date' ? q.question_type : 'text'}
                            value={typeof current === 'string' ? current : ''}
                            onChange={(e) => setSingleAnswer(q.field_name, e.target.value)}
                            placeholder={placeholder}
                            required={q.is_required}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #d1d5db' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {submitError && <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 8, padding: 10 }}>{submitError}</div>}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: 6,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: submitting ? '#94a3b8' : '#061F42',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CareerDetailsPage;
