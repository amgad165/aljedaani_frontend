import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

interface HisShift {
  id: number;
  SHIFT_CODE: string;
  SHIFT_DESC: string;
  FromTime1: string;
  ToTime1: string;
  FromTime2: string;
  ToTime2: string;
  FromTime3: string;
  ToTime3: string;
  FromTime4: string;
  ToTime4: string;
  InterNetFrom1: string;
  InterNetTo1: string;
  Sduration1: number;
  Sduration2: number;
  prefix: string;
  Regular: boolean;
  NoAppointment: boolean;
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

const AdminHisShifts: React.FC = () => {
  const [shifts, setShifts] = useState<HisShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [perPage] = useState(15);

  useEffect(() => {
    fetchShifts();
  }, [currentPage, searchTerm]);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE_URL}/admin/his-shifts?page=${currentPage}&per_page=${perPage}&search=${searchTerm}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch shifts');

      const result = await response.json();
      setShifts(result.data.data);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error('Error fetching HIS shifts:', error);
      alert('Failed to load HIS shifts');
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
      hour: '2-digit',
      minute: '2-digit',
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
              HIS Shifts
            </h1>
            <p style={{ color: '#666', fontSize: '14px' }}>
              {pagination ? `Showing ${pagination.from || 0} to ${pagination.to || 0} of ${pagination.total} shifts` : 'Loading...'}
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
              placeholder="Search by shift code or description..."
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
          ) : shifts.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', color: '#666' }}>
              No shifts found
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Shift Code</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Description</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Time 1</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Time 2</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Duration</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Status</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Last Synced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((shift) => (
                      <tr
                        key={shift.id}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '600' }}>
                          {shift.SHIFT_CODE || 'N/A'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          {shift.SHIFT_DESC || 'N/A'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          {shift.FromTime1 && shift.ToTime1 ? `${shift.FromTime1} - ${shift.ToTime1}` : 'N/A'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          {shift.FromTime2 && shift.ToTime2 ? `${shift.FromTime2} - ${shift.ToTime2}` : 'N/A'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          {shift.Sduration1 ? `${shift.Sduration1} min` : 'N/A'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: !shift.NoAppointment ? '#d1fae5' : '#fee2e2',
                            color: !shift.NoAppointment ? '#065f46' : '#991b1b',
                          }}>
                            {!shift.NoAppointment ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                          {formatDate(shift.last_synced_at)}
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

export default AdminHisShifts;
