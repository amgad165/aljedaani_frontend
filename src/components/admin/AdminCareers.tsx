import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { careersService, type Career, type CareerApplication, type CareerQuestion, type EmploymentType, type QuestionType } from '../../services/careersService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface FormState {
  title_en: string;
  title_ar: string;
  department_en: string;
  department_ar: string;
  location: string;
  employment_type: EmploymentType;
  experience_level: string;
  description_en: string;
  description_ar: string;
  requirements: string;
  application_email: string;
  application_url: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  published_at: string;
}

interface QuestionForm {
  question_en: string;
  question_ar: string;
  field_name: string;
  question_type: QuestionType;
  options: string;
  placeholder_en: string;
  placeholder_ar: string;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  title_en: '',
  title_ar: '',
  department_en: '',
  department_ar: '',
  location: '',
  employment_type: 'full_time',
  experience_level: '',
  description_en: '',
  description_ar: '',
  requirements: '',
  application_email: '',
  application_url: '',
  sort_order: 0,
  is_active: true,
  is_featured: false,
  published_at: '',
};

const EMPTY_QUESTION: QuestionForm = {
  question_en: '',
  question_ar: '',
  field_name: '',
  question_type: 'text',
  options: '',
  placeholder_en: '',
  placeholder_ar: '',
  is_required: true,
  sort_order: 0,
  is_active: true,
};

const parseField = (field: Career['title'] | Career['department'] | Career['description']): { en: string; ar: string } => {
  if (!field) return { en: '', ar: '' };
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return { en: parsed.en ?? '', ar: parsed.ar ?? '' };
    } catch {
      return { en: field, ar: '' };
    }
  }
  return { en: field.en ?? '', ar: field.ar ?? '' };
};

const parseQuestionField = (field: CareerQuestion['question'] | CareerQuestion['placeholder']): { en: string; ar: string } => {
  if (!field) return { en: '', ar: '' };
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return { en: parsed.en ?? '', ar: parsed.ar ?? '' };
    } catch {
      return { en: field, ar: '' };
    }
  }
  return { en: field.en ?? '', ar: field.ar ?? '' };
};

const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const getQuestionLabelByFieldName = (questions: CareerQuestion[], fieldName: string): string => {
  const found = questions.find((q) => q.field_name === fieldName);
  if (!found) return fieldName;
  const parsed = parseQuestionField(found.question);
  return parsed.en || parsed.ar || fieldName;
};

const getApiErrorMessage = (data: unknown, fallback: string): string => {
  if (!data || typeof data !== 'object') return fallback;

  const payload = data as { message?: string; errors?: Record<string, string[] | string> };
  if (payload.message) return payload.message;

  if (payload.errors) {
    const firstKey = Object.keys(payload.errors)[0];
    const firstValue = firstKey ? payload.errors[firstKey] : null;
    if (Array.isArray(firstValue) && firstValue.length > 0) return firstValue[0];
    if (typeof firstValue === 'string') return firstValue;
  }

  return fallback;
};

const AdminCareers: React.FC = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [questionsModalOpen, setQuestionsModalOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [questions, setQuestions] = useState<CareerQuestion[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionSaving, setQuestionSaving] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionForm>(EMPTY_QUESTION);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const [applicationsModalOpen, setApplicationsModalOpen] = useState(false);
  const [applicationsCareer, setApplicationsCareer] = useState<Career | null>(null);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [applicationQuestions, setApplicationQuestions] = useState<CareerQuestion[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationSavingId, setApplicationSavingId] = useState<number | null>(null);
  const [applicationDrafts, setApplicationDrafts] = useState<Record<number, { status: CareerApplication['status']; admin_notes: string }>>({});

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const token = localStorage.getItem('auth_token') || '';

  const fetchCareers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await careersService.getCareers({ active: 'all' });
      setCareers(data);
    } catch {
      setError('Failed to load careers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCareers();
  }, [fetchCareers]);

  const openCreate = () => {
    setEditingCareer(null);
    setForm(EMPTY_FORM);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (career: Career) => {
    const title = parseField(career.title);
    const department = parseField(career.department);
    const description = parseField(career.description);

    setEditingCareer(career);
    setForm({
      title_en: title.en,
      title_ar: title.ar,
      department_en: department.en,
      department_ar: department.ar,
      location: career.location,
      employment_type: career.employment_type,
      experience_level: career.experience_level ?? '',
      description_en: description.en,
      description_ar: description.ar,
      requirements: career.requirements?.join('\n') ?? '',
      application_email: career.application_email ?? '',
      application_url: career.application_url ?? '',
      sort_order: career.sort_order ?? 0,
      is_active: career.is_active ?? true,
      is_featured: career.is_featured ?? false,
      published_at: career.published_at ? career.published_at.slice(0, 10) : '',
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title_en.trim() || !form.location.trim()) {
      setError('Title and location are required');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: JSON.stringify({ en: form.title_en.trim(), ar: form.title_ar.trim() }),
      department: form.department_en || form.department_ar ? JSON.stringify({ en: form.department_en.trim(), ar: form.department_ar.trim() }) : null,
      location: form.location.trim(),
      employment_type: form.employment_type,
      experience_level: form.experience_level.trim() || null,
      description: form.description_en || form.description_ar ? JSON.stringify({ en: form.description_en.trim(), ar: form.description_ar.trim() }) : null,
      requirements: form.requirements
        ? JSON.stringify(form.requirements.split('\n').map((r) => r.trim()).filter(Boolean))
        : null,
      application_email: form.application_email.trim() || null,
      application_url: form.application_url.trim() || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
      is_featured: form.is_featured,
      published_at: form.published_at || null,
    } as const;

    try {
      const endpoint = editingCareer ? `${API_BASE_URL}/careers/${editingCareer.id}` : `${API_BASE_URL}/careers`;
      const method = editingCareer ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to save career');
        return;
      }

      setModalOpen(false);

      if (!editingCareer && data.data?.id) {
        const createdCareer: Career = data.data;
        await openQuestionsManager(createdCareer);
      }

      fetchCareers();
    } catch {
      setError('Network error while saving career');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/careers/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmId(null);
        fetchCareers();
      } else {
        setError(data.message || 'Delete failed');
      }
    } catch {
      setError('Network error');
    }
  };

  const openQuestionsManager = async (career: Career) => {
    setSelectedCareer(career);
    setQuestionsModalOpen(true);
    setQuestionForm(EMPTY_QUESTION);
    setEditingQuestionId(null);
    setQuestionError(null);
    setQuestionLoading(true);
    try {
      const data = await careersService.getQuestions(career.id, token);
      setQuestions(data);
    } catch {
      setError('Failed to load questions');
    } finally {
      setQuestionLoading(false);
    }
  };

  const openQuestionEdit = (question: CareerQuestion) => {
    const text = parseQuestionField(question.question);
    const placeholder = parseQuestionField(question.placeholder);

    setEditingQuestionId(question.id);
    setQuestionForm({
      question_en: text.en,
      question_ar: text.ar,
      field_name: question.field_name,
      question_type: question.question_type,
      options: question.options?.join('\n') ?? '',
      placeholder_en: placeholder.en,
      placeholder_ar: placeholder.ar,
      is_required: question.is_required,
      sort_order: question.sort_order,
      is_active: question.is_active,
    });
  };

  const saveQuestion = async () => {
    setQuestionError(null);

    if (!selectedCareer || !questionForm.question_en.trim()) {
      setQuestionError('Question (EN) is required');
      return;
    }

    if (['select', 'radio', 'checkbox'].includes(questionForm.question_type)) {
      const options = questionForm.options.split('\n').map((o) => o.trim()).filter(Boolean);
      if (options.length === 0) {
        setQuestionError('Options are required for select, radio, and checkbox question types');
        return;
      }
    }

    setQuestionSaving(true);
    setError(null);

    const payload = {
      question: JSON.stringify({ en: questionForm.question_en.trim(), ar: questionForm.question_ar.trim() }),
      field_name: questionForm.field_name.trim() || null,
      question_type: questionForm.question_type,
      options: ['select', 'radio', 'checkbox'].includes(questionForm.question_type)
        ? JSON.stringify(questionForm.options.split('\n').map((o) => o.trim()).filter(Boolean))
        : null,
      placeholder: questionForm.placeholder_en || questionForm.placeholder_ar
        ? JSON.stringify({ en: questionForm.placeholder_en.trim(), ar: questionForm.placeholder_ar.trim() })
        : null,
      is_required: questionForm.is_required,
      sort_order: questionForm.sort_order,
      is_active: questionForm.is_active,
    } as const;

    try {
      const endpoint = editingQuestionId
        ? `${API_BASE_URL}/careers/${selectedCareer.id}/questions/${editingQuestionId}`
        : `${API_BASE_URL}/careers/${selectedCareer.id}/questions`;
      const method = editingQuestionId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setQuestionError(getApiErrorMessage(data, 'Failed to save question'));
        return;
      }

      const refreshed = await careersService.getQuestions(selectedCareer.id, token);
      setQuestions(refreshed);
      setQuestionForm(EMPTY_QUESTION);
      setEditingQuestionId(null);
      setQuestionError(null);
      fetchCareers();
    } catch {
      setQuestionError('Network error while saving question');
    } finally {
      setQuestionSaving(false);
    }
  };

  const deleteQuestion = async (questionId: number) => {
    if (!selectedCareer) return;
    try {
      const res = await fetch(`${API_BASE_URL}/careers/${selectedCareer.id}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        const refreshed = await careersService.getQuestions(selectedCareer.id, token);
        setQuestions(refreshed);
        fetchCareers();
      } else {
        setError(data.message || 'Failed to delete question');
      }
    } catch {
      setError('Network error while deleting question');
    }
  };

  const openApplicationsManager = async (career: Career) => {
    setApplicationsCareer(career);
    setApplicationsModalOpen(true);
    setApplicationsLoading(true);
    setError(null);
    try {
      const [data, questionsData] = await Promise.all([
        careersService.getApplications(career.id, token),
        careersService.getQuestions(career.id, token),
      ]);
      setApplications(data);
      setApplicationQuestions(questionsData);
      const drafts: Record<number, { status: CareerApplication['status']; admin_notes: string }> = {};
      data.forEach((app) => {
        drafts[app.id] = { status: app.status, admin_notes: app.admin_notes ?? '' };
      });
      setApplicationDrafts(drafts);
    } catch {
      setError('Failed to load applications');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const saveApplicationUpdate = async (applicationId: number) => {
    if (!applicationsCareer) return;
    const draft = applicationDrafts[applicationId];
    if (!draft) return;

    setApplicationSavingId(applicationId);
    setError(null);
    try {
      const updated = await careersService.updateApplication(
        applicationsCareer.id,
        applicationId,
        {
          status: draft.status,
          admin_notes: draft.admin_notes.trim() || null,
        },
        token,
      );

      setApplications((prev) => prev.map((app) => (app.id === updated.id ? updated : app)));
    } catch {
      setError('Failed to update application');
    } finally {
      setApplicationSavingId(null);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    padding: '28px 32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    marginBottom: 24,
  };

  return (
    <AdminLayout>
      <div style={{ padding: '32px 40px', fontFamily: 'Nunito' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0a4d68' }}>Careers</h1>
            <div style={{ width: 56, height: 4, background: 'linear-gradient(90deg,#0a4d68,#05bfdb)', borderRadius: 4, marginTop: 6 }} />
          </div>
          <button
            style={{ background: 'linear-gradient(135deg, #0a4d68, #088395)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            onClick={openCreate}
          >
            + New Career
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <div style={cardStyle}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>Loading careers...</div>
          ) : careers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#aaa' }}>No career records yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    {['Title', 'Department', 'Location', 'Type', 'Questions', 'Applications', 'Published', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {careers.map((career, index) => {
                    const title = parseField(career.title);
                    const department = parseField(career.department);
                    return (
                      <tr key={career.id} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#fff' : '#fafbfc' }}>
                        <td style={{ padding: '10px 14px', maxWidth: 240 }}>
                          <div style={{ fontWeight: 700, color: '#0a4d68', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title.en}</div>
                          {title.ar && <div style={{ color: '#9ca3af', fontSize: 12, direction: 'rtl' }}>{title.ar}</div>}
                        </td>
                        <td style={{ padding: '10px 14px' }}>{department.en || '-'}</td>
                        <td style={{ padding: '10px 14px' }}>{career.location}</td>
                        <td style={{ padding: '10px 14px' }}>{careersService.getEmploymentTypeLabel(career.employment_type)}</td>
                        <td style={{ padding: '10px 14px' }}>{career.questions_count ?? 0}</td>
                        <td style={{ padding: '10px 14px' }}>{career.applications_count ?? 0}</td>
                        <td style={{ padding: '10px 14px' }}>
                          {career.published_at ? new Date(career.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            background: career.is_active ? '#dcfce7' : '#fee2e2',
                            color: career.is_active ? '#16a34a' : '#dc2626',
                          }}>
                            {career.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{ background: '#dcfce7', color: '#166534', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }} onClick={() => openApplicationsManager(career)}>Applications</button>
                            <button style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }} onClick={() => openQuestionsManager(career)}>Questions</button>
                            <button style={{ background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }} onClick={() => openEdit(career)}>Edit</button>
                            <button style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }} onClick={() => setDeleteConfirmId(career.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '32px 16px' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 860, padding: '30px 34px', position: 'relative' }}>
            <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: '#eef2f7', borderRadius: 8, width: 30, height: 30, cursor: 'pointer' }}>x</button>
            <h2 style={{ margin: '0 0 18px', color: '#0a4d68' }}>{editingCareer ? 'Edit Career' : 'New Career'}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input placeholder="Title (EN)" value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input placeholder="Title (AR)" value={form.title_ar} onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input placeholder="Department (EN)" value={form.department_en} onChange={(e) => setForm((f) => ({ ...f, department_en: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input placeholder="Department (AR)" value={form.department_ar} onChange={(e) => setForm((f) => ({ ...f, department_ar: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <select value={form.employment_type} onChange={(e) => setForm((f) => ({ ...f, employment_type: e.target.value as EmploymentType }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="temporary">Temporary</option>
              </select>
              <input placeholder="Experience Level" value={form.experience_level} onChange={(e) => setForm((f) => ({ ...f, experience_level: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input placeholder="Application Email" value={form.application_email} onChange={(e) => setForm((f) => ({ ...f, application_email: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input placeholder="Application URL" value={form.application_url} onChange={(e) => setForm((f) => ({ ...f, application_url: e.target.value }))} style={{ gridColumn: '1 / span 2', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <textarea placeholder="Description (EN)" value={form.description_en} onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))} style={{ minHeight: 92, padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <textarea placeholder="Description (AR)" value={form.description_ar} onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))} style={{ minHeight: 92, padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <textarea placeholder="Requirements (one per line)" value={form.requirements} onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))} style={{ gridColumn: '1 / span 2', minHeight: 92, padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input type="number" placeholder="Sort Order" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input type="date" value={form.published_at} onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
            </div>

            <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
              <label><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /> Active</label>
              <label><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} /> Featured</label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#e2e8f0', cursor: 'pointer' }} onClick={() => setModalOpen(false)}>Cancel</button>
              <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#0a4d68', color: '#fff', cursor: 'pointer' }} disabled={saving} onClick={handleSave}>
                {saving ? 'Saving...' : editingCareer ? 'Update Career' : 'Create Career'}
              </button>
            </div>
          </div>
        </div>
      )}

      {questionsModalOpen && selectedCareer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '32px 16px' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 980, padding: '26px 30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#0a4d68' }}>Questions: {careersService.getField(selectedCareer.title)}</h2>
              <button onClick={() => setQuestionsModalOpen(false)} style={{ border: 'none', background: '#eef2f7', borderRadius: 8, width: 30, height: 30, cursor: 'pointer' }}>x</button>
            </div>

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input placeholder="Question (EN)" value={questionForm.question_en} onChange={(e) => setQuestionForm((f) => ({ ...f, question_en: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input placeholder="Question (AR)" value={questionForm.question_ar} onChange={(e) => setQuestionForm((f) => ({ ...f, question_ar: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input placeholder="Field Name (optional)" value={questionForm.field_name} onChange={(e) => setQuestionForm((f) => ({ ...f, field_name: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <select value={questionForm.question_type} onChange={(e) => setQuestionForm((f) => ({ ...f, question_type: e.target.value as QuestionType }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
                <option value="radio">Radio</option>
                <option value="checkbox">Checkbox</option>
                <option value="date">Date</option>
                <option value="file">File</option>
              </select>
              <textarea placeholder="Options (one per line for select/radio/checkbox)" value={questionForm.options} onChange={(e) => setQuestionForm((f) => ({ ...f, options: e.target.value }))} style={{ gridColumn: '1 / span 2', minHeight: 70, padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input placeholder="Placeholder (EN)" value={questionForm.placeholder_en} onChange={(e) => setQuestionForm((f) => ({ ...f, placeholder_en: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input placeholder="Placeholder (AR)" value={questionForm.placeholder_ar} onChange={(e) => setQuestionForm((f) => ({ ...f, placeholder_ar: e.target.value }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <input type="number" placeholder="Sort Order" value={questionForm.sort_order} onChange={(e) => setQuestionForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <label><input type="checkbox" checked={questionForm.is_required} onChange={(e) => setQuestionForm((f) => ({ ...f, is_required: e.target.checked }))} /> Required</label>
                <label><input type="checkbox" checked={questionForm.is_active} onChange={(e) => setQuestionForm((f) => ({ ...f, is_active: e.target.checked }))} /> Active</label>
              </div>
            </div>

            {questionError && (
              <div style={{ marginTop: 10, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px' }}>
                {questionError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              {editingQuestionId && (
                <button style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#e2e8f0', cursor: 'pointer' }} onClick={() => { setQuestionForm(EMPTY_QUESTION); setEditingQuestionId(null); }}>
                  Cancel Edit
                </button>
              )}
              <button style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#0a4d68', color: '#fff', cursor: 'pointer' }} disabled={questionSaving} onClick={saveQuestion}>
                {questionSaving ? 'Saving...' : editingQuestionId ? 'Update Question' : 'Add Question'}
              </button>
            </div>

            <div style={{ marginTop: 14, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
              {questionLoading ? (
                <div style={{ padding: 14, color: '#64748b' }}>Loading questions...</div>
              ) : questions.length === 0 ? (
                <div style={{ padding: 14, color: '#64748b' }}>No questions yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Question</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Field</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Required</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Order</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q) => {
                      const text = parseQuestionField(q.question);
                      return (
                        <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px' }}>{text.en}</td>
                          <td style={{ padding: '8px' }}>{q.question_type}</td>
                          <td style={{ padding: '8px' }}>{q.field_name}</td>
                          <td style={{ padding: '8px' }}>{q.is_required ? 'Yes' : 'No'}</td>
                          <td style={{ padding: '8px' }}>{q.sort_order}</td>
                          <td style={{ padding: '8px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button style={{ border: 'none', borderRadius: 6, background: '#dbeafe', color: '#1d4ed8', padding: '4px 8px', cursor: 'pointer' }} onClick={() => openQuestionEdit(q)}>Edit</button>
                              <button style={{ border: 'none', borderRadius: 6, background: '#fee2e2', color: '#dc2626', padding: '4px 8px', cursor: 'pointer' }} onClick={() => deleteQuestion(q.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {applicationsModalOpen && applicationsCareer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '32px 16px' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 1080, padding: '26px 30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#0a4d68' }}>Applications: {careersService.getField(applicationsCareer.title)}</h2>
              <button onClick={() => setApplicationsModalOpen(false)} style={{ border: 'none', background: '#eef2f7', borderRadius: 8, width: 30, height: 30, cursor: 'pointer' }}>x</button>
            </div>

            <div style={{ marginTop: 14 }}>
              {applicationsLoading ? (
                <div style={{ padding: 14, color: '#64748b' }}>Loading applications...</div>
              ) : applications.length === 0 ? (
                <div style={{ padding: 14, color: '#64748b' }}>No applications yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Applicant</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>CV</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Answers</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Admin Notes</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Submitted</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => {
                        const draft = applicationDrafts[app.id] ?? { status: app.status, admin_notes: app.admin_notes ?? '' };
                        return (
                          <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px', minWidth: 200 }}>
                              <div style={{ fontWeight: 700, color: '#0a4d68' }}>{app.full_name}</div>
                              <div style={{ color: '#475569' }}>{app.email}</div>
                              <div style={{ color: '#64748b' }}>{app.phone}</div>
                            </td>
                            <td style={{ padding: '8px' }}>
                              {app.cv_url ? (
                                <a href={app.cv_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 700 }}>
                                  Open CV
                                </a>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td style={{ padding: '8px', minWidth: 260, color: '#334155' }}>
                              {!app.answers || Object.keys(app.answers).length === 0 ? (
                                <span style={{ color: '#94a3b8' }}>No answers</span>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {Object.entries(app.answers).map(([fieldName, rawValue]) => {
                                    const label = getQuestionLabelByFieldName(applicationQuestions, fieldName);

                                    if (Array.isArray(rawValue)) {
                                      const display = rawValue.join(', ');
                                      return (
                                        <div key={`${app.id}_${fieldName}`}>
                                          <strong>{label}:</strong> {display || '-'}
                                        </div>
                                      );
                                    }

                                    const value = typeof rawValue === 'string' ? rawValue : String(rawValue ?? '');
                                    return (
                                      <div key={`${app.id}_${fieldName}`}>
                                        <strong>{label}:</strong>{' '}
                                        {isHttpUrl(value) ? (
                                          <a href={value} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 700 }}>
                                            Open File
                                          </a>
                                        ) : (
                                          value || '-'
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '8px' }}>
                              <select
                                value={draft.status}
                                onChange={(e) => setApplicationDrafts((prev) => ({
                                  ...prev,
                                  [app.id]: {
                                    ...draft,
                                    status: e.target.value as CareerApplication['status'],
                                  },
                                }))}
                                style={{ padding: '8px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                              >
                                <option value="new">New</option>
                                <option value="reviewing">Reviewing</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="rejected">Rejected</option>
                                <option value="hired">Hired</option>
                              </select>
                            </td>
                            <td style={{ padding: '8px', minWidth: 230 }}>
                              <textarea
                                value={draft.admin_notes}
                                onChange={(e) => setApplicationDrafts((prev) => ({
                                  ...prev,
                                  [app.id]: {
                                    ...draft,
                                    admin_notes: e.target.value,
                                  },
                                }))}
                                style={{ width: '100%', minHeight: 64, padding: '8px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                              />
                            </td>
                            <td style={{ padding: '8px', color: '#475569' }}>
                              {new Date(app.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td style={{ padding: '8px' }}>
                              <button
                                style={{ border: 'none', borderRadius: 8, background: '#0a4d68', color: '#fff', padding: '6px 12px', cursor: 'pointer' }}
                                onClick={() => saveApplicationUpdate(app.id)}
                                disabled={applicationSavingId === app.id}
                              >
                                {applicationSavingId === app.id ? 'Saving...' : 'Save'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', maxWidth: 400, width: '90%', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, color: '#111' }}>Delete Career?</h3>
            <p style={{ color: '#6b7280', marginBottom: 22, fontSize: 14 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }} onClick={() => handleDelete(deleteConfirmId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCareers;
