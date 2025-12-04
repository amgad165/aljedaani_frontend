import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import ImageUpload from './ImageUpload';
import { departmentsService, type Department, type DepartmentTabContent, type SubSection, type ServiceListItem } from '../../services/departmentsService';

type TabType = 'overview' | 'opd_services' | 'inpatient_services' | 'investigations';

const tabLabels: Record<TabType, string> = {
  overview: 'Overview',
  opd_services: 'OPD Services',
  inpatient_services: 'Inpatient Services',
  investigations: 'Investigations',
};

const AdminDepartmentTabs: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [tabContents, setTabContents] = useState<DepartmentTabContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state for current tab
  const [formData, setFormData] = useState<{
    main_image: string;
    main_description: string;
    quote_text: string;
    sub_sections: SubSection[];
    service_list: ServiceListItem[];
    sidebar_items: string[];
    is_active: boolean;
  }>({
    main_image: '',
    main_description: '',
    quote_text: '',
    sub_sections: [],
    service_list: [],
    sidebar_items: [],
    is_active: true,
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchData = useCallback(async () => {
    if (!departmentId) return;
    
    try {
      setLoading(true);
      
      // Fetch department
      const deptResponse = await fetch(`${API_BASE_URL}/departments/${departmentId}`);
      const deptResult = await deptResponse.json();
      if (deptResult.success) {
        setDepartment(deptResult.data);
      }
      
      // Fetch tab contents
      const tabsResponse = await fetch(`${API_BASE_URL}/departments/${departmentId}/tabs`);
      const tabsResult = await tabsResponse.json();
      if (tabsResult.success) {
        setTabContents(tabsResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setNotification({ type: 'error', message: 'Failed to load department data' });
    } finally {
      setLoading(false);
    }
  }, [departmentId, API_BASE_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load form data when tab changes
  useEffect(() => {
    const currentContent = tabContents.find(tc => tc.tab_type === activeTab);
    if (currentContent) {
      setFormData({
        main_image: currentContent.main_image || '',
        main_description: currentContent.main_description || '',
        quote_text: currentContent.quote_text || '',
        sub_sections: currentContent.sub_sections || [],
        service_list: currentContent.service_list || [],
        sidebar_items: currentContent.sidebar_items || [],
        is_active: currentContent.is_active,
      });
    } else {
      setFormData({
        main_image: '',
        main_description: '',
        quote_text: '',
        sub_sections: [],
        service_list: [],
        sidebar_items: [],
        is_active: true,
      });
    }
  }, [activeTab, tabContents]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSave = async () => {
    if (!departmentId) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/tabs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          tab_type: activeTab,
          ...formData,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update local state
        const updatedContent = result.data;
        setTabContents(prev => {
          const existing = prev.findIndex(tc => tc.tab_type === activeTab);
          if (existing >= 0) {
            const newContents = [...prev];
            newContents[existing] = updatedContent;
            return newContents;
          }
          return [...prev, updatedContent];
        });
        setNotification({ type: 'success', message: 'Tab content saved successfully' });
      } else {
        throw new Error(result.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving:', error);
      setNotification({ type: 'error', message: 'Failed to save tab content' });
    } finally {
      setSaving(false);
    }
  };

  // Sub-section management
  const addSubSection = () => {
    setFormData(prev => ({
      ...prev,
      sub_sections: [...prev.sub_sections, { image: '', title: '', description: '', position: 'left' }],
    }));
  };

  const updateSubSection = (index: number, field: keyof SubSection, value: string) => {
    setFormData(prev => {
      const newSubSections = [...prev.sub_sections];
      newSubSections[index] = { ...newSubSections[index], [field]: value };
      return { ...prev, sub_sections: newSubSections };
    });
  };

  const removeSubSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sub_sections: prev.sub_sections.filter((_, i) => i !== index),
    }));
  };

  // Service list management
  const addServiceItem = () => {
    setFormData(prev => ({
      ...prev,
      service_list: [...prev.service_list, { title: '', items: [''] }],
    }));
  };

  const updateServiceItem = (index: number, field: keyof ServiceListItem, value: string | string[]) => {
    setFormData(prev => {
      const newServiceList = [...prev.service_list];
      newServiceList[index] = { ...newServiceList[index], [field]: value };
      return { ...prev, service_list: newServiceList };
    });
  };

  const removeServiceItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      service_list: prev.service_list.filter((_, i) => i !== index),
    }));
  };

  const addServiceListItem = (serviceIndex: number) => {
    setFormData(prev => {
      const newServiceList = [...prev.service_list];
      const currentItems = newServiceList[serviceIndex].items || [];
      newServiceList[serviceIndex] = { ...newServiceList[serviceIndex], items: [...currentItems, ''] };
      return { ...prev, service_list: newServiceList };
    });
  };

  const updateServiceListItem = (serviceIndex: number, itemIndex: number, value: string) => {
    setFormData(prev => {
      const newServiceList = [...prev.service_list];
      const currentItems = [...(newServiceList[serviceIndex].items || [])];
      currentItems[itemIndex] = value;
      newServiceList[serviceIndex] = { ...newServiceList[serviceIndex], items: currentItems };
      return { ...prev, service_list: newServiceList };
    });
  };

  const removeServiceListItem = (serviceIndex: number, itemIndex: number) => {
    setFormData(prev => {
      const newServiceList = [...prev.service_list];
      const currentItems = (newServiceList[serviceIndex].items || []).filter((_, i) => i !== itemIndex);
      newServiceList[serviceIndex] = { ...newServiceList[serviceIndex], items: currentItems };
      return { ...prev, service_list: newServiceList };
    });
  };

  // Sidebar items management
  const addSidebarItem = () => {
    setFormData(prev => ({
      ...prev,
      sidebar_items: [...prev.sidebar_items, ''],
    }));
  };

  const updateSidebarItem = (index: number, value: string) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      newItems[index] = value;
      return { ...prev, sidebar_items: newItems };
    });
  };

  const removeSidebarItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sidebar_items: prev.sidebar_items.filter((_, i) => i !== index),
    }));
  };

  // Styles
  const containerStyle: React.CSSProperties = { padding: '24px', fontFamily: "'Nunito', sans-serif" };
  const headerStyle: React.CSSProperties = { marginBottom: '24px' };
  const titleStyle: React.CSSProperties = { fontSize: '28px', fontWeight: 700, color: '#061F42', margin: 0 };
  const backButtonStyle: React.CSSProperties = { 
    display: 'inline-flex', alignItems: 'center', gap: '8px', 
    color: '#6B7280', fontSize: '14px', cursor: 'pointer', 
    background: 'none', border: 'none', marginBottom: '16px' 
  };
  const tabContainerStyle: React.CSSProperties = { 
    display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' 
  };
  const tabStyle = (isActive: boolean): React.CSSProperties => ({ 
    padding: '12px 20px', 
    background: isActive ? '#15C9FA' : '#E5E7EB', 
    color: isActive ? 'white' : '#374151', 
    border: 'none', borderRadius: '8px', 
    cursor: 'pointer', fontWeight: 600, fontSize: '14px' 
  });
  const cardStyle: React.CSSProperties = { 
    background: 'white', borderRadius: '16px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
    border: '1px solid #E5E7EB', padding: '24px', marginBottom: '24px' 
  };
  const sectionTitleStyle: React.CSSProperties = { 
    fontSize: '18px', fontWeight: 700, color: '#061F42', 
    marginBottom: '16px', marginTop: '0' 
  };
  const labelStyle: React.CSSProperties = { 
    display: 'block', fontSize: '14px', fontWeight: 600, 
    color: '#061F42', marginBottom: '8px' 
  };
  const inputStyle: React.CSSProperties = { 
    width: '100%', padding: '12px 16px', 
    border: '2px solid #E5E7EB', borderRadius: '12px', 
    fontSize: '14px', outline: 'none', boxSizing: 'border-box' 
  };
  const textareaStyle: React.CSSProperties = { 
    ...inputStyle, minHeight: '120px', resize: 'vertical' 
  };
  const addButtonStyle: React.CSSProperties = { 
    display: 'inline-flex', alignItems: 'center', gap: '8px', 
    padding: '10px 16px', backgroundColor: '#E8F8FF', 
    color: '#15C9FA', fontWeight: 600, fontSize: '14px', 
    border: '1px dashed #15C9FA', borderRadius: '8px', cursor: 'pointer' 
  };
  const removeButtonStyle: React.CSSProperties = { 
    padding: '8px', backgroundColor: '#FEE2E2', 
    color: '#EF4444', border: 'none', borderRadius: '8px', cursor: 'pointer' 
  };
  const saveButtonStyle: React.CSSProperties = { 
    padding: '14px 28px', backgroundColor: '#15C9FA', 
    color: 'white', fontWeight: 600, border: 'none', 
    borderRadius: '12px', cursor: 'pointer', fontSize: '16px' 
  };
  const notificationStyle: React.CSSProperties = { 
    position: 'fixed', top: '20px', right: '20px', 
    padding: '16px 24px', borderRadius: '12px', 
    display: 'flex', alignItems: 'center', gap: '12px', 
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 2000 
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ 
            width: '48px', height: '48px', 
            border: '4px solid #E5E7EB', borderTopColor: '#15C9FA', 
            borderRadius: '50%', animation: 'spin 1s linear infinite' 
          }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={containerStyle}>
        {/* Notification */}
        {notification && (
          <div style={{ 
            ...notificationStyle, 
            backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444', 
            color: 'white' 
          }}>
            <span style={{ fontWeight: 500 }}>{notification.message}</span>
          </div>
        )}

        {/* Header */}
        <div style={headerStyle}>
          <button style={backButtonStyle} onClick={() => navigate('/admin/departments')}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Departments
          </button>
          <h1 style={titleStyle}>
            {department?.name || 'Department'} - Tab Content Management
          </h1>
          <p style={{ color: '#6B7280', marginTop: '4px' }}>
            Manage content for each tab on the department details page
          </p>
        </div>

        {/* Tab Selector */}
        <div style={tabContainerStyle}>
          {(Object.keys(tabLabels) as TabType[]).map((tab) => (
            <button
              key={tab}
              style={tabStyle(activeTab === tab)}
              onClick={() => setActiveTab(tab)}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>{tabLabels[activeTab]} Content</h3>

          {/* Main Image */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Main Image</label>
            <ImageUpload
              currentImageUrl={formData.main_image}
              onImageUploaded={(url) => setFormData(prev => ({ ...prev, main_image: url }))}
              onImageRemoved={() => setFormData(prev => ({ ...prev, main_image: '' }))}
              folder="departments"
              placeholder="Upload main section image"
            />
          </div>

          {/* Main Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Main Description</label>
            <textarea
              value={formData.main_description}
              onChange={(e) => setFormData(prev => ({ ...prev, main_description: e.target.value }))}
              style={textareaStyle}
              placeholder="Enter the main description text..."
            />
          </div>

          {/* Quote (Overview tab only) */}
          {activeTab === 'overview' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Quote Text (displayed in highlighted box)</label>
              <textarea
                value={formData.quote_text}
                onChange={(e) => setFormData(prev => ({ ...prev, quote_text: e.target.value }))}
                style={textareaStyle}
                placeholder="Enter an inspiring quote..."
              />
            </div>
          )}

          {/* Sub Sections (Overview tab) */}
          {activeTab === 'overview' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Service Sections (with images)</label>
              {formData.sub_sections.map((section, index) => (
                <div 
                  key={index} 
                  style={{ 
                    border: '1px solid #E5E7EB', borderRadius: '12px', 
                    padding: '16px', marginBottom: '12px', background: '#FAFAFA' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>Section {index + 1}</span>
                    <button style={removeButtonStyle} onClick={() => removeSubSection(index)}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Section Image</label>
                    <input
                      type="text"
                      value={section.image || ''}
                      onChange={(e) => updateSubSection(index, 'image', e.target.value)}
                      style={inputStyle}
                      placeholder="Image URL"
                    />
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Title</label>
                    <input
                      type="text"
                      value={section.title || ''}
                      onChange={(e) => updateSubSection(index, 'title', e.target.value)}
                      style={inputStyle}
                      placeholder="e.g., Gynecology"
                    />
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Description</label>
                    <textarea
                      value={section.description || ''}
                      onChange={(e) => updateSubSection(index, 'description', e.target.value)}
                      style={{ ...textareaStyle, minHeight: '80px' }}
                      placeholder="Section description..."
                    />
                  </div>
                  
                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Image Position</label>
                    <select
                      value={section.position || 'left'}
                      onChange={(e) => updateSubSection(index, 'position', e.target.value)}
                      style={inputStyle}
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              ))}
              <button style={addButtonStyle} onClick={addSubSection}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Section
              </button>
            </div>
          )}

          {/* Sidebar Items (for services tabs) */}
          {(activeTab === 'opd_services' || activeTab === 'inpatient_services' || activeTab === 'investigations') && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Sidebar Menu Items</label>
                {formData.sidebar_items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateSidebarItem(index, e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="e.g., Vaginal Ultrasound"
                    />
                    <button style={removeButtonStyle} onClick={() => removeSidebarItem(index)}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button style={addButtonStyle} onClick={addSidebarItem}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Sidebar Item
                </button>
              </div>

              {/* Service List */}
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Service Categories</label>
                {formData.service_list.map((service, serviceIndex) => (
                  <div 
                    key={serviceIndex} 
                    style={{ 
                      border: '1px solid #E5E7EB', borderRadius: '12px', 
                      padding: '16px', marginBottom: '12px', background: '#FAFAFA' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <input
                        type="text"
                        value={service.title || ''}
                        onChange={(e) => updateServiceItem(serviceIndex, 'title', e.target.value)}
                        style={{ ...inputStyle, flex: 1, marginRight: '8px', fontWeight: 600 }}
                        placeholder="Category title (e.g., Special care throughout the motherhood journey)"
                      />
                      <button style={removeButtonStyle} onClick={() => removeServiceItem(serviceIndex)}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <label style={{ ...labelStyle, fontSize: '12px' }}>List Items</label>
                    {(service.items || []).map((item, itemIndex) => (
                      <div key={itemIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ padding: '12px 0', color: '#6B7280' }}>•</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateServiceListItem(serviceIndex, itemIndex, e.target.value)}
                          style={{ ...inputStyle, flex: 1 }}
                          placeholder="Service item"
                        />
                        <button 
                          style={{ ...removeButtonStyle, padding: '8px 12px' }} 
                          onClick={() => removeServiceListItem(serviceIndex, itemIndex)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button 
                      style={{ ...addButtonStyle, fontSize: '12px', padding: '6px 12px' }} 
                      onClick={() => addServiceListItem(serviceIndex)}
                    >
                      + Add Item
                    </button>
                  </div>
                ))}
                <button style={addButtonStyle} onClick={addServiceItem}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Service Category
                </button>
              </div>
            </>
          )}

          {/* Active Toggle */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                style={{ width: '20px', height: '20px', marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>Tab is active</span>
            </label>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              style={{ ...saveButtonStyle, opacity: saving ? 0.7 : 1 }} 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </AdminLayout>
  );
};

export default AdminDepartmentTabs;
