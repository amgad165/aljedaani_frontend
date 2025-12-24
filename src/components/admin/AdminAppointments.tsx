import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface Appointment {
  id: number;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  medical_record_number: string | null;
  national_id: string | null;
  doctor_id: number;
  doctor_code: string | null;
  doctor?: {
    id: number;
    name: string;
    specialty: string;
  };
  department_id: number;
  department?: {
    id: number;
    name: string;
  };
  branch_id: number;
  branch?: {
    id: number;
    name: string;
  };
  appointment_date: string;
  appointment_time: string;
  appointment_datetime: string;
  shift_code: string | null;
  slot_duration: number;
  status: string;
  booking_source: string;
  synced_to_his: boolean;
  his_appointment_code: string | null;
  sync_attempts: number;
  last_sync_attempt_at: string | null;
  sync_error: string | null;
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSyncStatus, setFilterSyncStatus] = useState<string>('all');

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, searchTerm, filterStatus, filterSyncStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterSyncStatus !== 'all' && { synced_to_his: filterSyncStatus }),
      });

      const response = await fetch(`${API_BASE_URL}/admin/appointments?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const result = await response.json();
      setAppointments(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      alert('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString ? timeString.substring(0, 5) : 'N/A';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#f59e0b',
      confirmed: '#10b981',
      completed: '#6366f1',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const handleRowClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      fetchAppointments();
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status');
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
              Appointments
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Manage web-booked appointments
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              Total Appointments
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700' }}>
              {pagination?.total || 0}
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              Synced to HIS
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700' }}>
              {appointments.filter(a => a.synced_to_his).length}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              Pending Sync
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700' }}>
              {appointments.filter(a => !a.synced_to_his).length}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              Today's Appointments
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700' }}>
              {appointments.filter(a => 
                formatDate(a.appointment_date) === formatDate(new Date().toISOString())
              ).length}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
              }}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, phone, email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
              }}>
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
              }}>
                HIS Sync Status
              </label>
              <select
                value={filterSyncStatus}
                onChange={(e) => {
                  setFilterSyncStatus(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                <option value="all">All</option>
                <option value="true">Synced</option>
                <option value="false">Not Synced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
              No appointments found
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Patient
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Doctor
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Department
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Date & Time
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Status
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        HIS Sync
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        onClick={() => handleRowClick(appointment)}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: '500', color: '#111827' }}>
                            {appointment.patient_name}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {appointment.patient_phone}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: '#111827' }}>
                            {appointment.doctor?.name || 'N/A'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Code: {appointment.doctor_code || 'N/A'}
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                          {appointment.department?.name || 'N/A'}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: '#111827' }}>
                            {formatDate(appointment.appointment_date)}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {formatTime(appointment.appointment_time)}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: `${getStatusColor(appointment.status)}20`,
                            color: getStatusColor(appointment.status),
                          }}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {appointment.synced_to_his ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#10b981',
                              }} />
                              <span style={{ fontSize: '14px', color: '#10b981' }}>Synced</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#f59e0b',
                              }} />
                              <span style={{ fontSize: '14px', color: '#f59e0b' }}>Pending</span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                          {appointment.booking_source.toUpperCase()}
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
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                    {pagination.total} appointments
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.5 : 1,
                      }}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.last_page}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: currentPage === pagination.last_page ? 'not-allowed' : 'pointer',
                        opacity: currentPage === pagination.last_page ? 0.5 : 1,
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

      {/* Appointment Details Modal */}
      {showModal && selectedAppointment && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '800px',
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
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0a4d68' }}>
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
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px',
              }}>
                {/* Patient Information */}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a4d68', marginBottom: '16px' }}>
                    Patient Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Name</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedAppointment.patient_name}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Phone</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedAppointment.patient_phone}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Email</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedAppointment.patient_email || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Medical Record Number</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedAppointment.medical_record_number || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>National ID</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedAppointment.national_id || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a4d68', marginBottom: '16px' }}>
                    Appointment Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Doctor</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedAppointment.doctor?.name || 'N/A'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Code: {selectedAppointment.doctor_code || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Department</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedAppointment.department?.name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Branch</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedAppointment.branch?.name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Date & Time</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {formatDate(selectedAppointment.appointment_date)} at {formatTime(selectedAppointment.appointment_time)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Duration</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedAppointment.slot_duration} minutes
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Shift</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedAppointment.shift_code || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Sync Information */}
                <div style={{ gridColumn: 'span 2' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a4d68', marginBottom: '16px' }}>
                    Status & Sync
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Status</div>
                      <select
                        value={selectedAppointment.status}
                        onChange={(e) => handleStatusChange(selectedAppointment.id, e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          width: '100%',
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Booking Source</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedAppointment.booking_source.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>HIS Sync Status</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: selectedAppointment.synced_to_his ? '#10b981' : '#f59e0b' }}>
                        {selectedAppointment.synced_to_his ? 'Synced' : 'Pending'}
                      </div>
                    </div>
                    {selectedAppointment.his_appointment_code && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>HIS Appointment Code</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {selectedAppointment.his_appointment_code}
                        </div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Sync Attempts</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {selectedAppointment.sync_attempts || 0}
                      </div>
                    </div>
                    {selectedAppointment.last_sync_attempt_at && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Last Sync Attempt</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                          {formatDate(selectedAppointment.last_sync_attempt_at)}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedAppointment.sync_error && (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: '#fef2f2',
                      borderLeft: '4px solid #ef4444',
                      borderRadius: '4px',
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#991b1b', marginBottom: '4px' }}>
                        Sync Error
                      </div>
                      <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                        {selectedAppointment.sync_error}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {(selectedAppointment.reason || selectedAppointment.notes) && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a4d68', marginBottom: '16px' }}>
                      Notes
                    </h3>
                    {selectedAppointment.reason && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Reason</div>
                        <div style={{ fontSize: '14px', color: '#111827' }}>
                          {selectedAppointment.reason}
                        </div>
                      </div>
                    )}
                    {selectedAppointment.notes && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Notes</div>
                        <div style={{ fontSize: '14px', color: '#111827' }}>
                          {selectedAppointment.notes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamps */}
                <div style={{ gridColumn: 'span 2', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
                    <div>
                      Created: {formatDate(selectedAppointment.created_at)}
                    </div>
                    <div>
                      Updated: {formatDate(selectedAppointment.updated_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 24px',
                  background: '#0a4d68',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAppointments;
