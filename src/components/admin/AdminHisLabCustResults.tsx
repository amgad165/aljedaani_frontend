import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getHisLabCustResults, getHisLabCustResultStats } from '../../services/hisLabCustResultService';
import type { HisLabCustResult, HisLabCustResultStats } from '../../services/hisLabCustResultService';

const AdminHisLabCustResults: React.FC = () => {
  const [results, setResults] = useState<HisLabCustResult[]>([]);
  const [stats, setStats] = useState<HisLabCustResultStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [perPage] = useState(15);
  const [selectedResult, setSelectedResult] = useState<HisLabCustResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchColumn, setSearchColumn] = useState('Description');

  useEffect(() => {
    fetchData();
    fetchResults();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      const statsData = await getHisLabCustResultStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching HIS lab custom result stats:', error);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await getHisLabCustResults(currentPage, perPage, {
        search: searchTerm || undefined,
        search_column: searchColumn,
      });
      setResults(data.data);
      setTotalPages(data.pagination?.last_page || 1);
      setTotalResults(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching HIS lab custom results:', error);
      alert('Failed to load HIS lab custom results');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchResults();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRowClick = (result: HisLabCustResult) => {
    setSelectedResult(result);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedResult(null);
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
              HIS Lab Custom Results
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Detailed test results from Hospital Information System
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
                Total Results
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.total_synced.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #088395 0%, #05bfdb 100%)',
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

            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Unique SlNos
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.unique_slnos.toLocaleString()}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Recent Syncs
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {stats.recent_syncs.toLocaleString()}
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
              <option value="Description">Description</option>
              <option value="SlNo">SlNo</option>
              <option value="CaseCode">Case Code</option>
              <option value="SCode">SCode</option>
            </select>
            <input
              type="text"
              placeholder={`Search by ${searchColumn}...`}
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
              onClick={fetchResults}
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
              Loading results...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
              No results found
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
                      <th style={tableHeaderStyle}>SlNo</th>
                      <th style={tableHeaderStyle}>Description</th>
                      <th style={tableHeaderStyle}>Result</th>
                      <th style={tableHeaderStyle}>Unit</th>
                      <th style={tableHeaderStyle}>Normal Value</th>
                      <th style={tableHeaderStyle}>Case Code</th>
                      <th style={tableHeaderStyle}>Synced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr
                        key={result.id || index}
                        onClick={() => handleRowClick(result)}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={tableCellStyle}>{result.SlNo || 'N/A'}</td>
                        <td style={tableCellStyle}>
                          <div style={{ 
                            maxWidth: '300px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                          }}>
                            {result.Description || 'N/A'}
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            background: '#e0f2fe',
                            color: '#0369a1',
                          }}>
                            {result.Result || 'N/A'}
                          </span>
                        </td>
                        <td style={tableCellStyle}>{result.Unit || '-'}</td>
                        <td style={tableCellStyle}>{result.NormalValue || '-'}</td>
                        <td style={tableCellStyle}>{result.CaseCode || 'N/A'}</td>
                        <td style={tableCellStyle}>{formatDate(result.last_synced_at)}</td>
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
                  {Math.min(currentPage * perPage, totalResults)} of{' '}
                  {totalResults} results
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
      {showModal && selectedResult && (
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
                Lab Custom Result Details
              </h2>
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

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {/* Identification */}
              <Section title="Identification">
                <InfoRow label="ID" value={selectedResult.id?.toString()} />
                <InfoRow label="SlNo" value={selectedResult.SlNo} />
                <InfoRow label="Case Code" value={selectedResult.CaseCode} />
                <InfoRow label="SCode" value={selectedResult.SCode} />
                <InfoRow label="HIS ID" value={selectedResult.his_id} />
              </Section>

              {/* Test Information */}
              <Section title="Test Information">
                <InfoRow label="Description" value={selectedResult.Description} />
                <InfoRow label="Result" value={selectedResult.Result} />
                <InfoRow label="Unit" value={selectedResult.Unit} />
                <InfoRow label="Normal Value" value={selectedResult.NormalValue} />
              </Section>

              {/* Linked Lab Report */}
              {selectedResult.lab_report && (
                <Section title="Linked Lab Report">
                  <InfoRow label="Report SLNO" value={selectedResult.lab_report.SLNO} />
                  <InfoRow label="File Number" value={selectedResult.lab_report.FILENUMBER} />
                  <InfoRow label="Report Date" value={formatDate(selectedResult.lab_report.R_DATE)} />
                  <InfoRow label="Category" value={selectedResult.lab_report.Category} />
                </Section>
              )}

              {/* System Information */}
              <Section title="System Information">
                <InfoRow label="Last Synced" value={formatDate(selectedResult.last_synced_at)} />
                <InfoRow label="Created At" value={formatDate(selectedResult.created_at)} />
                <InfoRow label="Updated At" value={formatDate(selectedResult.updated_at)} />
              </Section>

              {/* Sync Metadata */}
              {selectedResult.sync_metadata && Object.keys(selectedResult.sync_metadata).length > 0 && (
                <Section title="Sync Metadata">
                  <pre style={{
                    background: '#f9fafb',
                    padding: '16px',
                    borderRadius: '8px',
                    overflow: 'auto',
                    fontSize: '13px',
                  }}>
                    {JSON.stringify(selectedResult.sync_metadata, null, 2)}
                  </pre>
                </Section>
              )}
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
    <span style={{ color: '#6b7280', wordBreak: 'break-word' }}>{value || 'N/A'}</span>
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

export default AdminHisLabCustResults;
