import { useState, useEffect, useCallback } from 'react';
import { 
  getUserHisLabReports, 
  downloadHisLabReportPdf, 
  viewHisLabReportPdf,
  formatReportDate,
  type HisLabReport 
} from '../../services/hisLabUserService';

interface ReportCardProps {
  report: HisLabReport;
  onDownload: (slno: string) => void;
  onView: (slno: string) => void;
}

const ReportCard = ({ report, onDownload, onView }: ReportCardProps) => (
  <div style={{
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px',
    gap: '12px',
    width: '100%',
    maxWidth: window.innerWidth <= 768 ? '100%' : '284px',
    height: window.innerWidth <= 768 ? 'auto' : '199.67px',
    background: '#FFFFFF',
    border: '1px solid #D8D8D8',
    borderRadius: '12px',
  }}>
    {/* PDF Icon */}
    <img src="/assets/images/profile/PDF.png" alt="PDF" style={{ width: '31.2px', height: '31.2px' }} />
    
    {/* Title */}
    <div style={{
      width: '100%',
      fontFamily: 'Nunito',
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '20px',
      textAlign: 'center',
      color: '#061F42',
    }}>
      {report.service_name || 'Lab Test'}
    </div>
    

    
    {/* Date Badge */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '8px',
      gap: '4px',
      width: '100%',
      height: '36px',
      background: '#F8F8F8',
      borderRadius: '12px',
    }}>
      <div style={{
        width: '100%',
        fontFamily: 'Nunito',
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '20px',
        textAlign: 'center',
        color: '#1F57A4',
      }}>
        {formatReportDate(report.date)}
      </div>
    </div>
    
    {/* Buttons */}
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '0px',
      gap: '8px',
      width: '100%',
      height: '32px'
    }}>
      <button 
        onClick={() => onDownload(report.slno)}
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '8px 12px',
          flex: 1,
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
        }}
      >
        Download
      </button>
      <button 
        onClick={() => onView(report.slno)}
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '8px 12px',
          flex: 1,
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
        }}
      >
        View File
      </button>
    </div>
  </div>
);

const LabReportsTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState<HisLabReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserHisLabReports(currentPage, 4);
      let filteredReports = response.data;
      
      // Apply search filter
      if (searchQuery) {
        filteredReports = filteredReports.filter(report =>
          report.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.technician?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply date filter
      if (dateFilter) {
        filteredReports = filteredReports.filter(report =>
          report.date === dateFilter
        );
      }
      
      setReports(filteredReports);
      setTotalPages(response.pagination.last_page);
    } catch (err) {
      setError('Failed to load lab reports');
      console.error('Error fetching lab reports:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, dateFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDownload = async (slno: string) => {
    try {
      await downloadHisLabReportPdf(slno);
    } catch (err) {
      alert('Failed to download report');
      console.error('Error downloading report:', err);
    }
  };

  const handleView = async (slno: string) => {
    try {
      await viewHisLabReportPdf(slno);
    } catch (err) {
      alert('Failed to view report');
      console.error('Error viewing report:', err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setDateFilter(date || null);
    setCurrentPage(1); // Reset to first page on date filter
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
        width: '100%',
        maxWidth: window.innerWidth <= 768 ? '100%' : '612px',
        height: window.innerWidth <= 768 ? 'auto' : '595.33px'
      }}>
      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '0px',
        width: '100%',
        height: window.innerWidth <= 768 ? 'auto' : '64px'
      }}>
        <div style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          alignItems: 'center',
          padding: window.innerWidth <= 768 ? '8px' : '12px',
          gap: '8px',
          width: '100%',
          height: window.innerWidth <= 768 ? 'auto' : '64px',
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
            width: window.innerWidth <= 768 ? '100%' : '117px',
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
            width: '100%',
            height: '40px',
            flexGrow: 1
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
                value={searchQuery}
                onChange={handleSearchChange}
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
          
          {/* Date Input */}
          <input
            type="date"
            value={dateFilter || ''}
            onChange={handleDateChange}
            style={{
              boxSizing: 'border-box',
              width: window.innerWidth <= 768 ? '100%' : '132px',
              height: '40px',
              padding: '8px 12px',
              background: '#FFFFFF',
              border: '1px solid #061F42',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Nunito',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#061F42',
            }}
          />
        </div>
      </div>
      
      {/* Reports Grid */}
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: window.innerWidth <= 768 ? 'auto' : '411.33px',
          padding: '40px 12px',
          fontFamily: 'Nunito',
          fontSize: '16px',
          color: '#666'
        }}>
          Loading lab reports...
        </div>
      ) : error ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: window.innerWidth <= 768 ? 'auto' : '411.33px',
          padding: '40px 12px',
          fontFamily: 'Nunito',
          fontSize: '16px',
          color: '#CB0729'
        }}>
          {error}
        </div>
      ) : reports.length === 0 ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: window.innerWidth <= 768 ? 'auto' : '411.33px',
          padding: '40px 12px',
          fontFamily: 'Nunito',
          fontSize: '16px',
          color: '#666'
        }}>
          No lab reports found
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 284px)',
          gap: window.innerWidth <= 768 ? '12px' : '28px 44px',
          width: '100%',
          maxWidth: window.innerWidth <= 768 ? '100%' : '612px',
          height: window.innerWidth <= 768 ? 'auto' : '411.33px',
          padding: window.innerWidth <= 768 ? '0 12px' : '0'
        }}>
          {reports.map((report) => (
            <ReportCard
              key={report.slno}
              report={report}
              onDownload={handleDownload}
              onView={handleView}
            />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px 0px',
        width: '100%',
        height: window.innerWidth <= 768 ? 'auto' : '72px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          padding: '0px',
          gap: '8px',
          width: window.innerWidth <= 768 ? '100%' : '328px',
          maxWidth: '100%',
          height: '48px',
          justifyContent: 'center'
        }}>
          {/* Previous Button */}
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
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
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Page Numbers */}
          {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
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
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
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
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
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

export default LabReportsTab;
