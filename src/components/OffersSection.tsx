import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';
import { useHomepageData } from '../context/HomepageContext';
import { getTranslatedField } from '../utils/localeHelpers';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import type { Offer } from '../services/offersService';

interface ClaimDetails {
  full_name: string;
  email: string;
  phone: string;
}

const CLAIMED_OFFERS_STORAGE_KEY = 'claimed_offer_ids';
const EMPTY_OFFERS: Offer[] = [];

const OffersSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: contentRef } = useScrollAnimation();
  const { data } = useHomepageData();
  const { t } = useTranslation('pages');
  const { user, isAuthenticated } = useAuth();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [claimDetails, setClaimDetails] = useState<ClaimDetails>({
    full_name: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [claimedOfferIds, setClaimedOfferIds] = useState<number[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  const offers = useMemo(() => {
    if (Array.isArray(data?.offers)) {
      return data.offers as Offer[];
    }
    return EMPTY_OFFERS;
  }, [data?.offers]);

  const offerSlides = useMemo(() => {
    const chunkSize = 3;
    const chunks: Offer[][] = [];
    for (let i = 0; i < offers.length; i += chunkSize) {
      chunks.push(offers.slice(i, i + chunkSize));
    }
    return chunks;
  }, [offers]);

  useEffect(() => {
    let localClaimedIds: number[] = [];

    try {
      const localClaimedRaw = localStorage.getItem(CLAIMED_OFFERS_STORAGE_KEY);
      const parsed = localClaimedRaw ? JSON.parse(localClaimedRaw) : [];
      localClaimedIds = Array.isArray(parsed)
        ? parsed.map((id) => Number(id)).filter((id) => Number.isFinite(id))
        : [];
    } catch {
      localClaimedIds = [];
    }

    const fromApiClaimed = offers.filter((offer) => offer.has_claimed).map((offer) => offer.id);

    const merged = Array.from(new Set<number>([...localClaimedIds, ...fromApiClaimed]));
    setClaimedOfferIds((prev) => {
      if (prev.length === merged.length && prev.every((id, index) => id === merged[index])) {
        return prev;
      }
      return merged;
    });
  }, [offers]);

  useEffect(() => {
    if (activeSlide >= offerSlides.length) {
      setActiveSlide(0);
    }
  }, [activeSlide, offerSlides.length]);

  useEffect(() => {
    if (offerSlides.length <= 1 || selectedOffer) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % offerSlides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [offerSlides.length, selectedOffer]);

  const calculateFinalPrice = (price: number, discount: number) => {
    const numPrice = Number(price);
    const numDiscount = Number(discount);
    return numPrice - (numPrice * (numDiscount / 100));
  };

  const isOfferClaimed = (offer: Offer) => {
    return offer.has_claimed || claimedOfferIds.includes(offer.id);
  };

  const markOfferAsClaimed = (offerId: number) => {
    setClaimedOfferIds((prev) => {
      const next = prev.includes(offerId) ? prev : [...prev, offerId];
      localStorage.setItem(CLAIMED_OFFERS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const submitClaim = async (offer: Offer, details: ClaimDetails, fromModal: boolean) => {
    setSubmitting(true);
    setFormError('');
    setNotice(null);

    try {
      const endpoint = isAuthenticated
        ? `/user/offers/${offer.id}/claim`
        : `/offers/${offer.id}/claim`;
      const payload = isAuthenticated
        ? { phone: details.phone }
        : details;
      await apiClient.post(endpoint, payload);
      markOfferAsClaimed(offer.id);
      setSelectedOffer(null);
      setNotice({ type: 'success', message: t('offerClaimedSuccess') });
    } catch (error) {
      const statusCode = typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status: number }).status)
        : undefined;
      const message = error instanceof Error ? error.message : t('offerClaimFailed');
      const isDuplicate = statusCode === 409;

      if (isDuplicate) {
        markOfferAsClaimed(offer.id);
      }

      if (fromModal) {
        setFormError(isDuplicate ? t('offerAlreadyClaimed') : message);
      } else {
        setNotice({ type: isDuplicate ? 'success' : 'error', message: isDuplicate ? t('offerAlreadyClaimed') : message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimClick = (offer: Offer) => {
    setNotice(null);

    if (isOfferClaimed(offer)) {
      setNotice({ type: 'success', message: t('offerAlreadyClaimed') });
      return;
    }

    if (isAuthenticated && user?.phone?.trim()) {
      void submitClaim(offer, {
        full_name: user.name,
        email: user.email,
        phone: user.phone,
      }, false);
      return;
    }

    setClaimDetails({
      full_name: isAuthenticated ? user?.name || '' : '',
      email: isAuthenticated ? user?.email || '' : '',
      phone: isAuthenticated ? user?.phone || '' : '',
    });
    setFormError('');
    setSelectedOffer(offer);
  };

  const closeClaimForm = () => {
    if (!submitting) {
      setSelectedOffer(null);
      setFormError('');
    }
  };

  const goToNextSlide = () => {
    if (offerSlides.length <= 1) {
      return;
    }
    setActiveSlide((prev) => (prev + 1) % offerSlides.length);
  };

  const goToPrevSlide = () => {
    if (offerSlides.length <= 1) {
      return;
    }
    setActiveSlide((prev) => (prev - 1 + offerSlides.length) % offerSlides.length);
  };

  if (offers.length === 0) {
    return null;
  }

  const claimButtonStyle: React.CSSProperties = {
    border: 0,
    borderRadius: '8px',
    padding: '9px 16px',
    color: '#fff',
    background: 'linear-gradient(135deg, #0155CB 0%, #00ABDA 100%)',
    fontWeight: 700,
    cursor: submitting ? 'wait' : 'pointer',
  };

  const renderOfferSlide = (slideOffers: Offer[], slideIndex: number) => {
    const mainOffer = slideOffers[0];
    const sideOffers = slideOffers.slice(1, 3);

    return (
      <div key={`offer-slide-${slideIndex}`} style={{ minWidth: '100%' }}>
        <div className="service-wrapper mb-4">
          {mainOffer && (
            <div style={{ backgroundImage: `url('${mainOffer.image_url}')` }} className="image-wrapper">
              <div className="content-wrapper resposive-justify-end">
                <div className="icon roboto responsive-d-block">{Math.floor(Number(mainOffer.discount))}%
                  <br />OFF</div>
                <div className="service-card">
                  <span className="h3 fw-exbold">{getTranslatedField(mainOffer.title, '')}</span>
                  <div className="d-flex align-items-center gap-1">
                    <div className="buttons">
                      <div style={{
                        background: 'linear-gradient(135deg, #0155CB 0%, #00ABDA 100%)',
                        borderRadius: '12px',
                        padding: '12px 24px',
                        display: 'inline-block'
                      }}>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '14px',
                          textDecoration: 'line-through',
                          marginBottom: '2px'
                        }}>
                          {Number(mainOffer.price).toFixed(2)} SAR
                        </div>
                        <div style={{
                          color: '#fff',
                          fontSize: '24px',
                          fontWeight: 800
                        }}>
                          {calculateFinalPrice(mainOffer.price, mainOffer.discount).toFixed(2)} SAR
                        </div>
                      </div>
                    </div>
                    <div className="icon roboto responsive-d-none m-0">{mainOffer.discount}% OFF</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClaimClick(mainOffer)}
                    disabled={submitting || isOfferClaimed(mainOffer)}
                    style={isOfferClaimed(mainOffer) ? claimedButtonStyle : claimButtonStyle}
                  >
                    {isOfferClaimed(mainOffer) ? t('offerClaimed') : t('claimOffer')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {sideOffers.length > 0 && (
            <div className="right-side">
              {sideOffers.map((offer, index) => (
                <div
                  key={offer.id}
                  style={{ backgroundImage: `url('${offer.image_url}')` }}
                  className={`image-wrapper wrapper-1 ${index === 0 ? 'mb-3 m-mb-2' : ''}`}
                >
                  <div className="content-wrapper justify-content-end">
                    <div className="service-card">
                      <span className="h3 fw-exbold">{getTranslatedField(offer.title, '')}</span>
                      <div className="right">
                        <div className="buttons">
                          <div style={{
                            background: 'linear-gradient(135deg, #0155CB 0%, #00ABDA 100%)',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            display: 'inline-block'
                          }}>
                            <div style={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: '12px',
                              textDecoration: 'line-through',
                              marginBottom: '2px'
                            }}>
                              {Number(offer.price).toFixed(2)} SAR
                            </div>
                            <div style={{
                              color: '#fff',
                              fontSize: '18px',
                              fontWeight: 800
                            }}>
                              {calculateFinalPrice(offer.price, offer.discount).toFixed(2)} SAR
                            </div>
                          </div>
                        </div>
                        <div className="icon roboto">{Math.floor(Number(offer.discount))}%
                          <br />OFF</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleClaimClick(offer)}
                        disabled={submitting || isOfferClaimed(offer)}
                        style={isOfferClaimed(offer) ? claimedButtonStyle : claimButtonStyle}
                      >
                        {isOfferClaimed(offer) ? t('offerClaimed') : t('claimOffer')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 992px) {
            .offers-title {
              font-size: 32px !important;
              line-height: 38px !important;
              margin-bottom: 40px !important;
            }
          }
          @media (max-width: 576px) {
            .offers-title {
              font-size: 28px !important;
              line-height: 34px !important;
              margin-bottom: 40px !important;
            }
          }
        `}
      </style>
      <section className="service-sec pb-0">
        <div className="container">
          <h2 
            ref={titleRef}
            className="offers-title"
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: '48px',
              lineHeight: '50px',
              textAlign: 'center',
              color: '#061F42',
              marginBottom: '60px',
              ...getAnimationStyle(titleVisible, 0),
              opacity: 1
            }}
          >
            {t('offersTitle')}
          </h2>
        {notice && (
          <div
            role="status"
            style={{
              maxWidth: '720px',
              margin: '0 auto 24px',
              padding: '14px 18px',
              borderRadius: '10px',
              color: notice.type === 'success' ? '#166534' : '#991b1b',
              background: notice.type === 'success' ? '#dcfce7' : '#fee2e2',
              textAlign: 'center',
            }}
          >
            {notice.message}
          </div>
        )}
        {offerSlides.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <button type="button" onClick={goToPrevSlide} style={slideArrowButtonStyle} aria-label="Previous offers">
              <span style={{ fontSize: '18px', fontWeight: 700 }}>‹</span>
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              {offerSlides.map((_, index) => (
                <button
                  key={`offer-slide-dot-${index}`}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Go to offers slide ${index + 1}`}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    background: index === activeSlide ? '#0155CB' : '#bfdbfe',
                  }}
                />
              ))}
            </div>
            <button type="button" onClick={goToNextSlide} style={slideArrowButtonStyle} aria-label="Next offers">
              <span style={{ fontSize: '18px', fontWeight: 700 }}>›</span>
            </button>
          </div>
        )}
        <div
          ref={contentRef}
          style={{ overflow: 'hidden' }}
        >
          <div
            style={{
              display: 'flex',
              transform: `translateX(-${activeSlide * 100}%)`,
              transition: 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform',
            }}
          >
            {offerSlides.map((slideOffers, slideIndex) => renderOfferSlide(slideOffers, slideIndex))}
          </div>
        </div>
      </div>
    </section>
      {selectedOffer && (
        <div
          role="presentation"
          onClick={closeClaimForm}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(6, 31, 66, 0.65)',
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="offer-claim-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              void submitClaim(selectedOffer, claimDetails, true);
            }}
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '28px',
              borderRadius: '16px',
              background: '#fff',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
          >
            <h3 id="offer-claim-title" style={{ marginTop: 0, color: '#061F42' }}>
              {t('claimOffer')}
            </h3>
            <p style={{ color: '#475569' }}>
              {getTranslatedField(selectedOffer.title, '')}
            </p>
            {isAuthenticated ? (
              <>
                <p style={{ color: '#475569' }}>
                  {user?.name} · {user?.email}
                </p>
                <label style={{ display: 'block', marginBottom: '16px', color: '#061F42' }}>
                  {t('offerPhone')}
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    value={claimDetails.phone}
                    onChange={(event) => setClaimDetails({ ...claimDetails, phone: event.target.value })}
                    style={inputStyle}
                  />
                </label>
              </>
            ) : (
              <>
                <label style={{ display: 'block', marginBottom: '16px', color: '#061F42' }}>
                  {t('offerFullName')}
                  <input
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={150}
                    value={claimDetails.full_name}
                    onChange={(event) => setClaimDetails({ ...claimDetails, full_name: event.target.value })}
                    style={inputStyle}
                  />
                </label>
                <label style={{ display: 'block', marginBottom: '16px', color: '#061F42' }}>
                  {t('offerEmail')}
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={190}
                    value={claimDetails.email}
                    onChange={(event) => setClaimDetails({ ...claimDetails, email: event.target.value })}
                    style={inputStyle}
                  />
                </label>
                <label style={{ display: 'block', marginBottom: '16px', color: '#061F42' }}>
                  {t('offerPhone')}
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={40}
                    value={claimDetails.phone}
                    onChange={(event) => setClaimDetails({ ...claimDetails, phone: event.target.value })}
                    style={inputStyle}
                  />
                </label>
              </>
            )}
            {formError && (
              <p role="alert" style={{ color: '#b91c1c' }}>{formError}</p>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={closeClaimForm} disabled={submitting} style={secondaryButtonStyle}>
                {t('cancel')}
              </button>
              <button type="submit" disabled={submitting} style={claimButtonStyle}>
                {submitting ? t('submittingOfferClaim') : t('confirmOfferClaim')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: '6px',
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  font: 'inherit',
};

const secondaryButtonStyle: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '9px 16px',
  color: '#061F42',
  background: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};

const slideArrowButtonStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '999px',
  border: '1px solid #93c5fd',
  background: '#eff6ff',
  color: '#0155CB',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const claimedButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: '8px',
  padding: '9px 16px',
  color: '#14532d',
  background: '#dcfce7',
  fontWeight: 700,
  cursor: 'not-allowed',
};

export default OffersSection;
