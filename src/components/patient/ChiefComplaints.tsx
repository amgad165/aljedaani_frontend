import React, { useEffect, useState } from 'react';
import { patientService } from '../../services/medicalRecordsService';

interface ConsultationData {
  inspection_code: string;
  consultation_date: string;
  doctor_code: string;
  dept_code: string;
  chief_complaint: string;
}

const ChiefComplaints: React.FC = () => {
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConsultation();
  }, []);

  const fetchConsultation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getLatestConsultation();
      
      if (response.success && response.data) {
        setConsultation(response.data);
      } else {
        setError(response.message || 'No consultation data available');
      }
    } catch (err: any) {
      console.error('Error fetching consultation:', err);
      setError(err.response?.data?.message || 'Failed to load consultation data');
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
        }}>Loading chief complaints...</div>
      </div>
    );
  }

  if (error || !consultation) {
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
          {error || 'No consultation data available'}
        </div>
        <button
          onClick={fetchConsultation}
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
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      gap: '12px',
      width: '100%',
      minHeight: '380px',
      background: '#FCFCFC',
      boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
      borderRadius: '0px 12px 12px 12px',
    }}>
      {/* Consultation Info */}
      {consultation && (
        <div style={{
          width: '100%',
          padding: '12px 0',
          marginBottom: '8px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6A7282',
        }}>
          Last recorded on {formatDate(consultation.consultation_date)}
        </div>
      )}

      {/* Chief Complaint Card */}
      <div style={{
        width: '100%',
        maxWidth: '1072px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '24px',
        gap: '16px',
        background: '#FFFFFF',
        border: '1px solid #F3F4F6',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
        borderRadius: '20px',
        minHeight: '200px',
      }}>
        {/* Title */}
        <div style={{
          fontFamily: 'Nunito',
          fontStyle: 'normal',
          fontWeight: '600',
          fontSize: '16px',
          lineHeight: '24px',
          color: '#061F42',
        }}>
          Chief Complaint
        </div>

        {/* Content */}
        <div style={{
          fontFamily: 'Nunito',
          fontStyle: 'normal',
          fontWeight: '400',
          fontSize: '14px',
          lineHeight: '24px',
          color: '#6A7282',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
        }}>
          {consultation.chief_complaint || 'No chief complaint recorded'}
        </div>
      </div>
    </div>
  );
};

export default ChiefComplaints;
