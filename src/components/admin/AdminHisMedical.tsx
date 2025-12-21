import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getHisMedicalReports, getHisMedicalStats } from '../../services/hisMedicalService';
import type { HisMedicalReport, HisMedicalStats } from '../../services/hisMedicalService';

const AdminHisMedical: React.FC = () => {
  const [reports, setReports] = useState<HisMedicalReport[]>([]);
  const [stats, setStats] = useState<HisMedicalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [perPage] = useState(15);
  const [selectedReport, setSelectedReport] = useState<HisMedicalReport | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
    fetchReports();
  }, [currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      const statsData = await getHisMedicalStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching HIS medical stats:', error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getHisMedicalReports(currentPage, perPage, {
        search: searchTerm || undefined,
      });
      setReports(data.data);
      setTotalPages(data.pagination?.last_page || 1);
      setTotalReports(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching HIS medical reports:', error);
      alert('Failed to load HIS medical reports');
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

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const handleRowClick = (report: HisMedicalReport) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
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
              HIS Medical Reports
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Synced medical reports and sick leave from Hospital Information System
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
                Total Reports
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
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Unique Patients
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.unique_patients.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                This Week
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.synced_this_week.toLocaleString()}
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
              placeholder="Search by File Number, CODE, Patient Name, Doctor..."
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
            <button
              onClick={fetchReports}
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
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
              No reports found
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
                      <th style={tableHeaderStyle}>CODE</th>
                      <th style={tableHeaderStyle}>File Number</th>
                      <th style={tableHeaderStyle}>Report Date</th>
                      <th style={tableHeaderStyle}>Report Type</th>
                      <th style={tableHeaderStyle}>Patient Name</th>
                      <th style={tableHeaderStyle}>Doctor</th>
                      <th style={tableHeaderStyle}>Report To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report, index) => (
                      <tr
                        key={report.id || index}
                        onClick={() => handleRowClick(report)}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={tableCellStyle}>{report.CODE || 'N/A'}</td>
                        <td style={tableCellStyle}>{report.FILENUMBER || 'N/A'}</td>
                        <td style={tableCellStyle}>{formatDate(report.MRDATE)}</td>
                        <td style={tableCellStyle}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            background: '#e0f2fe',
                            color: '#0369a1',
                          }}>
                            {report.ReportType || 'N/A'}
                          </span>
                        </td>
                        <td style={tableCellStyle}>{report.PATNAME || 'N/A'}</td>
                        <td style={tableCellStyle}>{report.DRNAME || 'N/A'}</td>
                        <td style={tableCellStyle}>{report.MRTO || 'N/A'}</td>
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
                  {Math.min(currentPage * perPage, totalReports)} of{' '}
                  {totalReports} reports
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
      {showModal && selectedReport && (
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
                Medical Report Details
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
              {/* Report Information */}
              <Section title="Report Information">
                <InfoRow label="CODE" value={selectedReport.CODE} />
                <InfoRow label="File Number" value={selectedReport.FILENUMBER} />
                <InfoRow label="Patient ID" value={selectedReport.PatientID} />
                <InfoRow label="Report Type" value={selectedReport.ReportType} />
                <InfoRow label="Report Date" value={formatDate(selectedReport.MRDATE)} />
                <InfoRow label="Report To" value={selectedReport.MRTO} />
              </Section>

              {/* Attendance Information */}
              <Section title="Attendance Information">
                <InfoRow label="Attendance Date" value={formatDate(selectedReport.ATTDATE)} />
                <InfoRow label="Attendance Time" value={formatTime(selectedReport.ATTTIME)} />
              </Section>

              {/* Patient Information */}
              <Section title="Patient Information">
                <InfoRow label="Patient Name" value={selectedReport.PATNAME} />
                <InfoRow label="Payment Type" value={selectedReport.COMPCASH === '1' ? 'Credit/Company' : 'Cash'} />
              </Section>

              {/* Doctor Information */}
              <Section title="Doctor Information">
                <InfoRow label="Doctor Name" value={selectedReport.DRNAME} />
                <InfoRow label="Doctor Code" value={selectedReport.DRCODE} />
                <InfoRow label="Inspection Code" value={selectedReport.InspectionCode} />
              </Section>

              {/* Medical Report Description (English) */}
              {selectedReport.MRDESC && (
                <Section title="Medical Report Description (English)">
                  <div style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    color: '#374151',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6',
                  }}>
                    {selectedReport.MRDESC}
                  </div>
                </Section>
              )}

              {/* Medical Report Description (Arabic) */}
              {selectedReport.MRDESCNCHAR && (
                <Section title="Medical Report Description (Arabic)">
                  <div style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    color: '#374151',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.8',
                    direction: 'rtl',
                    fontFamily: 'Arial, sans-serif',
                  }}>
                    {selectedReport.MRDESCNCHAR}
                  </div>
                </Section>
              )}

              {/* System Information */}
              <Section title="System Information">
                <InfoRow label="Last Synced" value={selectedReport.last_synced_at ? formatDate(selectedReport.last_synced_at) : null} />
                <InfoRow label="Created At" value={selectedReport.created_at ? formatDate(selectedReport.created_at) : null} />
                <InfoRow label="Updated At" value={selectedReport.updated_at ? formatDate(selectedReport.updated_at) : null} />
              </Section>

              {/* Patient Information (if linked) */}
              {selectedReport.patient && (
                <Section title="Linked Patient Account">
                  <InfoRow label="Patient ID" value={selectedReport.patient.id?.toString()} />
                  <InfoRow label="File Number" value={selectedReport.patient.FileNumber} />
                  <InfoRow label="Full Name" value={`${selectedReport.patient.Name} ${selectedReport.patient.MiddleName || ''} ${selectedReport.patient.FamilyName || ''}`.trim()} />
                  <InfoRow label="Phone" value={selectedReport.patient.Telephone} />
                </Section>
              )}
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
    gridTemplateColumns: '180px 1fr',
    gap: '16px',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
  }}>
    <span style={{ fontWeight: '600', color: '#374151' }}>{label}:</span>
    <span style={{ color: '#6b7280', wordBreak: 'break-word' }}>{value || 'N/A'}</span>
  </div>
);

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

export default AdminHisMedical;
