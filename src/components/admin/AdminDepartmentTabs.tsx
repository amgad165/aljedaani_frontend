import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { type Department, type DepartmentTabContent, type SubSection, type ServiceListItem, type SidebarItem } from '../../services/departmentsService';
import { getTranslatedField } from '../../utils/localeHelpers';

type TabType = 'overview' | 'opd_services' | 'inpatient_services' | 'investigations';

const tabLabels: Record<TabType, string> = {
  overview: 'Overview',
  opd_services: 'OPD Services',
  inpatient_services: 'Inpatient Services',
  investigations: 'Investigations',
};

// Extended SubSection type to include file for upload and bilingual fields
interface SubSectionWithFile {
  image?: string;
  mobile_image?: string;
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  position?: 'left' | 'right';
  imageFile?: File | null;
  imagePreview?: string;
}

// Bilingual item type
interface BilingualItem {
  en: string;
  ar: string;
}

// Extended ServiceListItem type with bilingual title and items
interface ServiceListItemWithLang {
  title_en?: string;
  title_ar?: string;
  items?: BilingualItem[];
}

// Extended SidebarItem type to include file for upload and bilingual fields
interface SidebarItemWithFile {
  id: string;
  title_en: string;
  title_ar: string;
  image?: string;
  mobile_image?: string;
  description_en?: string;
  description_ar?: string;
  service_list?: ServiceListItemWithLang[];
  sort_order?: number;
  imageFile?: File | null;
  imagePreview?: string;
}

const AdminDepartmentTabs: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileFileInputRef = useRef<HTMLInputElement | null>(null);
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
  const [activeFormTab, setActiveFormTab] = useState<'en' | 'ar'>('en');

  // Image file state for main image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Image file state for mobile image
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [mobileImagePreview, setMobileImagePreview] = useState<string>('');

  // Form state for current tab
  const [formData, setFormData] = useState<{
    main_image: string;
    mobile_image: string;
    main_description_en: string;
    main_description_ar: string;
    quote_text_en: string;
    quote_text_ar: string;
    sub_sections: SubSectionWithFile[];
    service_list: ServiceListItemWithLang[];
    sidebar_items: SidebarItemWithFile[];
    is_active: boolean;
  }>({
    main_image: '',
    mobile_image: '',
    main_description_en: '',
    main_description_ar: '',
    quote_text_en: '',
    quote_text_ar: '',
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
      // Parse JSON objects for translatable fields
      const mainDescObj = (typeof currentContent.main_description === 'object' && currentContent.main_description !== null) 
        ? currentContent.main_description 
        : { en: currentContent.main_description || '', ar: '' };
      const quoteTextObj = (typeof currentContent.quote_text === 'object' && currentContent.quote_text !== null) 
        ? currentContent.quote_text 
        : { en: currentContent.quote_text || '', ar: '' };
      
      // Convert sidebar_items to include file fields and bilingual support
      let sidebarItemsWithFiles: SidebarItemWithFile[] = [];
      let rawSidebarItems = currentContent.sidebar_items;
      
      // Handle old format where spatie wrapped it: {en: [...]}
      if (rawSidebarItems && typeof rawSidebarItems === 'object' && !Array.isArray(rawSidebarItems)) {
        rawSidebarItems = (rawSidebarItems as any).en || [];
      }
      
      if (rawSidebarItems && Array.isArray(rawSidebarItems)) {
        sidebarItemsWithFiles = rawSidebarItems
          .map((item, idx) => {
            // Check if it's a string (old format)
            if (typeof item === 'string') {
              return {
                id: `migrated_${idx}_${Date.now()}`,
                title_en: item,
                title_ar: '',
                image: '',
                description_en: '',
                description_ar: '',
                service_list: [],
                sort_order: idx,
                imageFile: null,
                imagePreview: ''
              };
            }
            
            // Check if it's an array (corrupted)
            if (Array.isArray(item)) {
              const title = item.join('');
              return {
                id: `recovered_${idx}_${Date.now()}`,
                title_en: title,
                title_ar: '',
                image: '',
                description_en: '',
                description_ar: '',
                service_list: [],
                sort_order: idx,
                imageFile: null,
                imagePreview: ''
              };
            }
            
            // Check if it's an object
            if (typeof item === 'object' && item !== null) {
              const hasNumericKeys = Object.keys(item).some(key => /^\d+$/.test(key));
              
              // Parse bilingual fields
              const titleObj = (typeof item.title === 'object' && item.title !== null) 
                ? item.title 
                : { en: item.title || '', ar: '' };
              const descObj = (typeof item.description === 'object' && item.description !== null) 
                ? item.description 
                : { en: item.description || '', ar: '' };
              
              const cleanItem: SidebarItemWithFile = {
                id: item.id || `item_${idx}_${Date.now()}`,
                title_en: titleObj.en || '',
                title_ar: titleObj.ar || '',
                image: item.image || '',
                description_en: descObj.en || '',
                description_ar: descObj.ar || '',
                service_list: Array.isArray(item.service_list) ? item.service_list.map((s: ServiceListItem) => {
                  const sTitleObj = (typeof s.title === 'object' && s.title !== null) 
                    ? s.title 
                    : { en: s.title || '', ar: '' };
                  const parsedItems = (s.items || []).map(itm => {
                    if (typeof itm === 'object' && itm !== null && 'en' in itm) {
                      return { en: (itm as any).en || '', ar: (itm as any).ar || '' };
                    }
                    return { en: String(itm), ar: '' };
                  });
                  return {
                    title_en: sTitleObj.en || '',
                    title_ar: sTitleObj.ar || '',
                    items: parsedItems
                  };
                }) : [],
                sort_order: item.sort_order ?? idx,
                imageFile: null,
                imagePreview: item.image || ''
              };
              
              // If we had numeric keys but no title, try to reconstruct
              if (hasNumericKeys && !cleanItem.title_en) {
                const chars = Object.keys(item)
                  .filter(key => /^\d+$/.test(key))
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .map(key => (item as unknown as Record<string, string>)[key]);
                cleanItem.title_en = chars.join('');
              }
              
              return cleanItem;
            }
            
            // Fallback for unexpected data
            return {
              id: `fallback_${idx}_${Date.now()}`,
              title_en: String(item),
              title_ar: '',
              image: '',
              description_en: '',
              description_ar: '',
              service_list: [],
              sort_order: idx,
              imageFile: null,
              imagePreview: ''
            };
          })
          .filter(item => (item.title_en || item.title_ar).trim() !== '');
      }
      
      setFormData({
        main_image: currentContent.main_image || '',
        mobile_image: currentContent.mobile_image || '',
        main_description_en: mainDescObj.en || '',
        main_description_ar: mainDescObj.ar || '',
        quote_text_en: quoteTextObj.en || '',
        quote_text_ar: quoteTextObj.ar || '',
        sub_sections: (Array.isArray(currentContent.sub_sections) ? currentContent.sub_sections : []).map(s => {
          const sTitleObj = (typeof s.title === 'object' && s.title !== null) ? s.title : { en: s.title || '', ar: '' };
          const sDescObj = (typeof s.description === 'object' && s.description !== null) ? s.description : { en: s.description || '', ar: '' };
          return {
            image: s.image || '',
            mobile_image: s.mobile_image || '',
            title_en: sTitleObj.en || '',
            title_ar: sTitleObj.ar || '',
            description_en: sDescObj.en || '',
            description_ar: sDescObj.ar || '',
            position: s.position || 'left',
            imageFile: null,
            imagePreview: s.image || ''
          };
        }),
        service_list: (() => {
          let serviceListData = currentContent.service_list;
          // Handle old format where spatie wrapped it: {en: [...]}
          if (serviceListData && typeof serviceListData === 'object' && !Array.isArray(serviceListData)) {
            serviceListData = (serviceListData as any).en || [];
          }
          return (Array.isArray(serviceListData) ? serviceListData : []).map((item: ServiceListItem) => {
            const itemTitleObj = (typeof item.title === 'object' && item.title !== null) ? item.title : { en: item.title || '', ar: '' };
            const parsedItems = (item.items || []).map(itm => {
              if (typeof itm === 'object' && itm !== null && 'en' in itm) {
                return { en: (itm as any).en || '', ar: (itm as any).ar || '' };
              }
              return { en: String(itm), ar: '' };
            });
            return {
              title_en: itemTitleObj.en || '',
              title_ar: itemTitleObj.ar || '',
              items: parsedItems
            };
          });
        })(),
        sidebar_items: sidebarItemsWithFiles,
        is_active: currentContent.is_active,
      });
      setImageFile(null);
      setImagePreview(currentContent.main_image || '');
      setMobileImageFile(null);
      setMobileImagePreview(currentContent.mobile_image || '');
    } else {
      setFormData({
        main_image: '',
        mobile_image: '',
        main_description_en: '',
        main_description_ar: '',
        quote_text_en: '',
        quote_text_ar: '',
        sub_sections: [],
        service_list: [],
        sidebar_items: [],
        is_active: true,
      });
      setImageFile(null);
      setImagePreview('');
      setMobileImageFile(null);
      setMobileImagePreview('');
    }
    setExpandedSidebarItem(null);
    setActiveFormTab('en');
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

  const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMobileImageFile(file);
      setMobileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveMobileImage = () => {
    setMobileImageFile(null);
    setMobileImagePreview('');
    setFormData(prev => ({ ...prev, mobile_image: '' }));
    if (mobileFileInputRef.current) mobileFileInputRef.current.value = '';
  };

  // Generate unique ID for new sidebar items
  const generateId = () => `sidebar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleSave = async () => {
    if (!departmentId) return;
    
    setSaving(true);
    try {
      const submitData = new FormData();
      submitData.append('tab_type', activeTab);
      
      // Build JSON objects for translatable fields
      submitData.append('main_description', JSON.stringify({ en: formData.main_description_en, ar: formData.main_description_ar }));
      submitData.append('quote_text', JSON.stringify({ en: formData.quote_text_en, ar: formData.quote_text_ar }));
      
      // Prepare sub_sections - strip out File objects and build JSON for translatable fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const subSectionsForJson = formData.sub_sections.map(({ imageFile: _f, imagePreview: _p, title_en, title_ar, description_en, description_ar, ...rest }) => ({
        ...rest,
        title: JSON.stringify({ en: title_en, ar: title_ar }),
        description: JSON.stringify({ en: description_en, ar: description_ar })
      }));
      submitData.append('sub_sections', JSON.stringify(subSectionsForJson));
      
      // Prepare service_list with bilingual titles and items
      const serviceListForJson = formData.service_list.map(({ title_en, title_ar, items }) => ({
        title: JSON.stringify({ en: title_en, ar: title_ar }),
        items: (items || []).map(itm => JSON.stringify({ en: itm.en, ar: itm.ar }))
      }));
      submitData.append('service_list', JSON.stringify(serviceListForJson));
      
      // Prepare sidebar_items - strip out File objects and build JSON for translatable fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const sidebarItemsForJson = formData.sidebar_items.map(({ imageFile: _f, imagePreview: _p, title_en, title_ar, description_en, description_ar, service_list, ...rest }) => ({
        ...rest,
        title: JSON.stringify({ en: title_en, ar: title_ar }),
        description: JSON.stringify({ en: description_en, ar: description_ar }),
        service_list: (service_list || []).map(({ title_en: sTen, title_ar: sTar, items }) => ({
          title: JSON.stringify({ en: sTen, ar: sTar }),
          items: (items || []).map(itm => JSON.stringify({ en: itm.en, ar: itm.ar }))
        }))
      }));
      submitData.append('sidebar_items', JSON.stringify(sidebarItemsForJson));
      
      submitData.append('is_active', formData.is_active ? '1' : '0');

      // Add main image file
      if (imageFile) {
        submitData.append('main_image', imageFile);
      }

      // Add mobile image file
      if (mobileImageFile) {
        submitData.append('mobile_image', mobileImageFile);
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
        
        // Update form data with new URLs from server - parse bilingual fields
        const mainDescObj = (typeof updatedContent.main_description === 'object' && updatedContent.main_description !== null) 
          ? updatedContent.main_description 
          : { en: updatedContent.main_description || '', ar: '' };
        const quoteTextObj = (typeof updatedContent.quote_text === 'object' && updatedContent.quote_text !== null) 
          ? updatedContent.quote_text 
          : { en: updatedContent.quote_text || '', ar: '' };
        
        setFormData(prev => ({ 
          ...prev, 
          main_image: updatedContent.main_image || '',
          mobile_image: updatedContent.mobile_image || '',
          main_description_en: mainDescObj.en || '',
          main_description_ar: mainDescObj.ar || '',
          quote_text_en: quoteTextObj.en || '',
          quote_text_ar: quoteTextObj.ar || '',
          sub_sections: (Array.isArray(updatedContent.sub_sections) ? updatedContent.sub_sections : []).map((s: SubSection) => {
            const sTitleObj = (typeof s.title === 'object' && s.title !== null) ? s.title : { en: s.title || '', ar: '' };
            const sDescObj = (typeof s.description === 'object' && s.description !== null) ? s.description : { en: s.description || '', ar: '' };
            return {
              image: s.image || '',
              mobile_image: s.mobile_image || '',
              title_en: sTitleObj.en || '',
              title_ar: sTitleObj.ar || '',
              description_en: sDescObj.en || '',
              description_ar: sDescObj.ar || '',
              position: s.position || 'left',
              imageFile: null,
              imagePreview: s.image || ''
            };
          }),
          service_list: (() => {
            let serviceListData = updatedContent.service_list;
            // Handle old format where spatie wrapped it: {en: [...]}
            if (serviceListData && typeof serviceListData === 'object' && !Array.isArray(serviceListData)) {
              serviceListData = serviceListData.en || [];
            }
            return (Array.isArray(serviceListData) ? serviceListData : []).map((item: ServiceListItem) => {
              const itemTitleObj = (typeof item.title === 'object' && item.title !== null) ? item.title : { en: item.title || '', ar: '' };
              const parsedItems = (item.items || []).map(itm => {
                if (typeof itm === 'object' && itm !== null && 'en' in itm) {
                  return { en: (itm as any).en || '', ar: (itm as any).ar || '' };
                }
                return { en: String(itm), ar: '' };
              });
              return {
                title_en: itemTitleObj.en || '',
                title_ar: itemTitleObj.ar || '',
                items: parsedItems
              };
            });
          })(),
          sidebar_items: (() => {
            let sidebarData = updatedContent.sidebar_items;
            // Handle old format where spatie wrapped it: {en: [...]}
            if (sidebarData && typeof sidebarData === 'object' && !Array.isArray(sidebarData)) {
              sidebarData = sidebarData.en || [];
            }
            return (Array.isArray(sidebarData) ? sidebarData : []).map((item: SidebarItem) => {
            const titleObj = (typeof item.title === 'object' && item.title !== null) ? item.title : { en: item.title || '', ar: '' };
            const descObj = (typeof item.description === 'object' && item.description !== null) ? item.description : { en: item.description || '', ar: '' };
            return {
              id: item.id || `item_${Date.now()}`,
              title_en: titleObj.en || '',
              title_ar: titleObj.ar || '',
              image: item.image || '',
              description_en: descObj.en || '',
              description_ar: descObj.ar || '',
              service_list: Array.isArray(item.service_list) ? item.service_list.map((s: ServiceListItem) => {
                const sTitleObj = (typeof s.title === 'object' && s.title !== null) ? s.title : { en: s.title || '', ar: '' };
                const parsedItems = (s.items || []).map(itm => {
                  if (typeof itm === 'object' && itm !== null && 'en' in itm) {
                    return { en: (itm as any).en || '', ar: (itm as any).ar || '' };
                  }
                  return { en: String(itm), ar: '' };
                });
                return {
                  title_en: sTitleObj.en || '',
                  title_ar: sTitleObj.ar || '',
                  items: parsedItems
                };
              }) : [],
              sort_order: item.sort_order ?? 0,
              imageFile: null,
              imagePreview: item.image || ''
            };
          })
          })()
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
      sub_sections: [...prev.sub_sections, { image: '', title_en: '', title_ar: '', description_en: '', description_ar: '', position: 'left', imageFile: null, imagePreview: '' }],
    }));
  };

  const updateSubSection = (index: number, field: string, value: string) => {
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
    if (window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
      setFormData(prev => ({ ...prev, sub_sections: prev.sub_sections.filter((_, i) => i !== index) }));
    }
  };

  // Sidebar item management (NEW - with full content)
  const addSidebarItem = () => {
    const newItem: SidebarItemWithFile = {
      id: generateId(),
      title_en: '',
      title_ar: '',
      image: '',
      description_en: '',
      description_ar: '',
      service_list: [],
      sort_order: formData.sidebar_items.length,
      imageFile: null,
      imagePreview: ''
    };
    setFormData(prev => ({ ...prev, sidebar_items: [...prev.sidebar_items, newItem] }));
    setExpandedSidebarItem(formData.sidebar_items.length); // Expand the new item
  };

  const updateSidebarItem = (index: number, field: string, value: string | ServiceListItemWithLang[] | number) => {
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
    if (window.confirm('Are you sure you want to delete this sidebar item? This action cannot be undone.')) {
      setFormData(prev => ({ ...prev, sidebar_items: prev.sidebar_items.filter((_, i) => i !== index) }));
      if (expandedSidebarItem === index) setExpandedSidebarItem(null);
    }
  };

  const moveSidebarItemUp = (index: number) => {
    if (index === 0) return;
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      // Update sort_order
      newItems.forEach((item, idx) => item.sort_order = idx);
      return { ...prev, sidebar_items: newItems };
    });
    // Update expanded index if needed
    if (expandedSidebarItem === index) setExpandedSidebarItem(index - 1);
    else if (expandedSidebarItem === index - 1) setExpandedSidebarItem(index);
  };

  const moveSidebarItemDown = (index: number) => {
    if (index >= formData.sidebar_items.length - 1) return;
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      // Update sort_order
      newItems.forEach((item, idx) => item.sort_order = idx);
      return { ...prev, sidebar_items: newItems };
    });
    // Update expanded index if needed
    if (expandedSidebarItem === index) setExpandedSidebarItem(index + 1);
    else if (expandedSidebarItem === index + 1) setExpandedSidebarItem(index);
  };

  // Sidebar item service list management
  const addSidebarItemService = (sidebarIndex: number) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      const currentServices = newItems[sidebarIndex].service_list || [];
      newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: [...currentServices, { title_en: '', title_ar: '', items: [{ en: '', ar: '' }] }] };
      return { ...prev, sidebar_items: newItems };
    });
  };

  const updateSidebarItemService = (sidebarIndex: number, serviceIndex: number, field: string, value: string | string[]) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      const services = [...(newItems[sidebarIndex].service_list || [])];
      services[serviceIndex] = { ...services[serviceIndex], [field]: value };
      newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: services };
      return { ...prev, sidebar_items: newItems };
    });
  };

  const removeSidebarItemService = (sidebarIndex: number, serviceIndex: number) => {
    if (window.confirm('Are you sure you want to delete this service category?')) {
      setFormData(prev => {
        const newItems = [...prev.sidebar_items];
        const services = (newItems[sidebarIndex].service_list || []).filter((_, i) => i !== serviceIndex);
        newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: services };
        return { ...prev, sidebar_items: newItems };
      });
    }
  };

  const addSidebarItemServiceListItem = (sidebarIndex: number, serviceIndex: number) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      const services = [...(newItems[sidebarIndex].service_list || [])];
      const items = [...(services[serviceIndex].items || []), { en: '', ar: '' }];
      services[serviceIndex] = { ...services[serviceIndex], items };
      newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: services };
      return { ...prev, sidebar_items: newItems };
    });
  };

  const updateSidebarItemServiceListItem = (sidebarIndex: number, serviceIndex: number, itemIndex: number, field: 'en' | 'ar', value: string) => {
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      const services = [...(newItems[sidebarIndex].service_list || [])];
      const items = [...(services[serviceIndex].items || [])];
      items[itemIndex] = { ...items[itemIndex], [field]: value };
      services[serviceIndex] = { ...services[serviceIndex], items };
      newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: services };
      return { ...prev, sidebar_items: newItems };
    });
  };

  const removeSidebarItemServiceListItem = (sidebarIndex: number, serviceIndex: number, itemIndex: number) => {
    if (window.confirm('Are you sure you want to delete this service item?')) {
      setFormData(prev => {
        const newItems = [...prev.sidebar_items];
        const services = [...(newItems[sidebarIndex].service_list || [])];
        const items = (services[serviceIndex].items || []).filter((_, i) => i !== itemIndex);
        services[serviceIndex] = { ...services[serviceIndex], items };
        newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: services };
        return { ...prev, sidebar_items: newItems };
      });
    }
  };

  const moveSidebarItemServiceUp = (sidebarIndex: number, serviceIndex: number) => {
    if (serviceIndex === 0) return;
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      const services = [...(newItems[sidebarIndex].service_list || [])];
      [services[serviceIndex - 1], services[serviceIndex]] = [services[serviceIndex], services[serviceIndex - 1]];
      newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: services };
      return { ...prev, sidebar_items: newItems };
    });
  };

  const moveSidebarItemServiceDown = (sidebarIndex: number, serviceIndex: number) => {
    const services = formData.sidebar_items[sidebarIndex].service_list || [];
    if (serviceIndex >= services.length - 1) return;
    setFormData(prev => {
      const newItems = [...prev.sidebar_items];
      const servicesArray = [...(newItems[sidebarIndex].service_list || [])];
      [servicesArray[serviceIndex], servicesArray[serviceIndex + 1]] = [servicesArray[serviceIndex + 1], servicesArray[serviceIndex]];
      newItems[sidebarIndex] = { ...newItems[sidebarIndex], service_list: servicesArray };
      return { ...prev, sidebar_items: newItems };
    });
  };

  // Styles
  const containerStyle: React.CSSProperties = { padding: '24px', fontFamily: "'Calibri', 'Segoe UI', sans-serif" };
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
          <h1 style={titleStyle}>{getTranslatedField(department?.name, 'Department')} - Tab Content Management</h1>
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

          {/* Mobile Image */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Mobile Image (Optional)</label>
            {renderImageUpload(mobileImagePreview, handleMobileFileChange, handleRemoveMobileImage, mobileFileInputRef)}
            {mobileImageFile && <p style={{ marginTop: '8px', fontSize: '12px', color: '#6B7280' }}>Selected: {mobileImageFile.name}</p>}
          </div>

          {/* Language Tabs */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #E5E7EB' }}>
            <button
              type="button"
              onClick={() => setActiveFormTab('en')}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                color: activeFormTab === 'en' ? '#15C9FA' : '#6B7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeFormTab === 'en' ? '3px solid #15C9FA' : '3px solid transparent',
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
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                color: activeFormTab === 'ar' ? '#15C9FA' : '#6B7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeFormTab === 'ar' ? '3px solid #15C9FA' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              العربية
            </button>
          </div>

          {/* Main Description */}
          {activeFormTab === 'en' ? (
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Main Description (English)</label>
              <textarea value={formData.main_description_en} onChange={(e) => setFormData(prev => ({ ...prev, main_description_en: e.target.value }))} style={textareaStyle} placeholder="Enter the main description text..." />
            </div>
          ) : (
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>الوصف الرئيسي (عربي)</label>
              <textarea value={formData.main_description_ar} onChange={(e) => setFormData(prev => ({ ...prev, main_description_ar: e.target.value }))} style={{ ...textareaStyle, direction: 'rtl', textAlign: 'right' }} placeholder="أدخل نص الوصف الرئيسي..." />
            </div>
          )}

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
                    {activeFormTab === 'en' ? (
                      <input
                        type="text"
                        value={service.title_en || ''}
                        onChange={(e) => {
                          const newServiceList = [...formData.service_list];
                          newServiceList[serviceIndex] = { ...newServiceList[serviceIndex], title_en: e.target.value };
                          setFormData(prev => ({ ...prev, service_list: newServiceList }));
                        }}
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="Service category title (e.g., Special care throughout the motherhood journey, including:)"
                      />
                    ) : (
                      <input
                        type="text"
                        value={service.title_ar || ''}
                        onChange={(e) => {
                          const newServiceList = [...formData.service_list];
                          newServiceList[serviceIndex] = { ...newServiceList[serviceIndex], title_ar: e.target.value };
                          setFormData(prev => ({ ...prev, service_list: newServiceList }));
                        }}
                        style={{ ...inputStyle, flex: 1, direction: 'rtl' }}
                        placeholder="عنوان فئة الخدمة (مثال: رعاية خاصة طوال رحلة الأمومة، بما في ذلك:)"
                      />
                    )}
                    <button 
                      style={removeButtonStyle} 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this service category?')) {
                          const newServiceList = formData.service_list.filter((_, i) => i !== serviceIndex);
                          setFormData(prev => ({ ...prev, service_list: newServiceList }));
                        }
                      }}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  {(service.items || []).map((item, itemIndex) => (
                    <div key={itemIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      {activeFormTab === 'en' ? (
                        <input
                          type="text"
                          value={item.en || ''}
                          onChange={(e) => {
                            const newServiceList = [...formData.service_list];
                            const newItems = [...(newServiceList[serviceIndex].items || [])];
                            newItems[itemIndex] = { ...newItems[itemIndex], en: e.target.value };
                            newServiceList[serviceIndex] = { ...newServiceList[serviceIndex], items: newItems };
                            setFormData(prev => ({ ...prev, service_list: newServiceList }));
                          }}
                          style={{ ...inputStyle, flex: 1 }}
                          placeholder="Service item"
                        />
                      ) : (
                        <input
                          type="text"
                          value={item.ar || ''}
                          onChange={(e) => {
                            const newServiceList = [...formData.service_list];
                            const newItems = [...(newServiceList[serviceIndex].items || [])];
                            newItems[itemIndex] = { ...newItems[itemIndex], ar: e.target.value };
                            newServiceList[serviceIndex] = { ...newServiceList[serviceIndex], items: newItems };
                            setFormData(prev => ({ ...prev, service_list: newServiceList }));
                          }}
                          style={{ ...inputStyle, flex: 1, direction: 'rtl' }}
                          placeholder="عنصر الخدمة"
                        />
                      )}
                      <button 
                        style={{ ...removeButtonStyle, padding: '8px' }} 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this service item?')) {
                            const newServiceList = [...formData.service_list];
                            const newItems = (newServiceList[serviceIndex].items || []).filter((_, i) => i !== itemIndex);
                            newServiceList[serviceIndex] = { ...newServiceList[serviceIndex], items: newItems };
                            setFormData(prev => ({ ...prev, service_list: newServiceList }));
                          }
                        }}
                      >×</button>
                    </div>
                  ))}
                  <button 
                    style={{ ...addButtonStyle, fontSize: '12px', padding: '6px 12px', marginLeft: '12px' }} 
                    onClick={() => {
                      const newServiceList = [...formData.service_list];
                      const newItems = [...(newServiceList[serviceIndex].items || []), { en: '', ar: '' }];
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
                    service_list: [...prev.service_list, { title_en: '', title_ar: '', items: [{ en: '', ar: '' }] }] 
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
              {activeFormTab === 'en' ? (
                <textarea value={formData.quote_text_en} onChange={(e) => setFormData(prev => ({ ...prev, quote_text_en: e.target.value }))} style={textareaStyle} placeholder="Enter an inspiring quote..." />
              ) : (
                <textarea value={formData.quote_text_ar} onChange={(e) => setFormData(prev => ({ ...prev, quote_text_ar: e.target.value }))} style={{ ...textareaStyle, direction: 'rtl' }} placeholder="أدخل اقتباسًا ملهمًا..." />
              )}
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
                    {activeFormTab === 'en' ? (
                      <input type="text" value={section.title_en || ''} onChange={(e) => updateSubSection(index, 'title_en', e.target.value)} style={inputStyle} placeholder="e.g., Gynecology" />
                    ) : (
                      <input type="text" value={section.title_ar || ''} onChange={(e) => updateSubSection(index, 'title_ar', e.target.value)} style={{ ...inputStyle, direction: 'rtl' }} placeholder="مثال: أمراض النساء" />
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Description</label>
                    {activeFormTab === 'en' ? (
                      <textarea value={section.description_en || ''} onChange={(e) => updateSubSection(index, 'description_en', e.target.value)} style={{ ...textareaStyle, minHeight: '80px' }} placeholder="Section description..." />
                    ) : (
                      <textarea value={section.description_ar || ''} onChange={(e) => updateSubSection(index, 'description_ar', e.target.value)} style={{ ...textareaStyle, minHeight: '80px', direction: 'rtl' }} placeholder="وصف القسم..." />
                    )}
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
                      {activeFormTab === 'en' ? (
                        <input
                          type="text"
                          value={item.title_en}
                          onChange={(e) => { e.stopPropagation(); updateSidebarItem(index, 'title_en', e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ ...inputStyle, flex: 1, padding: '8px 12px' }}
                          placeholder="Item title (e.g., Vaginal Ultrasound)"
                        />
                      ) : (
                        <input
                          type="text"
                          value={item.title_ar}
                          onChange={(e) => { e.stopPropagation(); updateSidebarItem(index, 'title_ar', e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ ...inputStyle, flex: 1, padding: '8px 12px', direction: 'rtl' }}
                          placeholder="عنوان العنصر (مثال: الموجات فوق الصوتية المهبلية)"
                        />
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        style={{ padding: '6px', backgroundColor: index === 0 ? '#F3F4F6' : '#E0F7FA', color: index === 0 ? '#9CA3AF' : '#15C9FA', border: 'none', borderRadius: '6px', cursor: index === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }} 
                        onClick={(e) => { e.stopPropagation(); moveSidebarItemUp(index); }}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button 
                        style={{ padding: '6px', backgroundColor: index >= formData.sidebar_items.length - 1 ? '#F3F4F6' : '#E0F7FA', color: index >= formData.sidebar_items.length - 1 ? '#9CA3AF' : '#15C9FA', border: 'none', borderRadius: '6px', cursor: index >= formData.sidebar_items.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }} 
                        onClick={(e) => { e.stopPropagation(); moveSidebarItemDown(index); }}
                        disabled={index >= formData.sidebar_items.length - 1}
                        title="Move down"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <button style={{ ...removeButtonStyle, marginLeft: '4px' }} onClick={(e) => { e.stopPropagation(); removeSidebarItem(index); }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
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
                        {activeFormTab === 'en' ? (
                          <textarea
                            value={item.description_en || ''}
                            onChange={(e) => updateSidebarItem(index, 'description_en', e.target.value)}
                            style={{ ...textareaStyle, minHeight: '80px' }}
                            placeholder="Description for this service..."
                          />
                        ) : (
                          <textarea
                            value={item.description_ar || ''}
                            onChange={(e) => updateSidebarItem(index, 'description_ar', e.target.value)}
                            style={{ ...textareaStyle, minHeight: '80px', direction: 'rtl' }}
                            placeholder="وصف لهذه الخدمة..."
                          />
                        )}
                      </div>
                      
                      {/* Item Service Categories */}
                      <div>
                        <label style={{ ...labelStyle, fontSize: '12px' }}>Service Categories</label>
                        {(item.service_list || []).map((service, serviceIndex) => (
                          <div key={serviceIndex} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', marginBottom: '8px', background: 'white' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              {activeFormTab === 'en' ? (
                                <input
                                  type="text"
                                  value={service.title_en || ''}
                                  onChange={(e) => updateSidebarItemService(index, serviceIndex, 'title_en', e.target.value)}
                                  style={{ ...inputStyle, flex: 1, padding: '8px 12px', fontSize: '13px' }}
                                  placeholder="Category title"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={service.title_ar || ''}
                                  onChange={(e) => updateSidebarItemService(index, serviceIndex, 'title_ar', e.target.value)}
                                  style={{ ...inputStyle, flex: 1, padding: '8px 12px', fontSize: '13px', direction: 'rtl' }}
                                  placeholder="عنوان الفئة"
                                />
                              )}
                              <button 
                                style={{ padding: '6px', backgroundColor: serviceIndex === 0 ? '#F3F4F6' : '#E0F7FA', color: serviceIndex === 0 ? '#9CA3AF' : '#15C9FA', border: 'none', borderRadius: '6px', cursor: serviceIndex === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }} 
                                onClick={() => moveSidebarItemServiceUp(index, serviceIndex)}
                                disabled={serviceIndex === 0}
                                title="Move up"
                              >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                              </button>
                              <button 
                                style={{ padding: '6px', backgroundColor: serviceIndex >= (item.service_list || []).length - 1 ? '#F3F4F6' : '#E0F7FA', color: serviceIndex >= (item.service_list || []).length - 1 ? '#9CA3AF' : '#15C9FA', border: 'none', borderRadius: '6px', cursor: serviceIndex >= (item.service_list || []).length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }} 
                                onClick={() => moveSidebarItemServiceDown(index, serviceIndex)}
                                disabled={serviceIndex >= (item.service_list || []).length - 1}
                                title="Move down"
                              >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </button>
                              <button style={{ ...removeButtonStyle, padding: '6px' }} onClick={() => removeSidebarItemService(index, serviceIndex)}>×</button>
                            </div>
                            
                            {(service.items || []).map((listItem, itemIndex) => (
                              <div key={itemIndex} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                {activeFormTab === 'en' ? (
                                  <input
                                    type="text"
                                    value={listItem.en || ''}
                                    onChange={(e) => updateSidebarItemServiceListItem(index, serviceIndex, itemIndex, 'en', e.target.value)}
                                    style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: '12px' }}
                                    placeholder="Service item"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={listItem.ar || ''}
                                    onChange={(e) => updateSidebarItemServiceListItem(index, serviceIndex, itemIndex, 'ar', e.target.value)}
                                    style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: '12px', direction: 'rtl' }}
                                    placeholder="عنصر الخدمة"
                                  />
                                )}
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
