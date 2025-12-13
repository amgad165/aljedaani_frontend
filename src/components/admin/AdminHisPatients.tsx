import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getHisPatients, getHisSyncStats } from '../../services/hisPatientsService';
import type { HisPatient, HisSyncStats } from '../../services/hisPatientsService';

const AdminHisPatients: React.FC = () => {
  const [patients, setPatients] = useState<HisPatient[]>([]);
  const [stats, setStats] = useState<HisSyncStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [perPage] = useState(15);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      const statsData = await getHisSyncStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching HIS stats:', error);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await getHisPatients(currentPage, perPage, searchTerm);
      setPatients(data.data);
      setTotalPages(data.pagination?.last_page || 1);
      setTotalPatients(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching HIS patients:', error);
      alert('Failed to load HIS patients');
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

  const calculateAge = (dob: string | null) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
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
              HIS Patients
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
            }}>
              View synced patient data from the Hospital Information System
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #088395 0%, #0a4d68 100%)',
              padding: '24px',
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Total Synced Patients
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.total_patients.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid #088395',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                Last Sync
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#0a4d68' }}>
                {stats.last_sync ? formatDate(stats.last_sync) : 'Never'}
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid #088395',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                Synced Today
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#0a4d68' }}>
                {stats.synced_today.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid #088395',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                Synced This Week
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#0a4d68' }}>
                {stats.synced_this_week.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Search and Table */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}>
          {/* Search Bar */}
          <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB' }}>
            <input
              type="text"
              placeholder="Search by name, file number, or phone..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #088395',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#0a4d68'}
              onBlur={(e) => e.target.style.borderColor = '#088395'}
            />
          </div>

          {/* Table */}
          {loading ? (
            <div style={{
              padding: '64px',
              textAlign: 'center',
              fontSize: '18px',
              color: '#6B7280',
            }}>
              Loading...
            </div>
          ) : patients.length === 0 ? (
            <div style={{
              padding: '64px',
              textAlign: 'center',
              fontSize: '18px',
              color: '#6B7280',
            }}>
              No patients found
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
                      <th style={tableHeaderStyle}>File Number</th>
                      <th style={tableHeaderStyle}>Patient Name</th>
                      <th style={tableHeaderStyle}>Phone</th>
                      <th style={tableHeaderStyle}>Gender</th>
                      <th style={tableHeaderStyle}>Age</th>
                      <th style={tableHeaderStyle}>Nationality</th>
                      <th style={tableHeaderStyle}>Last Synced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient, index) => (
                      <tr
                        key={patient.id}
                        style={{
                          background: index % 2 === 0 ? 'white' : '#f9fafb',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#f9fafb'}
                      >
                        <td style={tableCellStyle}>
                          <span style={{ color: '#0a4d68', fontWeight: '600' }}>
                            {patient.file_number || 'N/A'}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#111827' }}>
                              {patient.english_full_name || patient.arabic_full_name || 'N/A'}
                            </div>
                            {patient.english_full_name && patient.arabic_full_name && (
                              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                                {patient.arabic_full_name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={tableCellStyle}>{patient.mobile || 'N/A'}</td>
                        <td style={tableCellStyle}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '500',
                            background: patient.gender === 'M' ? '#DBEAFE' : '#FCE7F3',
                            color: patient.gender === 'M' ? '#1E40AF' : '#BE185D',
                          }}>
                            {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'N/A'}
                          </span>
                        </td>
                        <td style={tableCellStyle}>{calculateAge(patient.date_of_birth)}</td>
                        <td style={tableCellStyle}>{patient.nationality || 'N/A'}</td>
                        <td style={tableCellStyle}>{formatDate(patient.updated_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #E5E7EB',
              }}>
                <div style={{ color: '#6B7280', fontSize: '14px' }}>
                  Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalPatients)} of {totalPatients} patients
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 16px',
                      border: '2px solid #088395',
                      borderRadius: '8px',
                      background: currentPage === 1 ? '#f3f4f6' : 'white',
                      color: currentPage === 1 ? '#9CA3AF' : '#088395',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                    }}
                  >
                    Previous
                  </button>
                  <div style={{
                    padding: '8px 16px',
                    color: '#0a4d68',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}>
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 16px',
                      border: '2px solid #088395',
                      borderRadius: '8px',
                      background: currentPage === totalPages ? '#f3f4f6' : 'white',
                      color: currentPage === totalPages ? '#9CA3AF' : '#088395',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.2s',
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
    </AdminLayout>
  );
};

const tableHeaderStyle: React.CSSProperties = {
  padding: '16px',
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  borderBottom: '2px solid #E5E7EB',
};

const tableCellStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '14px',
  color: '#111827',
  borderBottom: '1px solid #E5E7EB',
};

export default AdminHisPatients;
