import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

interface HisShiftDefineDetail {
  id: number;
  Shift_DSlno: string;
  Day: string;
  smonth: string;
  ShiftYear: string;
  DoctorCode: string;
  shiftPrefix: string;
  last_synced_at: string;
  created_at: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

const AdminHisShiftDefineDetails: React.FC = () => {
  const [details, setDetails] = useState<HisShiftDefineDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [perPage] = useState(15);

  useEffect(() => {
    fetchDetails();
  }, [currentPage, searchTerm]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE_URL}/admin/his-shift-define-details?page=${currentPage}&per_page=${perPage}&search=${searchTerm}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch shift details');

      const result = await response.json();
      setDetails(result.data.data);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error('Error fetching HIS shift details:', error);
      alert('Failed to load HIS shift details');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShiftDate = (day: string, month: string, year: string) => {
    if (!day || !month || !year) return 'N/A';
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
              HIS Shift Assignments
            </h1>
            <p style={{ color: '#666', fontSize: '14px' }}>
              {pagination ? `Showing ${pagination.from || 0} to ${pagination.to || 0} of ${pagination.total} shift assignments` : 'Loading...'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          marginBottom: '24px',
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by doctor code, shift serial number, or shift prefix..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <svg
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
              }}
              fill="none"
              stroke="#9ca3af"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #f3f4f6',
                borderTopColor: '#088395',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
            </div>
          ) : details.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', color: '#666' }}>
              No shift assignments found
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Doctor Code</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Shift Serial No</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Shift Prefix</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Date</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Last Synced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((detail) => (
                      <tr
                        key={detail.id}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '600' }}>
                          {detail.DoctorCode || 'N/A'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          {detail.Shift_DSlno || 'N/A'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          {detail.shiftPrefix || 'N/A'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          {formatShiftDate(detail.Day, detail.smonth, detail.ShiftYear)}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                          {formatDateTime(detail.last_synced_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderTop: '1px solid #e5e7eb',
                }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                      color: currentPage === 1 ? '#9ca3af' : '#374151',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    Page {currentPage} of {pagination.last_page}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
                    disabled={currentPage === pagination.last_page}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: currentPage === pagination.last_page ? '#f3f4f6' : 'white',
                      color: currentPage === pagination.last_page ? '#9ca3af' : '#374151',
                      cursor: currentPage === pagination.last_page ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminHisShiftDefineDetails;
