import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { excellenceCentersService, type ExcellenceCenter } from '../../services/excellenceCentersService';

const AdminExcellenceCenters = () => {
  const [centers, setCenters] = useState<ExcellenceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCenter, setEditingCenter] = useState<ExcellenceCenter | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    map_url: '',
    sort_order: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const data = await excellenceCentersService.getAll();
      setCenters(data);
    } catch (error) {
      console.error('Error fetching centers:', error);
      setNotification({ type: 'error', message: 'Failed to load excellence centers' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCenter) {
        await excellenceCentersService.update(editingCenter.id, {
          ...formData,
          image: imageFile,
        });
        setNotification({ type: 'success', message: 'Center updated successfully' });
      } else {
        await excellenceCentersService.create({
          ...formData,
          image: imageFile,
        });
        setNotification({ type: 'success', message: 'Center created successfully' });
      }
      resetForm();
      fetchCenters();
    } catch (error) {
      console.error('Error saving center:', error);
      setNotification({ type: 'error', message: 'Failed to save center' });
    }
  };

  const handleEdit = (center: ExcellenceCenter) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      description: center.description,
      map_url: center.map_url || '',
      sort_order: center.sort_order,
      is_active: center.is_active,
    });
    setImagePreview(center.image_url || '');
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this center?')) return;
    try {
      await excellenceCentersService.delete(id);
      setNotification({ type: 'success', message: 'Center deleted successfully' });
      fetchCenters();
    } catch (error) {
      console.error('Error deleting center:', error);
      setNotification({ type: 'error', message: 'Failed to delete center' });
    }
  };

  const resetForm = () => {
    setEditingCenter(null);
    setFormData({ name: '', description: '', map_url: '', sort_order: 0, is_active: true });
    setImageFile(null);
    setImagePreview('');
    setShowForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const cardStyle: React.CSSProperties = { background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '24px' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const buttonStyle: React.CSSProperties = { padding: '12px 24px', backgroundColor: '#15C9FA', color: 'white', fontWeight: 600, border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px' };

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
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#061F42', margin: 0 }}>Excellence Centers</h1>
          <button onClick={() => setShowForm(!showForm)} style={buttonStyle}>
            {showForm ? 'Cancel' : '+ Add Center'}
          </button>
        </div>

        {showForm && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#061F42', marginTop: 0 }}>
              {editingCenter ? 'Edit Center' : 'Add New Center'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', marginTop: '8px', borderRadius: '8px' }} />}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>Map URL (optional)</label>
                <input
                  type="url"
                  value={formData.map_url}
                  onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                  style={inputStyle}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' }}>Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '20px', height: '20px', marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Active</span>
                </label>
              </div>

              <button type="submit" style={buttonStyle}>
                {editingCenter ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        )}

        <div style={cardStyle}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : centers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>No centers found</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Image</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Order</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Active</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {centers.map((center) => (
                  <tr key={center.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '12px' }}>
                      {center.image_url && (
                        <img src={center.image_url} alt={center.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                      )}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{center.name}</td>
                    <td style={{ padding: '12px', maxWidth: '300px' }}>
                      {center.description.length > 100 ? `${center.description.substring(0, 100)}...` : center.description}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{center.sort_order}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: center.is_active ? '#D1FAE5' : '#FEE2E2',
                        color: center.is_active ? '#065F46' : '#991B1B'
                      }}>
                        {center.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEdit(center)}
                        style={{ ...buttonStyle, marginRight: '8px', padding: '8px 16px', backgroundColor: '#3B82F6' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(center.id)}
                        style={{ ...buttonStyle, padding: '8px 16px', backgroundColor: '#EF4444' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminExcellenceCenters;
