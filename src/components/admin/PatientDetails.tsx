import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import {
  labReportsService,
  radiologyReportsService,
  medicalReportsService,
  usersService,
} from '../../services/medicalRecordsService';
import type { User, LabReport, RadiologyReport, MedicalReport } from '../../services/medicalRecordsService';

type TabType = 'lab' | 'radiology' | 'medical';

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('lab');
  
  // Lab Reports State
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [labPage] = useState(1);
  const [labTotal, setLabTotal] = useState(0);
  const [labLoading, setLabLoading] = useState(false);
  
  // Radiology Reports State
  const [radiologyReports, setRadiologyReports] = useState<RadiologyReport[]>([]);
  const [radiologyPage] = useState(1);
  const [radiologyTotal, setRadiologyTotal] = useState(0);
  const [radiologyLoading, setRadiologyLoading] = useState(false);
  
  // Medical Reports State
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);
  const [medicalPage] = useState(1);
  const [medicalTotal, setMedicalTotal] = useState(0);
  const [medicalLoading, setMedicalLoading] = useState(false);

  // Form Modals State
  const [showLabForm, setShowLabForm] = useState(false);
  const [showRadiologyForm, setShowRadiologyForm] = useState(false);
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Lab Report Form State
  const [labFormData, setLabFormData] = useState({
    test_name: '',
    test_description: '',
    test_date: '',
    result_date: '',
    results: '',
    notes: '',
    doctor_name: '',
    technician_name: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
  });
  const [labFile, setLabFile] = useState<File | null>(null);

  // Radiology Report Form State
  const [radiologyFormData, setRadiologyFormData] = useState({
    study_description: '',
    modality: 'X-Ray' as 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'Mammography' | 'PET' | 'Other',
    clinical_indication: '',
    study_date: '',
    report_date: '',
    findings: '',
    impression: '',
    recommendations: '',
    radiologist_name: '',
    technician_name: '',
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
  });
  const [radiologyFile, setRadiologyFile] = useState<File | null>(null);

  // Medical Report Form State
  const [medicalFormData, setMedicalFormData] = useState({
    title: '',
    report_type: 'consultation' as 'consultation' | 'follow_up' | 'discharge' | 'procedure' | 'emergency' | 'other',
    chief_complaint: '',
    history_of_present_illness: '',
    physical_examination: '',
    diagnosis: '',
    treatment_plan: '',
    medications: '',
    follow_up_instructions: '',
    notes: '',
    doctor_name: '',
    department: '',
    visit_date: '',
  });
  const [medicalFile, setMedicalFile] = useState<File | null>(null);

  // Track if data has been loaded to prevent duplicates
  const dataLoadedRef = React.useRef(false);

  // Fetch patient on mount only
  useEffect(() => {
    const loadPatient = async () => {
      await fetchPatient();
    };
    loadPatient();
  }, [id]);

  // Fetch all data once when patient loads
  useEffect(() => {
    if (patient && !dataLoadedRef.current) {
      dataLoadedRef.current = true;
      // Fetch all 3 tabs data at once
      fetchLabReports();
      fetchRadiologyReports();
      fetchMedicalReports();
    }
  }, [patient]);

  // Only refetch when pagination changes for the active tab
  useEffect(() => {
    if (!patient || !dataLoadedRef.current) return;
    
    if (activeTab === 'lab') {
      fetchLabReports();
    }
  }, [labPage]);

  useEffect(() => {
    if (!patient || !dataLoadedRef.current) return;
    
    if (activeTab === 'radiology') {
      fetchRadiologyReports();
    }
  }, [radiologyPage]);

  useEffect(() => {
    if (!patient || !dataLoadedRef.current) return;
    
    if (activeTab === 'medical') {
      fetchMedicalReports();
    }
  }, [medicalPage]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const response = await usersService.getById(Number(id));
      if (response.success) {
        setPatient(response.data);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabReports = async () => {
    try {
      setLabLoading(true);
      const response = await labReportsService.getAll({
        user_id: Number(id),
        page: labPage,
        per_page: 10,
      });
      if (response.success) {
        setLabReports(response.data);
        setLabTotal(response.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching lab reports:', error);
    } finally {
      setLabLoading(false);
    }
  };

  const fetchRadiologyReports = async () => {
    try {
      setRadiologyLoading(true);
      const response = await radiologyReportsService.getAll({
        user_id: Number(id),
        page: radiologyPage,
        per_page: 10,
      });
      if (response.success) {
        setRadiologyReports(response.data);
        setRadiologyTotal(response.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching radiology reports:', error);
    } finally {
      setRadiologyLoading(false);
    }
  };

  const fetchMedicalReports = async () => {
    try {
      setMedicalLoading(true);
      const response = await medicalReportsService.getAll({
        user_id: Number(id),
        page: medicalPage,
        per_page: 10,
      });
      if (response.success) {
        setMedicalReports(response.data);
        setMedicalTotal(response.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching medical reports:', error);
    } finally {
      setMedicalLoading(false);
    }
  };

  const handleDeleteLabReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this lab report?')) return;
    
    try {
      await labReportsService.delete(reportId);
      fetchLabReports();
    } catch (error) {
      console.error('Error deleting lab report:', error);
    }
  };

  const handleDeleteRadiologyReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this radiology report?')) return;
    
    try {
      await radiologyReportsService.delete(reportId);
      fetchRadiologyReports();
    } catch (error) {
      console.error('Error deleting radiology report:', error);
    }
  };

  const handleDeleteMedicalReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this medical report?')) return;
    
    try {
      await medicalReportsService.delete(reportId);
      fetchMedicalReports();
    } catch (error) {
      console.error('Error deleting medical report:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Form Submit Handlers
  const handleLabFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    try {
      setFormSubmitting(true);
      const formData = new FormData();
      formData.append('user_id', patient.id.toString());
      Object.entries(labFormData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (labFile) {
        formData.append('file', labFile);
      }

      // Debug: Log FormData contents
      console.log('Submitting lab report with data:', {
        user_id: patient.id,
        ...labFormData,
        file: labFile?.name
      });

      await labReportsService.create(formData);
      setShowLabForm(false);
      // Reset form
      setLabFormData({
        test_name: '',
        test_description: '',
        test_date: '',
        result_date: '',
        results: '',
        notes: '',
        doctor_name: '',
        technician_name: '',
        status: 'pending',
      });
      setLabFile(null);
      fetchLabReports();
      alert('Lab report added successfully!');
    } catch (error) {
      console.error('Error creating lab report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create lab report';
      alert(`Error: ${errorMessage}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleRadiologyFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    try {
      setFormSubmitting(true);
      const formData = new FormData();
      formData.append('user_id', patient.id.toString());
      Object.entries(radiologyFormData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (radiologyFile) {
        formData.append('report_file', radiologyFile);
      }

      await radiologyReportsService.create(formData);
      setShowRadiologyForm(false);
      // Reset form
      setRadiologyFormData({
        study_description: '',
        modality: 'X-Ray',
        clinical_indication: '',
        study_date: '',
        report_date: '',
        findings: '',
        impression: '',
        recommendations: '',
        radiologist_name: '',
        technician_name: '',
        status: 'scheduled',
      });
      setRadiologyFile(null);
      fetchRadiologyReports();
      alert('Radiology report added successfully!');
    } catch (error) {
      console.error('Error creating radiology report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create radiology report';
      alert(`Error: ${errorMessage}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleMedicalFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    try {
      setFormSubmitting(true);
      const formData = new FormData();
      formData.append('user_id', patient.id.toString());
      Object.entries(medicalFormData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (medicalFile) {
        formData.append('file', medicalFile);
      }

      await medicalReportsService.create(formData);
      setShowMedicalForm(false);
      // Reset form
      setMedicalFormData({
        title: '',
        report_type: 'consultation',
        chief_complaint: '',
        history_of_present_illness: '',
        physical_examination: '',
        diagnosis: '',
        treatment_plan: '',
        medications: '',
        follow_up_instructions: '',
        notes: '',
        doctor_name: '',
        department: '',
        visit_date: '',
      });
      setMedicalFile(null);
      fetchMedicalReports();
      alert('Medical report added successfully!');
    } catch (error) {
      console.error('Error creating medical report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create medical report';
      alert(`Error: ${errorMessage}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E5E7EB',
            borderTopColor: '#3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
        </div>
      </AdminLayout>
    );
  }

  if (!patient) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <p style={{ color: '#6B7280', fontSize: '16px', marginBottom: '20px' }}>Patient not found</p>
          <button
            onClick={() => navigate('/admin/patients')}
            style={{
              padding: '10px 24px',
              background: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Back to Patients
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ padding: '32px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/patients')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'transparent',
            color: '#3B82F6',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px',
          }}
        >
          ← Back to Patients
        </button>

        {/* Patient Header Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '24px' }}>
            {patient.profile_photo ? (
              <img
                src={patient.profile_photo}
                alt={patient.name}
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #EFF6FF',
                }}
              />
            ) : (
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '4px solid #EFF6FF',
              }}>
                <span style={{ fontSize: '36px', color: '#FFFFFF', fontWeight: '700' }}>
                  {patient.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
                {patient.name}
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                Medical Record: <strong>{patient.medical_record_number || 'N/A'}</strong>
              </p>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: '24px', 
                fontSize: '14px', 
                color: '#6B7280' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{patient.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>{patient.phone}</span>
                </div>
                {patient.gender && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    <span style={{ textTransform: 'capitalize' }}>{patient.gender}</span>
                  </div>
                )}
                {patient.date_of_birth && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>DOB: {formatDate(patient.date_of_birth)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Container */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #E5E7EB',
            background: '#F9FAFB',
          }}>
            <button
              onClick={() => setActiveTab('lab')}
              style={{
                padding: '16px 24px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                borderBottom: activeTab === 'lab' ? '3px solid #3B82F6' : '3px solid transparent',
                background: activeTab === 'lab' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'lab' ? '#3B82F6' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Lab Reports ({labTotal})
            </button>
            <button
              onClick={() => setActiveTab('radiology')}
              style={{
                padding: '16px 24px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                borderBottom: activeTab === 'radiology' ? '3px solid #3B82F6' : '3px solid transparent',
                background: activeTab === 'radiology' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'radiology' ? '#3B82F6' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Radiology Reports ({radiologyTotal})
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              style={{
                padding: '16px 24px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                borderBottom: activeTab === 'medical' ? '3px solid #3B82F6' : '3px solid transparent',
                background: activeTab === 'medical' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'medical' ? '#3B82F6' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Medical Reports ({medicalTotal})
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '32px' }}>
            {/* Lab Reports Tab */}
            {activeTab === 'lab' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>Lab Reports</h2>
                  <button
                    onClick={() => setShowLabForm(true)}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    + Add Lab Report
                  </button>
                </div>

                {labLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid #E5E7EB',
                      borderTopColor: '#3B82F6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}></div>
                  </div>
                ) : labReports.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6B7280', padding: '48px 0' }}>No lab reports found</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead style={{ background: '#F9FAFB' }}>
                        <tr>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Report #
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Test Name
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Test Date
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Status
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Doctor
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ background: '#FFFFFF' }}>
                        {labReports.map((report) => (
                          <tr key={report.id} style={{ borderTop: '1px solid #E5E7EB' }}>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                              {report.report_number}
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#1F2937' }}>
                              {report.test_name}
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#6B7280' }}>
                              {formatDate(report.test_date)}
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                              <span style={{
                                padding: '4px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                borderRadius: '9999px',
                                ...(report.status === 'completed' && { background: '#D1FAE5', color: '#065F46' }),
                                ...(report.status === 'in_progress' && { background: '#DBEAFE', color: '#1E40AF' }),
                                ...(report.status === 'pending' && { background: '#FEF3C7', color: '#92400E' }),
                                ...(report.status === 'cancelled' && { background: '#FEE2E2', color: '#991B1B' }),
                              }}>
                                {report.status_label}
                              </span>
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#6B7280' }}>
                              {report.doctor_name || 'N/A'}
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '600' }}>
                              {report.file_url && (
                                <a
                                  href={report.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#3B82F6', marginRight: '16px', textDecoration: 'none' }}
                                >
                                  View
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteLabReport(report.id)}
                                style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Radiology Reports Tab */}
            {activeTab === 'radiology' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>Radiology Reports</h2>
                  <button
                    onClick={() => setShowRadiologyForm(true)}
                    style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    + Add Radiology Report
                  </button>
                </div>

                {radiologyLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  </div>
                ) : radiologyReports.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6B7280', padding: '48px 0' }}>No radiology reports found</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead style={{ background: '#F9FAFB' }}>
                        <tr>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Report #
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Study
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Modality
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Study Date
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Status
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ background: '#FFFFFF' }}>
                        {radiologyReports.map((report) => (
                          <tr key={report.id}>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                              {report.report_number}
                            </td>
                            <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1F2937' }}>
                              {report.study_description}
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#6B7280' }}>
                              {report.modality_label}
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#6B7280' }}>
                              {formatDate(report.study_date)}
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                              <span style={{ padding: '4px 12px', fontSize: '12px', fontWeight: '600', borderRadius: '9999px', ...(report.status === 'completed' && { background: '#D1FAE5', color: '#065F46' }), ...(report.status === 'in_progress' && { background: '#DBEAFE', color: '#1E40AF' }), ...(report.status === 'scheduled' && { background: '#E0E7FF', color: '#3730A3' }), ...(report.status === 'cancelled' && { background: '#FEE2E2', color: '#991B1B' }) }}>
                                {report.status_label}
                              </span>
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '600' }}>
                              {report.report_file_url && (
                                <a
                                  href={report.report_file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#3B82F6', marginRight: '16px', textDecoration: 'none' }}
                                >
                                  View
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteRadiologyReport(report.id)}
                                style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Medical Reports Tab */}
            {activeTab === 'medical' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>Medical Reports</h2>
                  <button
                    onClick={() => setShowMedicalForm(true)}
                    style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    + Add Medical Report
                  </button>
                </div>

                {medicalLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  </div>
                ) : medicalReports.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6B7280', padding: '48px 0' }}>No medical reports found</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead style={{ background: '#F9FAFB' }}>
                        <tr>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Report #
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Title
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Type
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Visit Date
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Doctor
                          </th>
                          <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ background: '#FFFFFF' }}>
                        {medicalReports.map((report) => (
                          <tr key={report.id}>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                              {report.report_number}
                            </td>
                            <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1F2937' }}>
                              {report.title}
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#6B7280' }}>
                              {report.report_type_label}
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#6B7280' }}>
                              {formatDate(report.visit_date)}
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#6B7280' }}>
                              {report.doctor_name}
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '600' }}>
                              {report.file_url && (
                                <a
                                  href={report.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#3B82F6', marginRight: '16px', textDecoration: 'none' }}
                                >
                                  View
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteMedicalReport(report.id)}
                                style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Lab Report Form Modal */}
        {showLabForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1F2937' }}>Add Lab Report</h3>
              
              <form onSubmit={handleLabFormSubmit}>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Test Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Test Name <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={labFormData.test_name}
                      onChange={(e) => setLabFormData({ ...labFormData, test_name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      placeholder="e.g., Complete Blood Count"
                    />
                  </div>

                  {/* Test Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Test Description
                    </label>
                    <textarea
                      value={labFormData.test_description}
                      onChange={(e) => setLabFormData({ ...labFormData, test_description: e.target.value })}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Brief description of the test"
                    />
                  </div>

                  {/* Test Date and Result Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Test Date <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={labFormData.test_date}
                        onChange={(e) => setLabFormData({ ...labFormData, test_date: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Result Date
                      </label>
                      <input
                        type="date"
                        value={labFormData.result_date}
                        onChange={(e) => setLabFormData({ ...labFormData, result_date: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Status
                    </label>
                    <select
                      value={labFormData.status}
                      onChange={(e) => setLabFormData({ ...labFormData, status: e.target.value as 'pending' | 'in_progress' | 'completed' | 'cancelled' })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Results */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Results
                    </label>
                    <textarea
                      value={labFormData.results}
                      onChange={(e) => setLabFormData({ ...labFormData, results: e.target.value })}
                      rows={4}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Test results and findings"
                    />
                  </div>

                  {/* Doctor and Technician */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Doctor Name
                      </label>
                      <input
                        type="text"
                        value={labFormData.doctor_name}
                        onChange={(e) => setLabFormData({ ...labFormData, doctor_name: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Technician Name
                      </label>
                      <input
                        type="text"
                        value={labFormData.technician_name}
                        onChange={(e) => setLabFormData({ ...labFormData, technician_name: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Notes
                    </label>
                    <textarea
                      value={labFormData.notes}
                      onChange={(e) => setLabFormData({ ...labFormData, notes: e.target.value })}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Additional notes or comments"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Upload Report (PDF)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setLabFile(e.target.files?.[0] || null)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      style={{ flex: 1, padding: '12px 16px', background: formSubmitting ? '#9CA3AF' : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: formSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                      {formSubmitting ? 'Saving...' : 'Save Report'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLabForm(false)}
                      disabled={formSubmitting}
                      style={{ flex: 1, padding: '12px 16px', background: '#E5E7EB', color: '#1F2937', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: formSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Radiology Report Form Modal */}
        {showRadiologyForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1F2937' }}>Add Radiology Report</h3>
              
              <form onSubmit={handleRadiologyFormSubmit}>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Study Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Study Description <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={radiologyFormData.study_description}
                      onChange={(e) => setRadiologyFormData({ ...radiologyFormData, study_description: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      placeholder="e.g., Chest X-Ray PA and Lateral"
                    />
                  </div>

                  {/* Modality */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Modality
                    </label>
                    <select
                      value={radiologyFormData.modality}
                      onChange={(e) => setRadiologyFormData({ ...radiologyFormData, modality: e.target.value as 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'Mammography' | 'PET' | 'Other' })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="X-Ray">X-Ray</option>
                      <option value="CT">CT Scan</option>
                      <option value="MRI">MRI</option>
                      <option value="Ultrasound">Ultrasound</option>
                      <option value="Mammography">Mammography</option>
                      <option value="PET">PET Scan</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Clinical Indication */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Clinical Indication
                    </label>
                    <textarea
                      value={radiologyFormData.clinical_indication}
                      onChange={(e) => setRadiologyFormData({ ...radiologyFormData, clinical_indication: e.target.value })}
                      rows={2}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Reason for examination"
                    />
                  </div>

                  {/* Study Date and Report Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Study Date <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={radiologyFormData.study_date}
                        onChange={(e) => setRadiologyFormData({ ...radiologyFormData, study_date: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Report Date
                      </label>
                      <input
                        type="date"
                        value={radiologyFormData.report_date}
                        onChange={(e) => setRadiologyFormData({ ...radiologyFormData, report_date: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Status
                    </label>
                    <select
                      value={radiologyFormData.status}
                      onChange={(e) => setRadiologyFormData({ ...radiologyFormData, status: e.target.value as 'scheduled' | 'in_progress' | 'completed' | 'cancelled' })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Findings */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Findings
                    </label>
                    <textarea
                      value={radiologyFormData.findings}
                      onChange={(e) => setRadiologyFormData({ ...radiologyFormData, findings: e.target.value })}
                      rows={4}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Detailed findings from the study"
                    />
                  </div>

                  {/* Impression */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Impression
                    </label>
                    <textarea
                      value={radiologyFormData.impression}
                      onChange={(e) => setRadiologyFormData({ ...radiologyFormData, impression: e.target.value })}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Summary and interpretation"
                    />
                  </div>

                  {/* Recommendations */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Recommendations
                    </label>
                    <textarea
                      value={radiologyFormData.recommendations}
                      onChange={(e) => setRadiologyFormData({ ...radiologyFormData, recommendations: e.target.value })}
                      rows={2}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Follow-up recommendations"
                    />
                  </div>

                  {/* Radiologist and Technician */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Radiologist Name
                      </label>
                      <input
                        type="text"
                        value={radiologyFormData.radiologist_name}
                        onChange={(e) => setRadiologyFormData({ ...radiologyFormData, radiologist_name: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Technician Name
                      </label>
                      <input
                        type="text"
                        value={radiologyFormData.technician_name}
                        onChange={(e) => setRadiologyFormData({ ...radiologyFormData, technician_name: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Upload Report (PDF)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setRadiologyFile(e.target.files?.[0] || null)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      style={{ flex: 1, padding: '12px 16px', background: formSubmitting ? '#9CA3AF' : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: formSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                      {formSubmitting ? 'Saving...' : 'Save Report'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRadiologyForm(false)}
                      disabled={formSubmitting}
                      style={{ flex: 1, padding: '12px 16px', background: '#E5E7EB', color: '#1F2937', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: formSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Medical Report Form Modal */}
        {showMedicalForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', maxWidth: '700px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1F2937' }}>Add Medical Report</h3>
              
              <form onSubmit={handleMedicalFormSubmit}>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Report Title <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={medicalFormData.title}
                      onChange={(e) => setMedicalFormData({ ...medicalFormData, title: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      placeholder="e.g., Follow-up Consultation"
                    />
                  </div>

                  {/* Report Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Report Type
                    </label>
                    <select
                      value={medicalFormData.report_type}
                      onChange={(e) => setMedicalFormData({ ...medicalFormData, report_type: e.target.value as 'consultation' | 'follow_up' | 'discharge' | 'procedure' | 'emergency' | 'other' })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="consultation">Consultation</option>
                      <option value="follow_up">Follow-up</option>
                      <option value="discharge">Discharge Summary</option>
                      <option value="procedure">Procedure Note</option>
                      <option value="emergency">Emergency Report</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Doctor, Department, and Visit Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Doctor Name <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={medicalFormData.doctor_name}
                        onChange={(e) => setMedicalFormData({ ...medicalFormData, doctor_name: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Department
                      </label>
                      <input
                        type="text"
                        value={medicalFormData.department}
                        onChange={(e) => setMedicalFormData({ ...medicalFormData, department: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  {/* Visit Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Visit Date <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={medicalFormData.visit_date}
                      onChange={(e) => setMedicalFormData({ ...medicalFormData, visit_date: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>

                  {/* Chief Complaint */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Chief Complaint
                    </label>
                    <textarea
                      value={medicalFormData.chief_complaint}
                      onChange={(e) => setMedicalFormData({ ...medicalFormData, chief_complaint: e.target.value })}
                      rows={2}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Patient's main reason for visit"
                    />
                  </div>

                  {/* History of Present Illness */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      History of Present Illness
                    </label>
                    <textarea
                      value={medicalFormData.history_of_present_illness}
                      onChange={(e) => setMedicalFormData({ ...medicalFormData, history_of_present_illness: e.target.value })}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Detailed history of the current condition"
                    />
                  </div>

                  {/* Physical Examination */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Physical Examination
                    </label>
                    <textarea
                      value={medicalFormData.physical_examination}
                      onChange={(e) => setMedicalFormData({ ...medicalFormData, physical_examination: e.target.value })}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Physical examination findings"
                    />
                  </div>

                  {/* Diagnosis */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Diagnosis
                    </label>
                    <textarea
                      value={medicalFormData.diagnosis}
                      onChange={(e) => setMedicalFormData({ ...medicalFormData, diagnosis: e.target.value })}
                      rows={2}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Medical diagnosis"
                    />
                  </div>

                  {/* Treatment Plan */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Treatment Plan
                    </label>
                    <textarea
                      value={medicalFormData.treatment_plan}
                      onChange={(e) => setMedicalFormData({ ...medicalFormData, treatment_plan: e.target.value })}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Proposed treatment and interventions"
                    />
                  </div>

                  {/* Medications */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Medications
                    </label>
                    <textarea
                      value={medicalFormData.medications}
                      onChange={(e) => setMedicalFormData({ ...medicalFormData, medications: e.target.value })}
                      rows={2}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Prescribed medications and dosages"
                    />
                  </div>

                  {/* Follow-up Instructions */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Follow-up Instructions
                    </label>
                    <textarea
                      value={medicalFormData.follow_up_instructions}
                      onChange={(e) => setMedicalFormData({ ...medicalFormData, follow_up_instructions: e.target.value })}
                      rows={2}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Instructions for follow-up care"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Additional Notes
                    </label>
                    <textarea
                      value={medicalFormData.notes}
                      onChange={(e) => setMedicalFormData({ ...medicalFormData, notes: e.target.value })}
                      rows={2}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                      placeholder="Any additional notes or observations"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Upload Report (PDF)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setMedicalFile(e.target.files?.[0] || null)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      style={{ flex: 1, padding: '12px 16px', background: formSubmitting ? '#9CA3AF' : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: formSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                      {formSubmitting ? 'Saving...' : 'Save Report'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMedicalForm(false)}
                      disabled={formSubmitting}
                      style={{ flex: 1, padding: '12px 16px', background: '#E5E7EB', color: '#1F2937', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: formSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PatientDetails;




