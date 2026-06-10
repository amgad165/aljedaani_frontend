import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from './AdminLayout';
import {
  patientEducationService,
  type PatientEducation,
} from '../../services/patientEducationService';

import '../../styles/admin/AdminPatientExperiences.css';

export default function AdminPatientEducations() {
  const { t } = useTranslation('pages');

  const [educations, setEducations] = useState<PatientEducation[]>([]);

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    sort_order: number;
    is_active: boolean;
    published_at: string; // datetime-local value (yyyy-MM-ddTHH:mm) or ''
    pdf: File | null;
  }>({
    name: '',
    description: '',
    sort_order: 0,
    is_active: true,
    published_at: '',
    pdf: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toDateTimeLocalValue = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours(),
    )}:${pad(d.getMinutes())}`;
  };

  const fetchEducations = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const data = await patientEducationService.getAdminEducations({ active: undefined });
      setEducations(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : t('errorLoadingData');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      sort_order: 0,
      is_active: true,
      published_at: '',
      pdf: null,
    });
  };

  const startCreate = () => {
    setEditingId(null);
    setShowForm(true);
    setFormData({
      name: '',
      description: '',
      sort_order: 0,
      is_active: true,
      published_at: '',
      pdf: null,
    });
  };

  const startEdit = (edu: PatientEducation) => {
    setEditingId(edu.id);
    setShowForm(true);
    setFormData({
      name: edu.name ?? '',
      description: typeof edu.description === 'string' ? edu.description : '',
      sort_order: edu.sort_order ?? 0,
      is_active: edu.is_active ?? true,
      published_at: edu.published_at ? toDateTimeLocalValue(edu.published_at) : '',
      pdf: null,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!formData.name.trim()) throw new Error(t('validationRequired') ?? 'Name is required');

      // Backend requires pdf on create; on update it can be omitted.
      if (!editingId && !formData.pdf) {
        throw new Error(t('validationRequiredPdf') ?? 'PDF is required');
      }

      const name = formData.name.trim();
      const description = formData.description.trim() ? formData.description.trim() : null;
      const publishedAtIso =
        formData.published_at && formData.published_at.trim() ? new Date(formData.published_at).toISOString() : null;

      if (editingId) {
        await patientEducationService.updateEducation(editingId, {
          name,
          description,
          sort_order: formData.sort_order,
          is_active: formData.is_active,
          published_at: publishedAtIso,
          pdf: formData.pdf ?? undefined,
        });
        setSuccess(t('updatedSuccessfully'));
      } else {
        await patientEducationService.createEducation({
          name,
          description,
          sort_order: formData.sort_order,
          is_active: formData.is_active,
          published_at: publishedAtIso,
          pdf: formData.pdf as File,
        });
        setSuccess(t('createdSuccessfully'));
      }

      await fetchEducations();
      resetForm();
    } catch (e) {
      const message = e instanceof Error ? e.message : t('errorSavingData');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await patientEducationService.deleteEducation(id);

      setSuccess(t('deletedSuccessfully'));
      await fetchEducations();

      if (editingId === id) resetForm();
    } catch (e) {
      const message = e instanceof Error ? e.message : t('errorDeletingData');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (isActive: boolean) => (
    <span className={`badge ${isActive ? 'active' : 'inactive'}`}>
      {isActive ? t('active') : t('inactive')}
    </span>
  );

  return (
    <AdminLayout>
      <div className="admin-patient-experiences">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="tab-content">
          <div className="tab-header">
            <h2>{t('patientEducation') ?? 'Patient Educations'}</h2>

            <button onClick={startCreate} className="btn btn-primary" disabled={loading}>
              {t('addNew')}
            </button>
          </div>

          {showForm && (
            <div className="form-section">
              <div className="form-group">
                <label>{t('name') ?? 'Name'}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('enterText') ?? 'Enter name'}
                />
              </div>

              <div className="form-group">
                <label>{t('description') ?? 'Description'}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('enterText') ?? 'Enter description'}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>{t('sortOrder') ?? 'Sort Order'}</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                />
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active">{t('isActive')}</label>
              </div>

              <div className="form-group">
                <label>{t('publishedAt') ?? 'Published At'}</label>
                <input
                  type="datetime-local"
                  value={formData.published_at}
                  onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>{t('pdf') ?? 'PDF File'}</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFormData({ ...formData, pdf: e.target.files?.[0] ?? null })}
                />
                {editingId && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                    {t('leaveEmptyToKeepOldPdf') ?? 'Leave empty to keep the current PDF.'}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button onClick={handleSave} disabled={loading} className="btn btn-success">
                  {t('save')}
                </button>
                <button onClick={resetForm} className="btn btn-secondary" disabled={loading}>
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>{t('name') ?? 'Name'}</th>
                  <th>{t('status') ?? 'Status'}</th>
                  <th>{t('pdf') ?? 'PDF'}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {educations.map((edu) => (
                  <tr key={edu.id}>
                    <td>{edu.name}</td>
                    <td>{statusBadge(edu.is_active)}</td>
                    <td>{edu.pdf_path ? t('available') ?? 'Available' : '-'}</td>
                    <td>
                      <button onClick={() => startEdit(edu)} className="btn btn-sm btn-primary">
                        {t('edit')}
                      </button>{' '}
                      <button onClick={() => handleDelete(edu.id)} className="btn btn-sm btn-danger">
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {educations.length === 0 && !loading && (
              <div style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>
                {t('noData') ?? 'No patient educations found.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
