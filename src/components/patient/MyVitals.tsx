import React, { useEffect, useState } from 'react';
import { patientService } from '../../services/medicalRecordsService';

interface VitalReading {
  value?: number | null;
  systolic?: number | null;
  diastolic?: number | null;
  unit: string;
  recorded_at: string;
}

interface VitalsData {
  blood_pressure: VitalReading;
  heart_rate: VitalReading;
  temperature: VitalReading;
  respiratory_rate: VitalReading;
  blood_glucose: VitalReading;
  weight: VitalReading;
  height?: VitalReading;
  bmi?: VitalReading;
  oxygen_saturation?: VitalReading;
}

interface ConsultationInfo {
  inspection_code: string;
  consultation_date: string;
  doctor_code: string;
  dept_code: string;
}

const MyVitals: React.FC = () => {
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [consultation, setConsultation] = useState<ConsultationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getLatestVitals();
      
      if (response.success && response.data) {
        setVitals(response.data.vitals);
        setConsultation(response.data.consultation);
      } else {
        setError(response.message || 'No vital signs data available');
      }
    } catch (err: any) {
      console.error('Error fetching vitals:', err);
      setError(err.response?.data?.message || 'Failed to load vital signs');
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

  const vitalCards = vitals ? [
    {
      title: 'Blood Pressure',
      value: `${vitals.blood_pressure.systolic ?? '--'}/${vitals.blood_pressure.diastolic ?? '--'}`,
      unit: vitals.blood_pressure.unit,
      icon: (
        <img 
          src="/assets/images/my_vitals/pressure.svg" 
          alt="Blood Pressure" 
          style={{ width: '24px', height: '24px' }}
        />
      ),
      bgColor: 'rgba(16, 185, 129, 0.082)',
      iconColor: '#10B981',
    },
    {
      title: 'Heart Rate',
      value: `${vitals.heart_rate.value ?? '--'}`,
      unit: vitals.heart_rate.unit,
      icon: (
        <img 
          src="/assets/images/my_vitals/heart.svg" 
          alt="Heart Rate" 
          style={{ width: '24px', height: '24px' }}
        />
      ),
      bgColor: 'rgba(0, 171, 218, 0.082)',
      iconColor: '#00ABDA',
    },
    {
      title: 'Temperature',
      value: `${vitals.temperature.value ?? '--'}`,
      unit: vitals.temperature.unit,
      icon: (
        <img 
          src="/assets/images/my_vitals/temperature.svg" 
          alt="Temperature" 
          style={{ width: '24px', height: '24px' }}
        />
      ),
      bgColor: 'rgba(239, 68, 68, 0.082)',
      iconColor: '#EF4444',
    },
    {
      title: 'Respiratory Rate',
      value: `${vitals.respiratory_rate.value ?? '--'}`,
      unit: 'brpm',
      icon: (
        <img 
          src="/assets/images/my_vitals/respiratory.svg" 
          alt="Respiratory Rate" 
          style={{ width: '24px', height: '24px' }}
        />
      ),
      bgColor: 'rgba(59, 130, 246, 0.082)',
      iconColor: '#3B82F6',
    },
    {
      title: 'Blood Glucose',
      value: `${vitals.blood_glucose.value ?? '--'}`,
      unit: vitals.blood_glucose.unit,
      icon: (
        <img 
          src="/assets/images/my_vitals/glucose.svg" 
          alt="Blood Glucose" 
          style={{ width: '24px', height: '24px' }}
        />
      ),
      bgColor: 'rgba(139, 92, 246, 0.082)',
      iconColor: '#8B5CF6',
    },
    {
      title: 'Weight/Height',
      value: `${vitals.weight.value ?? '--'}`,
      value2: `${vitals.height?.value ?? '--'}`,
      unit: vitals.weight.unit,
      unit2: vitals.height?.unit ?? '',
      icon: (
        <img 
          src="/assets/images/my_vitals/angle-tool.svg" 
          alt="Weight" 
          style={{ width: '24px', height: '24px' }}
        />
      ),
      bgColor: 'rgba(245, 158, 11, 0.082)',
      iconColor: '#F59E0B',
    },
  ] : [];

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
        }}>Loading vital signs...</div>
      </div>
    );
  }

  if (error || !vitals) {
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
          {error || 'No vital signs data available'}
        </div>
        <button
          onClick={fetchVitals}
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
      padding: '12px 24px',
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

      {/* Vitals Grid */}
      <div style={{
        width: '100%',
        maxWidth: '1072px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        position: 'relative',
      }}>
        {vitalCards.map((card, index) => (
          <div
            key={index}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '24px',
              gap: '16px',
              background: '#FFFFFF',
              border: '1px solid #F3F4F6',
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '20px',
              minHeight: '168px',
            }}
          >
            {/* Header with Icon */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              width: '100%',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '48px',
                height: '48px',
                background: card.bgColor,
                borderRadius: '50%',
              }}>
                {card.icon}
              </div>
            </div>

            {/* Content */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              width: '100%',
            }}>
              {/* Title */}
              <div style={{
                fontFamily: 'Nunito',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '14px',
                lineHeight: '20px',
                color: '#6A7282',
              }}>
                {card.title}
              </div>

              {/* Value(s) */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '8px',
              }}>
                {/* First Value */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  gap: '4px',
                }}>
                  <span style={{
                    fontFamily: 'Nunito',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    fontSize: '24px',
                    lineHeight: '32px',
                    color: '#061F42',
                  }}>
                    {card.value}
                  </span>
                  {card.unit && (
                    <span style={{
                      fontFamily: 'Nunito',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#99A1AF',
                    }}>
                      {card.unit}
                    </span>
                  )}
                </div>

                {/* Second Value (for BP) */}
                {card.value2 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    gap: '4px',
                  }}>
                    <span style={{
                      fontFamily: 'Nunito',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      fontSize: '24px',
                      lineHeight: '32px',
                      color: '#061F42',
                    }}>
                      {card.value2}
                    </span>
                    <span style={{
                      fontFamily: 'Nunito',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#99A1AF',
                    }}>
                      {card.unit2 || card.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyVitals;
