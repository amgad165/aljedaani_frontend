import { useState, useEffect, useCallback } from 'react';
import {
  getUserHisRadiologyReports,
  viewHisRadiologyReportPdf,
  downloadHisRadiologyReportPdf,
  formatReportDate,
  type HisRadiologyReport,
} from '../../services/hisRadiologyUserService';

interface ReportCardProps {
  report: HisRadiologyReport;
  onViewPdf: () => void;
  onDownloadPdf: () => void;
}

const ReportCard = ({ report, onViewPdf, onDownloadPdf }: ReportCardProps) => {
  const inspectionName = report.service_name || 'Radiology Test';
  const technicianName = report.technician;
  const reportDate = formatReportDate(report.date);

  return (
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
      {inspectionName}
    </div>
    
    {/* Technician/Doctor - Only show if technician exists */}
    {technicianName && (
      <div style={{
        width: '100%',
        fontFamily: 'Nunito',
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: '16px',
        textAlign: 'center',
        color: '#061F42',
      }}>
        Ref. Doctor: {technicianName}
      </div>
    )}
    
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
        {reportDate}
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
        onClick={onDownloadPdf}
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
        }}>
        Download
      </button>
      <button 
        onClick={onViewPdf}
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
        }}>
        View File
      </button>
    </div>
  </div>
  );
};

const RadReportsTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState<HisRadiologyReport[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const perPage = 4; // 2x2 grid

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserHisRadiologyReports(currentPage, perPage, {
        search: searchQuery || undefined,
      });
      let filteredReports = response.data;
      
      // Apply date filter on client side
      if (dateFilter) {
        filteredReports = filteredReports.filter(report =>
          report.date === dateFilter
        );
      }
      
      setReports(filteredReports);
      setTotalPages(response.pagination.last_page);
      setTotal(response.pagination.total);
    } catch (err: any) {
      console.error('Error fetching HIS radiology reports:', err);
      setError(err.response?.data?.message || 'Failed to load radiology reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, dateFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleViewPdf = (slno: string) => {
    viewHisRadiologyReportPdf(slno);
  };

  const handleDownloadPdf = async (slno: string) => {
    try {
      await downloadHisRadiologyReportPdf(slno);
    } catch (err) {
      alert('Failed to download PDF');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchReports();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setDateFilter(date || null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Mock data - replace with actual data from API
  // const reports = [
  //   { id: 1, title: 'Blood Test', technician: 'Lab Technician: Samir Tayel', date: '25/08/2025' },
  //   { id: 2, title: 'Blood Test', technician: 'Lab Technician: Samir Tayel', date: '25/08/2025' },
  //   { id: 3, title: 'Blood Test', technician: 'Lab Technician: Samir Tayel', date: '25/08/2025' },
  //   { id: 4, title: 'Blood Test', technician: 'Lab Technician: Samir Tayel', date: '25/08/2025' },
  // ];

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
            <form onSubmit={handleSearch} style={{ width: '100%' }}>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                <button type="submit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="7" stroke="#061F42" strokeWidth="1.5"/>
                    <path d="M20 20L17 17" stroke="#131927" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </form>
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
          Loading reports...
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
          color: '#d32f2f'
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
          No radiology reports found
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 284px)',
          gap: window.innerWidth <= 768 ? '12px' : '28px 44px',
          width: '100%',
          maxWidth: window.innerWidth <= 768 ? '100%' : '612px',
          minHeight: window.innerWidth <= 768 ? 'auto' : '411.33px',
          padding: window.innerWidth <= 768 ? '0 12px' : '0'
        }}>
          {reports.map((report) => (
            <ReportCard
              key={report.slno}
              report={report}
              onViewPdf={() => handleViewPdf(report.slno)}
              onDownloadPdf={() => handleDownloadPdf(report.slno)}
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
          {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
            let page;
            if (totalPages <= 4) {
              page = i + 1;
            } else if (currentPage <= 2) {
              page = i + 1;
            } else if (currentPage >= totalPages - 1) {
              page = totalPages - 3 + i;
            } else {
              page = currentPage - 1 + i;
            }
            
            return (
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
            );
          })}
          
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

export default RadReportsTab;
