import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getHisConsultations, getHisConsultationStats } from '../../services/hisConsultationService';
import type { HisConsultation, HisConsultationStats } from '../../services/hisConsultationService';

const AdminHisConsultations: React.FC = () => {
  const [consultations, setConsultations] = useState<HisConsultation[]>([]);
  const [stats, setStats] = useState<HisConsultationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [perPage] = useState(15);
  const [selectedConsultation, setSelectedConsultation] = useState<HisConsultation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [withAdmissions, setWithAdmissions] = useState(false);
  const [withSickLeave, setWithSickLeave] = useState(false);
  const [withAllergies, setWithAllergies] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchConsultations();
  }, [currentPage, searchTerm, withAdmissions, withSickLeave, withAllergies]);

  const fetchData = async () => {
    try {
      const statsData = await getHisConsultationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching HIS consultation stats:', error);
    }
  };

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const data = await getHisConsultations(currentPage, perPage, {
        search: searchTerm || undefined,
        with_admissions: withAdmissions || undefined,
        with_sick_leave: withSickLeave || undefined,
        with_allergies: withAllergies || undefined,
      });
      setConsultations(data.data);
      setTotalPages(data.pagination?.last_page || 1);
      setTotalConsultations(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching HIS consultations:', error);
      alert('Failed to load HIS consultations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRowClick = (consultation: HisConsultation) => {
    setSelectedConsultation(consultation);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedConsultation(null);
  };

  return (
    <AdminLayout>
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#0a4d68',
              marginBottom: '8px',
            }}>
              HIS Consultations
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Synced consultation records from Hospital Information System
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0a4d68 0%, #088395 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Total Consultations
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.total_synced.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #088395 0%, #05bfdb 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Synced Today
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.synced_today.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                With Admissions
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.with_admissions.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                With Allergies
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.with_allergies.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                With Sick Leave
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.with_sick_leave.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Linked to Users
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.linked_to_users.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Search and Controls */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by diagnosis, patient code, inspection code..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                flex: 1,
                minWidth: '300px',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#088395'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={withAdmissions}
                onChange={(e) => {
                  setWithAdmissions(e.target.checked);
                  setCurrentPage(1);
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#f97316' }}>
                Admissions
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={withSickLeave}
                onChange={(e) => {
                  setWithSickLeave(e.target.checked);
                  setCurrentPage(1);
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#8b5cf6' }}>
                Sick Leave
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={withAllergies}
                onChange={(e) => {
                  setWithAllergies(e.target.checked);
                  setCurrentPage(1);
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#dc2626' }}>
                Allergies
              </span>
            </label>

            <button
              onClick={fetchConsultations}
              style={{
                padding: '12px 24px',
                background: '#088395',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#0a4d68'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#088395'}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
              Loading consultations...
            </div>
          ) : consultations.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
              No consultations found
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={tableHeaderStyle}>Inspection Code</th>
                      <th style={tableHeaderStyle}>Patient Code</th>
                      <th style={tableHeaderStyle}>Date</th>
                      <th style={tableHeaderStyle}>Diagnosis</th>
                      <th style={tableHeaderStyle}>Doctor</th>
                      <th style={tableHeaderStyle}>Dept</th>
                      <th style={tableHeaderStyle}>Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.map((consultation, index) => (
                      <tr
                        key={consultation.id || index}
                        onClick={() => handleRowClick(consultation)}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={tableCellStyle}>
                          <span style={{ fontWeight: '600', color: '#0a4d68' }}>
                            {consultation.inspection_code}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          {consultation.patient_code}
                          {consultation.user && (
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                              {consultation.user.name}
                            </div>
                          )}
                        </td>
                        <td style={tableCellStyle}>
                          {formatDate(consultation.consultation_date || consultation.inspection_date)}
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                            {consultation.inspection_time}
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {consultation.diagnosis || consultation.chief_complaint || 'N/A'}
                          </div>
                        </td>
                        <td style={tableCellStyle}>{consultation.doctor_code}</td>
                        <td style={tableCellStyle}>{consultation.dept_code}</td>
                        <td style={tableCellStyle}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {consultation.allergy && (
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: '#fee2e2',
                                color: '#991b1b',
                              }}>
                                ⚠️ Allergy
                              </span>
                            )}
                            {consultation.tobe_admitted && (
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: '#fed7aa',
                                color: '#9a3412',
                              }}>
                                🏥 Admit
                              </span>
                            )}
                            {consultation.sick_leave && (
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: '#e9d5ff',
                                color: '#6b21a8',
                              }}>
                                📋 Sick Leave
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderTop: '1px solid #e5e7eb',
              }}>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                  Showing {((currentPage - 1) * perPage) + 1} to{' '}
                  {Math.min(currentPage * perPage, totalConsultations)} of{' '}
                  {totalConsultations} consultations
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      background: currentPage === 1 ? '#f9fafb' : 'white',
                      color: currentPage === 1 ? '#9ca3af' : '#374151',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    Previous
                  </button>
                  <div style={{
                    padding: '8px 16px',
                    border: '1px solid #088395',
                    borderRadius: '6px',
                    background: '#088395',
                    color: 'white',
                    fontWeight: '500',
                  }}>
                    {currentPage}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      background: currentPage === totalPages ? '#f9fafb' : 'white',
                      color: currentPage === totalPages ? '#9ca3af' : '#374151',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedConsultation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 1,
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#0a4d68',
              }}>
                Consultation Details
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px',
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {/* Alerts */}
              {selectedConsultation.allergy && (
                <div style={{
                  padding: '12px 16px',
                  background: '#fee2e2',
                  border: '2px solid #dc2626',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontWeight: '600',
                  color: '#991b1b',
                }}>
                  ⚠️ ALLERGY ALERT: {selectedConsultation.allergy_text || 'Patient has allergies recorded'}
                </div>
              )}

              {/* Consultation Information */}
              <Section title="Consultation Information">
                <InfoRow label="Inspection Code" value={selectedConsultation.inspection_code} />
                <InfoRow label="Patient Code" value={selectedConsultation.patient_code} />
                <InfoRow label="Consultation Date" value={formatDateTime(selectedConsultation.consultation_date)} />
                <InfoRow label="Inspection Date" value={formatDateTime(selectedConsultation.inspection_date)} />
                <InfoRow label="Inspection Time" value={selectedConsultation.inspection_time} />
                <InfoRow label="Department Code" value={selectedConsultation.dept_code?.toString()} />
                <InfoRow label="Doctor Code" value={selectedConsultation.doctor_code?.toString()} />
                <InfoRow label="Invoice No" value={selectedConsultation.invoice_no} />
              </Section>

              {/* Linked User */}
              {selectedConsultation.user && (
                <Section title="Linked User Account">
                  <InfoRow label="User ID" value={selectedConsultation.user.id?.toString()} />
                  <InfoRow label="Name" value={selectedConsultation.user.name} />
                  <InfoRow label="Email" value={selectedConsultation.user.email} />
                  <InfoRow label="Phone" value={selectedConsultation.user.phone} />
                  <InfoRow label="MR Number" value={selectedConsultation.user.medical_record_number} />
                </Section>
              )}

              {/* Vital Signs */}
              <Section title="Vital Signs">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <VitalCard label="Blood Pressure" value={selectedConsultation.bp_min && selectedConsultation.bp_max ? `${selectedConsultation.bp_min}/${selectedConsultation.bp_max}` : null} />
                  <VitalCard label="Temperature" value={selectedConsultation.temperature ? `${selectedConsultation.temperature}°C` : null} />
                  <VitalCard label="Pulse" value={selectedConsultation.pulse} />
                  <VitalCard label="Respiratory Rate" value={selectedConsultation.rr} />
                  <VitalCard label="Weight" value={selectedConsultation.weight ? `${selectedConsultation.weight} ${selectedConsultation.wunit || ''}` : null} />
                  <VitalCard label="Height" value={selectedConsultation.height ? `${selectedConsultation.height} ${selectedConsultation.hunit || ''}` : null} />
                  <VitalCard label="BMI" value={selectedConsultation.bmi} />
                  <VitalCard label="SpO2" value={selectedConsultation.spo2} />
                  <VitalCard label="Blood Sugar" value={selectedConsultation.sugar} />
                </div>
              </Section>

              {/* Clinical Assessment */}
              {(selectedConsultation.chief_complaint || selectedConsultation.diagnosis || selectedConsultation.prov_diagonosis) && (
                <Section title="Clinical Assessment">
                  <TextBlock label="Chief Complaint" value={selectedConsultation.chief_complaint} />
                  <TextBlock label="Diagnosis" value={selectedConsultation.diagnosis} />
                  <TextBlock label="Provisional Diagnosis" value={selectedConsultation.prov_diagonosis} />
                  <TextBlock label="Chest" value={selectedConsultation.chest} />
                  <TextBlock label="Abdomen" value={selectedConsultation.abdomen} />
                </Section>
              )}

              {/* Treatment & Advice */}
              {(selectedConsultation.instruction || selectedConsultation.advice_treat || selectedConsultation.advice_med) && (
                <Section title="Treatment & Medical Advice">
                  <TextBlock label="Instructions" value={selectedConsultation.instruction} />
                  <TextBlock label="Treatment Advice" value={selectedConsultation.advice_treat} />
                  <TextBlock label="Medication Advice" value={selectedConsultation.advice_med} />
                  <TextBlock label="Other Advice" value={selectedConsultation.advice_other} />
                </Section>
              )}

              {/* Follow-up */}
              {(selectedConsultation.revisit_after || selectedConsultation.follow_up_notes) && (
                <Section title="Follow-up">
                  <InfoRow label="Revisit After" value={selectedConsultation.revisit_after ? `${selectedConsultation.revisit_after} ${selectedConsultation.revisit_after_unit || ''}` : null} />
                  <TextBlock label="Follow-up Notes" value={selectedConsultation.follow_up_notes} />
                </Section>
              )}

              {/* Admission Details */}
              {selectedConsultation.tobe_admitted && (
                <Section title="Admission Details">
                  <InfoRow label="Admission Required" value="Yes" />
                  <InfoRow label="Date of Admission" value={formatDateTime(selectedConsultation.date_of_admit)} />
                  <InfoRow label="Estimated Days" value={selectedConsultation.estimated_days?.toString()} />
                  <TextBlock label="Admission Details" value={selectedConsultation.admition_detail} />
                </Section>
              )}

              {/* Sick Leave */}
              {selectedConsultation.sick_leave && (
                <Section title="Sick Leave">
                  <InfoRow label="Duration" value={selectedConsultation.sick_leave ? `${selectedConsultation.sick_leave} days` : null} />
                  <InfoRow label="Start Date" value={formatDate(selectedConsultation.sick_leave_start_date)} />
                  <TextBlock label="Notes" value={selectedConsultation.sick_leave_note} />
                </Section>
              )}

              {/* System Information */}
              <Section title="System Information">
                <InfoRow label="Created At" value={formatDateTime(selectedConsultation.created_at)} />
                <InfoRow label="Updated At" value={formatDateTime(selectedConsultation.updated_at)} />
                <InfoRow label="Last Modified (HIS)" value={formatDateTime(selectedConsultation.m_when)} />
              </Section>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

// Reusable Components
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '24px' }}>
    <h3 style={{
      fontSize: '18px',
      fontWeight: '600',
      color: '#0a4d68',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '2px solid #088395',
    }}>
      {title}
    </h3>
    <div style={{ display: 'grid', gap: '12px' }}>
      {children}
    </div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '200px 1fr',
    gap: '16px',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
  }}>
    <span style={{ fontWeight: '600', color: '#374151' }}>{label}:</span>
    <span style={{ color: '#6b7280', wordBreak: 'break-word' }}>{value || 'N/A'}</span>
  </div>
);

const TextBlock: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontWeight: '600', color: '#374151', marginBottom: '6px' }}>{label}:</div>
      <div style={{
        padding: '12px',
        background: '#f9fafb',
        borderRadius: '8px',
        color: '#6b7280',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {value}
      </div>
    </div>
  );
};

const VitalCard: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div style={{
      padding: '12px',
      background: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #bae6fd',
    }}>
      <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '18px', color: '#0c4a6e', fontWeight: '700' }}>{value}</div>
    </div>
  );
};

// Styles
const tableHeaderStyle: React.CSSProperties = {
  padding: '16px',
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  borderBottom: '2px solid #e5e7eb',
};

const tableCellStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '14px',
  color: '#6b7280',
};

export default AdminHisConsultations;
