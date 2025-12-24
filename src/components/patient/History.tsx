import React, { useEffect, useState } from 'react';
import { patientService } from '../../services/medicalRecordsService';

interface ConsultationRecord {
  inspection_code: string;
  consultation_date: string;
  chief_complaint: string;
  diagnosis: string;
  doctor_code: string | number;
  temperature: number | string;
  bp_max: number | string;
  bp_min: number | string;
  pulse: number | string;
  revisit: number;
  revisit_after: number | null;
  revisit_after_unit: string | null;
}

const History: React.FC = () => {
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConsultationHistory();
  }, []);

  const fetchConsultationHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getConsultationHistory();
      
      if (response.success && response.data) {
        setConsultations(response.data);
      } else {
        setError(response.message || 'No consultation history available');
      }
    } catch (err: any) {
      console.error('Error fetching consultation history:', err);
      setError(err.response?.data?.message || 'Failed to load consultation history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 24px',
        minHeight: '380px',
      }}>
        <div style={{
          fontSize: '18px',
          color: '#6A7282',
        }}>Loading consultation history...</div>
      </div>
    );
  }

  if (error || consultations.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 24px',
        minHeight: '380px',
        gap: '16px',
      }}>
        <div style={{
          fontSize: '18px',
          color: '#6A7282',
          textAlign: 'center',
        }}>
          {error || 'No consultation history available'}
        </div>
        <button
          onClick={fetchConsultationHistory}
          style={{
            padding: '12px 24px',
            background: '#061F42',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: '24px',
      gap: '16px',
      width: '100%',
      minHeight: '380px',
      background: '#FCFCFC',
      boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
      borderRadius: '0px 12px 12px 12px',
    }}>
      {/* History Title */}
      <div style={{
        width: '100%',
        fontSize: '16px',
        fontWeight: '600',
        color: '#061F42',
        marginBottom: '8px',
      }}>
        Consultation History
      </div>

      {/* Consultations List */}
      <div style={{
        width: '100%',
        maxWidth: '1072px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '600px',
        overflowY: 'auto',
        paddingRight: '8px',
      }}>
        {consultations.map((consultation, index) => (
          <div
            key={index}
            style={{
              padding: '16px',
              background: '#FFFFFF',
              border: '1px solid #F3F4F6',
              borderRadius: '12px',
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Date and Chief Complaint */}
            <div style={{
              marginBottom: '12px',
            }}>
              <div style={{
                fontSize: '12px',
                color: '#99A1AF',
                marginBottom: '4px',
              }}>
                {formatDate(consultation.consultation_date)}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#061F42',
                marginBottom: '8px',
              }}>
                {consultation.chief_complaint || 'No complaint recorded'}
              </div>
            </div>

            {/* Diagnosis */}
            <div style={{
              marginBottom: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid #F3F4F6',
            }}>
              <div style={{
                fontSize: '12px',
                color: '#99A1AF',
                marginBottom: '4px',
              }}>
                Diagnosis
              </div>
              <div style={{
                fontSize: '13px',
                color: '#6A7282',
              }}>
                {consultation.diagnosis || 'N/A'}
              </div>
            </div>

            {/* Vital Signs Summary */}
            <div style={{
              marginBottom: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid #F3F4F6',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
            }}>
              {/* BP */}
              <div>
                <div style={{
                  fontSize: '11px',
                  color: '#99A1AF',
                  marginBottom: '4px',
                }}>
                  BP
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#061F42',
                }}>
                  {consultation.bp_max}/{consultation.bp_min}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#99A1AF',
                }}>
                  mmHg
                </div>
              </div>

              {/* Temperature */}
              <div>
                <div style={{
                  fontSize: '11px',
                  color: '#99A1AF',
                  marginBottom: '4px',
                }}>
                  Temp
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#061F42',
                }}>
                  {consultation.temperature}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#99A1AF',
                }}>
                  °C
                </div>
              </div>

              {/* Pulse */}
              <div>
                <div style={{
                  fontSize: '11px',
                  color: '#99A1AF',
                  marginBottom: '4px',
                }}>
                  Pulse
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#061F42',
                }}>
                  {consultation.pulse}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#99A1AF',
                }}>
                  bpm
                </div>
              </div>

              {/* Doctor Code */}
              <div>
                <div style={{
                  fontSize: '11px',
                  color: '#99A1AF',
                  marginBottom: '4px',
                }}>
                  Doctor
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#061F42',
                }}>
                  #{consultation.doctor_code}
                </div>
              </div>
            </div>

            {/* Revisit Info */}
            {consultation.revisit === 1 && (
              <div style={{
                padding: '8px 12px',
                background: 'rgba(59, 130, 246, 0.082)',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#3B82F6',
                fontWeight: '500',
              }}>
                Follow-up needed in {consultation.revisit_after} {consultation.revisit_after_unit}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
