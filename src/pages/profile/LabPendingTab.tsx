import { useState, useEffect, useCallback } from 'react';
import { 
  getUserHisLabPendingReports, 
  downloadHisLabPendingReportPdf, 
  viewHisLabPendingReportPdf,
  formatReportDate,
  formatReportTime,
  type HisLabPendingReport 
} from '../../services/hisLabPendingService';

interface ReportCardProps {
  report: HisLabPendingReport;
  onDownload: (id: number) => void;
  onView: (id: number) => void;
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
      {report.service_name}
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
        onClick={() => onDownload(report.id)}
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
        onClick={() => onView(report.id)}
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

const LabPendingTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState<HisLabPendingReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = searchQuery ? { search: searchQuery } : {};
      const response = await getUserHisLabPendingReports(currentPage, 4, filters);
      let filteredReports = response.data;
      
      // Apply date filter on client side (backend doesn't support date filter yet)
      if (dateFilter) {
        filteredReports = filteredReports.filter(report =>
          report.date === dateFilter
        );
      }
      
      setReports(filteredReports);
      setTotalPages(response.pagination.last_page);
    } catch (err) {
      setError('Failed to load lab pending reports');
      console.error('Error fetching lab pending reports:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, dateFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDownload = async (id: number) => {
    try {
      await downloadHisLabPendingReportPdf(id);
    } catch (err) {
      alert('Failed to download report');
      console.error('Error downloading report:', err);
    }
  };

  const handleView = async (id: number) => {
    try {
      await viewHisLabPendingReportPdf(id);
    } catch (err) {
      alert('Failed to view report');
      console.error('Error viewing report:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearchClick = () => {
    setSearchQuery(inputValue);
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
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
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
            </div>
          </div>
          
          {/* Search Button */}
          <button
            onClick={handleSearchClick}
            style={{
              boxSizing: 'border-box',
              width: window.innerWidth <= 768 ? '100%' : 'auto',
              height: '40px',
              padding: '8px 16px',
              background: '#061F42',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Nunito',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
            }}
          >
            Search
          </button>
          
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
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#E91E63' }}>
          {error}
        </div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No lab pending reports found
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
          gap: '24px',
          width: '100%',
          justifyItems: 'center',
        }}>
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDownload={handleDownload}
              onView={handleView}
            />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {!loading && !error && reports.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0px',
          gap: '8px',
          width: '100%',
          marginTop: '24px',
        }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              background: currentPage === 1 ? '#E0E0E0' : '#061F42',
              border: 'none',
              borderRadius: '8px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: '#FFFFFF',
              fontFamily: 'Nunito',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Previous
          </button>
          
          <span style={{
            fontFamily: 'Nunito',
            fontWeight: 600,
            fontSize: '14px',
            color: '#061F42',
          }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              background: currentPage === totalPages ? '#E0E0E0' : '#061F42',
              border: 'none',
              borderRadius: '8px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: '#FFFFFF',
              fontFamily: 'Nunito',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Next
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default LabPendingTab;
