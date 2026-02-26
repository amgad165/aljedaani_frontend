import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getHisAppointments, getHisAppointmentsSyncStats, resetHisAppointmentSync } from '../../services/hisAppointmentsService';
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
  const [searchColumn, setSearchColumn] = useState('file_number');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchAppointments();
  }, [currentPage]);

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
      const data = await getHisAppointments(currentPage, perPage, searchTerm, searchColumn);
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
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAppointments();
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

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSyncStatusBadge = (appointment: HisAppointment) => {
    // Check if cancelled
    if (appointment.status === '9' || appointment.cancelled_at) {
      if (appointment.needs_cancel_sync) {
        return {
          text: 'Pending Cancel Sync',
          bg: '#fef3c7',
          color: '#92400e',
          icon: '⏳'
        };
      }
      return {
        text: 'Cancelled',
        bg: '#fee2e2',
        color: '#991b1b',
        icon: '✕'
      };
    }

    // Check if needs resync (rescheduled)
    if (appointment.needs_resync) {
      return {
        text: 'Pending Resync',
        bg: '#fef3c7',
        color: '#92400e',
        icon: '⏳'
      };
    }

    // Normal synced status
    return {
      text: 'Synced',
      bg: '#dcfce7',
      color: '#166534',
      icon: '✓'
    };
  };

  const handleRowClick = (appointment: HisAppointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
    setShowResetConfirm(false);
  };

  const handleResetSync = async () => {
    if (!selectedAppointment) return;

    setIsResetting(true);
    try {
      await resetHisAppointmentSync(selectedAppointment.id);
      alert('✅ Sync flags reset successfully! The appointment status has been restored to "Booked" and you can now cancel/reschedule it again.');
      
      // Refresh the appointments list and close modal
      await fetchAppointments();
      closeModal();
    } catch (error) {
      console.error('Error resetting sync:', error);
      alert('❌ Failed to reset sync flags: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
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
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={searchColumn}
              onChange={(e) => setSearchColumn(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                cursor: 'pointer',
                background: 'white',
              }}
            >
              <option value="file_number">File Number</option>
              <option value="app_code">App Code</option>
              <option value="doctor_code">Doctor Code</option>
              <option value="department">Department</option>
              <option value="phone">Phone</option>
            </select>
            <input
              type="text"
              placeholder={`Search by ${searchColumn.replace('_', ' ')}...`}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
              onClick={handleSearch}
              style={{
                padding: '12px 24px',
                background: '#05bfdb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#088395'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#05bfdb'}
            >
              Search
            </button>
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
                      <th style={tableHeaderStyle}>Sync Status</th>
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
                                       appointment.status === 'Cancelled' ? '#fee2e2' : 
                                       appointment.status === '9' ? '#fee2e2' : '#e5e7eb',
                            color: appointment.status === 'Confirmed' ? '#166534' : 
                                   appointment.status === 'Cancelled' ? '#991b1b' : 
                                   appointment.status === '9' ? '#991b1b' : '#374151',
                          }}>
                            {appointment.status === '9' ? 'Cancelled' : (appointment.status || 'N/A')}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          {(() => {
                            const badge = getSyncStatusBadge(appointment);
                            return (
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: '500',
                                background: badge.bg,
                                color: badge.color,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}>
                                <span>{badge.icon}</span>
                                <span>{badge.text}</span>
                              </span>
                            );
                          })()}
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
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Reset Sync Button */}
                {(selectedAppointment.needs_cancel_sync || selectedAppointment.needs_resync || selectedAppointment.cancelled_at) && (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    disabled={isResetting}
                    style={{
                      padding: '8px 16px',
                      background: isResetting ? '#9ca3af' : '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isResetting ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    onMouseEnter={(e) => !isResetting && (e.currentTarget.style.background = '#d97706')}
                    onMouseLeave={(e) => !isResetting && (e.currentTarget.style.background = '#f59e0b')}
                  >
                    <span>🔄</span>
                    <span>{isResetting ? 'Resetting...' : 'Reset Sync'}</span>
                  </button>
                )}
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
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {/* Sync Status Alert */}
              {(selectedAppointment.needs_cancel_sync || selectedAppointment.needs_resync) && (
                <div style={{
                  padding: '16px',
                  marginBottom: '24px',
                  borderRadius: '12px',
                  background: '#fef3c7',
                  border: '2px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '12px',
                }}>
                  <span style={{ fontSize: '24px' }}>⚠️</span>
                  <div>
                    <h4 style={{ fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                      Pending Sync to HIS
                    </h4>
                    <p style={{ color: '#78350f', fontSize: '14px' }}>
                      {selectedAppointment.needs_cancel_sync 
                        ? 'This appointment cancellation is waiting to be synced to the HIS system.'
                        : 'This appointment reschedule is waiting to be synced to the HIS system.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Cancellation Info */}
              {selectedAppointment.cancelled_at && (
                <div style={{
                  padding: '16px',
                  marginBottom: '24px',
                  borderRadius: '12px',
                  background: '#fee2e2',
                  border: '2px solid #ef4444',
                }}>
                  <h4 style={{ fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>
                    ✕ Cancelled Appointment
                  </h4>
                  <div style={{ color: '#7f1d1d', fontSize: '14px', display: 'grid', gap: '4px' }}>
                    <p><strong>Cancelled At:</strong> {formatDateTime(selectedAppointment.cancelled_at)}</p>
                    {selectedAppointment.cancellation_reason && (
                      <p><strong>Reason:</strong> {selectedAppointment.cancellation_reason}</p>
                    )}
                    {selectedAppointment.cancelled_by && (
                      <p><strong>Cancelled By User ID:</strong> {selectedAppointment.cancelled_by}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Reschedule Info */}
              {selectedAppointment.original_appointment_date && (
                <div style={{
                  padding: '16px',
                  marginBottom: '24px',
                  borderRadius: '12px',
                  background: '#dbeafe',
                  border: '2px solid #3b82f6',
                }}>
                  <h4 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                    🔄 Rescheduled Appointment
                  </h4>
                  <div style={{ color: '#1e3a8a', fontSize: '14px', display: 'grid', gap: '4px' }}>
                    <p><strong>Original Date:</strong> {formatDate(selectedAppointment.original_appointment_date)}</p>
                    {selectedAppointment.original_appointment_time && (
                      <p><strong>Original Time:</strong> {formatTime(selectedAppointment.original_appointment_time)}</p>
                    )}
                    <p><strong>New Date:</strong> {formatDate(selectedAppointment.appointment_date)}</p>
                    <p><strong>New Time:</strong> {formatTime(selectedAppointment.appointment_time)}</p>
                  </div>
                </div>
              )}

              {/* Appointment Information */}
              <Section title="Appointment Information">
                <InfoRow label="ID" value={selectedAppointment.id?.toString()} />
                <InfoRow label="App Code" value={selectedAppointment.app_code} />
                <InfoRow label="File Number" value={selectedAppointment.file_number} />
                <InfoRow label="Date" value={formatDate(selectedAppointment.appointment_date)} />
                <InfoRow label="Time" value={formatTime(selectedAppointment.appointment_time)} />
                <InfoRow label="Original Time" value={formatTime(selectedAppointment.original_time)} />
                <InfoRow label="Waiting" value={selectedAppointment.waiting?.toString()} />
                <InfoRow label="Status" value={selectedAppointment.status === '9' ? 'Cancelled (9)' : selectedAppointment.status} />
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

              {/* Sync Tracking */}
              <Section title="Sync Tracking">
                <InfoRow label="Needs Cancel Sync" value={selectedAppointment.needs_cancel_sync ? 'Yes ⏳' : 'No'} />
                <InfoRow label="Needs Resync" value={selectedAppointment.needs_resync ? 'Yes ⏳' : 'No'} />
                <InfoRow label="Last Synced" value={selectedAppointment.last_synced_at ? formatDateTime(selectedAppointment.last_synced_at) : null} />
              </Section>

              {/* System Information */}
              <Section title="System Information">
                <InfoRow label="Added By" value={selectedAppointment.added_by} />
                <InfoRow label="Added Time" value={selectedAppointment.added_time ? formatDate(selectedAppointment.added_time) : null} />
                <InfoRow label="Edited By" value={selectedAppointment.edited_by} />
                <InfoRow label="Edit Time" value={selectedAppointment.edit_time ? formatDate(selectedAppointment.edit_time) : null} />
                <InfoRow label="Message ID" value={selectedAppointment.message_id} />
                <InfoRow label="Block Value" value={selectedAppointment.block_value} />
              </Section>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && selectedAppointment && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
          }}
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '32px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#0a4d68',
                marginBottom: '12px',
              }}>
                Reset Sync Status?
              </h3>
              <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6' }}>
                This will reset the appointment to "Booked" status and clear all sync flags.
                <br />
                <strong>Use this for testing only.</strong>
              </p>
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#fef3c7',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#92400e',
              }}>
                <strong>What will be reset:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', textAlign: 'left' }}>
                  <li>Status → Booked (0)</li>
                  <li>needs_cancel_sync → false</li>
                  <li>needs_resync → false</li>
                  <li>Cancellation data cleared</li>
                  <li>Reschedule tracking cleared</li>
                </ul>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                style={{
                  padding: '12px 24px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isResetting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetSync}
                disabled={isResetting}
                style={{
                  padding: '12px 24px',
                  background: isResetting ? '#9ca3af' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isResetting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => !isResetting && (e.currentTarget.style.background = '#d97706')}
                onMouseLeave={(e) => !isResetting && (e.currentTarget.style.background = '#f59e0b')}
              >
                {isResetting ? '🔄 Resetting...' : '✓ Yes, Reset'}
              </button>
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
