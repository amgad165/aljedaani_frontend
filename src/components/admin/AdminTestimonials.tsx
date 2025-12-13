import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  image_url: string | null;
  branch_id: number;
}

interface Testimonial {
  id: number;
  doctor_id: number;
  doctor?: Doctor;
  name?: string;
  role?: string | null;
  testimonial_image?: string | null;
  location?: string | null;
  experience?: string | null;
  review_title: string;
  description: string;
  full_story?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  doctor_id: number;
  name?: string;
  role?: string;
  testimonial_image?: string;
  image_file: File | null;
  location?: string;
  experience?: string;
  review_title: string;
  description: string;
  full_story: string;
  is_active: boolean;
}

const AdminTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<FormData>({
    doctor_id: 0,
    name: '',
    role: '',
    testimonial_image: '',
    image_file: null,
    location: '',
    experience: '',
    review_title: '',
    description: '',
    full_story: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials`);
      const result = await response.json();
      // Note: testimonials API uses 'status' instead of 'success'
      if (result.status === 'success' && result.data) {
        setTestimonials(Array.isArray(result.data) ? result.data : []);
      } else if (result.success && result.data) {
        // Fallback in case API changes
        setTestimonials(Array.isArray(result.data) ? result.data : []);
      } else {
        setTestimonials([]);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setNotification({ type: 'error', message: 'Failed to load testimonials' });
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors?active=true`);
      const result = await response.json();
      if (result.success && result.data) {
        const doctorsArray = Array.isArray(result.data) ? result.data : (result.data.data || []);
        setDoctors(doctorsArray);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchTestimonials();
    fetchDoctors();
  }, [fetchTestimonials, fetchDoctors]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedTestimonial(null);
    setFormData({
      doctor_id: 0,
      name: '',
      role: '',
      testimonial_image: '',
      image_file: null,
      location: '',
      experience: '',
      review_title: '',
      description: '',
      full_story: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setModalMode('edit');
    setSelectedTestimonial(testimonial);
    setFormData({
      doctor_id: testimonial.doctor_id || 0,
      name: testimonial.name || '',
      role: testimonial.role || '',
      testimonial_image: testimonial.testimonial_image || '',
      image_file: null,
      location: testimonial.location || '',
      experience: testimonial.experience || '',
      review_title: testimonial.review_title || '',
      description: testimonial.description || '',
      full_story: testimonial.full_story || '',
      is_active: testimonial.is_active
    });
    setShowModal(true);
  };

  const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    setDeleting(id);
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== id));
        setNotification({ type: 'success', message: 'Testimonial deleted successfully' });
      } else {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Failed to delete testimonial' });
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate doctor selection
    if (!formData.doctor_id) {
      setNotification({ type: 'error', message: 'Please select a doctor' });
      return;
    }
    
    // Validate review title and description
    if (!formData.review_title.trim()) {
      setNotification({ type: 'error', message: 'Please enter a review title' });
      return;
    }
    
    if (!formData.description.trim()) {
      setNotification({ type: 'error', message: 'Please enter a review description' });
      return;
    }
    
    setSaving(true);

    try {
      // Use FormData for file upload support
      const formDataToSend = new window.FormData();
      formDataToSend.append('doctor_id', String(formData.doctor_id));
      if (formData.name) formDataToSend.append('name', formData.name);
      if (formData.role) formDataToSend.append('role', formData.role);
      if (formData.location) formDataToSend.append('location', formData.location);
      if (formData.experience) formDataToSend.append('experience', formData.experience);
      formDataToSend.append('review_title', formData.review_title);
      formDataToSend.append('description', formData.description);
      if (formData.full_story) formDataToSend.append('full_story', formData.full_story);
      formDataToSend.append('is_active', formData.is_active ? '1' : '0');
      
      // Add image file if selected
      if (formData.image_file) {
        formDataToSend.append('image', formData.image_file);
      } else if (formData.testimonial_image) {
        formDataToSend.append('testimonial_image', formData.testimonial_image);
      }

      // For PUT requests, Laravel needs _method field with FormData
      if (modalMode === 'edit') {
        formDataToSend.append('_method', 'PUT');
      }

      const url = modalMode === 'create' 
        ? `${API_BASE_URL}/testimonials`
        : `${API_BASE_URL}/testimonials/${selectedTestimonial?.id}`;
      
      const response = await fetch(url, {
        method: 'POST', // Always POST, use _method for PUT
        headers: getAuthHeaders(true),
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && (result.status === 'success' || result.success)) {
        if (modalMode === 'create') {
          setTestimonials(prev => [...prev, result.data]);
        } else {
          setTestimonials(prev => prev.map(t => t.id === selectedTestimonial?.id ? result.data : t));
        }
        setShowModal(false);
        setNotification({ type: 'success', message: `Testimonial ${modalMode === 'create' ? 'created' : 'updated'} successfully` });
      } else {
        throw new Error(result.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      setNotification({ type: 'error', message: 'Failed to save testimonial' });
    } finally {
      setSaving(false);
    }
  };

  const filteredTestimonials = testimonials.filter(t =>
    (t.doctor?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (t.role?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (t.review_title?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  // Inline Styles
  const containerStyle: React.CSSProperties = { padding: '24px', fontFamily: "'Calibri', 'Segoe UI', sans-serif" };
  const headerStyle: React.CSSProperties = { marginBottom: '24px' };
  const headerTopStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' };
  const titleStyle: React.CSSProperties = { fontSize: '28px', fontWeight: 700, color: '#061F42', margin: 0 };
  const subtitleStyle: React.CSSProperties = { color: '#6B7280', marginTop: '4px', fontSize: '14px' };
  const addButtonStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#15C9FA', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer' };
  const searchInputStyle: React.CSSProperties = { width: '100%', maxWidth: '320px', padding: '12px 16px 12px 44px', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', outline: 'none' };
  const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' };
  const cardStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' };
  const cardHeaderStyle: React.CSSProperties = { padding: '20px', borderBottom: '1px solid #F3F4F6' };
  const cardBodyStyle: React.CSSProperties = { padding: '20px' };
  const cardFooterStyle: React.CSSProperties = { padding: '16px 20px', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const avatarStyle: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', backgroundColor: '#C9F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#061F42', fontWeight: 700, fontSize: '20px' };
  const actionButtonStyle: React.CSSProperties = { padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' };
  const statusBadgeStyle = (active: boolean): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: active ? '#DEF7EC' : '#F3F4F6', color: active ? '#03543F' : '#6B7280' });
  const modalStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' };
  const modalContentStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' };
  const modalHeaderStyle: React.CSSProperties = { padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const modalTitleStyle: React.CSSProperties = { fontSize: '20px', fontWeight: 700, color: '#061F42', margin: 0 };
  const modalBodyStyle: React.CSSProperties = { padding: '24px' };
  const formGroupStyle: React.CSSProperties = { marginBottom: '20px' };
  const formRowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: '100px', resize: 'vertical' };
  const modalFooterStyle: React.CSSProperties = { padding: '20px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' };
  const cancelButtonStyle: React.CSSProperties = { padding: '12px 24px', backgroundColor: '#F3F4F6', color: '#374151', fontWeight: 600, border: 'none', borderRadius: '12px', cursor: 'pointer' };
  const submitButtonStyle: React.CSSProperties = { padding: '12px 24px', backgroundColor: '#15C9FA', color: 'white', fontWeight: 600, border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
  const notificationStyle: React.CSSProperties = { position: 'fixed', top: '20px', right: '20px', padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 2000 };
  const emptyStateStyle: React.CSSProperties = { textAlign: 'center', padding: '80px 20px' };
  const loadingSpinnerStyle: React.CSSProperties = { width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#15C9FA', borderRadius: '50%', animation: 'spin 1s linear infinite' };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
              <h1 style={titleStyle}>Testimonials</h1>
              <p style={subtitleStyle}>Manage doctor-linked success stories and testimonials</p>
            </div>
            <button style={addButtonStyle} onClick={handleCreate}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Testimonial
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9CA3AF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search testimonials..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={searchInputStyle} />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <div style={loadingSpinnerStyle} />
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div style={emptyStateStyle}>
            <svg style={{ width: '64px', height: '64px', color: '#D1D5DB', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>No testimonials found</h3>
            <p style={{ color: '#9CA3AF' }}>{searchQuery ? 'Try a different search' : 'Add your first testimonial'}</p>
          </div>
        ) : (
          <div style={gridStyle}>
            {filteredTestimonials.map((testimonial) => (
              <div key={testimonial.id} style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {testimonial.doctor?.image_url ? (
                      <img src={testimonial.doctor.image_url} alt={testimonial.doctor.name} style={avatarStyle as React.CSSProperties} />
                    ) : (
                      <div style={avatarStyle}>{getInitials(testimonial.doctor?.name || 'Doctor')}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#061F42', margin: 0 }}>Dr. {testimonial.doctor?.name}</h3>
                      <p style={{ fontSize: '13px', color: '#15C9FA', fontWeight: 500, margin: '2px 0 0' }}>{testimonial.doctor?.specialization}</p>
                      {testimonial.name && (
                        <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #E5E7EB' }}>
                          <p style={{ fontSize: '12px', color: '#6B7280', margin: '0' }}>Patient: <strong>{testimonial.name}</strong></p>
                        </div>
                      )}
                    </div>
                    <span style={statusBadgeStyle(testimonial.is_active)}>
                      {testimonial.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div style={cardBodyStyle}>
                  {testimonial.review_title && (
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>
                      "{testimonial.review_title}"
                    </h4>
                  )}
                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                    {testimonial.description ? (testimonial.description.length > 150 ? testimonial.description.substring(0, 150) + '...' : testimonial.description) : 'No description'}
                  </p>
                  {testimonial.experience && (
                    <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#F0F9FF', borderRadius: '8px', fontSize: '13px', color: '#0369A1' }}>
                      <strong>Experience:</strong> {testimonial.experience}
                    </div>
                  )}
                </div>
                <div style={cardFooterStyle}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    Added {new Date(testimonial.created_at).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(testimonial)} style={{ ...actionButtonStyle, color: '#15C9FA' }} title="Edit">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(testimonial.id)} disabled={deleting === testimonial.id} style={{ ...actionButtonStyle, color: '#EF4444', opacity: deleting === testimonial.id ? 0.5 : 1 }} title="Delete">
                      {deleting === testimonial.id ? (
                        <div style={{ width: '20px', height: '20px', border: '2px solid #EF4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div style={modalContentStyle}>
              <div style={modalHeaderStyle}>
                <h2 style={modalTitleStyle}>{modalMode === 'create' ? 'Add New Testimonial' : 'Edit Testimonial'}</h2>
                <button onClick={() => setShowModal(false)} style={{ ...actionButtonStyle, padding: '8px' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#6B7280">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={modalBodyStyle}>
                  {/* Doctor Selection - Primary Field */}
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Select Doctor *</label>
                    <select 
                      required 
                      value={formData.doctor_id} 
                      onChange={(e) => setFormData({ ...formData, doctor_id: parseInt(e.target.value) })} 
                      style={{ ...inputStyle, backgroundColor: 'white' }}
                    >
                      <option value={0}>-- Choose a doctor --</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>This is the primary doctor whose success story is being documented</p>
                  </div>

                  {/* Review Title and Description - Core Testimonial Fields */}
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Review Title *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.review_title} 
                      onChange={(e) => setFormData({ ...formData, review_title: e.target.value })} 
                      style={inputStyle} 
                      placeholder="e.g., Excellent Care and Service" 
                    />
                  </div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Review / Brief Description *</label>
                    <textarea 
                      required
                      value={formData.description} 
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                      style={textareaStyle} 
                      placeholder="A brief review of the service or experience..." 
                    />
                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Brief summary (will appear on testimonial cards)</p>
                  </div>

                  {/* Full Story - Extended Narrative */}
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Full Story (Optional)</label>
                    <textarea 
                      value={formData.full_story} 
                      onChange={(e) => setFormData({ ...formData, full_story: e.target.value })} 
                      style={{ ...textareaStyle, minHeight: '120px' }}
                      placeholder="The complete success story - detailed account of the treatment, outcomes, and personal journey. This appears on the detailed success story page."
                    />
                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Complete narrative of the success story (optional but recommended)</p>
                  </div>

                  {/* Patient Information - Optional Secondary Fields */}
                  <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #15C9FA' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#061F42', marginTop: 0, marginBottom: '12px' }}>
                      Patient Information (Optional)
                    </p>
                    <div style={formRowStyle}>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Patient Name</label>
                        <input 
                          type="text" 
                          value={formData.name || ''} 
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                          style={inputStyle} 
                          placeholder="e.g., John Doe" 
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Patient Role</label>
                        <input 
                          type="text" 
                          value={formData.role || ''} 
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })} 
                          style={inputStyle} 
                          placeholder="e.g., Patient, Family Member" 
                        />
                      </div>
                    </div>
                    <div style={formRowStyle}>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Location</label>
                        <input 
                          type="text" 
                          value={formData.location || ''} 
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                          style={inputStyle} 
                          placeholder="e.g., Jeddah, KSA" 
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Experience / Condition</label>
                        <input 
                          type="text" 
                          value={formData.experience || ''} 
                          onChange={(e) => setFormData({ ...formData, experience: e.target.value })} 
                          style={inputStyle} 
                          placeholder="e.g., Cardiac surgery, Pregnancy care" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Testimonial Photo */}
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Testimonial Photo (Optional)</label>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: 0, marginBottom: '12px' }}>Photo of patient/situation (different from doctor profile image)</p>
                    <div style={{ border: '2px dashed #E5E7EB', borderRadius: '12px', padding: '16px', backgroundColor: '#FAFAFA' }}>
                      {(formData.image_file || formData.testimonial_image) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <img 
                            src={formData.image_file ? URL.createObjectURL(formData.image_file) : formData.testimonial_image} 
                            alt="Preview" 
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                              {formData.image_file ? formData.image_file.name : 'Current image'}
                            </p>
                            <button 
                              type="button" 
                              onClick={() => setFormData({ ...formData, image_file: null, testimonial_image: '' })}
                              style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span style={{ marginTop: '8px', fontSize: '14px', color: '#6B7280' }}>Click to upload photo</span>
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>PNG, JPG, GIF up to 5MB</span>
                          <input 
                            type="file" 
                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setFormData({ ...formData, image_file: file, testimonial_image: '' });
                            }}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div style={formGroupStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>Testimonial is active (visible on website)</span>
                    </label>
                  </div>
                </div>
                <div style={modalFooterStyle}>
                  <button type="button" onClick={() => setShowModal(false)} style={cancelButtonStyle}>Cancel</button>
                  <button type="submit" disabled={saving} style={{ ...submitButtonStyle, opacity: saving ? 0.7 : 1 }}>
                    {saving ? (
                      <>
                        <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Saving...
                      </>
                    ) : (
                      <>{modalMode === 'create' ? 'Add Testimonial' : 'Save Changes'}</>
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

export default AdminTestimonials;
