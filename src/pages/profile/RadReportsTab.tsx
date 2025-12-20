import { useState, useEffect } from 'react';
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
  const inspectionName = report.InspectionCode || 'Radiology Test';
  const technicianName = report.REFDOCTOR || 'N/A';
  const reportDate = formatReportDate(report.R_DATE);

  return (
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
      {inspectionName}
    </div>
    
    {/* Technician/Doctor */}
    <div style={{
      width: '260px',
      fontFamily: 'Varela Round',
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '16px',
      textAlign: 'center',
      color: '#061F42',
    }}>
      Ref. Doctor: {technicianName}
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
      width: '260px',
      height: '32px',
    }}>
      <button 
        onClick={onDownloadPdf}
        style={{
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
      <button 
        onClick={onViewPdf}
        style={{
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
};

const RadReportsTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState<HisRadiologyReport[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const perPage = 4; // 2x2 grid

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserHisRadiologyReports(currentPage, perPage, {
        search: searchQuery || undefined,
      });
      setReports(response.data);
      setTotalPages(response.pagination.last_page);
      setTotal(response.pagination.total);
    } catch (err: any) {
      console.error('Error fetching HIS radiology reports:', err);
      setError(err.response?.data?.message || 'Failed to load radiology reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentPage, searchQuery]);

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
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '612px',
          height: '411.33px',
          fontFamily: 'Nunito',
          fontSize: '16px',
          color: '#666',
        }}>
          Loading reports...
        </div>
      ) : error ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '612px',
          height: '411.33px',
          fontFamily: 'Nunito',
          fontSize: '16px',
          color: '#d32f2f',
        }}>
          {error}
        </div>
      ) : reports.length === 0 ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '612px',
          height: '411.33px',
          fontFamily: 'Nunito',
          fontSize: '16px',
          color: '#666',
        }}>
          No radiology reports found
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 284px)',
          gap: '28px 44px',
          width: '612px',
          minHeight: '411.33px',
        }}>
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onViewPdf={() => handleViewPdf(report.SLNO)}
              onDownloadPdf={() => handleDownloadPdf(report.SLNO)}
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
