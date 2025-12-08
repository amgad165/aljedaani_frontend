import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface OtpLog {
  id: number;
  phone: string;
  purpose: string;
  status: string;
  user_id: number | null;
  msg_id: string | null;
  attempts: number;
  sent_at: string | null;
  delivered_at: string | null;
  verified_at: string | null;
  expires_at: string;
  created_at: string;
  user?: User;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface Statistics {
  total: number;
  verified: number;
  failed: number;
  pending: number;
  sent: number;
  delivered: number;
  success_rate: number;
  by_purpose: Record<string, number>;
  today: number;
  today_verified: number;
  this_week: number;
  this_month: number;
}

const AdminOtpLogs: React.FC = () => {
  const [logs, setLogs] = useState<OtpLog[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    phone: '',
    purpose: '',
    status: '',
    from_date: '',
    to_date: '',
    per_page: 15,
    page: 1,
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/otp-logs/statistics`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStatistics(data.statistics);
        }
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE_URL}/otp-logs?${queryParams}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLogs(data.data);
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#10B981';
      case 'delivered': return '#3B82F6';
      case 'sent': return '#8B5CF6';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPurposeColor = (purpose: string) => {
    switch (purpose) {
      case 'login': return '#3B82F6';
      case 'registration': return '#10B981';
      case 'booking': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '32px 40px',
    fontFamily: "'Open Sans', 'Nunito', sans-serif",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#232323',
    textTransform: 'uppercase',
    margin: 0,
    letterSpacing: '0.5px',
  };

  const titleUnderlineStyle: React.CSSProperties = {
    width: '62px',
    height: '5px',
    background: 'linear-gradient(270deg, #7572FF 0.58%, #70FC7E 98.33%)',
    borderRadius: '5px',
    marginTop: '8px',
    marginBottom: '32px',
  };

  const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  };

  const statCardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.08)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const filterBarStyle: React.CSSProperties = {
    background: '#FFFFFF',
    boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.08)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const tableContainerStyle: React.CSSProperties = {
    background: '#FFFFFF',
    boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.08)',
    borderRadius: '16px',
    overflow: 'hidden',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle: React.CSSProperties = {
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 700,
    color: '#6B7280',
    textTransform: 'uppercase',
    borderBottom: '2px solid #F3F4F6',
    background: '#F9FAFB',
  };

  const tdStyle: React.CSSProperties = {
    padding: '16px',
    fontSize: '14px',
    color: '#374151',
    borderBottom: '1px solid #F3F4F6',
  };

  const badgeStyle = (color: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#FFFFFF',
    backgroundColor: color,
  });

  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderTop: '1px solid #F3F4F6',
  };

  const buttonStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    background: disabled ? '#F3F4F6' : '#FFFFFF',
    color: disabled ? '#9CA3AF' : '#374151',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s',
  });

  return (
    <AdminLayout>
      <div style={containerStyle}>
        <h1 style={sectionTitleStyle}>OTP Logs</h1>
        <div style={titleUnderlineStyle} />

        {/* Statistics Cards */}
        {!statsLoading && statistics && (
          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>TOTAL SENT</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#232323' }}>{statistics.total.toLocaleString()}</span>
            </div>
            <div style={statCardStyle}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>VERIFIED</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#10B981' }}>{statistics.verified.toLocaleString()}</span>
            </div>
            <div style={statCardStyle}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>SUCCESS RATE</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#7572FF' }}>{statistics.success_rate}%</span>
            </div>
            <div style={statCardStyle}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>TODAY</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#232323' }}>{statistics.today.toLocaleString()}</span>
            </div>
            <div style={statCardStyle}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>THIS WEEK</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#232323' }}>{statistics.this_week.toLocaleString()}</span>
            </div>
            <div style={statCardStyle}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>FAILED</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#EF4444' }}>{statistics.failed.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={filterBarStyle}>
          <input
            type="text"
            placeholder="Search phone..."
            value={filters.phone}
            onChange={(e) => handleFilterChange('phone', e.target.value)}
            style={inputStyle}
          />
          <select
            value={filters.purpose}
            onChange={(e) => handleFilterChange('purpose', e.target.value)}
            style={inputStyle}
          >
            <option value="">All Purposes</option>
            <option value="login">Login</option>
            <option value="registration">Registration</option>
            <option value="booking">Booking</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={inputStyle}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>
          <input
            type="date"
            value={filters.from_date}
            onChange={(e) => handleFilterChange('from_date', e.target.value)}
            style={inputStyle}
            placeholder="From Date"
          />
          <input
            type="date"
            value={filters.to_date}
            onChange={(e) => handleFilterChange('to_date', e.target.value)}
            style={inputStyle}
            placeholder="To Date"
          />
        </div>

        {/* Table */}
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Purpose</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Attempts</th>
                <th style={thStyle}>Sent At</th>
                <th style={thStyle}>Verified At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: '#6B7280' }}>Loading...</div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: '#6B7280' }}>No OTP logs found</div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{log.phone}</div>
                      {log.msg_id && (
                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                          MSG: {log.msg_id}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(getPurposeColor(log.purpose))}>
                        {log.purpose}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(getStatusColor(log.status))}>
                        {log.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {log.user ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{log.user.name}</div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{log.user.email}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>-</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ 
                        fontWeight: 600, 
                        color: log.attempts > 3 ? '#EF4444' : '#374151' 
                      }}>
                        {log.attempts}
                      </span>
                    </td>
                    <td style={tdStyle}>{formatDate(log.sent_at)}</td>
                    <td style={tdStyle}>{formatDate(log.verified_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && (
            <div style={paginationStyle}>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                Showing {pagination.from} to {pagination.to} of {pagination.total} logs
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  style={buttonStyle(pagination.current_page === 1)}
                >
                  Previous
                </button>
                <div style={{ padding: '8px 16px', fontSize: '14px', color: '#374151', fontWeight: 600 }}>
                  Page {pagination.current_page} of {pagination.last_page}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  style={buttonStyle(pagination.current_page === pagination.last_page)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOtpLogs;
