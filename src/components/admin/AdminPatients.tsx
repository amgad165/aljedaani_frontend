import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  medical_record_number?: string;
  national_id?: string;
  date_of_birth: string;
  gender: string;
  profile_photo?: string;
  created_at: string;
}

const AdminPatients: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [perPage] = useState(15);

  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchTerm]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch patients');

      const data = await response.json();
      
      if (data.success) {
        setPatients(data.data);
        setTotalPages(data.pagination?.last_page || 1);
        setTotalPatients(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      alert('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleViewPatient = (patientId: number) => {
    navigate(`/admin/patients/${patientId}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateAge = (dob: string) => {
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
          marginBottom: '24px',
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: '4px',
            }}>
              Patient Management
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
            }}>
              Manage patient records and medical reports
            </p>
          </div>

          <div style={{
            background: '#EFF6FF',
            padding: '12px 20px',
            borderRadius: '8px',
            border: '1px solid #DBEAFE',
          }}>
            <p style={{ fontSize: '12px', color: '#1E40AF', marginBottom: '4px' }}>
              Total Patients
            </p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#1E40AF' }}>
              {totalPatients}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, phone, or medical record number..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                color: '#1F2937',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Patients Table */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>
              Loading patients...
            </div>
          ) : patients.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <p style={{ color: '#9CA3AF', marginBottom: '8px' }}>No patients found</p>
              {searchTerm && (
                <p style={{ fontSize: '14px', color: '#6B7280' }}>
                  Try adjusting your search terms
                </p>
              )}
            </div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                      PATIENT
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                      MR NUMBER
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                      CONTACT
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                      AGE/GENDER
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                      REGISTERED
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr
                      key={patient.id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        transition: 'background 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => handleViewPatient(patient.id)}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: patient.profile_photo ? 'transparent' : '#EFF6FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}>
                            {patient.profile_photo ? (
                              <img
                                src={patient.profile_photo}
                                alt={patient.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ fontSize: '16px', fontWeight: '600', color: '#3B82F6' }}>
                                {patient.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', color: '#1F2937', marginBottom: '2px' }}>
                              {patient.name}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6B7280' }}>
                              {patient.national_id || 'No National ID'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '14px', color: '#1F2937', fontWeight: '500' }}>
                          {patient.medical_record_number || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '14px', color: '#1F2937', marginBottom: '2px' }}>
                          {patient.email}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>
                          {patient.phone}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '14px', color: '#1F2937' }}>
                          {calculateAge(patient.date_of_birth)} years
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280', textTransform: 'capitalize' }}>
                          {patient.gender}
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                        {formatDate(patient.created_at)}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPatient(patient.id);
                            }}
                            style={{
                              padding: '8px 16px',
                              background: '#3B82F6',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2563EB'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#3B82F6'}
                          >
                            View Records
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderTop: '1px solid #E5E7EB',
                }}>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalPatients)} of {totalPatients} patients
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 12px',
                        background: currentPage === 1 ? '#F3F4F6' : '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: currentPage === 1 ? '#9CA3AF' : '#1F2937',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Previous
                    </button>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              padding: '8px 12px',
                              background: currentPage === pageNum ? '#3B82F6' : '#FFFFFF',
                              border: '1px solid #E5E7EB',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: currentPage === pageNum ? '#FFFFFF' : '#1F2937',
                              fontWeight: currentPage === pageNum ? '600' : '400',
                              cursor: 'pointer',
                              minWidth: '40px',
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 12px',
                        background: currentPage === totalPages ? '#F3F4F6' : '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: currentPage === totalPages ? '#9CA3AF' : '#1F2937',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPatients;
