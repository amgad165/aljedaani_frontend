import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';

interface ContactSubmission {
  id: number;
  name: string;
  mobile: string;
  email: string;
  message: string;
  created_at: string;
}

const AdminContactSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  const fetchSubmissions = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/contact-submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const result = await response.json();
      setSubmissions(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      setNotification({ type: 'error', message: 'Failed to load contact submissions' });
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    setDeleting(id);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/contact-submissions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }

      setNotification({ type: 'success', message: 'Submission deleted successfully' });
      fetchSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
      setNotification({ type: 'error', message: 'Failed to delete submission' });
    } finally {
      setDeleting(null);
    }
  };

  const handleViewDetails = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.mobile.includes(searchQuery)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            Contact Submissions
          </h1>
        </div>

        {/* Notification */}
        {notification && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: notification.type === 'success' ? '#D4EDDA' : '#F8D7DA',
            border: `1px solid ${notification.type === 'success' ? '#C3E6CB' : '#F5C6CB'}`,
            color: notification.type === 'success' ? '#155724' : '#721C24'
          }}>
            {notification.message}
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            flex: 1,
            minWidth: '200px',
            padding: '20px',
            backgroundColor: '#F8F9FA',
            borderRadius: '8px',
            border: '1px solid #DEE2E6'
          }}>
            <div style={{ fontSize: '14px', color: '#6C757D', marginBottom: '5px' }}>
              Total Submissions
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#061F42' }}>
              {submissions.length}
            </div>
          </div>
          <div style={{
            flex: 1,
            minWidth: '200px',
            padding: '20px',
            backgroundColor: '#F8F9FA',
            borderRadius: '8px',
            border: '1px solid #DEE2E6'
          }}>
            <div style={{ fontSize: '14px', color: '#6C757D', marginBottom: '5px' }}>
              Today
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#061F42' }}>
              {submissions.filter(s => {
                const today = new Date();
                const submissionDate = new Date(s.created_at);
                return submissionDate.toDateString() === today.toDateString();
              }).length}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #DEE2E6',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              Loading...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6C757D' }}>
              No contact submissions found
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid #DEE2E6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Mobile</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Message</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    style={{
                      borderBottom: '1px solid #DEE2E6',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px' }}>{submission.name}</td>
                    <td style={{ padding: '12px' }}>{submission.mobile}</td>
                    <td style={{ padding: '12px' }}>{submission.email}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {submission.message}
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#6C757D' }}>
                      {formatDate(submission.created_at)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleViewDetails(submission)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#15C9FA',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(submission.id)}
                          disabled={deleting === submission.id}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: deleting === submission.id ? '#CCC' : '#DC3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: deleting === submission.id ? 'not-allowed' : 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          {deleting === submission.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedSubmission && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setShowDetailModal(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '24px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                  Contact Submission Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6C757D'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#6C757D', marginBottom: '4px' }}>
                    Name
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 500 }}>
                    {selectedSubmission.name}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#6C757D', marginBottom: '4px' }}>
                    Mobile
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 500 }}>
                    <a href={`tel:${selectedSubmission.mobile}`} style={{ color: '#15C9FA' }}>
                      {selectedSubmission.mobile}
                    </a>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#6C757D', marginBottom: '4px' }}>
                    Email
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 500 }}>
                    <a href={`mailto:${selectedSubmission.email}`} style={{ color: '#15C9FA' }}>
                      {selectedSubmission.email}
                    </a>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#6C757D', marginBottom: '4px' }}>
                    Message
                  </div>
                  <div style={{
                    fontSize: '16px',
                    lineHeight: '1.6',
                    padding: '12px',
                    backgroundColor: '#F8F9FA',
                    borderRadius: '8px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedSubmission.message}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#6C757D', marginBottom: '4px' }}>
                    Submitted On
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 500 }}>
                    {formatDate(selectedSubmission.created_at)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#061F42',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminContactSubmissions;
