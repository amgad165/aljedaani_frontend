import { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { apiClient } from '../../services/apiClient';
import { getTranslatedField } from '../../utils/localeHelpers';

interface OfferClaimItem {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  claimed_at: string;
  offer: {
    id: number;
    title: string;
    discount: number;
  } | null;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface ClaimsResponse {
  success: boolean;
  data: {
    data: OfferClaimItem[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

const AdminOfferClaims = () => {
  const [claims, setClaims] = useState<OfferClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      setQuery(search.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const result = await apiClient.get<ClaimsResponse>('/admin/offers/claims', {
          per_page: 20,
          page,
          search: query || undefined,
        });

        if (result.success) {
          setClaims(result.data.data || []);
          setLastPage(result.data.last_page || 1);
          setTotal(result.data.total || 0);
        }
      } catch (error) {
        console.error('Error loading offer claims:', error);
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [page, query]);

  const fromIndex = useMemo(() => ((page - 1) * 20) + (claims.length > 0 ? 1 : 0), [page, claims.length]);
  const toIndex = useMemo(() => ((page - 1) * 20) + claims.length, [page, claims.length]);

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: "'Calibri', 'Segoe UI', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#061F42', margin: 0 }}>Offer Claims</h1>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>Track all users and guests who claimed offers.</p>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, phone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              minWidth: '280px',
              padding: '10px 14px',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading claims...</div>
          ) : claims.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No claimed offers found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Offer', 'Claimer', 'Contact', 'Type', 'Claimed At'].map((header) => (
                      <th key={header} style={{ textAlign: 'left', padding: '14px 16px', fontSize: '13px', color: '#334155', borderBottom: '1px solid #e2e8f0' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id}>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{claim.offer ? getTranslatedField(claim.offer.title, 'Offer') : 'Offer'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>ID #{claim.offer?.id ?? '-'}</div>
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: 600 }}>{claim.full_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{claim.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>{claim.phone}</td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: claim.user ? '#1d4ed8' : '#0f766e',
                          background: claim.user ? '#dbeafe' : '#ccfbf1',
                        }}>
                          {claim.user ? 'Registered User' : 'Guest'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        {new Date(claim.claimed_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '14px' }}>
            {total > 0 ? `Showing ${fromIndex} to ${toIndex} of ${total}` : 'No records'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
            >
              Prev
            </button>
            <span style={{ padding: '8px 10px', color: '#334155', minWidth: '78px', textAlign: 'center' }}>{page} / {lastPage}</span>
            <button
              onClick={() => setPage((prev) => Math.min(lastPage, prev + 1))}
              disabled={page >= lastPage || loading}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: page >= lastPage ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOfferClaims;
