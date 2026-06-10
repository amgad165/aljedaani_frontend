import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from './AdminLayout';
import {
  patientExperienceService,
  type PatientExperience,
  type PatientExperienceQuestion,
  type PatientExperienceSubmission,
  type QuestionType,
} from '../../services/patientExperienceService';
import '../../styles/admin/AdminPatientExperiences.css';

type Tab = 'experiences' | 'questions' | 'submissions';

export default function AdminPatientExperiences() {
  const { t } = useTranslation('pages');
  const [activeTab, setActiveTab] = useState<Tab>('experiences');
  const [experiences, setExperiences] = useState<PatientExperience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<PatientExperience | null>(null);
  const [questions, setQuestions] = useState<PatientExperienceQuestion[]>([]);
  const [submissions, setSubmissions] = useState<PatientExperienceSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<PatientExperienceSubmission | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    title: Record<string, string>;
    description: Record<string, string>;
    is_active: boolean;
    sort_order: number;
  }>({
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    is_active: true,
    sort_order: 0,
  });

  const [questionFormData, setQuestionFormData] = useState<{
    question: Record<string, string>;
    field_name: string;
    question_type: QuestionType;
    options: string[];
    placeholder: Record<string, string>;
    is_required: boolean;
    is_active: boolean;
  }>({
    question: { en: '', ar: '' },
    field_name: '',
    question_type: 'text',
    options: [],
    placeholder: { en: '', ar: '' },
    is_required: true,
    is_active: true,
  });

  // Fetch experiences
  useEffect(() => {
    fetchExperiences();
  }, []);

  // Fetch questions and submissions when experience is selected
  useEffect(() => {
    if (selectedExperience && activeTab === 'questions') {
      fetchQuestions();
    } else if (selectedExperience && activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [selectedExperience, activeTab]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const data = await patientExperienceService.getExperiences();
      setExperiences(data);
      if (data.length > 0 && !selectedExperience) {
        setSelectedExperience(data[0]);
      }
    } catch {
      setError(t('errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (!selectedExperience) return;
    try {
      const data = await patientExperienceService.getQuestions(selectedExperience.id);
      setQuestions(data);
    } catch {
      setError(t('errorLoadingData'));
    }
  };

  const fetchSubmissions = async () => {
    if (!selectedExperience) return;
    try {
      const data = await patientExperienceService.getSubmissions(selectedExperience.id);
      setSubmissions(data);
    } catch {
      setError(t('errorLoadingData'));
    }
  };

  const handleSaveExperience = async () => {
    try {
      setLoading(true);
      if (editingId) {
        await patientExperienceService.updateExperience(editingId, formData);
        setSuccess(t('updatedSuccessfully'));
      } else {
        await patientExperienceService.createExperience(formData);
        setSuccess(t('createdSuccessfully'));
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: { en: '', ar: '' },
        description: { en: '', ar: '' },
        is_active: true,
        sort_order: 0,
      });
      fetchExperiences();
    } catch {
      setError(t('errorSavingData'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperience = async (id: number) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      await patientExperienceService.deleteExperience(id);
      setSuccess(t('deletedSuccessfully'));
      fetchExperiences();
    } catch {
      setError(t('errorDeletingData'));
    }
  };

  const handleEditExperience = (experience: PatientExperience) => {
    setEditingId(experience.id);
    setFormData({
      title: experience.title,
      description: experience.description || { en: '', ar: '' },
      is_active: experience.is_active,
      sort_order: experience.sort_order,
    });
    setShowForm(true);
  };

  const handleSaveQuestion = async () => {
    if (!selectedExperience) return;
    try {
      setLoading(true);
      const payload = {
        ...questionFormData,
        options: questionFormData.question_type !== 'text' && questionFormData.question_type !== 'textarea' 
          ? questionFormData.options 
          : undefined,
      };
      
      if (editingId) {
        await patientExperienceService.updateQuestion(selectedExperience.id, editingId, payload);
        setSuccess(t('updatedSuccessfully'));
      } else {
        await patientExperienceService.createQuestion(selectedExperience.id, payload);
        setSuccess(t('createdSuccessfully'));
      }
      
      setEditingId(null);
      setQuestionFormData({
        question: { en: '', ar: '' },
        field_name: '',
        question_type: 'text',
        options: [],
        placeholder: { en: '', ar: '' },
        is_required: true,
        is_active: true,
      });
      fetchQuestions();
    } catch {
      setError(t('errorSavingData'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!selectedExperience || !confirm(t('confirmDelete'))) return;
    try {
      await patientExperienceService.deleteQuestion(selectedExperience.id, questionId);
      setSuccess(t('deletedSuccessfully'));
      fetchQuestions();
    } catch {
      setError(t('errorDeletingData'));
    }
  };

  const handleViewSubmission = (submission: PatientExperienceSubmission) => {
    setSelectedSubmission(submission);
  };

  const handleUpdateSubmissionStatus = async (submissionId: number, newStatus: string) => {
    if (!selectedExperience) return;
    try {
      await patientExperienceService.updateSubmission(selectedExperience.id, submissionId, { status: newStatus });
      setSuccess(t('updatedSuccessfully'));
      fetchSubmissions();
    } catch {
      setError(t('errorUpdatingData'));
    }
  };

  const handleAddOption = () => {
    setQuestionFormData({
      ...questionFormData,
      options: [...questionFormData.options, ''],
    });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...questionFormData.options];
    newOptions[index] = value;
    setQuestionFormData({
      ...questionFormData,
      options: newOptions,
    });
  };

  const handleRemoveOption = (index: number) => {
    setQuestionFormData({
      ...questionFormData,
      options: questionFormData.options.filter((_, i) => i !== index),
    });
  };

  return (
    <AdminLayout>
      <div className="admin-patient-experiences">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'experiences' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiences')}
        >
          {t('patientExperiences')}
        </button>
        <button
          className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
          disabled={!selectedExperience}
        >
          {t('questions')}
        </button>
        <button
          className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
          disabled={!selectedExperience}
        >
          {t('submissions')}
        </button>
      </div>

      {/* Experiences Tab */}
      {activeTab === 'experiences' && (
        <div className="tab-content">
          <div className="tab-header">
            <h2>{t('patientExperiences')}</h2>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({
                  title: { en: '', ar: '' },
                  description: { en: '', ar: '' },
                  is_active: true,
                  sort_order: 0,
                });
              }}
              className="btn btn-primary"
            >
              {t('addNew')}
            </button>
          </div>

          {showForm && (
            <div className="form-section">
              <div className="form-group">
                <label>{t('titleEn')}</label>
                <input
                  type="text"
                value={(formData.title as Record<string, string>).en || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: { ...(formData.title as Record<string, string>), en: e.target.value },
                  })
                }
                placeholder={t('enterText')}
              />
            </div>

            <div className="form-group">
              <label>{t('titleAr')}</label>
              <input
                type="text"
                value={(formData.title as Record<string, string>).ar || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: { ...(formData.title as Record<string, string>), ar: e.target.value },
                  })
                }
                placeholder={t('enterText')}
              />
            </div>

            <div className="form-group">
              <label>{t('descriptionEn')}</label>
              <textarea
                value={(formData.description as Record<string, string>).en || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: { ...(formData.description as Record<string, string>), en: e.target.value },
                  })
                }
                placeholder={t('enterText')}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>{t('descriptionAr')}</label>
              <textarea
                value={(formData.description as Record<string, string>).ar || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: { ...(formData.description as Record<string, string>), ar: e.target.value },
                  })
                }
                placeholder={t('enterText')}
                rows={3}
              />
              </div>

              <div className="form-group">
                <label>{t('sortOrder')}</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.checked,
                    })
                  }
                />
                <label htmlFor="is_active">{t('isActive')}</label>
              </div>

              <div className="form-actions">
                <button onClick={handleSaveExperience} disabled={loading} className="btn btn-success">
                  {t('save')}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="btn btn-secondary"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>{t('title')}</th>
                  <th>{t('status')}</th>
                  <th>{t('questions')}</th>
                  <th>{t('submissions')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {experiences.map((experience) => (
                  <tr key={experience.id}>
                    <td>{patientExperienceService.getField(experience.title)}</td>
                    <td>
                      <span className={`badge ${experience.is_active ? 'active' : 'inactive'}`}>
                        {experience.is_active ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td>{experience.questions_count || 0}</td>
                    <td>{experience.submissions_count || 0}</td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedExperience(experience);
                          setActiveTab('questions');
                        }}
                        className="btn btn-sm btn-info"
                      >
                        {t('manage')}
                      </button>
                      <button
                        onClick={() => handleEditExperience(experience)}
                        className="btn btn-sm btn-primary"
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(experience.id)}
                        className="btn btn-sm btn-danger"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && selectedExperience && (
        <div className="tab-content">
          <div className="tab-header">
            <h2>
              {t('questions')} - {patientExperienceService.getField(selectedExperience.title)}
            </h2>
            <button
              onClick={() => {
                setEditingId(null);
                setQuestionFormData({
                  question: { en: '', ar: '' },
                  field_name: '',
                  question_type: 'text',
                  options: [],
                  placeholder: { en: '', ar: '' },
                  is_required: true,
                  is_active: true,
                });
              }}
              className="btn btn-primary"
            >
              {t('addQuestion')}
            </button>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>{t('questionEn')}</label>
              <input
                type="text"
                value={questionFormData.question.en}
                onChange={(e) =>
                  setQuestionFormData({
                    ...questionFormData,
                    question: { ...questionFormData.question, en: e.target.value },
                  })
                }
                placeholder={t('enterQuestion')}
              />
            </div>

            <div className="form-group">
              <label>{t('questionAr')}</label>
              <input
                type="text"
                value={questionFormData.question.ar}
                onChange={(e) =>
                  setQuestionFormData({
                    ...questionFormData,
                    question: { ...questionFormData.question, ar: e.target.value },
                  })
                }
                placeholder={t('enterQuestion')}
              />
            </div>

            <div className="form-group">
              <label>{t('fieldName')}</label>
              <input
                type="text"
                value={questionFormData.field_name}
                onChange={(e) =>
                  setQuestionFormData({
                    ...questionFormData,
                    field_name: e.target.value,
                  })
                }
                placeholder={t('enterFieldName')}
              />
            </div>

            <div className="form-group">
              <label>{t('questionType')}</label>
              <select
                value={questionFormData.question_type}
                onChange={(e) =>
                  setQuestionFormData({
                    ...questionFormData,
                    question_type: e.target.value as QuestionType,
                    options: [],
                  })
                }
              >
                <option value="text">{t('text')}</option>
                <option value="textarea">{t('textarea')}</option>
                <option value="email">{t('email')}</option>
                <option value="phone">{t('phone')}</option>
                <option value="number">{t('number')}</option>
                <option value="date">{t('date')}</option>
                <option value="select">{t('select')}</option>
                <option value="radio">{t('radio')}</option>
                <option value="checkbox">{t('checkbox')}</option>
              </select>
            </div>

            {['select', 'radio', 'checkbox'].includes(questionFormData.question_type) && (
              <div className="form-group">
                <label>{t('options')}</label>
                {(questionFormData.options as string[]).map((option, index) => (
                  <div key={index} className="option-input">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleUpdateOption(index, e.target.value)}
                      placeholder={`${t('option')} ${index + 1}`}
                    />
                    <button
                      onClick={() => handleRemoveOption(index)}
                      type="button"
                      className="btn btn-sm btn-danger"
                    >
                      {t('remove')}
                    </button>
                  </div>
                ))}
                <button onClick={handleAddOption} type="button" className="btn btn-sm btn-secondary">
                  {t('addOption')}
                </button>
              </div>
            )}

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="is_required"
                checked={questionFormData.is_required}
                onChange={(e) =>
                  setQuestionFormData({
                    ...questionFormData,
                    is_required: e.target.checked,
                  })
                }
              />
              <label htmlFor="is_required">{t('isRequired')}</label>
            </div>

            <div className="form-actions">
              <button onClick={handleSaveQuestion} disabled={loading} className="btn btn-success">
                {t('save')}
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setQuestionFormData({
                    question: { en: '', ar: '' },
                    field_name: '',
                    question_type: 'text',
                    options: [],
                    placeholder: { en: '', ar: '' },
                    is_required: true,
                    is_active: true,
                  });
                }}
                className="btn btn-secondary"
              >
                {t('clear')}
              </button>
            </div>
          </div>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>{t('question')}</th>
                  <th>{t('type')}</th>
                  <th>{t('required')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id}>
                    <td>{patientExperienceService.getField(question.question)}</td>
                    <td>{question.question_type}</td>
                    <td>{question.is_required ? t('yes') : t('no')}</td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingId(question.id);
                          setQuestionFormData({
                            question: question.question,
                            field_name: question.field_name,
                            question_type: question.question_type,
                            options: (question.options || []) as string[],
                            placeholder: question.placeholder || { en: '', ar: '' },
                            is_required: question.is_required,
                            is_active: question.is_active,
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="btn btn-sm btn-primary"
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="btn btn-sm btn-danger"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && selectedExperience && (
        <div className="tab-content">
          <div className="tab-header">
            <h2>
              {t('submissions')} - {patientExperienceService.getField(selectedExperience.title)}
            </h2>
          </div>

          {selectedSubmission && (
            <div className="submission-view-modal">
              <div className="submission-view-modal__content">
                <div className="submission-view-modal__header">
                  <h3>{t('submissionDetails') ?? 'Submission details'}</h3>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    {t('close') ?? 'Close'}
                  </button>
                </div>

                <div className="submission-view-modal__body">
                  <div className="submission-view-meta">
                    <div><strong>{t('name')}: </strong>{selectedSubmission.full_name}</div>
                    <div><strong>{t('email')}: </strong>{selectedSubmission.email || '-'}</div>
                    <div><strong>{t('phone')}: </strong>{selectedSubmission.phone || '-'}</div>
                    <div><strong>{t('status')}: </strong>{selectedSubmission.status}</div>
                    <div><strong>{t('date')}: </strong>{new Date(selectedSubmission.created_at).toLocaleDateString()}</div>
                  </div>

                  <div className="submission-view-answers">
                    <h4>{t('answers') ?? 'Answers'}</h4>

                    {selectedSubmission.answers && Object.keys(selectedSubmission.answers).length > 0 ? (
                      <div className="submission-answers-grid">
                        {(() => {
                          const fieldNameToLabel: Record<string, string> = {};
                          questions.forEach((q) => {
                            fieldNameToLabel[q.field_name] = patientExperienceService.getField(q.question);
                          });

                          return Object.entries(selectedSubmission.answers).map(([fieldName, value]) => {
                            const matchedQuestion = questions.find((q) => q.field_name === fieldName);

                            // Prefer the exact question text returned by backend question object
                            const questionText =
                              matchedQuestion?.question?.en ??
                              matchedQuestion?.question?.ar ??
                              fieldNameToLabel[fieldName] ??
                              fieldName;

                            return (
                              <div key={fieldName} className="submission-answer-item">
                                <div className="submission-answer-key">{questionText}</div>
                                <div className="submission-answer-value">
                                  {Array.isArray(value) ? value.join(', ') : String(value ?? '')}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                      <div className="submission-answer-empty">-</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('email')}</th>
                  <th>{t('phone')}</th>
                  <th>{t('status')}</th>
                  <th>{t('date')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.full_name}</td>
                    <td>{submission.email || '-'}</td>
                    <td>{submission.phone || '-'}</td>
                    <td>
                      <select
                        value={submission.status}
                        onChange={(e) => handleUpdateSubmissionStatus(submission.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="new">{t('new')}</option>
                        <option value="reviewing">{t('reviewing')}</option>
                        <option value="resolved">{t('resolved')}</option>
                        <option value="closed">{t('closed')}</option>
                      </select>
                    </td>
                    <td>{new Date(submission.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        type="button"
                        onClick={() => handleViewSubmission(submission)}
                      >
                        {t('view')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
