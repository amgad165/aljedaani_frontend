import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface Branch {
  id: number;
  name: string;
  name_ar: string;
}

interface Department {
  id: number;
  name: string;
}

interface ServiceItem {
  title: string;
  description: string;
}

interface Doctor {
  id: number;
  doctor_code: string;
  name: string;
  email: string;
  phone: string;
  image_url: string;
  department_id: number;
  branch_id: number | null;
  branch?: Branch;
  department?: Department;
  location: string;
  experience_years: number;
  education: string;
  specialization: string;
  status: 'available_today' | 'busy' | 'available_soon';
  is_active: boolean;
  order: number;
  outpatient_services: ServiceItem[];
  inpatient_services: ServiceItem[];
}

interface FormData {
  doctor_code: string;
  name: string;
  email: string;
  phone: string;
  department_id: string;
  branch_id: string;
  location: string;
  experience_years: string;
  education: string;
  specialization: string;
  status: string;
  is_active: boolean;
  order: string;
  outpatient_services: ServiceItem[];
  inpatient_services: ServiceItem[];
}

const initialFormData: FormData = {
  doctor_code: '',
  name: '',
  email: '',
  phone: '',
  department_id: '',
  branch_id: '',
  location: '',
  experience_years: '',
  education: '',
  specialization: '',
  status: 'available_today',
  is_active: true,
  order: '0',
  outpatient_services: [],
  inpatient_services: [],
};

interface NewServiceForm {
  title: string;
  description: string;
}

const initialServiceForm: NewServiceForm = { title: '', description: '' };

const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'services'>('basic');
  const [newOutpatientService, setNewOutpatientService] = useState<NewServiceForm>(initialServiceForm);
  const [newInpatientService, setNewInpatientService] = useState<NewServiceForm>(initialServiceForm);
  const [editingOutpatientIndex, setEditingOutpatientIndex] = useState<number | null>(null);
  const [editingInpatientIndex, setEditingInpatientIndex] = useState<number | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const initialFormRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterBranch, setFilterBranch] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBranches();
    fetchDepartments();
  }, []);
  
  useEffect(() => {
    fetchDoctors();
  }, [currentPage, searchQuery, filterStatus, filterDepartment, filterBranch]);

  useEffect(() => {
    // Track changes
    const currentForm = JSON.stringify({ ...formData, imageFile: imageFile?.name || '' });
    setHasChanges(currentForm !== initialFormRef.current);
  }, [formData, imageFile]);

  const getToken = () => localStorage.getItem('auth_token') || '';

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        active: 'all',
        page: currentPage.toString(),
        per_page: itemsPerPage.toString(),
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (filterStatus) params.append('status', filterStatus);
      if (filterDepartment) params.append('department_id', filterDepartment);
      if (filterBranch) params.append('branch_id', filterBranch);
      
      const response = await fetch(`${API_BASE_URL}/doctors?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      const result = await response.json();
      
      // Handle paginated response
      if (result.data) {
        setDoctors(result.data.data || result.data);
        setTotalPages(result.data.last_page || 1);
        setTotalDoctors(result.data.total || 0);
      } else {
        setDoctors([]);
        setTotalPages(1);
        setTotalDoctors(0);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
      setTotalPages(1);
      setTotalDoctors(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/branches?active=all`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      const result = await response.json();
      setBranches(result.data || result);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      const result = await response.json();
      setDepartments(result.data || result);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const openDrawer = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      const newFormData: FormData = {
        doctor_code: doctor.doctor_code || '',
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone || '',
        department_id: doctor.department_id?.toString() || '',
        branch_id: doctor.branch_id?.toString() || '',
        location: doctor.location,
        experience_years: doctor.experience_years.toString(),
        education: doctor.education,
        specialization: doctor.specialization || '',
        status: doctor.status,
        is_active: doctor.is_active,
        order: doctor.order?.toString() || '0',
        outpatient_services: doctor.outpatient_services || [],
        inpatient_services: doctor.inpatient_services || [],
      };
      setFormData(newFormData);
      setImagePreview(doctor.image_url || '');
      initialFormRef.current = JSON.stringify({ ...newFormData, imageFile: '' });
    } else {
      setEditingDoctor(null);
      setFormData(initialFormData);
      setImagePreview('');
      initialFormRef.current = JSON.stringify({ ...initialFormData, imageFile: '' });
    }
    setImageFile(null);
    setActiveTab('basic');
    setHasChanges(false);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    if (hasChanges) {
      setShowUnsavedDialog(true);
    } else {
      closeDrawer();
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingDoctor(null);
    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview('');
    setActiveTab('basic');
    setHasChanges(false);
    setNewOutpatientService(initialServiceForm);
    setNewInpatientService(initialServiceForm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

  const addOutpatientService = () => {
    if (newOutpatientService.title.trim()) {
      if (editingOutpatientIndex !== null) {
        // Update existing service
        setFormData(prev => {
          const updated = [...prev.outpatient_services];
          updated[editingOutpatientIndex] = {
            title: newOutpatientService.title.trim(),
            description: newOutpatientService.description.trim()
          };
          return { ...prev, outpatient_services: updated };
        });
        setEditingOutpatientIndex(null);
      } else {
        // Add new service
        setFormData(prev => ({
          ...prev,
          outpatient_services: [...prev.outpatient_services, {
            title: newOutpatientService.title.trim(),
            description: newOutpatientService.description.trim()
          }]
        }));
      }
      setNewOutpatientService(initialServiceForm);
    }
  };

  const editOutpatientService = (index: number) => {
    setNewOutpatientService(formData.outpatient_services[index]);
    setEditingOutpatientIndex(index);
  };

  const cancelEditOutpatient = () => {
    setNewOutpatientService(initialServiceForm);
    setEditingOutpatientIndex(null);
  };

  const removeOutpatientService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      outpatient_services: prev.outpatient_services.filter((_, i) => i !== index)
    }));
    if (editingOutpatientIndex === index) {
      cancelEditOutpatient();
    }
  };

  const addInpatientService = () => {
    if (newInpatientService.title.trim()) {
      if (editingInpatientIndex !== null) {
        // Update existing service
        setFormData(prev => {
          const updated = [...prev.inpatient_services];
          updated[editingInpatientIndex] = {
            title: newInpatientService.title.trim(),
            description: newInpatientService.description.trim()
          };
          return { ...prev, inpatient_services: updated };
        });
        setEditingInpatientIndex(null);
      } else {
        // Add new service
        setFormData(prev => ({
          ...prev,
          inpatient_services: [...prev.inpatient_services, {
            title: newInpatientService.title.trim(),
            description: newInpatientService.description.trim()
          }]
        }));
      }
      setNewInpatientService(initialServiceForm);
    }
  };

  const editInpatientService = (index: number) => {
    setNewInpatientService(formData.inpatient_services[index]);
    setEditingInpatientIndex(index);
  };

  const cancelEditInpatient = () => {
    setNewInpatientService(initialServiceForm);
    setEditingInpatientIndex(null);
  };

  const removeInpatientService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inpatient_services: prev.inpatient_services.filter((_, i) => i !== index)
    }));
    if (editingInpatientIndex === index) {
      cancelEditInpatient();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = new FormData();
      if (formData.doctor_code) {
        submitData.append('doctor_code', formData.doctor_code);
      }
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('department_id', formData.department_id);
      submitData.append('location', formData.location);
      submitData.append('experience_years', formData.experience_years);
      submitData.append('education', formData.education);
      submitData.append('specialization', formData.specialization);
      submitData.append('status', formData.status);
      submitData.append('is_active', formData.is_active ? '1' : '0');
      submitData.append('order', formData.order || '0');
      
      if (formData.branch_id) {
        submitData.append('branch_id', formData.branch_id);
      }
      
      // Append services as JSON strings for Laravel
      submitData.append('outpatient_services', JSON.stringify(formData.outpatient_services));
      submitData.append('inpatient_services', JSON.stringify(formData.inpatient_services));

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const url = editingDoctor 
        ? `${API_BASE_URL}/doctors/${editingDoctor.id}`
        : `${API_BASE_URL}/doctors`;
      
      if (editingDoctor) {
        submitData.append('_method', 'PUT');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save doctor');
      }

      fetchDoctors();
      closeDrawer();
    } catch (error) {
      console.error('Error saving doctor:', error);
      alert('Error saving doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete doctor');
      }

      fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Error deleting doctor');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available_today': return 'Available Today';
      case 'busy': return 'Busy';
      case 'available_soon': return 'Available Soon';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available_today': return { bg: '#dcfce7', color: '#166534' };
      case 'busy': return { bg: '#fee2e2', color: '#dc2626' };
      case 'available_soon': return { bg: '#fef3c7', color: '#92400e' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterDepartment('');
    setFilterBranch('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filterStatus, filterDepartment, filterBranch, searchQuery]);
  
  // Calculate display indices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalDoctors);
  const hasActiveFilters = filterStatus || filterDepartment || filterBranch || searchQuery;

  const styles = {
    container: {
      padding: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1a1a2e',
      margin: 0,
    },
    addButton: {
      backgroundColor: '#0d9488',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    th: {
      padding: '16px',
      textAlign: 'left' as const,
      backgroundColor: '#f8fafc',
      fontWeight: '600',
      color: '#475569',
      fontSize: '14px',
      borderBottom: '1px solid #e2e8f0',
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #e2e8f0',
      color: '#1e293b',
      fontSize: '14px',
    },
    doctorImage: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      objectFit: 'cover' as const,
    },
    statusBadge: (active: boolean) => ({
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: active ? '#dcfce7' : '#fee2e2',
      color: active ? '#166534' : '#dc2626',
    }),
    actionButton: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '13px',
      marginRight: '8px',
    },
    editButton: {
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
    },
    deleteButton: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
    },
    // Drawer styles
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      opacity: isDrawerOpen ? 1 : 0,
      visibility: isDrawerOpen ? 'visible' as const : 'hidden' as const,
      transition: 'opacity 0.3s ease, visibility 0.3s ease',
    },
    drawer: {
      position: 'fixed' as const,
      top: 0,
      right: 0,
      width: '800px',
      maxWidth: '100vw',
      height: '100vh',
      backgroundColor: 'white',
      boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
      zIndex: 1001,
      transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    drawerHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
    },
    drawerTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1a1a2e',
      margin: 0,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#64748b',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '6px',
      transition: 'background-color 0.2s',
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: 'white',
    },
    tab: (isActive: boolean) => ({
      padding: '16px 24px',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: isActive ? '#0d9488' : '#64748b',
      borderBottom: isActive ? '2px solid #0d9488' : '2px solid transparent',
      transition: 'all 0.2s',
    }),
    drawerContent: {
      flex: 1,
      overflow: 'auto',
      padding: '24px',
      minHeight: 0,
    },
    drawerFooter: {
      padding: '16px 24px',
      borderTop: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      flexShrink: 0,
    },
    formGroup: {
      marginBottom: '20px',
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontWeight: '500',
      color: '#374151',
      fontSize: '14px',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      outline: 'none',
      boxSizing: 'border-box' as const,
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical' as const,
      outline: 'none',
      boxSizing: 'border-box' as const,
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box' as const,
      backgroundColor: 'white',
    },
    imageUpload: {
      display: 'block',
      width: '100%',
      border: '2px dashed #d1d5db',
      borderRadius: '12px',
      padding: '32px 24px',
      textAlign: 'center' as const,
      cursor: 'pointer',
      transition: 'border-color 0.2s, background-color 0.2s',
      backgroundColor: '#f9fafb',
      boxSizing: 'border-box' as const,
    },
    imagePreview: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      objectFit: 'cover' as const,
      margin: '0 auto',
      display: 'block',
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
    },
    cancelButton: {
      padding: '10px 20px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      backgroundColor: 'white',
      color: '#374151',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    saveButton: {
      padding: '10px 24px',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#0d9488',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    // Services styles
    serviceSection: {
      marginBottom: '24px',
    },
    serviceSectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1a1a2e',
      marginBottom: '12px',
    },
    serviceInputRow: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
    },
    serviceInput: {
      flex: 1,
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
    },
    addServiceButton: {
      padding: '10px 16px',
      backgroundColor: '#0d9488',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      whiteSpace: 'nowrap' as const,
    },
    serviceList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
    serviceItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: '#f1f5f9',
      borderRadius: '8px',
    },
    serviceText: {
      fontSize: '14px',
      color: '#1e293b',
    },
    removeServiceButton: {
      background: 'none',
      border: 'none',
      color: '#dc2626',
      cursor: 'pointer',
      fontSize: '18px',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyServices: {
      padding: '24px',
      textAlign: 'center' as const,
      color: '#64748b',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      fontSize: '14px',
    },
    // Unsaved dialog styles
    dialogOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dialog: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    dialogTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1a1a2e',
      marginBottom: '12px',
    },
    dialogText: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '20px',
    },
    dialogActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
    },
    dialogCancelButton: {
      padding: '8px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: 'white',
      color: '#374151',
      cursor: 'pointer',
      fontSize: '14px',
    },
    dialogDiscardButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#dc2626',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
    },
    branchBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
    },
    imagePlaceholder: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#94a3b8',
      fontSize: '20px',
    },
  };

  if (loading) {
    return (
      <AdminLayout>
      <div style={styles.container}>
        <p>Loading doctors...</p>
      </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Doctors Management</h1>
        <button style={styles.addButton} onClick={() => openDrawer()}>
          <span>+</span> Add Doctor
        </button>
      </div>

      {/* Filters Section */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap' as const,
        alignItems: 'flex-end',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {/* Search */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name, email, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box' as const,
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: '160px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="">All Statuses</option>
            <option value="available_today">Available Today</option>
            <option value="busy">Busy</option>
            <option value="available_soon">Available Soon</option>
          </select>
        </div>

        {/* Department Filter */}
        <div style={{ minWidth: '180px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
            Department
          </label>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Filter */}
        <div style={{ minWidth: '180px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
            Branch
          </label>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              padding: '10px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '16px', color: '#64748b', fontSize: '14px' }}>
        Showing {totalDoctors} doctors
        {hasActiveFilters && <span> (filtered)</span>}
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Order</th>
            <th style={styles.th}>Image</th>
            <th style={styles.th}>Doctor Code</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Department</th>
            <th style={styles.th}>Branch</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Active</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map(doctor => (
            <tr key={doctor.id}>
              <td style={styles.td}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#0d9488',
                  fontFamily: 'monospace'
                }}>
                  {doctor.order || 0}
                </div>
              </td>
              <td style={styles.td}>
                {doctor.image_url ? (
                  <img src={doctor.image_url} alt={doctor.name} style={styles.doctorImage} />
                ) : (
                  <div style={styles.imagePlaceholder}>👤</div>
                )}
              </td>
              <td style={styles.td}>
                <div style={{ fontSize: '13px', color: '#666', fontFamily: 'monospace' }}>
                  {doctor.doctor_code || '-'}
                </div>
              </td>
              <td style={styles.td}>
                <div>{doctor.name}</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>{doctor.email}</div>
              </td>
              <td style={styles.td}>
                {doctor.department?.name || <span style={{ color: '#94a3b8' }}>No department</span>}
              </td>
              <td style={styles.td}>
                {doctor.branch ? (
                  <span style={styles.branchBadge}>{doctor.branch.name}</span>
                ) : (
                  <span style={{ color: '#94a3b8' }}>No branch</span>
                )}
              </td>
              <td style={styles.td}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: getStatusColor(doctor.status).bg,
                  color: getStatusColor(doctor.status).color,
                }}>
                  {getStatusLabel(doctor.status)}
                </span>
              </td>
              <td style={styles.td}>
                <span style={styles.statusBadge(doctor.is_active)}>
                  {doctor.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={styles.td}>
                <button
                  style={{ ...styles.actionButton, ...styles.editButton }}
                  onClick={() => openDrawer(doctor)}
                >
                  Edit
                </button>
                <button
                  style={{ ...styles.actionButton, ...styles.deleteButton }}
                  onClick={() => handleDelete(doctor.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginTop: '-4px',
        }}>
          <div style={{ color: '#64748b', fontSize: '14px' }}>
            Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{endIndex} of {totalDoctors}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                color: currentPage === 1 ? '#94a3b8' : '#374151',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              ← Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '8px 12px',
                  border: currentPage === page ? 'none' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: currentPage === page ? '#0d9488' : 'white',
                  color: currentPage === page ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: currentPage === page ? '600' : '500',
                  transition: 'all 0.2s',
                  minWidth: '36px',
                }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                color: currentPage === totalPages ? '#94a3b8' : '#374151',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Drawer Overlay */}
      <div style={styles.overlay} />

      {/* Drawer Panel */}
      <div style={styles.drawer}>
        <div style={styles.drawerHeader}>
          <h2 style={styles.drawerTitle}>
            {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
          </h2>
          <button
            style={styles.closeButton}
            onClick={handleCloseDrawer}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={styles.tab(activeTab === 'basic')}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            style={styles.tab(activeTab === 'services')}
            onClick={() => setActiveTab('services')}
          >
            Services
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div style={styles.drawerContent}>
            {activeTab === 'basic' ? (
              <>
                {/* Image Upload */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Doctor Image</label>
                  <label style={styles.imageUpload}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                    ) : (
                      <div>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                        <div style={{ color: '#64748b' }}>Click to upload image</div>
                      </div>
                    )}
                  </label>
                </div>

                {/* Doctor Code & Name */}
                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>Doctor Code</label>
                    <input
                      type="text"
                      name="doctor_code"
                      value={formData.doctor_code}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="e.g., DOC-001"
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>

                {/* Phone & Location */}
                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* Department & Branch */}
                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>Department *</label>
                    <select
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleInputChange}
                      style={styles.select}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Branch</label>
                    <select
                      name="branch_id"
                      value={formData.branch_id}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      <option value="">Select Branch</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Education & Experience */}
                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>Education *</label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Experience (Years) *</label>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleInputChange}
                      style={styles.input}
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Specialization */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Specialization</label>
                  <textarea
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    placeholder="Enter specialization details. Use line breaks for multiple items."
                  />
                </div>

                {/* Status & Active */}
                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      style={styles.select}
                      required
                    >
                      <option value="available_today">Available Today</option>
                      <option value="busy">Busy</option>
                      <option value="available_soon">Available Soon</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                    <div style={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        style={styles.checkbox}
                        id="is_active"
                      />
                      <label htmlFor="is_active" style={{ ...styles.label, marginBottom: 0 }}>
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                {/* Display Order */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Display Order *</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                    min="0"
                    placeholder="0"
                  />
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Lower numbers appear first. Multiple doctors can have the same order.
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Outpatient Services */}
                <div style={styles.serviceSection}>
                  <h3 style={styles.serviceSectionTitle}>Outpatient Services</h3>
                  <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={styles.label}>Service Title *</label>
                      <input
                        type="text"
                        value={newOutpatientService.title}
                        onChange={(e) => setNewOutpatientService(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Acne Treatment"
                        style={styles.input}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={styles.label}>Service Description</label>
                      <textarea
                        value={newOutpatientService.description}
                        onChange={(e) => setNewOutpatientService(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., We offer effective solutions to get rid of acne and its effects..."
                        style={styles.textarea}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addOutpatientService}
                      style={styles.addServiceButton}
                      disabled={!newOutpatientService.title.trim()}
                    >
                      {editingOutpatientIndex !== null ? '✓ Update Service' : '+ Add Service'}
                    </button>
                    {editingOutpatientIndex !== null && (
                      <button
                        type="button"
                        onClick={cancelEditOutpatient}
                        style={{
                          ...styles.addServiceButton,
                          backgroundColor: '#6b7280',
                          marginLeft: '8px',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {formData.outpatient_services.length > 0 ? (
                    <div style={styles.serviceList}>
                      {formData.outpatient_services.map((service, index) => (
                        <div key={index} style={styles.serviceItem}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>• {service.title}</div>
                            {service.description && (
                              <div style={{ fontSize: '13px', color: '#64748b' }}>{service.description}</div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => editOutpatientService(index)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#0369a1',
                                cursor: 'pointer',
                                fontSize: '16px',
                                padding: '4px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Edit service"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => removeOutpatientService(index)}
                              style={styles.removeServiceButton}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.emptyServices}>
                      No outpatient services added yet
                    </div>
                  )}
                </div>

                {/* Inpatient Services */}
                <div style={styles.serviceSection}>
                  <h3 style={styles.serviceSectionTitle}>Inpatient Services</h3>
                  <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={styles.label}>Service Title *</label>
                      <input
                        type="text"
                        value={newInpatientService.title}
                        onChange={(e) => setNewInpatientService(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Surgery Preparation"
                        style={styles.input}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={styles.label}>Service Description</label>
                      <textarea
                        value={newInpatientService.description}
                        onChange={(e) => setNewInpatientService(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., Comprehensive pre-operative care and consultation..."
                        style={styles.textarea}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addInpatientService}
                      style={styles.addServiceButton}
                      disabled={!newInpatientService.title.trim()}
                    >
                      {editingInpatientIndex !== null ? '✓ Update Service' : '+ Add Service'}
                    </button>
                    {editingInpatientIndex !== null && (
                      <button
                        type="button"
                        onClick={cancelEditInpatient}
                        style={{
                          ...styles.addServiceButton,
                          backgroundColor: '#6b7280',
                          marginLeft: '8px',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {formData.inpatient_services.length > 0 ? (
                    <div style={styles.serviceList}>
                      {formData.inpatient_services.map((service, index) => (
                        <div key={index} style={styles.serviceItem}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>• {service.title}</div>
                            {service.description && (
                              <div style={{ fontSize: '13px', color: '#64748b' }}>{service.description}</div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => editInpatientService(index)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#0369a1',
                                cursor: 'pointer',
                                fontSize: '16px',
                                padding: '4px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Edit service"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => removeInpatientService(index)}
                              style={styles.removeServiceButton}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.emptyServices}>
                      No inpatient services added yet
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div style={styles.drawerFooter}>
            <button
              type="button"
              onClick={handleCloseDrawer}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.saveButton,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : (editingDoctor ? 'Update Doctor' : 'Create Doctor')}
            </button>
          </div>
        </form>
      </div>

      {/* Unsaved Changes Dialog */}
      {showUnsavedDialog && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialog}>
            <h3 style={styles.dialogTitle}>Unsaved Changes</h3>
            <p style={styles.dialogText}>
              You have unsaved changes. Are you sure you want to discard them?
            </p>
            <div style={styles.dialogActions}>
              <button
                style={styles.dialogCancelButton}
                onClick={() => setShowUnsavedDialog(false)}
              >
                Keep Editing
              </button>
              <button
                style={styles.dialogDiscardButton}
                onClick={() => {
                  setShowUnsavedDialog(false);
                  closeDrawer();
                }}
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminDoctors;
