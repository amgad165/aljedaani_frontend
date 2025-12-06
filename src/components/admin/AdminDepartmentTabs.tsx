import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { type Department, type DepartmentTabContent, type SubSection, type ServiceListItem, type SidebarItem } from '../../services/departmentsService';

type TabType = 'overview' | 'opd_services' | 'inpatient_services' | 'investigations';

const tabLabels: Record<TabType, string> = {
  overview: 'Overview',
  opd_services: 'OPD Services',
  inpatient_services: 'Inpatient Services',
  investigations: 'Investigations',
};

// Extended SubSection type to include file for upload
interface SubSectionWithFile extends SubSection {
  imageFile?: File | null;
  imagePreview?: string;
}

// Extended SidebarItem type to include file for upload
interface SidebarItemWithFile extends SidebarItem {
  imageFile?: File | null;
  imagePreview?: string;
}

const AdminDepartmentTabs: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const subSectionFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const sidebarItemFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [tabContents, setTabContents] = useState<DepartmentTabContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Track which sidebar item is expanded for editing
  const [expandedSidebarItem, setExpandedSidebarItem] = useState<number | null>(null);

  // Image file state for main image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Form state for current tab
  const [formData, setFormData] = useState<{
    main_image: string;
    main_description: string;
    quote_text: string;
    sub_sections: SubSectionWithFile[];
    service_list: ServiceListItem[];
    sidebar_items: SidebarItemWithFile[];
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

  const getAuthHeaders = (isFormData: boolean = false) => {
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

  const fetchData = useCallback(async () => {
    if (!departmentId) return;
    
    try {
      setLoading(true);
      
      const deptResponse = await fetch(`${API_BASE_URL}/departments/${departmentId}`);
      const deptResult = await deptResponse.json();
      if (deptResult.success) {
        setDepartment(deptResult.data);
      }
      
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
      // Convert sidebar_items to include file fields
      // Handle migration from old/corrupted formats to new format (array of objects)
      let sidebarItemsWithFiles: SidebarItemWithFile[] = [];
      const rawSidebarItems = currentContent.sidebar_items;
      
      if (rawSidebarItems && Array.isArray(rawSidebarItems)) {
        sidebarItemsWithFiles = rawSidebarItems
          .map((item, idx) => {
            // Check if it's a string
            if (typeof item === 'string') {
              // Old format - convert string to new object format
              return {
                id: `migrated_${idx}_${Date.now()}`,
                title: item,
                image: '',
                description: '',
                service_list: [],
                sort_order: idx,
                imageFile: null,
                imagePreview: ''
              };
            }
            
            // Check if it's an array (corrupted - array of characters)
            if (Array.isArray(item)) {
              // This is a corrupted item where a string became an array of chars
              const title = item.join('');
              return {
                id: `recovered_${idx}_${Date.now()}`,
                title: title,
                image: '',
                description: '',
                service_list: [],
                sort_order: idx,
                imageFile: null,
                imagePreview: ''
              };
            }
            
            // Check if it's an object
            if (typeof item === 'object' && item !== null) {
              // Check if it has numeric string keys (corrupted from spreading a string)
              // These would be keys like "0", "1", "2" etc.
              const hasNumericKeys = Object.keys(item).some(key => /^\d+$/.test(key));
              
              // Clean the item - only keep valid SidebarItem properties
              const cleanItem: SidebarItemWithFile = {
                id: item.id || `item_${idx}_${Date.now()}`,
                title: item.title || '',
                image: item.image || '',
                description: item.description || '',
                service_list: Array.isArray(item.service_list) ? item.service_list : [],
                sort_order: item.sort_order ?? idx,
                imageFile: null,
                imagePreview: item.image || ''
              };
              
              // If we had numeric keys but no title, try to reconstruct from those keys
              if (hasNumericKeys && !cleanItem.title) {
                const chars = Object.keys(item)
                  .filter(key => /^\d+$/.test(key))
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .map(key => (item as unknown as Record<string, string>)[key]);
                cleanItem.title = chars.join('');
              }
              
              return cleanItem;
            }
            
            // Fallback for unexpected data
            return {
              id: `fallback_${idx}_${Date.now()}`,
              title: String(item),
              image: '',
              description: '',
              service_list: [],
              sort_order: idx,
              imageFile: null,
              imagePreview: ''
            };
          })
          // Filter out items with empty titles
          .filter(item => item.title.trim() !== '');
      }
      
      setFormData({
        main_image: currentContent.main_image || '',
        main_description: currentContent.main_description || '',
        quote_text: currentContent.quote_text || '',
        sub_sections: (currentContent.sub_sections || []).map(s => ({
          ...s,
          imageFile: null,
          imagePreview: s.image || ''
        })),
        service_list: currentContent.service_list || [],
        sidebar_items: sidebarItemsWithFiles,
        is_active: currentContent.is_active,
      });
      setImageFile(null);
      setImagePreview(currentContent.main_image || '');
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
      setImageFile(null);
      setImagePreview('');
    }
    setExpandedSidebarItem(null);
  }, [activeTab, tabContents]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Main image handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, main_image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Generate unique ID for new sidebar items
  const generateId = () => `sidebar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleSave = async () => {
    if (!departmentId) return;
    
    setSaving(true);
    try {
      const submitData = new FormData();
      submitData.append('tab_type', activeTab);
      submitData.append('main_description', formData.main_description || '');
      submitData.append('quote_text', formData.quote_text || '');
      
      // Prepare sub_sections - strip out File objects
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const subSectionsForJson = formData.sub_sections.map(({ imageFile: _f, imagePreview: _p, ...rest }) => rest);
      submitData.append('sub_sections', JSON.stringify(subSectionsForJson));
      
      submitData.append('service_list', JSON.stringify(formData.service_list || []));
      
      // Prepare sidebar_items - strip out File objects
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const sidebarItemsForJson = formData.sidebar_items.map(({ imageFile: _f, imagePreview: _p, ...rest }) => rest);
      submitData.append('sidebar_items', JSON.stringify(sidebarItemsForJson));
      
      submitData.append('is_active', formData.is_active ? '1' : '0');

      // Add main image file
      if (imageFile) {
        submitData.append('main_image', imageFile);
      }

      // Add sub-section image files
      formData.sub_sections.forEach((section, index) => {
        if (section.imageFile) {
          submitData.append(`sub_section_images[${index}]`, section.imageFile);
        }
      });

      // Add sidebar item image files
      formData.sidebar_items.forEach((item, index) => {
        if (item.imageFile) {
          submitData.append(`sidebar_item_images[${index}]`, item.imageFile);
        }
      });

      const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/tabs`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: submitData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
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
        
        // Update form data with new URLs from server
        setFormData(prev => ({ 
          ...prev, 
          main_image: updatedContent.main_image || '',
          sub_sections: (updatedContent.sub_sections || []).map((s: SubSection) => ({
            ...s, imageFile: null, imagePreview: s.image || ''
          })),
          sidebar_items: (updatedContent.sidebar_items || []).map((item: SidebarItem) => ({
            ...item, imageFile: null, imagePreview: item.image || ''
          }))
        }));
        setImagePreview(updatedContent.main_image || '');
        setImageFile(null);
        
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
      sub_sections: [...prev.sub_sections, { image: '', title: '', description: '', position: 'left', imageFile: null, imagePreview: '' }],
    }));
  };

  const updateSubSection = (index: number, field: keyof SubSection, value: string) => {
    setFormData(prev => {
      const newSubSections = [...prev.sub_sections];
      newSubSections[index] = { ...newSubSections[index], [field]: value };
      return { ...prev, sub_sections: newSubSections };
    });
  };

  const handleSubSectionFileChange = (index: number, file: File | null) => {
    setFormData(prev => {
      const newSubSections = [...prev.sub_sections];
      if (file) {
        newSubSections[index] = { ...newSubSections[index], imageFile: file, imagePreview: URL.createObjectURL(file) };
      } else {
        newSubSections[index] = { ...newSubSections[index], imageFile: null, imagePreview: '', image: '' };
      }
      return { ...prev, sub_sections: newSubSections };
    });
  };

  const removeSubSection = (index: number) => {
    setFormData(prev => ({ ...prev, sub_sections: prev.sub_sections.filter((_, i) => i !== index) }));
  };

  // Sidebar item management (NEW - with full content)
  const addSidebarItem = () => {
    const newItem: SidebarItemWithFile = {
      id: generateId(),
      title: '',
      image: '',
      description: '',
      service_list: [],
      sort_order: formData.sidebar_items.length,
      imageFile: null,
      imagePreview: ''
    };
    setFormData(prev => ({ ...prev, sidebar_items: [...prev.sidebar_items, newItem] }));
    setExpandedSidebarItem(formData.sidebar_items.length); // Expand the new item
  };

  const updateSidebarItem = (index: number, field: keyof SidebarItem, value: string | ServiceListItem[] | number) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, sidebar_items: newItems };
    });
  };

  const handleSidebarItemFileChange = (index: number, file: File | null) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      if (file) {
        newItems[index] = { ...newItems[index], imageFile: file, imagePreview: URL.createObjectURL(file) };
      } else {
        newItems[index] = { ...newItems[index], imageFile: null, imagePreview: '', image: '' };
      }
      return { ...prev, sidebar_items: newItems };
    });
  };

  const removeSidebarItem = (index: number) => {
    setFormData(prev => ({ ...prev, sidebar_items: prev.sidebar_items.filter((_, i) => i !== index) }));
    if (expandedSidebarItem === index) setExpandedSidebarItem(null);
  };

  // Sidebar item service list management
  const addSidebarItemService = (sidebarIndex: number) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      const currentServices = newItems[sidebarIndex].service_list || [];
      newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: [...currentServices, { title: '', items: [''] }] };
      return { ...prev, sidebar_items: newItems };
    });
  };

  const updateSidebarItemService = (sidebarIndex: number, serviceIndex: number, field: keyof ServiceListItem, value: string | string[]) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      const services = [...(newItems[sidebarIndex].service_list || [])];
      services[serviceIndex] = { ...services[serviceIndex], [field]: value };
      newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: services };
      return { ...prev, sidebar_items: newItems };
    });
  };

  const removeSidebarItemService = (sidebarIndex: number, serviceIndex: number) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      const services = (newItems[sidebarIndex].service_list || []).filter((_, i) => i !== serviceIndex);
      newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: services };
      return { ...prev, sidebar_items: newItems };
    });
  };

  const addSidebarItemServiceListItem = (sidebarIndex: number, serviceIndex: number) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      const services = [...(newItems[sidebarIndex].service_list || [])];
      const items = [...(services[serviceIndex].items || []), ''];
      services[serviceIndex] = { ...services[serviceIndex], items };
      newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: services };
      return { ...prev, sidebar_items: newItems };
    });
  };

  const updateSidebarItemServiceListItem = (sidebarIndex: number, serviceIndex: number, itemIndex: number, value: string) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      const services = [...(newItems[sidebarIndex].service_list || [])];
      const items = [...(services[serviceIndex].items || [])];
      items[itemIndex] = value;
      services[serviceIndex] = { ...services[serviceIndex], items };
      newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: services };
      return { ...prev, sidebar_items: newItems };
    });
  };

  const removeSidebarItemServiceListItem = (sidebarIndex: number, serviceIndex: number, itemIndex: number) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      const services = [...(newItems[sidebarIndex].service_list || [])];
      const items = (services[serviceIndex].items || []).filter((_, i) => i !== itemIndex);
      services[serviceIndex] = { ...services[serviceIndex], items };
      newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: services };
      return { ...prev, sidebar_items: newItems };
    });
  };

  // Styles
  const containerStyle: React.CSSProperties = { padding: '24px', fontFamily: "'Nunito', sans-serif" };
  const headerStyle: React.CSSProperties = { marginBottom: '24px' };
  const titleStyle: React.CSSProperties = { fontSize: '28px', fontWeight: 700, color: '#061F42', margin: 0 };
  const backButtonStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '14px', cursor: 'pointer', background: 'none', border: 'none', marginBottom: '16px' };
  const tabContainerStyle: React.CSSProperties = { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' };
  const tabStyle = (isActive: boolean): React.CSSProperties => ({ padding: '12px 20px', background: isActive ? '#15C9FA' : '#E5E7EB', color: isActive ? 'white' : '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' });
  const cardStyle: React.CSSProperties = { background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '24px' };
  const sectionTitleStyle: React.CSSProperties = { fontSize: '18px', fontWeight: 700, color: '#061F42', marginBottom: '16px', marginTop: '0' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#061F42', marginBottom: '8px' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: '120px', resize: 'vertical' };
  const addButtonStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#E8F8FF', color: '#15C9FA', fontWeight: 600, fontSize: '14px', border: '1px dashed #15C9FA', borderRadius: '8px', cursor: 'pointer' };
  const removeButtonStyle: React.CSSProperties = { padding: '8px', backgroundColor: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '8px', cursor: 'pointer' };
  const saveButtonStyle: React.CSSProperties = { padding: '14px 28px', backgroundColor: '#15C9FA', color: 'white', fontWeight: 600, border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px' };
  const notificationStyle: React.CSSProperties = { position: 'fixed', top: '20px', right: '20px', padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 2000 };
  const sidebarItemCardStyle = (isExpanded: boolean): React.CSSProperties => ({ border: isExpanded ? '2px solid #15C9FA' : '1px solid #E5E7EB', borderRadius: '12px', marginBottom: '12px', background: isExpanded ? '#F0FDFF' : '#FAFAFA', overflow: 'hidden' });
  const sidebarItemHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', cursor: 'pointer' };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#15C9FA', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </AdminLayout>
    );
  }

  // Render image upload section (reusable)
  const renderImageUpload = (
    preview: string, 
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    onRemove: () => void, 
    inputRef: React.RefObject<HTMLInputElement | null> | ((el: HTMLInputElement | null) => void),
    size: 'large' | 'small' = 'large'
  ) => {
    const maxW = size === 'large' ? '300px' : '150px';
    const maxH = size === 'large' ? '200px' : '100px';
    const padding = size === 'large' ? '20px' : '12px';
    
    return (
      <div style={{ border: '2px dashed #E5E7EB', borderRadius: '12px', padding, textAlign: 'center', backgroundColor: '#FAFAFA' }}>
        {preview ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={preview} alt="Preview" style={{ maxWidth: maxW, maxHeight: maxH, borderRadius: '8px', objectFit: 'cover' }} />
            <button type="button" onClick={onRemove} style={{ position: 'absolute', top: '-10px', right: '-10px', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EF4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>×</button>
          </div>
        ) : (
          <div>
            <svg width={size === 'large' ? '48' : '32'} height={size === 'large' ? '48' : '32'} fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" style={{ margin: '0 auto 12px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p style={{ color: '#6B7280', marginBottom: '12px', fontSize: size === 'large' ? '14px' : '12px' }}>Click to upload</p>
          </div>
        )}
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={onFileChange}
          style={{ display: preview ? 'none' : 'block', margin: '0 auto', cursor: 'pointer' }}
        />
        {preview && (
          <button type="button" onClick={() => {
            const ref = inputRef as React.RefObject<HTMLInputElement>;
            ref.current?.click();
          }} style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#E5E7EB', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
            Change Image
          </button>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div style={containerStyle}>
        {notification && (
          <div style={{ ...notificationStyle, backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444', color: 'white' }}>
            <span style={{ fontWeight: 500 }}>{notification.message}</span>
          </div>
        )}

        <div style={headerStyle}>
          <button style={backButtonStyle} onClick={() => navigate('/admin/departments')}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Departments
          </button>
          <h1 style={titleStyle}>{department?.name || 'Department'} - Tab Content Management</h1>
          <p style={{ color: '#6B7280', marginTop: '4px' }}>Manage content for each tab on the department details page</p>
        </div>

        <div style={tabContainerStyle}>
          {(Object.keys(tabLabels) as TabType[]).map((tab) => (
            <button key={tab} style={tabStyle(activeTab === tab)} onClick={() => setActiveTab(tab)}>
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>{tabLabels[activeTab]} Content</h3>

          {/* Main Image */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Main Image</label>
            {renderImageUpload(imagePreview, handleFileChange, handleRemoveImage, fileInputRef)}
            {imageFile && <p style={{ marginTop: '8px', fontSize: '12px', color: '#6B7280' }}>Selected: {imageFile.name}</p>}
          </div>

          {/* Main Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Main Description</label>
            <textarea value={formData.main_description} onChange={(e) => setFormData(prev => ({ ...prev, main_description: e.target.value }))} style={textareaStyle} placeholder="Enter the main description text..." />
          </div>

          {/* Main Service List (for OPD/Inpatient/Investigations tabs - shown in Overview sidebar item) */}
          {(activeTab === 'opd_services' || activeTab === 'inpatient_services' || activeTab === 'investigations') && (
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Main Service List (displayed when "Overview" is selected in sidebar)</label>
              <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '16px' }}>
                These services are shown below the main image when the "Overview" item is selected in the sidebar.
              </p>
              
              {formData.service_list.map((service, serviceIndex) => (
                <div key={serviceIndex} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginBottom: '12px', background: '#FAFAFA' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      value={service.title || ''}
                      onChange={(e) => {
                        const newServiceList = [...formData.service_list];
                        newServiceList[serviceIndex] = { ...newServiceList[serviceIndex], title: e.target.value };
                        setFormData(prev => ({ ...prev, service_list: newServiceList }));
                      }}
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="Service category title (e.g., Special care throughout the motherhood journey, including:)"
                    />
                    <button 
                      style={removeButtonStyle} 
                      onClick={() => {
                        const newServiceList = formData.service_list.filter((_, i) => i !== serviceIndex);
                        setFormData(prev => ({ ...prev, service_list: newServiceList }));
                      }}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <label style={{ ...labelStyle, fontSize: '12px' }}>Service Items (bullet points)</label>
                  {(service.items || []).map((item, itemIndex) => (
                    <div key={itemIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', paddingLeft: '12px' }}>
                      <span style={{ color: '#6B7280', padding: '10px 0' }}>•</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newServiceList = [...formData.service_list];
                          const newItems = [...(newServiceList[serviceIndex].items || [])];
                          newItems[itemIndex] = e.target.value;
                          newServiceList[serviceIndex] = { ...newServiceList[serviceIndex], items: newItems };
                          setFormData(prev => ({ ...prev, service_list: newServiceList }));
                        }}
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="Service item"
                      />
                      <button 
                        style={{ ...removeButtonStyle, padding: '8px' }} 
                        onClick={() => {
                          const newServiceList = [...formData.service_list];
                          const newItems = (newServiceList[serviceIndex].items || []).filter((_, i) => i !== itemIndex);
                          newServiceList[serviceIndex] = { ...newServiceList[serviceIndex], items: newItems };
                          setFormData(prev => ({ ...prev, service_list: newServiceList }));
                        }}
                      >×</button>
                    </div>
                  ))}
                  <button 
                    style={{ ...addButtonStyle, fontSize: '12px', padding: '6px 12px', marginLeft: '12px' }} 
                    onClick={() => {
                      const newServiceList = [...formData.service_list];
                      const newItems = [...(newServiceList[serviceIndex].items || []), ''];
                      newServiceList[serviceIndex] = { ...newServiceList[serviceIndex], items: newItems };
                      setFormData(prev => ({ ...prev, service_list: newServiceList }));
                    }}
                  >
                    + Add Item
                  </button>
                </div>
              ))}
              
              <button 
                style={addButtonStyle} 
                onClick={() => {
                  setFormData(prev => ({ 
                    ...prev, 
                    service_list: [...prev.service_list, { title: '', items: [''] }] 
                  }));
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Service Category
              </button>
            </div>
          )}

          {/* Quote (Overview tab only) */}
          {activeTab === 'overview' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Quote Text (displayed in highlighted box)</label>
              <textarea value={formData.quote_text} onChange={(e) => setFormData(prev => ({ ...prev, quote_text: e.target.value }))} style={textareaStyle} placeholder="Enter an inspiring quote..." />
            </div>
          )}

          {/* Sub Sections (Overview tab) */}
          {activeTab === 'overview' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Service Sections (with images)</label>
              {formData.sub_sections.map((section, index) => (
                <div key={index} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginBottom: '12px', background: '#FAFAFA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>Section {index + 1}</span>
                    <button style={removeButtonStyle} onClick={() => removeSubSection(index)}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Section Image</label>
                    {renderImageUpload(
                      section.imagePreview || section.image || '',
                      (e) => handleSubSectionFileChange(index, e.target.files?.[0] || null),
                      () => handleSubSectionFileChange(index, null),
                      (el) => { subSectionFileRefs.current[index] = el; },
                      'small'
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Title</label>
                    <input type="text" value={section.title || ''} onChange={(e) => updateSubSection(index, 'title', e.target.value)} style={inputStyle} placeholder="e.g., Gynecology" />
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Description</label>
                    <textarea value={section.description || ''} onChange={(e) => updateSubSection(index, 'description', e.target.value)} style={{ ...textareaStyle, minHeight: '80px' }} placeholder="Section description..." />
                  </div>
                  
                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Image Position</label>
                    <select value={section.position || 'left'} onChange={(e) => updateSubSection(index, 'position', e.target.value)} style={inputStyle}>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              ))}
              <button style={addButtonStyle} onClick={addSubSection}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Section
              </button>
            </div>
          )}

          {/* Sidebar Items with Content (for services tabs) */}
          {(activeTab === 'opd_services' || activeTab === 'inpatient_services' || activeTab === 'investigations') && (
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Sidebar Menu Items (each with its own content)</label>
              <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '16px' }}>
                Each sidebar item acts as a tab. Click to expand and add content (image, description, services).
              </p>
              
              {formData.sidebar_items.map((item, index) => (
                <div key={item.id || index} style={sidebarItemCardStyle(expandedSidebarItem === index)}>
                  {/* Header - Always visible */}
                  <div style={sidebarItemHeaderStyle} onClick={() => setExpandedSidebarItem(expandedSidebarItem === index ? null : index)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6B7280" style={{ transform: expandedSidebarItem === index ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => { e.stopPropagation(); updateSidebarItem(index, 'title', e.target.value); }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ ...inputStyle, flex: 1, padding: '8px 12px' }}
                        placeholder="Item title (e.g., Vaginal Ultrasound)"
                      />
                    </div>
                    <button style={{ ...removeButtonStyle, marginLeft: '8px' }} onClick={(e) => { e.stopPropagation(); removeSidebarItem(index); }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedSidebarItem === index && (
                    <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid #E5E7EB' }}>
                      {/* Item Image */}
                      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                        <label style={{ ...labelStyle, fontSize: '12px' }}>Item Image</label>
                        {renderImageUpload(
                          item.imagePreview || item.image || '',
                          (e) => handleSidebarItemFileChange(index, e.target.files?.[0] || null),
                          () => handleSidebarItemFileChange(index, null),
                          (el) => { sidebarItemFileRefs.current[index] = el; },
                          'small'
                        )}
                        {item.imageFile && <p style={{ marginTop: '4px', fontSize: '11px', color: '#6B7280' }}>Selected: {item.imageFile.name}</p>}
                      </div>
                      
                      {/* Item Description */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ ...labelStyle, fontSize: '12px' }}>Description</label>
                        <textarea
                          value={item.description || ''}
                          onChange={(e) => updateSidebarItem(index, 'description', e.target.value)}
                          style={{ ...textareaStyle, minHeight: '80px' }}
                          placeholder="Description for this service..."
                        />
                      </div>
                      
                      {/* Item Service Categories */}
                      <div>
                        <label style={{ ...labelStyle, fontSize: '12px' }}>Service Categories</label>
                        {(item.service_list || []).map((service, serviceIndex) => (
                          <div key={serviceIndex} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', marginBottom: '8px', background: 'white' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <input
                                type="text"
                                value={service.title || ''}
                                onChange={(e) => updateSidebarItemService(index, serviceIndex, 'title', e.target.value)}
                                style={{ ...inputStyle, flex: 1, padding: '8px 12px', fontSize: '13px' }}
                                placeholder="Category title"
                              />
                              <button style={{ ...removeButtonStyle, padding: '6px' }} onClick={() => removeSidebarItemService(index, serviceIndex)}>×</button>
                            </div>
                            
                            {(service.items || []).map((listItem, itemIndex) => (
                              <div key={itemIndex} style={{ display: 'flex', gap: '8px', marginBottom: '4px', paddingLeft: '12px' }}>
                                <span style={{ color: '#6B7280', padding: '6px 0' }}>•</span>
                                <input
                                  type="text"
                                  value={listItem}
                                  onChange={(e) => updateSidebarItemServiceListItem(index, serviceIndex, itemIndex, e.target.value)}
                                  style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: '12px' }}
                                  placeholder="Service item"
                                />
                                <button style={{ ...removeButtonStyle, padding: '4px 8px', fontSize: '12px' }} onClick={() => removeSidebarItemServiceListItem(index, serviceIndex, itemIndex)}>×</button>
                              </div>
                            ))}
                            <button style={{ ...addButtonStyle, fontSize: '11px', padding: '4px 10px', marginLeft: '12px' }} onClick={() => addSidebarItemServiceListItem(index, serviceIndex)}>+ Add Item</button>
                          </div>
                        ))}
                        <button style={{ ...addButtonStyle, fontSize: '12px', padding: '6px 12px' }} onClick={() => addSidebarItemService(index)}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Add Service Category
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <button style={addButtonStyle} onClick={addSidebarItem}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Sidebar Item
              </button>
            </div>
          )}

          {/* Active Toggle */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              <span style={{ fontSize: '14px', color: '#374151' }}>Tab is active</span>
            </label>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ ...saveButtonStyle, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
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
