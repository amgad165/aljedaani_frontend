import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import FloatingContactButtons from '../components/FloatingContactButtons';
import { newsService, type NewsItem } from '../services/newsService';

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const NewsDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ResponsiveNavbar = useResponsiveNavbar();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    window.scrollTo(0, 0);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!id) { navigate('/news'); return; }
    newsService.getNewsItem(id)
      .then(data => {
        if (!data) navigate('/news');
        else setNewsItem(data);
      })
      .catch(() => navigate('/news'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#C9F3FF', display: 'flex', flexDirection: 'column' }}>
        <FloatingContactButtons />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 124 }}>
          <div style={{ width: 48, height: 48, border: '4px solid #6BDFFF', borderTopColor: '#061F42', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!newsItem) return null;

  const title = newsService.getField(newsItem.title);
  const blockquote = newsService.getField(newsItem.blockquote);
  const body = newsService.getField(newsItem.body);

  const publishedDate = newsItem.published_at
    ? new Date(newsItem.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <div style={{ minHeight: '100vh', background: '#C9F3FF', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .article-detail-card {
          background: #FFFFFF;
          box-shadow: 0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1);
          border-radius: 24px;
          overflow: hidden;
          animation: detailFadeIn 0.5s ease forwards;
        }

        @keyframes detailFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .article-detail-hero {
          position: relative;
          height: 400px;
          overflow: hidden;
        }

        .article-detail-hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-color: #C5C5C5;
        }

        .article-detail-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(6, 31, 66, 0.85) 0%, rgba(0, 0, 0, 0) 65%);
        }

        .article-detail-hero-content {
          position: absolute;
          left: 48px;
          right: 48px;
          bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .article-detail-hero-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 48px;
          line-height: 58px;
          color: #FFFFFF;
          margin: 0;
          filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.12));
        }

        .article-detail-meta {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .article-detail-meta-text {
          font-family: 'Varela Round', sans-serif;
          font-weight: 400;
          font-size: 14px;
          line-height: 21px;
          color: rgba(255, 255, 255, 0.9);
        }

        .article-detail-meta-bullet {
          font-family: 'Varela Round', sans-serif;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
        }

        .article-detail-body {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 32px;
          padding: 48px 48px 0;
        }

        .article-detail-blockquote {
          box-sizing: border-box;
          border-left: 4px solid #15C9FA;
          padding-left: 28px;
          margin: 0;
          align-self: stretch;
        }

        .article-detail-blockquote p {
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          font-size: 20px;
          line-height: 36px;
          color: #061F42;
          margin: 0;
        }

        .article-body-content {
          align-self: stretch;
          font-family: 'Varela Round', sans-serif;
          font-size: 18px;
          line-height: 32px;
          color: #4A4A4A;
        }

        .article-body-content h2 {
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 28px;
          line-height: 50px;
          color: #061F42;
          margin: 24px 0 8px;
        }

        .article-body-content p {
          margin: 0 0 16px;
        }

        .article-body-content h2:first-child {
          margin-top: 0;
        }

        .article-body-content h3 {
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 22px;
          line-height: 38px;
          color: #061F42;
          margin: 20px 0 6px;
        }

        .article-body-content h4 {
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 18px;
          line-height: 30px;
          color: #061F42;
          margin: 16px 0 4px;
        }

        .article-body-content ul {
          list-style-type: disc;
          padding-inline-start: 28px;
          margin: 8px 0 16px;
        }

        .article-body-content ol {
          list-style-type: decimal;
          padding-inline-start: 28px;
          margin: 8px 0 16px;
        }

        .article-body-content li {
          margin-bottom: 6px;
          line-height: 1.75;
        }

        .article-body-content font[size="1"] { font-size: 11px; }
        .article-body-content font[size="2"] { font-size: 13px; }
        .article-body-content font[size="3"] { font-size: 16px; }
        .article-body-content font[size="4"] { font-size: 20px; }
        .article-body-content font[size="5"] { font-size: 26px; }
        .article-body-content font[size="6"] { font-size: 32px; }
        .article-body-content font[size="7"] { font-size: 48px; }

        .article-body-content blockquote {
          border-left: 4px solid #15C9FA;
          margin: 16px 0;
          padding: 10px 20px;
          background: #f0fdff;
          border-radius: 0 8px 8px 0;
          color: #475569;
          font-style: italic;
        }

        .article-body-content a {
          color: #0a4d68;
          text-decoration: underline;
        }

        .article-detail-share {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-self: stretch;
          border-top: 1px solid #E5E7EB;
          padding-top: 33px;
          padding-bottom: 48px;
        }

        .article-detail-share-heading {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 20px;
          line-height: 30px;
          letter-spacing: -0.449219px;
          color: #061F42;
          margin: 0;
        }

        .article-detail-share-buttons {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 16px;
        }

        .article-detail-social-btn {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4px;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .article-detail-social-btn:hover {
          opacity: 0.85;
          transform: translateY(-2px);
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: #061F42;
          padding: 8px 0;
          transition: opacity 0.2s ease;
        }

        .back-btn:hover { opacity: 0.7; }

        @media (max-width: 768px) {
          .article-detail-hero { height: 280px; }
          .article-detail-hero-content { left: 20px; right: 20px; bottom: 20px; }
          .article-detail-hero-title { font-size: 26px !important; line-height: 34px !important; }
          .article-detail-body { padding: 24px 20px 0; gap: 24px; }
          .article-detail-blockquote p { font-size: 16px !important; line-height: 28px !important; }
          .article-body-content h2 { font-size: 22px !important; line-height: 36px !important; }
          .article-body-content { font-size: 15px !important; line-height: 26px !important; }
          .article-detail-share { padding-bottom: 32px; }
        }
      `}</style>

      <FloatingContactButtons />
      {ResponsiveNavbar}

      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        marginTop: '124px',
        padding: isMobile ? '12px' : '24px',
        paddingTop: '10px',
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>

          {/* Back button */}
          <button className="back-btn" onClick={() => navigate('/news')}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="#061F42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to News
          </button>

          {/* Article Card */}
          <div className="article-detail-card">

            {/* Hero */}
            <div className="article-detail-hero">
              <div
                className="article-detail-hero-bg"
                style={newsItem.image_url ? { backgroundImage: `url('${newsItem.image_url}')` } : {}}
              />
              <div className="article-detail-hero-overlay" />
              <div className="article-detail-hero-content">
                <h1 className="article-detail-hero-title">{title}</h1>
                <div className="article-detail-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#D1D5DC', flexShrink: 0 }} />
                    <span className="article-detail-meta-text">{newsItem.author}</span>
                  </div>
                  {publishedDate && <>
                    <span className="article-detail-meta-bullet">•</span>
                    <span className="article-detail-meta-text">{publishedDate}</span>
                  </>}
                  {newsItem.read_time && <>
                    <span className="article-detail-meta-bullet">•</span>
                    <span className="article-detail-meta-text">{newsItem.read_time}</span>
                  </>}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="article-detail-body">

              {blockquote && (
                <blockquote className="article-detail-blockquote">
                  <p>"{blockquote}"</p>
                </blockquote>
              )}

              {body && (
                <div
                  className="article-body-content"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              )}

              {/* Share */}
              <div className="article-detail-share">
                <h3 className="article-detail-share-heading">Share News</h3>
                <div className="article-detail-share-buttons">
                  <button className="article-detail-social-btn" style={{ background: '#1877F2', color: '#fff' }} aria-label="Share on Facebook">
                    <FacebookIcon />
                  </button>
                  <button className="article-detail-social-btn" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff' }} aria-label="Share on Instagram">
                    <InstagramIcon />
                  </button>
                  <button className="article-detail-social-btn" style={{ background: '#0A66C2', color: '#fff' }} aria-label="Share on LinkedIn">
                    <LinkedInIcon />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailsPage;
