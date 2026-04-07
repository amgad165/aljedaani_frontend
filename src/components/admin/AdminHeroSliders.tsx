import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { heroSlidersService, type HeroSlider } from '../../services/heroSlidersService';

const AdminHeroSliders = () => {
  const [sliders, setSliders] = useState<HeroSlider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlider, setEditingSlider] = useState<HeroSlider | null>(null);
  const [formData, setFormData] = useState({
    sort_order: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [mobileImagePreview, setMobileImagePreview] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const data = await heroSlidersService.getAll();
      setSliders(data);
    } catch (error) {
      console.error('Error fetching hero sliders:', error);
      setNotification({ type: 'error', message: 'Failed to load hero sliders' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const resetForm = () => {
    setEditingSlider(null);
    setFormData({ sort_order: 0, is_active: true });
    setImageFile(null);
    setImagePreview('');
    setMobileImageFile(null);
    setMobileImagePreview('');
    setShowForm(false);
  };

  const handleImageChange = (file: File, isMobile = false) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isMobile) {
        setMobileImagePreview(reader.result as string);
      } else {
        setImagePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (slider: HeroSlider) => {
    setEditingSlider(slider);
    setFormData({
      sort_order: slider.sort_order,
      is_active: slider.is_active,
    });
    setImagePreview(slider.image_url || '');
    setMobileImagePreview(slider.mobile_image_url || '');
    setImageFile(null);
    setMobileImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingSlider && !imageFile) {
      setNotification({ type: 'error', message: 'Please upload a banner image' });
      return;
    }

    try {
      const payload = {
        sort_order: formData.sort_order,
        is_active: formData.is_active,
        image: imageFile || undefined,
        mobile_image: mobileImageFile || undefined,
      };

      if (editingSlider) {
        await heroSlidersService.update(editingSlider.id, payload);
        setNotification({ type: 'success', message: 'Slider updated successfully' });
      } else {
        await heroSlidersService.create(payload);
        setNotification({ type: 'success', message: 'Slider created successfully' });
      }

      resetForm();
      fetchSliders();
    } catch (error) {
      console.error('Error saving slider:', error);
      setNotification({ type: 'error', message: 'Failed to save slider' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this slider banner?')) return;

    try {
      await heroSlidersService.delete(id);
      setNotification({ type: 'success', message: 'Slider deleted successfully' });
      fetchSliders();
    } catch (error) {
      console.error('Error deleting slider:', error);
      setNotification({ type: 'error', message: 'Failed to delete slider' });
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: "'Calibri', 'Segoe UI', sans-serif" }}>
        {notification && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '16px 24px',
              borderRadius: '12px',
              backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444',
              color: 'white',
              zIndex: 2000,
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            {notification.message}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#061F42', margin: 0 }}>Hero Sliders</h1>
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #088395 0%, #05bfdb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {showForm ? 'Cancel' : '+ Add Slider'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ marginTop: 0, color: '#061F42' }}>{editingSlider ? 'Edit Slider' : 'Add Slider'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#0F172A' }}>Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', background: '#FFFFFF' }}
                  />
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: '#0F172A' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    Active Slider
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '14px', padding: '14px', background: '#FFFFFF' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#0F172A' }}>Desktop Banner Image *</label>
                  <div style={{ width: '100%', height: '180px', border: '1px dashed #CBD5E1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#F8FAFC', marginBottom: '10px' }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Desktop preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#64748B', fontSize: '13px' }}>No desktop image selected</span>
                    )}
                  </div>
                  <input
                    id="hero-slider-desktop-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImageFile(file);
                      handleImageChange(file);
                    }}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="hero-slider-desktop-image"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#0EA5E9', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Choose Desktop Image
                  </label>
                </div>

                <div style={{ border: '1px solid #E5E7EB', borderRadius: '14px', padding: '14px', background: '#FFFFFF' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#0F172A' }}>Mobile Banner Image (Optional)</label>
                  <div style={{ width: '100%', height: '180px', border: '1px dashed #CBD5E1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#F8FAFC', marginBottom: '10px' }}>
                    {mobileImagePreview ? (
                      <img src={mobileImagePreview} alt="Mobile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#64748B', fontSize: '13px' }}>No mobile image selected</span>
                    )}
                  </div>
                  <input
                    id="hero-slider-mobile-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setMobileImageFile(file);
                      handleImageChange(file, true);
                    }}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="hero-slider-mobile-image"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#14B8A6', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Choose Mobile Image
                  </label>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#15C9FA',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {editingSlider ? 'Update Slider' : 'Create Slider'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#4B5563' }}>Loading sliders...</div>
        ) : sliders.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280', background: 'white', borderRadius: '12px' }}>
            No slider banners found.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {sliders.map((slider) => (
              <div key={slider.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <img src={slider.image_url} alt={`Slider ${slider.id}`} style={{ width: '100%', height: '170px', objectFit: 'cover' }} />
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#374151', fontSize: '13px' }}>
                    <span>Order: {slider.sort_order}</span>
                    <span style={{ color: slider.is_active ? '#059669' : '#9CA3AF', fontWeight: 700 }}>
                      {slider.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(slider)}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: 'none', background: '#E0F2FE', color: '#0369A1', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slider.id)}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: 'none', background: '#FEE2E2', color: '#DC2626', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminHeroSliders;
