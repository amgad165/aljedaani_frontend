import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getHisRadiologyReports, getHisRadiologyStats } from '../../services/hisRadiologyService';
import type { HisRadiologyReport, HisRadiologyStats } from '../../services/hisRadiologyService';

const AdminHisRadiology: React.FC = () => {
  const [reports, setReports] = useState<HisRadiologyReport[]>([]);
  const [stats, setStats] = useState<HisRadiologyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [perPage] = useState(15);
  const [selectedReport, setSelectedReport] = useState<HisRadiologyReport | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [panicOnly, setPanicOnly] = useState(false);

  useEffect(() => {
    fetchData();
    fetchReports();
  }, [currentPage, searchTerm, panicOnly]);

  const fetchData = async () => {
    try {
      const statsData = await getHisRadiologyStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching HIS radiology stats:', error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getHisRadiologyReports(currentPage, perPage, {
        search: searchTerm || undefined,
        panic_only: panicOnly || undefined,
      });
      setReports(data.data);
      setTotalPages(data.pagination?.last_page || 1);
      setTotalReports(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching HIS radiology reports:', error);
      alert('Failed to load HIS radiology reports');
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

  const handleRowClick = (report: HisRadiologyReport) => {
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
              HIS Radiology Reports
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Synced radiology reports from Hospital Information System
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
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Panic Reports
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.panic_reports.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Last 24 Hours
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.recent_sync.last_24_hours.toLocaleString()}
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
              placeholder="Search by File Number, SLNO, Invoice, Patient Code..."
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
                checked={panicOnly}
                onChange={(e) => {
                  setPanicOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '16px', fontWeight: '500', color: '#dc2626' }}>
                Panic Only
              </span>
            </label>
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
                      <th style={tableHeaderStyle}>SLNO</th>
                      <th style={tableHeaderStyle}>File Number</th>
                      <th style={tableHeaderStyle}>Name</th>
                      <th style={tableHeaderStyle}>Date</th>
                      <th style={tableHeaderStyle}>Time</th>
                      <th style={tableHeaderStyle}>Status</th>
                      <th style={tableHeaderStyle}>Department</th>
                      <th style={tableHeaderStyle}>Doctor</th>
                      <th style={tableHeaderStyle}>Panic</th>
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
                        <td style={tableCellStyle}>{report.SLNO || 'N/A'}</td>
                        <td style={tableCellStyle}>{report.FILENUMBER || 'N/A'}</td>
                        <td style={tableCellStyle}>{report.NAME || 'N/A'}</td>
                        <td style={tableCellStyle}>{formatDate(report.R_DATE)}</td>
                        <td style={tableCellStyle}>{formatTime(report.R_TIME)}</td>
                        <td style={tableCellStyle}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            background: report.STATUS === '1' ? '#dcfce7' : '#e5e7eb',
                            color: report.STATUS === '1' ? '#166534' : '#374151',
                          }}>
                            {report.STATUS === '1' ? 'Completed' : report.STATUS === '0' ? 'Pending' : 'N/A'}
                          </span>
                        </td>
                        <td style={tableCellStyle}>{report.DEPTCODE || 'N/A'}</td>
                        <td style={tableCellStyle}>{report.DOCTORCODE || 'N/A'}</td>
                        <td style={tableCellStyle}>
                          {report.PANIC && report.PANIC !== 'NO' ? (
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '14px',
                              fontWeight: '700',
                              background: '#fee2e2',
                              color: '#991b1b',
                            }}>
                              🚨 PANIC
                            </span>
                          ) : '-'}
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
              maxWidth: '800px',
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
                Radiology Report Details
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
                <InfoRow label="SLNO" value={selectedReport.SLNO} />
                <InfoRow label="File Number" value={selectedReport.FILENUMBER} />
                <InfoRow label="Name" value={selectedReport.NAME} />
                <InfoRow label="Report Date" value={formatDate(selectedReport.R_DATE)} />
                <InfoRow label="Report Time" value={formatTime(selectedReport.R_TIME)} />
                <InfoRow label="Status" value={selectedReport.STATUS === '1' ? 'Completed' : selectedReport.STATUS === '0' ? 'Pending' : selectedReport.STATUS} />
                <InfoRow label="Invoice Number" value={selectedReport.INVOICENO} />
              </Section>

              {/* Patient Information */}
              <Section title="Patient Information">
                <InfoRow label="Patient Code" value={selectedReport.PatientUnCode} />
                <InfoRow label="Company Patient" value={selectedReport.COMPPATIENT} />
                <InfoRow label="In Patient" value={selectedReport.INPATIENT} />
                <InfoRow label="Payment Type" value={selectedReport.CASHCREDIT} />
              </Section>

              {/* Doctor & Department */}
              <Section title="Doctor & Department">
                <InfoRow label="Doctor Code" value={selectedReport.DOCTORCODE} />
                <InfoRow label="Referring Doctor" value={selectedReport.REFDOCTOR} />
                <InfoRow label="Department Code" value={selectedReport.DEPTCODE} />
                <InfoRow label="Alternate Dept" value={selectedReport.DEPTCODEALTER} />
              </Section>

              {/* Result */}
              <Section title="Result">
                <InfoRow label="Result" value={selectedReport.RESULT} />
                <InfoRow label="Result RTF" value={selectedReport.ResultRTF} />
                <InfoRow label="Result HTML to RTF" value={selectedReport.ResultHtomlToRTF} />
                <InfoRow label="X-Ray Number" value={selectedReport.XRAYNO} />
                <InfoRow label="Inspection Code" value={selectedReport.InspectionCode} />
              </Section>

              {/* Panic & Approval */}
              <Section title="Panic & Approval Status">
                <InfoRow label="Panic Flag" value={selectedReport.PANIC} />
                <InfoRow label="Panic User" value={selectedReport.PANICUSER} />
                <InfoRow label="Approval Status" value={selectedReport.APROVED} />
                <InfoRow label="Approved By" value={selectedReport.APPROVEDBY} />
                <InfoRow label="Approval Note" value={selectedReport.APPROVALNOTE} />
              </Section>

              {/* System Information */}
              <Section title="System Information">
                <InfoRow label="Case Code" value={selectedReport.CASECODE} />
                <InfoRow label="Entry Date" value={selectedReport.EntryDate ? formatDate(selectedReport.EntryDate) : null} />
                <InfoRow label="Last Synced" value={selectedReport.last_synced_at ? formatDate(selectedReport.last_synced_at) : null} />
                <InfoRow label="Created At" value={selectedReport.created_at ? formatDate(selectedReport.created_at) : null} />
                <InfoRow label="Updated At" value={selectedReport.updated_at ? formatDate(selectedReport.updated_at) : null} />
                <InfoRow label="Deleted At" value={selectedReport.deleted_at ? formatDate(selectedReport.deleted_at) : null} />
              </Section>

              {/* Sync Metadata */}
              {selectedReport.sync_metadata && (
                <Section title="Sync Metadata">
                  <InfoRow label="Synced From" value={selectedReport.sync_metadata.synced_from} />
                  <InfoRow label="Raw Data Hash" value={selectedReport.sync_metadata.raw_data_hash} />
                  {selectedReport.sync_metadata.error && (
                    <InfoRow label="Error" value={selectedReport.sync_metadata.error} />
                  )}
                </Section>
              )}

              {/* Patient Information (if linked) */}
              {selectedReport.patient && (
                <Section title="Linked Patient Account">
                  <InfoRow label="Patient ID" value={selectedReport.patient.id?.toString()} />
                  <InfoRow label="Patient Name" value={selectedReport.patient.name} />
                  <InfoRow label="Email" value={selectedReport.patient.email} />
                  <InfoRow label="Phone" value={selectedReport.patient.phone} />
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
    <span style={{ color: '#6b7280' }}>{value || 'N/A'}</span>
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

export default AdminHisRadiology;
