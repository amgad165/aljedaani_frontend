import { useState } from 'react';

interface ReportCardProps {
  title: string;
  technician: string;
  date: string;
}

const ReportCard = ({ title, technician, date }: ReportCardProps) => (
  <div style={{
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px',
    gap: '12px',
    width: '284px',
    height: '199.67px',
    background: '#FFFFFF',
    border: '1px solid #D8D8D8',
    borderRadius: '12px',
  }}>
    {/* PDF Icon */}
    <img src="/assets/images/profile/PDF.png" alt="PDF" style={{ width: '31.2px', height: '31.2px' }} />
    
    {/* Title */}
    <div style={{
      width: '260px',
      fontFamily: 'Nunito',
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '20px',
      textAlign: 'center',
      color: '#061F42',
    }}>
      {title}
    </div>
    
    {/* Technician */}
    <div style={{
      width: '260px',
      fontFamily: 'Varela Round',
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '16px',
      textAlign: 'center',
      color: '#061F42',
    }}>
      {technician}
    </div>
    
    {/* Date Badge */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '8px',
      gap: '4px',
      width: '260px',
      height: '36px',
      background: '#F8F8F8',
      borderRadius: '12px',
    }}>
      <div style={{
        width: '244px',
        fontFamily: 'Nunito',
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '20px',
        textAlign: 'center',
        color: '#1F57A4',
      }}>
        {date}
      </div>
    </div>
    
    {/* Buttons */}
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '0px',
      gap: '8px',
      width: '260px',
      height: '32px',
    }}>
      <button style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px 12px',
        width: '126px',
        height: '32px',
        background: '#061F42',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'Nunito',
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: '16px',
        color: '#FFFFFF',
      }}>
        Download
      </button>
      <button style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px 12px',
        width: '126px',
        height: '32px',
        background: '#15C9FA',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'Nunito',
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: '16px',
        color: '#FFFFFF',
      }}>
        View File
      </button>
    </div>
  </div>
);

const MedicalReportsTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mock data - replace with actual data from API
  const reports = [
    { id: 1, title: 'Blood Test', technician: 'Lab Technician: Samir Tayel', date: '25/08/2025' },
    { id: 2, title: 'Blood Test', technician: 'Lab Technician: Samir Tayel', date: '25/08/2025' },
    { id: 3, title: 'Blood Test', technician: 'Lab Technician: Samir Tayel', date: '25/08/2025' },
    { id: 4, title: 'Blood Test', technician: 'Lab Technician: Samir Tayel', date: '25/08/2025' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0px',
      width: '100%',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0px',
        gap: '24px',
        width: '612px',
        height: '595.33px',
      }}>
      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '0px',
        width: '612px',
        height: '64px',
      }}>
        <div style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '12px',
          gap: '8px',
          width: '612px',
          height: '64px',
          background: '#FFFFFF',
          borderBottom: '1px solid #DADADA',
          borderRadius: '0px',
        }}>
          {/* Back Button */}
          <button style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '12px 16px',
            width: '117px',
            height: '40px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: 'Nunito',
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '20px',
            color: '#061F42',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path d="M15 18L9 12L15 6" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          
          {/* Search Input */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '0px',
            width: '323px',
            height: '40px',
            flexGrow: 1,
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '8px 12px',
              gap: '12px',
              width: '100%',
              height: '40px',
              background: '#F9FAFB',
              border: '1px solid #A4A5A5',
              borderRadius: '8px',
            }}>
              <input
                type="text"
                placeholder="Search for documents"
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  fontFamily: 'Nunito',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '16px',
                  color: '#9EA2AE',
                  outline: 'none',
                }}
              />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="7" stroke="#061F42" strokeWidth="1.5"/>
                <path d="M20 20L17 17" stroke="#131927" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          
          {/* Date/Time Button */}
          <button style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px 12px',
            width: '132px',
            height: '40px',
            background: '#FFFFFF',
            border: '1px solid #061F42',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Nunito',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '16px',
            color: '#061F42',
          }}>
            Date/Time
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '4px' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="#061F42" strokeWidth="1.5"/>
              <path d="M3 8H21" stroke="#061F42" strokeWidth="1.5"/>
              <path d="M8 2V6" stroke="#131927" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 2V6" stroke="#131927" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Reports Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 284px)',
        gap: '28px 44px',
        width: '612px',
        height: '411.33px',
      }}>
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title}
            technician={report.technician}
            date={report.date}
          />
        ))}
      </div>
      
      {/* Pagination */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px 0px',
        width: '612px',
        height: '72px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          padding: '0px',
          gap: '8px',
          width: '328px',
          height: '48px',
        }}>
          {/* Previous Button */}
          <button style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '12px',
            width: '48px',
            height: '48px',
            borderRadius: '24px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Page Numbers */}
          {[1, 2, 3, 4].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px',
                width: '48px',
                height: '44px',
                background: currentPage === page ? '#061F42' : 'transparent',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Varela Round',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '40px',
                color: currentPage === page ? '#FFFFFF' : '#061F42',
              }}
            >
              {page}
            </button>
          ))}
          
          {/* Next Button */}
          <button style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '12px',
            width: '48px',
            height: '48px',
            borderRadius: '24px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default MedicalReportsTab;
