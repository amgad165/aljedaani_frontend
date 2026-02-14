import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { getTranslatedField } from '../../utils/localeHelpers';

interface Gallery {
  id: number;
  branch_id: number;
  title: string | null;
  description: string | null;
  image_url: string;
  order: number;
  is_active: boolean;
}

interface Branch {
  id: number;
  name: string;
  region: string;
  description: string | null;
  address: string;
  phone: string;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  image_url: string | null;
  mobile_image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  galleries?: Gallery[];
}

interface FormData {
  name_en: string;
  name_ar: string;
  region_en: string;
  region_ar: string;
  description_en: string;
  description_ar: string;
  address_en: string;
  address_ar: string;
  phone: string;
  email: string;
  latitude: string;
  longitude: string;
  map_url: string;
  image_url: string;
  image_file: File | null;
  mobile_image: string;
  mobile_image_file: File | null;
  is_active: boolean;
}

interface GalleryFormData {
  title: string;
  description: string;
  image_url: string;
  image_file: File | null;
  is_active: boolean;
}

interface GalleryItem {
  id?: number;
  title: string;
  description: string;
  image_url: string;
  image_file?: File | null;
  is_active: boolean;
  isNew?: boolean;
  toDelete?: boolean;
}

const AdminBranches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [galleryModalMode, setGalleryModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name_en: '',
    name_ar: '',
    region_en: '',
    region_ar: '',
    description_en: '',
    description_ar: '',
    address_en: '',
    address_ar: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    map_url: '',
    image_url: '',
    image_file: null,
    mobile_image: '',
    mobile_image_file: null,
    is_active: true
  });
  const [activeFormTab, setActiveFormTab] = useState<'en' | 'ar'>('en');
  const [galleryFormData, setGalleryFormData] = useState<GalleryFormData>({
    title: '',
    description: '',
    image_url: '',
    image_file: null,
    is_active: true
  });
  // Gallery items for the branch modal (inline editing)
  const [modalGalleryItems, setModalGalleryItems] = useState<GalleryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBranch, setExpandedBranch] = useState<number | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  const fetchBranches = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/branches?active=all&with_galleries=1`, {
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const result = await response.json();
      if (result.success && result.data) {
        setBranches(Array.isArray(result.data) ? result.data : []);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setNotification({ type: 'error', message: 'Failed to load branches' });
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedBranch(null);
    setFormData({
      name_en: '',
      name_ar: '',
      region_en: '',
      region_ar: '',
      description_en: '',
      description_ar: '',
      address_en: '',
      address_ar: '',
      phone: '',
      email: '',
      latitude: '',
      longitude: '',
      map_url: '',
      image_url: '',
      image_file: null,
      mobile_image: '',
      mobile_image_file: null,
      is_active: true
    });
    setActiveFormTab('en');
    setModalGalleryItems([]);
    setShowModal(true);
  };

  const handleEdit = (branch: Branch) => {
    setModalMode('edit');
    setSelectedBranch(branch);
    
    // Extract both EN and AR values from JSON fields
    const nameObj = typeof branch.name === 'object' ? branch.name : { en: branch.name || '', ar: '' };
    const regionObj = typeof branch.region === 'object' ? branch.region : { en: branch.region || '', ar: '' };
    const descObj = typeof branch.description === 'object' ? branch.description : { en: branch.description || '', ar: '' };
    const addrObj = typeof branch.address === 'object' ? branch.address : { en: branch.address || '', ar: '' };
    
    setFormData({
      name_en: nameObj.en || '',
      name_ar: nameObj.ar || '',
      region_en: regionObj.en || '',
      region_ar: regionObj.ar || '',
      description_en: (descObj && descObj.en) || '',
      description_ar: (descObj && descObj.ar) || '',
      address_en: addrObj.en || '',
      address_ar: addrObj.ar || '',
      phone: branch.phone,
      email: branch.email || '',
      latitude: branch.latitude?.toString() || '',
      longitude: branch.longitude?.toString() || '',
      map_url: branch.map_url || '',
      image_url: branch.image_url || '',
      image_file: null,
      mobile_image: branch.mobile_image || '',
      mobile_image_file: null,
      is_active: branch.is_active
    });
    setActiveFormTab('en');
    // Initialize gallery items from existing branch galleries
    setModalGalleryItems(
      (Array.isArray(branch.galleries) ? branch.galleries : []).map(g => ({
        id: g.id,
        title: g.title || '',
        description: g.description || '',
        image_url: g.image_url,
        is_active: g.is_active,
        isNew: false,
        toDelete: false
      }))
    );
    setShowModal(true);
  };

  const handleAddModalGalleryItem = () => {
    setModalGalleryItems(prev => [
      ...prev,
      { title: '', description: '', image_url: '', is_active: true, isNew: true }
    ]);
  };

  const handleRemoveModalGalleryItem = (index: number) => {
    setModalGalleryItems(prev => {
      const item = prev[index];
      if (item.id) {
        // Mark existing item for deletion
        return prev.map((g, i) => i === index ? { ...g, toDelete: true } : g);
      } else {
        // Remove new item entirely
        return prev.filter((_, i) => i !== index);
      }
    });
  };

  const handleUpdateModalGalleryItem = (index: number, field: keyof GalleryItem, value: string | boolean) => {
    setModalGalleryItems(prev => 
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  const handleAddGallery = (branch: Branch) => {
    setGalleryModalMode('create');
    setSelectedBranch(branch);
    setSelectedGallery(null);
    setGalleryFormData({
      title: '',
      description: '',
      image_url: '',
      image_file: null,
      is_active: true
    });
    setShowGalleryModal(true);
  };

  const handleEditGallery = (branch: Branch, gallery: Gallery) => {
    setGalleryModalMode('edit');
    setSelectedBranch(branch);
    setSelectedGallery(gallery);
    setGalleryFormData({
      title: gallery.title || '',
      description: gallery.description || '',
      image_url: gallery.image_url,
      image_file: null,
      is_active: gallery.is_active
    });
    setShowGalleryModal(true);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this branch? This will also delete all associated gallery images.')) return;
    
    setDeleting(id);
    try {
      const response = await fetch(`${API_BASE_URL}/branches/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setBranches(prev => prev.filter(b => b.id !== id));
        setNotification({ type: 'success', message: 'Branch deleted successfully' });
      } else {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Failed to delete branch' });
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteGallery = async (galleryId: number) => {
    if (!confirm('Are you sure you want to delete this gallery image?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/galleries/${galleryId}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setBranches(prev => prev.map(b => ({
          ...b,
          galleries: b.galleries?.filter(g => g.id !== galleryId)
        })));
        setNotification({ type: 'success', message: 'Gallery image deleted successfully' });
      } else {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting gallery:', error);
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Failed to delete gallery image' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Create FormData for branch with image
      const formDataToSend = new FormData();
      
      // Build JSON objects for translatable fields
      formDataToSend.append('name', JSON.stringify({ en: formData.name_en, ar: formData.name_ar }));
      formDataToSend.append('region', JSON.stringify({ en: formData.region_en, ar: formData.region_ar }));
      if (formData.description_en || formData.description_ar) {
        formDataToSend.append('description', JSON.stringify({ en: formData.description_en, ar: formData.description_ar }));
      }
      formDataToSend.append('address', JSON.stringify({ en: formData.address_en, ar: formData.address_ar }));
      formDataToSend.append('phone', formData.phone);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.latitude) formDataToSend.append('latitude', formData.latitude);
      if (formData.longitude) formDataToSend.append('longitude', formData.longitude);
      if (formData.map_url) formDataToSend.append('map_url', formData.map_url);
      formDataToSend.append('is_active', formData.is_active ? '1' : '0');
      
      // Handle image: new file takes priority, otherwise keep existing URL
      if (formData.image_file) {
        formDataToSend.append('image', formData.image_file);
      } else if (formData.image_url) {
        formDataToSend.append('image_url', formData.image_url);
      }

      // Handle mobile image: new file takes priority, otherwise keep existing URL
      if (formData.mobile_image_file) {
        formDataToSend.append('mobile_image', formData.mobile_image_file);
      }

      const url = modalMode === 'create' 
        ? `${API_BASE_URL}/branches`
        : `${API_BASE_URL}/branches/${selectedBranch?.id}`;
      
      // For PUT with FormData, we need to use POST with _method=PUT
      const method = modalMode === 'create' ? 'POST' : 'POST';
      if (modalMode === 'edit') {
        formDataToSend.append('_method', 'PUT');
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const branchId = result.data.id;
        const savedGalleries: Gallery[] = [];

        // Handle gallery items
        for (const item of modalGalleryItems) {
          if (item.toDelete && item.id) {
            // Delete existing gallery item
            await fetch(`${API_BASE_URL}/galleries/${item.id}`, {
              method: 'DELETE',
              headers: getAuthHeaders()
            });
          } else if (item.isNew && (item.image_file || item.image_url)) {
            // Create new gallery item with file upload
            const galleryFormData = new FormData();
            galleryFormData.append('branch_id', branchId.toString());
            if (item.title) galleryFormData.append('title', item.title);
            if (item.description) galleryFormData.append('description', item.description);
            galleryFormData.append('is_active', item.is_active ? '1' : '0');
            
            if (item.image_file) {
              galleryFormData.append('image', item.image_file);
            } else if (item.image_url) {
              galleryFormData.append('image_url', item.image_url);
            }
            
            const galleryResponse = await fetch(`${API_BASE_URL}/galleries`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: galleryFormData
            });
            const galleryResult = await galleryResponse.json();
            if (galleryResult.success) {
              savedGalleries.push(galleryResult.data);
            }
          } else if (item.id && !item.toDelete) {
            // Keep existing (or update if needed)
            savedGalleries.push({
              id: item.id,
              branch_id: branchId,
              title: item.title || null,
              description: item.description || null,
              image_url: item.image_url,
              order: 0,
              is_active: item.is_active
            });
          }
        }

        if (modalMode === 'create') {
          setBranches(prev => [...prev, { ...result.data, galleries: savedGalleries }]);
        } else {
          setBranches(prev => prev.map(b => b.id === selectedBranch?.id ? { ...result.data, galleries: savedGalleries } : b));
        }
        setShowModal(false);
        setNotification({ type: 'success', message: `Branch ${modalMode === 'create' ? 'created' : 'updated'} successfully` });
      } else {
        throw new Error(result.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving branch:', error);
      setNotification({ type: 'error', message: 'Failed to save branch' });
    } finally {
      setSaving(false);
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('branch_id', selectedBranch?.id?.toString() || '');
      if (galleryFormData.title) formDataToSend.append('title', galleryFormData.title);
      if (galleryFormData.description) formDataToSend.append('description', galleryFormData.description);
      formDataToSend.append('is_active', galleryFormData.is_active ? '1' : '0');
      
      // Handle image
      if (galleryFormData.image_file) {
        formDataToSend.append('image', galleryFormData.image_file);
      } else if (galleryFormData.image_url) {
        formDataToSend.append('image_url', galleryFormData.image_url);
      }

      const url = galleryModalMode === 'create' 
        ? `${API_BASE_URL}/galleries`
        : `${API_BASE_URL}/galleries/${selectedGallery?.id}`;
      
      // For PUT with FormData, use POST with _method=PUT
      const method = 'POST';
      if (galleryModalMode === 'edit') {
        formDataToSend.append('_method', 'PUT');
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (galleryModalMode === 'create') {
          setBranches(prev => prev.map(b => 
            b.id === selectedBranch?.id 
              ? { ...b, galleries: [...(b.galleries || []), result.data] }
              : b
          ));
        } else {
          setBranches(prev => prev.map(b => ({
            ...b,
            galleries: b.galleries?.map(g => g.id === selectedGallery?.id ? result.data : g)
          })));
        }
        setShowGalleryModal(false);
        setNotification({ type: 'success', message: `Gallery image ${galleryModalMode === 'create' ? 'added' : 'updated'} successfully` });
      } else {
        throw new Error(result.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving gallery:', error);
      setNotification({ type: 'error', message: 'Failed to save gallery image' });
    } finally {
      setSaving(false);
    }
  };

  const filteredBranches = branches.filter(branch =>
    getTranslatedField(branch.name, '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    getTranslatedField(branch.region, '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    getTranslatedField(branch.address, '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Inline Styles
  const containerStyle: React.CSSProperties = { padding: '24px', fontFamily: "'Calibri', 'Segoe UI', sans-serif" };
  const headerStyle: React.CSSProperties = { marginBottom: '24px' };
  const headerTopStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' };
  const titleStyle: React.CSSProperties = { fontSize: '28px', fontWeight: 700, color: '#061F42', margin: 0 };
  const subtitleStyle: React.CSSProperties = { color: '#6B7280', marginTop: '4px', fontSize: '14px' };
  const addButtonStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#15C9FA', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer' };
  const searchInputStyle: React.CSSProperties = { width: '100%', maxWidth: '320px', padding: '12px 16px 12px 44px', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', outline: 'none' };
  const cardContainerStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' };
  const cardStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', overflow: 'hidden' };
  const cardImageStyle: React.CSSProperties = { width: '100%', height: '180px', objectFit: 'cover', backgroundColor: '#F3F4F6' };
  const cardContentStyle: React.CSSProperties = { padding: '20px' };
  const cardHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' };
  const branchNameStyle: React.CSSProperties = { fontSize: '18px', fontWeight: 700, color: '#061F42', margin: 0 };
  const regionBadgeStyle: React.CSSProperties = { display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: '#C9F3FF', color: '#0a4d68' };
  const infoRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#6B7280' };
  const statusBadgeStyle = (active: boolean): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: active ? '#DEF7EC' : '#F3F4F6', color: active ? '#03543F' : '#6B7280' });
  const actionButtonStyle: React.CSSProperties = { padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' };
  const galleryGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginTop: '12px' };
  const galleryImageStyle: React.CSSProperties = { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' };
  const modalStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' };
  const modalContentStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' };
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
              <h1 style={titleStyle}>Branches</h1>
              <p style={subtitleStyle}>Manage hospital branches and their galleries</p>
            </div>
            <button style={addButtonStyle} onClick={handleCreate}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Branch
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9CA3AF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search branches..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={searchInputStyle} />
          </div>
        </div>

        {/* Branches Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={loadingSpinnerStyle} />
          </div>
        ) : filteredBranches.length === 0 ? (
          <div style={emptyStateStyle}>
            <svg style={{ width: '64px', height: '64px', color: '#D1D5DB', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>No branches found</h3>
            <p style={{ color: '#9CA3AF' }}>{searchQuery ? 'Try a different search' : 'Add your first branch'}</p>
          </div>
        ) : (
          <div style={cardContainerStyle}>
            {filteredBranches.map((branch) => (
              <div key={branch.id} style={cardStyle}>
                {branch.image_url ? (
                  <img src={branch.image_url} alt={getTranslatedField(branch.name, '')} style={cardImageStyle} />
                ) : (
                  <div style={{ ...cardImageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: '48px', height: '48px', color: '#D1D5DB' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
                <div style={cardContentStyle}>
                  <div style={cardHeaderStyle}>
                    <div>
                      <h3 style={branchNameStyle}>{getTranslatedField(branch.name, '')}</h3>
                      <span style={regionBadgeStyle}>{getTranslatedField(branch.region, '')}</span>
                    </div>
                    <span style={statusBadgeStyle(branch.is_active)}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: branch.is_active ? '#03543F' : '#6B7280', marginRight: '6px' }} />
                      {branch.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {branch.description && (
                    <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px', lineHeight: 1.5 }}>{getTranslatedField(branch.description, '')}</p>
                  )}
                  
                  <div style={infoRowStyle}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {getTranslatedField(branch.address, '')}
                  </div>
                  
                  <div style={infoRowStyle}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {branch.phone}
                  </div>
                  
                  {branch.email && (
                    <div style={infoRowStyle}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {branch.email}
                    </div>
                  )}

                  {/* Gallery Section */}
                  <div style={{ marginTop: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#061F42' }}>
                        Gallery ({branch.galleries?.length || 0})
                      </span>
                      <button 
                        onClick={() => handleAddGallery(branch)} 
                        style={{ ...actionButtonStyle, color: '#15C9FA', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </button>
                    </div>
                    {branch.galleries && branch.galleries.length > 0 && (
                      <div style={galleryGridStyle}>
                        {branch.galleries.slice(0, expandedBranch === branch.id ? undefined : 4).map((gallery) => (
                          <div key={gallery.id} style={{ position: 'relative' }}>
                            <img src={gallery.image_url} alt={getTranslatedField(gallery.title, 'Gallery')} style={galleryImageStyle} onClick={() => handleEditGallery(branch, gallery)} />
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteGallery(gallery.id); }}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {branch.galleries.length > 4 && (
                          <button
                            onClick={() => setExpandedBranch(expandedBranch === branch.id ? null : branch.id)}
                            style={{ ...galleryImageStyle, border: '2px dashed #E5E7EB', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#6B7280', cursor: 'pointer' }}
                          >
                            {expandedBranch === branch.id ? 'Show less' : `+${branch.galleries.length - 4} more`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                    <button onClick={() => handleEdit(branch)} style={{ ...actionButtonStyle, color: '#15C9FA' }} title="Edit">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(branch.id)} disabled={deleting === branch.id} style={{ ...actionButtonStyle, color: '#EF4444', opacity: deleting === branch.id ? 0.5 : 1 }} title="Delete">
                      {deleting === branch.id ? (
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

        {/* Branch Modal */}
        {showModal && (
          <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div style={{ ...modalContentStyle, maxWidth: '700px' }}>
              <div style={modalHeaderStyle}>
                <h2 style={modalTitleStyle}>{modalMode === 'create' ? 'Add New Branch' : 'Edit Branch'}</h2>
                <button onClick={() => setShowModal(false)} style={{ ...actionButtonStyle, padding: '8px' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#6B7280">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={modalBodyStyle}>
                  {/* Language Tabs */}
                  <div style={{ marginBottom: '24px', borderBottom: '2px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => setActiveFormTab('en')}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: 600,
                          border: 'none',
                          borderBottom: `3px solid ${activeFormTab === 'en' ? '#15C9FA' : 'transparent'}`,
                          backgroundColor: activeFormTab === 'en' ? '#E0F7FF' : 'transparent',
                          color: activeFormTab === 'en' ? '#0a4d68' : '#6B7280',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFormTab('ar')}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: 600,
                          border: 'none',
                          borderBottom: `3px solid ${activeFormTab === 'ar' ? '#15C9FA' : 'transparent'}`,
                          backgroundColor: activeFormTab === 'ar' ? '#E0F7FF' : 'transparent',
                          color: activeFormTab === 'ar' ? '#0a4d68' : '#6B7280',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        العربية (Arabic)
                      </button>
                    </div>
                  </div>

                  {/* English Fields */}
                  {activeFormTab === 'en' && (
                    <>
                      <div style={formRowStyle}>
                        <div style={formGroupStyle}>
                          <label style={labelStyle}>Branch Name (English) *</label>
                          <input
                            type="text"
                            required
                            value={formData.name_en}
                            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                            style={inputStyle}
                            placeholder="e.g., Ghulail Hospital"
                          />
                        </div>
                        <div style={formGroupStyle}>
                          <label style={labelStyle}>Region (English) *</label>
                          <input
                            type="text"
                            required
                            value={formData.region_en}
                            onChange={(e) => setFormData({ ...formData, region_en: e.target.value })}
                            style={inputStyle}
                            placeholder="e.g., Jeddah Region"
                          />
                        </div>
                      </div>
                      
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Description (English)</label>
                        <textarea
                          value={formData.description_en}
                          onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                          style={textareaStyle}
                          placeholder="Brief description of the branch"
                        />
                      </div>
                      
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Address (English) *</label>
                        <input
                          type="text"
                          required
                          value={formData.address_en}
                          onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g., King Faisal Road, Ghulail District"
                        />
                      </div>
                    </>
                  )}

                  {/* Arabic Fields */}
                  {activeFormTab === 'ar' && (
                    <>
                      <div style={formRowStyle}>
                        <div style={formGroupStyle}>
                          <label style={labelStyle}>اسم الفرع (عربي) *</label>
                          <input
                            type="text"
                            required
                            value={formData.name_ar}
                            onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                            style={{ ...inputStyle, direction: 'rtl' }}
                            placeholder="مثال: مستشفى الغليل"
                            dir="rtl"
                          />
                        </div>
                        <div style={formGroupStyle}>
                          <label style={labelStyle}>المنطقة (عربي) *</label>
                          <input
                            type="text"
                            required
                            value={formData.region_ar}
                            onChange={(e) => setFormData({ ...formData, region_ar: e.target.value })}
                            style={{ ...inputStyle, direction: 'rtl' }}
                            placeholder="مثال: منطقة جدة"
                            dir="rtl"
                          />
                        </div>
                      </div>
                      
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>الوصف (عربي)</label>
                        <textarea
                          value={formData.description_ar}
                          onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                          style={{ ...textareaStyle, direction: 'rtl' }}
                          placeholder="وصف مختصر للفرع"
                          dir="rtl"
                        />
                      </div>
                      
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>العنوان (عربي) *</label>
                        <input
                          type="text"
                          required
                          value={formData.address_ar}
                          onChange={(e) => setFormData({ ...formData, address_ar: e.target.value })}
                          style={{ ...inputStyle, direction: 'rtl' }}
                          placeholder="مثال: طريق الملك فيصل، حي الغليل"
                          dir="rtl"
                        />
                      </div>
                    </>
                  )}
                  
                  <div style={formRowStyle}>
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>Phone *</label>
                      <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} placeholder="+966 12 345 6789" />
                    </div>
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>Email</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} placeholder="branch@hospital.com" />
                    </div>
                  </div>
                  
                  <div style={formRowStyle}>
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>Latitude</label>
                      <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} style={inputStyle} placeholder="21.5433" />
                    </div>
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>Longitude</label>
                      <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} style={inputStyle} placeholder="39.1728" />
                    </div>
                  </div>
                  
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Map URL</label>
                    <input type="url" value={formData.map_url} onChange={(e) => setFormData({ ...formData, map_url: e.target.value })} style={inputStyle} placeholder="https://maps.google.com/..." />
                  </div>
                  
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Branch Image</label>
                    {(formData.image_file || formData.image_url) ? (
                      <div style={{ position: 'relative', width: 'fit-content' }}>
                        <img 
                          src={formData.image_file ? URL.createObjectURL(formData.image_file) : formData.image_url} 
                          alt="Branch preview" 
                          style={{ width: '200px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #E5E7EB' }} 
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_file: null, image_url: '' })}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#EF4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="branch-image-upload" style={{ 
                        display: 'block',
                        border: '2px dashed #E5E7EB', 
                        borderRadius: '12px', 
                        padding: '24px', 
                        textAlign: 'center',
                        backgroundColor: '#F9FAFB',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData({ ...formData, image_file: file });
                            }
                          }}
                          style={{ display: 'none' }}
                          id="branch-image-upload"
                        />
                        <svg style={{ width: '40px', height: '40px', color: '#9CA3AF', margin: '0 auto 8px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Click to upload image</p>
                      </label>
                    )}
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Mobile Branch Image (Optional)</label>
                    {(formData.mobile_image_file || formData.mobile_image) ? (
                      <div style={{ position: 'relative', width: 'fit-content' }}>
                        <img 
                          src={formData.mobile_image_file ? URL.createObjectURL(formData.mobile_image_file) : formData.mobile_image} 
                          alt="Mobile branch preview" 
                          style={{ width: '200px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #E5E7EB' }} 
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, mobile_image_file: null, mobile_image: '' })}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#EF4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="branch-mobile-image-upload" style={{ 
                        display: 'block',
                        border: '2px dashed #E5E7EB', 
                        borderRadius: '12px', 
                        padding: '24px', 
                        textAlign: 'center',
                        backgroundColor: '#F9FAFB',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData({ ...formData, mobile_image_file: file });
                            }
                          }}
                          style={{ display: 'none' }}
                          id="branch-mobile-image-upload"
                        />
                        <svg style={{ width: '40px', height: '40px', color: '#9CA3AF', margin: '0 auto 8px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Click to upload mobile image</p>
                      </label>
                    )}
                  </div>
                  
                  <div style={formGroupStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>Branch is active</span>
                    </label>
                  </div>

                  {/* Gallery Section */}
                  <div style={{ marginTop: '24px', borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <label style={labelStyle}>Gallery Images</label>
                      <button
                        type="button"
                        onClick={handleAddModalGalleryItem}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          backgroundColor: '#E0F7FF',
                          color: '#0a4d68',
                          fontWeight: 600,
                          fontSize: '13px',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Image
                      </button>
                    </div>

                    {modalGalleryItems.filter(g => !g.toDelete).length === 0 ? (
                      <div style={{ 
                        padding: '32px', 
                        textAlign: 'center', 
                        backgroundColor: '#F9FAFB', 
                        borderRadius: '12px',
                        border: '2px dashed #E5E7EB'
                      }}>
                        <svg style={{ width: '40px', height: '40px', color: '#9CA3AF', margin: '0 auto 12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>No gallery images yet. Click "Add Image" to add photos.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {modalGalleryItems.map((item, index) => {
                          if (item.toDelete) return null;
                          return (
                            <div key={index} style={{
                              display: 'flex',
                              gap: '12px',
                              padding: '12px',
                              backgroundColor: '#F9FAFB',
                              borderRadius: '12px',
                              border: '1px solid #E5E7EB'
                            }}>
                              {/* Image Upload */}
                              <div style={{ width: '120px', flexShrink: 0 }}>
                                {(item.image_file || item.image_url) ? (
                                  <div style={{ position: 'relative' }}>
                                    <img 
                                      src={item.image_file ? URL.createObjectURL(item.image_file) : item.image_url} 
                                      alt={getTranslatedField(item.title, 'Gallery')} 
                                      style={{ 
                                        width: '120px', 
                                        height: '80px', 
                                        objectFit: 'cover', 
                                        borderRadius: '8px' 
                                      }} 
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setModalGalleryItems(prev => prev.map((g, i) => 
                                          i === index ? { ...g, image_url: '', image_file: null } : g
                                        ));
                                      }}
                                      style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px'
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : (
                                  <label htmlFor={`gallery-image-upload-${index}`} style={{ 
                                    width: '120px', 
                                    height: '80px', 
                                    border: '2px dashed #E5E7EB', 
                                    borderRadius: '8px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    backgroundColor: '#F9FAFB',
                                    cursor: 'pointer'
                                  }}>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setModalGalleryItems(prev => prev.map((g, i) => 
                                            i === index ? { ...g, image_file: file } : g
                                          ));
                                        }
                                      }}
                                      style={{ display: 'none' }}
                                      id={`gallery-image-upload-${index}`}
                                    />
                                    <svg style={{ width: '24px', height: '24px', color: '#9CA3AF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </label>
                                )}
                              </div>
                              
                              {/* Title & Description */}
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => handleUpdateModalGalleryItem(index, 'title', e.target.value)}
                                  placeholder="Image title (optional)"
                                  style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }}
                                />
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleUpdateModalGalleryItem(index, 'description', e.target.value)}
                                  placeholder="Description (optional)"
                                  style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }}
                                />
                              </div>
                              
                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveModalGalleryItem(index)}
                                style={{
                                  padding: '8px',
                                  backgroundColor: 'transparent',
                                  color: '#EF4444',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  alignSelf: 'flex-start'
                                }}
                                title="Remove"
                              >
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                      <>{modalMode === 'create' ? 'Add Branch' : 'Save Changes'}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Gallery Modal */}
        {showGalleryModal && (
          <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && setShowGalleryModal(false)}>
            <div style={{ ...modalContentStyle, maxWidth: '480px' }}>
              <div style={modalHeaderStyle}>
                <h2 style={modalTitleStyle}>{galleryModalMode === 'create' ? 'Add Gallery Image' : 'Edit Gallery Image'}</h2>
                <button onClick={() => setShowGalleryModal(false)} style={{ ...actionButtonStyle, padding: '8px' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#6B7280">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleGallerySubmit}>
                <div style={modalBodyStyle}>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Image *</label>
                    {(galleryFormData.image_file || galleryFormData.image_url) ? (
                      <div style={{ position: 'relative', width: 'fit-content' }}>
                        <img 
                          src={galleryFormData.image_file ? URL.createObjectURL(galleryFormData.image_file) : galleryFormData.image_url} 
                          alt="Gallery preview" 
                          style={{ width: '200px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #E5E7EB' }} 
                        />
                        <button
                          type="button"
                          onClick={() => setGalleryFormData({ ...galleryFormData, image_file: null, image_url: '' })}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#EF4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="gallery-modal-image-upload" style={{ 
                        display: 'block',
                        border: '2px dashed #E5E7EB', 
                        borderRadius: '12px', 
                        padding: '24px', 
                        textAlign: 'center',
                        backgroundColor: '#F9FAFB',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setGalleryFormData({ ...galleryFormData, image_file: file });
                            }
                          }}
                          style={{ display: 'none' }}
                          id="gallery-modal-image-upload"
                        />
                        <svg style={{ width: '40px', height: '40px', color: '#9CA3AF', margin: '0 auto 8px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Click to upload image</p>
                      </label>
                    )}
                  </div>
                  
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Title</label>
                    <input type="text" value={galleryFormData.title} onChange={(e) => setGalleryFormData({ ...galleryFormData, title: e.target.value })} style={inputStyle} placeholder="Image title (optional)" />
                  </div>
                  
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Description</label>
                    <textarea value={galleryFormData.description} onChange={(e) => setGalleryFormData({ ...galleryFormData, description: e.target.value })} style={textareaStyle} placeholder="Image description (optional)" />
                  </div>
                  
                  <div style={formGroupStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" checked={galleryFormData.is_active} onChange={(e) => setGalleryFormData({ ...galleryFormData, is_active: e.target.checked })} style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>Image is active</span>
                    </label>
                  </div>
                </div>
                <div style={modalFooterStyle}>
                  <button type="button" onClick={() => setShowGalleryModal(false)} style={cancelButtonStyle}>Cancel</button>
                  <button type="submit" disabled={saving || (!galleryFormData.image_url && !galleryFormData.image_file)} style={{ ...submitButtonStyle, opacity: (saving || (!galleryFormData.image_url && !galleryFormData.image_file)) ? 0.7 : 1 }}>
                    {saving ? (
                      <>
                        <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Saving...
                      </>
                    ) : (
                      <>{galleryModalMode === 'create' ? 'Add Image' : 'Save Changes'}</>
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

export default AdminBranches;
