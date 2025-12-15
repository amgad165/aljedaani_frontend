import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getHisAppointments, getHisAppointmentsSyncStats } from '../../services/hisAppointmentsService';
import type { HisAppointment, HisAppointmentsSyncStats } from '../../services/hisAppointmentsService';

const AdminHisAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<HisAppointment[]>([]);
  const [stats, setStats] = useState<HisAppointmentsSyncStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [perPage] = useState(15);
  const [selectedAppointment, setSelectedAppointment] = useState<HisAppointment | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
    fetchAppointments();
  }, [currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      const statsData = await getHisAppointmentsSyncStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching HIS appointment stats:', error);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await getHisAppointments(currentPage, perPage, searchTerm);
      setAppointments(data.data);
      setTotalPages(data.pagination?.last_page || 1);
      setTotalAppointments(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching HIS appointments:', error);
      alert('Failed to load HIS appointments');
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

  const handleRowClick = (appointment: HisAppointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
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
              HIS Appointments
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Synced appointments from Hospital Information System
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
                Total Appointments
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.total_appointments.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #088395 0%, #05bfdb 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Appointments Today
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.appointments_today.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #05bfdb 0%, #00ffca 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Upcoming Appointments
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.appointments_upcoming.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
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
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by App Code, File Number, Doctor, Department, Phone..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                flex: 1,
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
              onClick={fetchAppointments}
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
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
              No appointments found
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
                      <th style={tableHeaderStyle}>App Code</th>
                      <th style={tableHeaderStyle}>File Number</th>
                      <th style={tableHeaderStyle}>Date</th>
                      <th style={tableHeaderStyle}>Time</th>
                      <th style={tableHeaderStyle}>Doctor</th>
                      <th style={tableHeaderStyle}>Department</th>
                      <th style={tableHeaderStyle}>Status</th>
                      <th style={tableHeaderStyle}>Mobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment, index) => (
                      <tr
                        key={appointment.app_code || index}
                        onClick={() => handleRowClick(appointment)}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={tableCellStyle}>{appointment.app_code || 'N/A'}</td>
                        <td style={tableCellStyle}>{appointment.file_number || 'N/A'}</td>
                        <td style={tableCellStyle}>{formatDate(appointment.appointment_date)}</td>
                        <td style={tableCellStyle}>{formatTime(appointment.appointment_time)}</td>
                        <td style={tableCellStyle}>{appointment.doctor_code || 'N/A'}</td>
                        <td style={tableCellStyle}>{appointment.department || 'N/A'}</td>
                        <td style={tableCellStyle}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            background: appointment.status === 'Confirmed' ? '#dcfce7' : 
                                       appointment.status === 'Cancelled' ? '#fee2e2' : '#e5e7eb',
                            color: appointment.status === 'Confirmed' ? '#166534' : 
                                   appointment.status === 'Cancelled' ? '#991b1b' : '#374151',
                          }}>
                            {appointment.status || 'N/A'}
                          </span>
                        </td>
                        <td style={tableCellStyle}>{appointment.mobile || 'N/A'}</td>
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
                  {Math.min(currentPage * perPage, totalAppointments)} of{' '}
                  {totalAppointments} appointments
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
      {showModal && selectedAppointment && (
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
                Appointment Details
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
              {/* Appointment Information */}
              <Section title="Appointment Information">
                <InfoRow label="App Code" value={selectedAppointment.app_code} />
                <InfoRow label="File Number" value={selectedAppointment.file_number} />
                <InfoRow label="Date" value={formatDate(selectedAppointment.appointment_date)} />
                <InfoRow label="Time" value={formatTime(selectedAppointment.appointment_time)} />
                <InfoRow label="Original Time" value={formatTime(selectedAppointment.original_time)} />
                <InfoRow label="Waiting" value={selectedAppointment.waiting?.toString()} />
                <InfoRow label="Status" value={selectedAppointment.status} />
                <InfoRow label="Station" value={selectedAppointment.station} />
              </Section>

              {/* Doctor & Department */}
              <Section title="Doctor & Department">
                <InfoRow label="Doctor Code" value={selectedAppointment.doctor_code} />
                <InfoRow label="Department" value={selectedAppointment.department} />
                <InfoRow label="Shift" value={selectedAppointment.shift} />
              </Section>

              {/* Payment Information */}
              <Section title="Payment Information">
                <InfoRow label="Payment Type" value={selectedAppointment.payment_type} />
              </Section>

              {/* Contact Information */}
              <Section title="Contact Information">
                <InfoRow label="Phone" value={selectedAppointment.phone} />
                <InfoRow label="Mobile" value={selectedAppointment.mobile} />
                <InfoRow label="Email" value={selectedAppointment.email} />
                <InfoRow label="Refuse Mobile" value={selectedAppointment.refuse_mobile} />
              </Section>

              {/* Additional Information */}
              <Section title="Additional Information">
                <InfoRow label="Attention" value={selectedAppointment.attention} />
                <InfoRow label="Relation" value={selectedAppointment.relation} />
                <InfoRow label="Remarks" value={selectedAppointment.remarks} />
                <InfoRow label="Remarks 2" value={selectedAppointment.remarks2} />
              </Section>

              {/* System Information */}
              <Section title="System Information">
                <InfoRow label="Added By" value={selectedAppointment.added_by} />
                <InfoRow label="Added Time" value={selectedAppointment.added_time ? formatDate(selectedAppointment.added_time) : null} />
                <InfoRow label="Edited By" value={selectedAppointment.edited_by} />
                <InfoRow label="Edit Time" value={selectedAppointment.edit_time ? formatDate(selectedAppointment.edit_time) : null} />
                <InfoRow label="Message ID" value={selectedAppointment.message_id} />
                <InfoRow label="Block Value" value={selectedAppointment.block_value} />
                <InfoRow label="Last Synced" value={selectedAppointment.last_synced_at ? formatDate(selectedAppointment.last_synced_at) : null} />
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

export default AdminHisAppointments;
