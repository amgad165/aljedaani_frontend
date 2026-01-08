import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { offersService, type Offer } from '../../services/offersService';

const AdminOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    discount: 0,
    sort_order: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await offersService.getAll();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setNotification({ type: 'error', message: 'Failed to load offers' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOffer) {
        await offersService.update(editingOffer.id, {
          ...formData,
          image: imageFile || undefined,
        });
        setNotification({ type: 'success', message: 'Offer updated successfully' });
      } else {
        await offersService.create({
          ...formData,
          image: imageFile || undefined,
        });
        setNotification({ type: 'success', message: 'Offer created successfully' });
      }
      resetForm();
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      setNotification({ type: 'error', message: 'Failed to save offer' });
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      price: offer.price,
      discount: offer.discount,
      sort_order: offer.sort_order,
      is_active: offer.is_active,
    });
    setImagePreview(offer.image_url || '');
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await offersService.delete(id);
      setNotification({ type: 'success', message: 'Offer deleted successfully' });
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      setNotification({ type: 'error', message: 'Failed to delete offer' });
    }
  };

  const resetForm = () => {
    setEditingOffer(null);
    setFormData({ title: '', description: '', price: 0, discount: 0, sort_order: 0, is_active: true });
    setImageFile(null);
    setImagePreview('');
    setShowForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #088395 0%, #05bfdb 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 16px',
    fontSize: '14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
  };

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: "'Calibri', 'Segoe UI', sans-serif" }}>
        {notification && (
          <div style={{
            position: 'fixed', top: '20px', right: '20px', padding: '16px 24px', borderRadius: '12px',
            backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444', color: 'white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 2000
          }}>
            {notification.message}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#061F42', margin: 0 }}>Offers</h1>
          <button onClick={() => setShowForm(!showForm)} style={buttonStyle}>
            {showForm ? 'Cancel' : '+ Add Offer'}
          </button>
        </div>

        {showForm && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#061F42', marginTop: 0 }}>
              {editingOffer ? 'Edit Offer' : 'Add New Offer'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>Price (SAR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>Discount (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={inputStyle}
                />
                {imagePreview && (
                  <div style={{ marginTop: '12px' }}>
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>Status</label>
                <select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                  style={inputStyle}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={buttonStyle}>
                  {editingOffer ? 'Update' : 'Create'} Offer
                </button>
                <button type="button" onClick={resetForm} style={{ ...buttonStyle, background: '#6B7280' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTopColor: '#088395', borderRadius: '50%', animation: 'spin 1s linear infinite' }}>
            </div>
          </div>
        ) : (
          <div style={cardStyle}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Image</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Title</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Price</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Discount</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Final Price</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Order</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => {
                    const price = Number(offer.price);
                    const discount = Number(offer.discount);
                    const finalPrice = price - (price * (discount / 100));
                    return (
                      <tr key={offer.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>
                          {offer.image_url && (
                            <img
                              src={offer.image_url}
                              alt={offer.title}
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                          )}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{offer.title}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{price.toFixed(2)} SAR</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{discount}%</td>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, color: '#088395' }}>{finalPrice.toFixed(2)} SAR</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{offer.sort_order}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: offer.is_active ? '#d1fae5' : '#f3f4f6',
                            color: offer.is_active ? '#065f46' : '#6b7280'
                          }}>
                            {offer.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEdit(offer)}
                              style={{ ...buttonStyle, padding: '6px 12px', fontSize: '12px' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(offer.id)}
                              style={{ ...buttonStyle, padding: '6px 12px', fontSize: '12px', background: '#EF4444' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {offers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '14px' }}>
                  No offers found. Click "+ Add Offer" to create one.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOffers;
