import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

interface Department {
  id: number;
  name: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  icon: string;
  description: string;
  is_active: boolean;
}

const AdminDepartments: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    icon: '',
    description: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`);
      const result = await response.json();
      if (result.success && result.data) {
        setDepartments(Array.isArray(result.data) ? result.data : []);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setNotification({ type: 'error', message: 'Failed to load departments' });
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedDepartment(null);
    setFormData({ name: '', icon: '', description: '', is_active: true });
    setIconFile(null);
    setIconPreview(null);
    setShowModal(true);
  };

  const handleEdit = (dept: Department) => {
    setModalMode('edit');
    setSelectedDepartment(dept);
    setFormData({
      name: dept.name,
      icon: dept.icon || '',
      description: dept.description || '',
      is_active: dept.is_active
    });
    setIconFile(null);
    setIconPreview(dept.icon || null);
    setShowModal(true);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const handleIconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    
    setDeleting(id);
    try {
      const response = await fetch(`${API_BASE_URL}/departments/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setDepartments(prev => prev.filter(d => d.id !== id));
        setNotification({ type: 'success', message: 'Department deleted successfully' });
      } else {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Failed to delete department' });
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = modalMode === 'create' 
        ? `${API_BASE_URL}/departments`
        : `${API_BASE_URL}/departments/${selectedDepartment?.id}`;
      
      // Use FormData to send file directly (same as doctor upload)
      const formDataToSend = new window.FormData();
      formDataToSend.append('name', formData.name);
      if (iconFile) {
        formDataToSend.append('icon', iconFile);
      }
      if (formData.description) formDataToSend.append('description', formData.description);
      formDataToSend.append('is_active', formData.is_active ? '1' : '0');
      
      if (modalMode === 'edit') {
        formDataToSend.append('_method', 'PUT');
      }
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (modalMode === 'create') {
          setDepartments(prev => [...prev, result.data]);
        } else {
          setDepartments(prev => prev.map(d => d.id === selectedDepartment?.id ? result.data : d));
        }
        setShowModal(false);
        setNotification({ type: 'success', message: `Department ${modalMode === 'create' ? 'created' : 'updated'} successfully` });
      } else {
        throw new Error(result.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      setNotification({ type: 'error', message: 'Failed to save department' });
    } finally {
      setSaving(false);
      setUploadingIcon(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  // Inline Styles
  const containerStyle: React.CSSProperties = { padding: '24px', fontFamily: "'Calibri', 'Segoe UI', sans-serif" };
  const headerStyle: React.CSSProperties = { marginBottom: '24px' };
  const headerTopStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' };
  const titleStyle: React.CSSProperties = { fontSize: '28px', fontWeight: 700, color: '#061F42', margin: 0 };
  const subtitleStyle: React.CSSProperties = { color: '#6B7280', marginTop: '4px', fontSize: '14px' };
  const addButtonStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#15C9FA', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer' };
  const searchInputStyle: React.CSSProperties = { width: '100%', maxWidth: '320px', padding: '12px 16px 12px 44px', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', outline: 'none' };
  const tableContainerStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', overflow: 'hidden' };
  const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
  const thStyle: React.CSSProperties = { padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' };
  const tdStyle: React.CSSProperties = { padding: '16px', borderBottom: '1px solid #F3F4F6' };
  const deptInfoStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px' };
  const iconBoxStyle: React.CSSProperties = { width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#C9F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' };
  const deptNameStyle: React.CSSProperties = { fontWeight: 600, color: '#061F42', fontSize: '14px' };
  const actionButtonStyle: React.CSSProperties = { padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' };
  const statusBadgeStyle = (active: boolean): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: active ? '#DEF7EC' : '#F3F4F6', color: active ? '#03543F' : '#6B7280' });
  const modalStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' };
  const modalContentStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' };
  const modalHeaderStyle: React.CSSProperties = { padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const modalTitleStyle: React.CSSProperties = { fontSize: '20px', fontWeight: 700, color: '#061F42', margin: 0 };
  const modalBodyStyle: React.CSSProperties = { padding: '24px' };
  const formGroupStyle: React.CSSProperties = { marginBottom: '20px' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: '100px', resize: 'vertical' };
  const modalFooterStyle: React.CSSProperties = { padding: '20px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' };
  const cancelButtonStyle: React.CSSProperties = { padding: '12px 24px', backgroundColor: '#F3F4F6', color: '#374151', fontWeight: 600, border: 'none', borderRadius: '12px', cursor: 'pointer' };
  const submitButtonStyle: React.CSSProperties = { padding: '12px 24px', backgroundColor: '#15C9FA', color: 'white', fontWeight: 600, border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
  const notificationStyle: React.CSSProperties = { position: 'fixed', top: '20px', right: '20px', padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 2000 };
  const emptyStateStyle: React.CSSProperties = { textAlign: 'center', padding: '60px 20px' };
  const loadingSpinnerStyle: React.CSSProperties = { width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#15C9FA', borderRadius: '50%', animation: 'spin 1s linear infinite' };

  return (
    <AdminLayout>
      <div style={containerStyle}>
        {/* Notification */}
        {notification && (
          <div style={{ ...notificationStyle, backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444', color: 'white' }}>
            <span style={{ fontWeight: 500 }}>{notification.message}</span>
          </div>
        )}

        {/* Header */}
        <div style={headerStyle}>
          <div style={headerTopStyle}>
            <div>
              <h1 style={titleStyle}>Departments</h1>
              <p style={subtitleStyle}>Manage hospital departments</p>
            </div>
            <button style={addButtonStyle} onClick={handleCreate}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Department
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9CA3AF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search departments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={searchInputStyle} />
          </div>
        </div>

        {/* Table */}
        <div style={tableContainerStyle}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div style={loadingSpinnerStyle} />
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div style={emptyStateStyle}>
              <svg style={{ width: '64px', height: '64px', color: '#D1D5DB', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>No departments found</h3>
              <p style={{ color: '#9CA3AF' }}>{searchQuery ? 'Try a different search' : 'Add your first department'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Created</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((dept) => (
                    <tr key={dept.id}>
                      <td style={tdStyle}>
                        <div style={deptInfoStyle}>
                          <div style={iconBoxStyle}>
                            {dept.icon ? (
                              <img
                                src={dept.icon}
                                alt={dept.name}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  objectFit: 'contain',
                                }}
                              />
                            ) : (
                              <span>🏥</span>
                            )}
                          </div>
                          <span style={deptNameStyle}>{dept.name}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: '#6B7280', fontSize: '14px' }}>{dept.description || '-'}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={statusBadgeStyle(dept.is_active)}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dept.is_active ? '#03543F' : '#6B7280', marginRight: '6px' }} />
                          {dept.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: '#6B7280', fontSize: '14px' }}>{new Date(dept.created_at).toLocaleDateString()}</span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => navigate(`/admin/departments/${dept.id}/tabs`)} style={{ ...actionButtonStyle, color: '#10B981' }} title="Manage Tab Content">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                          </button>
                          <button onClick={() => handleEdit(dept)} style={{ ...actionButtonStyle, color: '#15C9FA' }} title="Edit">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(dept.id)} disabled={deleting === dept.id} style={{ ...actionButtonStyle, color: '#EF4444', opacity: deleting === dept.id ? 0.5 : 1 }} title="Delete">
                            {deleting === dept.id ? (
                              <div style={{ width: '20px', height: '20px', border: '2px solid #EF4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div style={modalContentStyle}>
              <div style={modalHeaderStyle}>
                <h2 style={modalTitleStyle}>{modalMode === 'create' ? 'Add New Department' : 'Edit Department'}</h2>
                <button onClick={() => setShowModal(false)} style={{ ...actionButtonStyle, padding: '8px' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#6B7280">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={modalBodyStyle}>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Department Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={inputStyle} placeholder="e.g., Cardiology" />
                  </div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Department Icon</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconFileChange}
                        style={{
                          padding: '10px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      />
                      {iconPreview && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={iconPreview}
                            alt="Icon preview"
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'contain',
                              border: '1px solid #D1D5DB',
                              borderRadius: '8px',
                              padding: '8px',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setIconFile(null);
                              setIconPreview(null);
                              setFormData({ ...formData, icon: '' });
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#EF4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={textareaStyle} placeholder="Brief description of the department" />
                  </div>
                  <div style={formGroupStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>Department is active</span>
                    </label>
                  </div>
                </div>
                <div style={modalFooterStyle}>
                  <button type="button" onClick={() => setShowModal(false)} style={cancelButtonStyle}>Cancel</button>
                  <button type="submit" disabled={saving || uploadingIcon} style={{ ...submitButtonStyle, opacity: (saving || uploadingIcon) ? 0.7 : 1 }}>
                    {uploadingIcon ? (
                      <>
                        <div style={loadingSpinnerStyle} />
                        <span style={{ marginLeft: '8px' }}>Uploading Icon...</span>
                      </>
                    ) : saving ? (
                      <>
                        <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Saving...
                      </>
                    ) : (
                      <>{modalMode === 'create' ? 'Add Department' : 'Save Changes'}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </AdminLayout>
  );
};

export default AdminDepartments;
