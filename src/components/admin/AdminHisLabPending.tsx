import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

interface HisLabPending {
  id: number;
  LBPNDID: string;
  FileNumber: string;
  InvoiceNo: string;
  EntryDate: string;
  EntryTime: string;
  LABSLNO: string;
  Service: string;
  Name: string;
  STATUS: string;
  DOCTORCODE: string;
  CompanyPatient: string;
  patient?: {
    Name: string;
    MiddleName: string;
    FamilyName: string;
    Telephone: string;
  };
}

interface HisLabPendingStats {
  total_records: number;
  by_status: Record<string, number>;
  today: number;
  this_week: number;
  this_month: number;
  last_sync: string | null;
}

const AdminHisLabPending: React.FC = () => {
  const [reports, setReports] = useState<HisLabPending[]>([]);
  const [stats, setStats] = useState<HisLabPendingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [perPage] = useState(15);
  const [selectedReport, setSelectedReport] = useState<HisLabPending | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchColumn, setSearchColumn] = useState('FileNumber');

  useEffect(() => {
    fetchStats();
    fetchReports();
  }, [currentPage]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/his-lab-pending/stats`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
        params.append('search_column', searchColumn);
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/his-lab-pending?${params.toString()}`,
        { headers: getAuthHeaders() }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.data);
        setTotalPages(data.pagination?.last_page || 1);
        setTotalReports(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchReports();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRowClick = (report: HisLabPending) => {
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
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0a4d68', marginBottom: '8px' }}>
              HIS Lab Pending Reports
            </h1>
            <p style={{ color: '#64748b', fontSize: '16px' }}>
              Manage and view lab pending reports from HIS
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
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Total Records</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#0a4d68' }}>{stats.total_records}</p>
            </div>
            <div style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Today</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.today}</p>
            </div>
            <div style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>This Week</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>{stats.this_week}</p>
            </div>
            <div style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>This Month</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6' }}>{stats.this_month}</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '14px' }}>
                Search By
              </label>
              <select
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                <option value="FileNumber">File Number</option>
                <option value="LBPNDID">Lab Pending ID</option>
                <option value="LABSLNO">Lab SLNO</option>
                <option value="InvoiceNo">Invoice No</option>
              </select>
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '14px' }}>
                Search Term
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter search term..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              style={{
                padding: '12px 24px',
                background: '#0a4d68',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Search
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
                setTimeout(fetchReports, 0);
              }}
              style={{
                padding: '12px 24px',
                background: '#e2e8f0',
                color: '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>File Number</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Lab SLNO</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Service Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Entry Date</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Patient</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                      Loading...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr
                      key={report.id}
                      onClick={() => handleRowClick(report)}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '16px', fontSize: '14px', color: '#0a4d68', fontWeight: '600' }}>
                        {report.FileNumber}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{report.LABSLNO || 'N/A'}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{report.Name || 'N/A'}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{formatDate(report.EntryDate)}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: '#fef3c7',
                          color: '#92400e',
                        }}>
                          {report.STATUS || 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>
                        {report.patient ? 
                          `${report.patient.Name} ${report.patient.MiddleName || ''} ${report.patient.FamilyName || ''}`.trim() 
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && reports.length > 0 && (
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalReports)} of {totalReports} reports
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e2e8f0',
                    background: currentPage === 1 ? '#f8fafc' : '#fff',
                    borderRadius: '8px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    color: currentPage === 1 ? '#cbd5e1' : '#64748b',
                  }}
                >
                  Previous
                </button>
                <span style={{ padding: '8px 16px', color: '#64748b' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e2e8f0',
                    background: currentPage === totalPages ? '#f8fafc' : '#fff',
                    borderRadius: '8px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    color: currentPage === totalPages ? '#cbd5e1' : '#64748b',
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedReport && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
            onClick={closeModal}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#0a4d68' }}>
                Lab Pending Details
              </h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Lab Pending ID</p>
                  <p style={{ fontWeight: '600' }}>{selectedReport.LBPNDID}</p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>File Number</p>
                  <p style={{ fontWeight: '600' }}>{selectedReport.FileNumber}</p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Lab SLNO</p>
                  <p style={{ fontWeight: '600' }}>{selectedReport.LABSLNO || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Service</p>
                  <p style={{ fontWeight: '600' }}>{selectedReport.Service || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Service Name</p>
                  <p style={{ fontWeight: '600' }}>{selectedReport.Name || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Entry Date</p>
                  <p style={{ fontWeight: '600' }}>{formatDate(selectedReport.EntryDate)}</p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Status</p>
                  <p style={{ fontWeight: '600' }}>{selectedReport.STATUS || 'Pending'}</p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Invoice No</p>
                  <p style={{ fontWeight: '600' }}>{selectedReport.InvoiceNo || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Doctor Code</p>
                  <p style={{ fontWeight: '600' }}>{selectedReport.DOCTORCODE || 'N/A'}</p>
                </div>
                {selectedReport.patient && (
                  <div>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Patient</p>
                    <p style={{ fontWeight: '600' }}>
                      {`${selectedReport.patient.Name} ${selectedReport.patient.MiddleName || ''} ${selectedReport.patient.FamilyName || ''}`.trim()}
                    </p>
                    {selectedReport.patient.Telephone && (
                      <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                        Tel: {selectedReport.patient.Telephone}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={closeModal}
                style={{
                  marginTop: '24px',
                  padding: '12px 24px',
                  background: '#0a4d68',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminHisLabPending;
