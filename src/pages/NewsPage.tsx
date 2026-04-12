import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import FloatingContactButtons from '../components/FloatingContactButtons';
import { newsService, type NewsItem } from '../services/newsService';

const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const ResponsiveNavbar = useResponsiveNavbar();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    newsService.getNews().then(data => {
      setNewsItems(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#C9F3FF',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        /* ── Card shell ── */
        .article-card {
          position: relative;
          height: 480px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          animation: articleFadeIn 0.5s ease forwards;
          opacity: 0;
          transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
                      box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        @keyframes articleFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .article-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px rgba(6, 31, 66, 0.30);
        }

        /* ── Background image fills the entire card ── */
        .article-card-image {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-color: #C5C5C5;
          transition: transform 0.55s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .article-card:hover .article-card-image {
          transform: scale(1.06);
        }

        /* ── Panel pinned to the bottom, expands on hover ── */
        .article-headline-box {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: #061F42;
          border-top: 3px solid #6BDFFF;
          border-radius: 0 0 12px 12px;
          padding: 14px 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Title — always visible, fits container ── */
        .article-card-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 18px;
          line-height: 24px;
          color: #FFFFFF;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── Expandable area: description + button ── */
        .article-expandable {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.42s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity    0.30s ease 0.08s,
                      margin-top 0.42s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 0;
        }

        .article-card:hover .article-expandable {
          max-height: 120px;
          opacity: 1;
          margin-top: 12px;
        }

        /* ── Description text ── */
        .article-card-description {
          font-family: 'Varela', sans-serif;
          font-weight: 400;
          font-size: 14px;
          line-height: 20px;
          color: #FFFFFF;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── Read More button ── */
        .article-read-more-btn {
          align-self: flex-start;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 6px 10px;
          height: 28px;
          background: #15C9FA;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          font-size: 11px;
          line-height: 12px;
          color: #FFFFFF;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }

        .article-read-more-btn:hover {
          background: #0ab0e0;
        }

        .articles-skeleton {
          height: 480px;
          border-radius: 12px;
          background: linear-gradient(90deg, #dde8f0 25%, #c8dae5 50%, #dde8f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <FloatingContactButtons />
      {ResponsiveNavbar}

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginTop: '124px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          maxWidth: '1400px',
          padding: isMobile ? '16px' : '24px',
          paddingTop: '10px',
        }}>

          {/* Page Header */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'center',
            alignItems: isMobile ? 'flex-start' : 'center',
            padding: isMobile ? '16px' : '8px 8px 8px 24px',
            width: '100%',
            background: '#FFFFFF',
            borderRadius: '15px',
            gap: '16px',
          }}>
            <h1 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: isMobile ? '28px' : '44px',
              lineHeight: isMobile ? '32px' : '50px',
              color: '#061F42',
              margin: 0,
              flexGrow: 1,
            }}>
              News
            </h1>
          </div>

          {/* Section Label */}
          <div style={{ width: '100%', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: isMobile ? '14px' : '16px', lineHeight: '40px' }}>
            <span style={{ color: '#A4A5A5' }}>Displaying results for </span>
            <span style={{ color: '#061F42' }}>News</span>
          </div>

          <h2 style={{ width: '100%', margin: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: isMobile ? '24px' : '32px', lineHeight: isMobile ? '32px' : '40px', color: '#061F42' }}>
            Latest News
          </h2>

          {/* Articles Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '20px' : '28px', width: '100%', marginBottom: isMobile ? '24px' : '48px' }}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="articles-skeleton" style={{ animationDelay: `${i * 0.1}s` }} />
                ))
              : newsItems.map((newsItem, index) => {
                  const title = newsService.getField(newsItem.title);
                  const description = newsService.getField(newsItem.description);
                  return (
                    <div
                      key={newsItem.id}
                      className="article-card"
                      style={{ animationDelay: `${index * 80}ms` }}
                      onClick={() => navigate(`/news/${newsItem.id}`)}
                    >
                      {/* Full-card background image */}
                      <div
                        className="article-card-image"
                        style={newsItem.image_url ? { backgroundImage: `url('${newsItem.image_url}')` } : {}}
                      />

                      {/* Headline box */}
                      <div className="article-headline-box">
                        <h3 className="article-card-title">{title}</h3>

                        <div className="article-expandable">
                          {description && <p className="article-card-description">{description}</p>}
                          <button
                            className="article-read-more-btn"
                            onClick={(e) => { e.stopPropagation(); navigate(`/news/${newsItem.id}`); }}
                          >
                            Read More
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewsPage;
