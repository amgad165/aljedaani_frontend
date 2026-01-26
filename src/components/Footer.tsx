import { Link } from 'react-router-dom';

const Footer = () => {

  const hospitals = [
    { name: 'Al Safa Hospital', id: 'al-safa' },
    { name: 'Ghulail Hospital', id: 'ghulail' },
    { name: 'Ibn Sina Hospital', id: 'ibn-sina' }
  ];

  const quickLinks = [
    { label: 'Find A Doctor', href: '/doctors' },
    { label: 'Lab Result', href: '/profile?tab=lab-reports' },
    { label: 'Radiology Result', href: '/profile?tab=radiology-reports' },
    { label: 'Medical Reports', href: '/profile?tab=medical-reports' }
  ];

  const categoryLinks = [
    { label: 'My Profile', href: '/profile' },
    { label: 'Testimonials', href: '/#testimonials' },
    { label: 'Submit A Complaint', href: '/profile?tab=complaints' },
    { label: 'Patient Experience', href: '/#patient-experience' },
    { label: 'Privacy Policy', href: '/#privacy-policy' }
  ];

  const mainLinks = [
    { label: 'Overview', href: '/' },
    { label: 'Hospitals', href: '/branches' },
    { label: 'Ibn Sina College', href: 'https://ibnsina.edu.sa/' },
    { label: 'Pharmacies', href: '/#pharmacies' },
    { label: 'Departments', href: '/departments' },
    { label: 'Doctors', href: '/doctors' },
    { label: 'Media Hub', href: '/#media-hub' }
  ];

  return (
    <footer style={{
      background: '#061F42',
      padding: '48px 0',
      color: '#FFFFFF',
    }}>
      <style>{`
        .footer-link {
          color: #FFFFFF;
          text-decoration: none;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 20px;
          letter-spacing: -0.150391px;
          transition: opacity 0.2s ease;
        }
        .footer-link:hover {
          opacity: 0.8;
        }
        .footer-section-title {
          font-family: 'Nunito', sans-serif;
          font-size: 20px;
          font-weight: 700;
          line-height: 28px;
          color: #FFFFFF;
          margin-bottom: 24px;
        }
        .footer-button {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          padding: 8px 12px;
          width: 100%;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #FFFFFF;
          background: #061F42;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 600;
          line-height: 16px;
          color: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          gap: 8px;
        }
        .footer-button:hover {
          background: #FFFFFF;
          color: #061F42;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .location-popup {
          animation: fadeIn 0.2s ease;
        }
        @media (max-width: 992px) {
          .footer-container {
            padding: 0 24px !important;
          }
          .footer-content {
            flex-direction: column !important;
            gap: 32px !important;
          }
          .footer-column {
            width: 100% !important;
            padding-top: 0 !important;
          }
          .footer-section-title {
            font-size: 18px;
            margin-bottom: 16px;
          }
        }
        @media (max-width: 576px) {
          .footer-container {
            padding: 0 16px !important;
          }
          .footer-logo {
            margin-bottom: 32px !important;
          }
          .footer-content {
            gap: 24px !important;
          }
          .footer-section-title {
            font-size: 16px;
            margin-bottom: 12px;
          }
        }
      `}</style>

      <div className="footer-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 0px' }}>
        {/* Logo Section */}
        <div className="footer-logo" style={{ marginBottom: '48px' }}>
          <a href="/" className='log' style={{ display: 'inline-block' }}>
            <img 
              src="/assets/img/footer-logo.webp" 
              width="200" 
              height="73" 
              alt="Jedaani Hospitals Logo"
              style={{ display: 'block' }}
            />
          </a>
        </div>

        {/* Main Footer Content */}
        <div className="footer-content" style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '48px',
        }}>
          {/* Contact Us Section */}
          <div className="footer-column" style={{ flex: '0 0 auto', width: '230px' }}>
            <div className="footer-section-title">Contact Us</div>
            
            {/* Phone */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
              marginBottom: '12px',
              alignItems: 'center',
            }}>
              <img src="/assets/images/footer/Icon.svg" width="16" height="16" alt="Phone" />
              <a href="tel:920022404" className="footer-link" style={{ margin: 0 }}>
                920022404
              </a>
            </div>

            {/* Social Icons */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
              marginBottom: '12px',
            }}>
              <a href="https://www.facebook.com/share/1YnpkJ88z5/" target="_blank" rel="noopener noreferrer" style={{
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img src="/assets/img/icons/Facebook.svg" width="20" height="20" alt="Facebook" />
              </a>
              <a href="https://www.instagram.com/jedaanihospitals/" target="_blank" rel="noopener noreferrer" style={{
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img src="/assets/img/icons/Instagram.svg" width="20" height="20" alt="Instagram" />
              </a>
              <a href="https://www.linkedin.com/company/jedaanihospitals" target="_blank" rel="noopener noreferrer" style={{
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img src="/assets/img/icons/LinkedIn.svg" width="20" height="20" alt="LinkedIn" />
              </a>
            </div>

            {/* Locations */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px',
            }}>
              {hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  style={{ position: 'relative' }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '8px',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1C5.24 1 3 3.24 3 6C3 9.5 8 14 8 14S13 9.5 13 6C13 3.24 10.76 1 8 1ZM8 8C6.9 8 6 7.1 6 6C6 4.9 6.9 4 8 4C9.1 4 10 4.9 10 6C10 7.1 9.1 8 8 8Z" fill="#FFFFFF"/>
                    </svg>
                    <span className="footer-link" style={{ margin: 0 }}>
                      {hospital.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <a href="https://wa.me/966" target="_blank" rel="noopener noreferrer" className="footer-button" style={{
                background: '#00BD13',
                borderColor: '#00BD13',
              }}>
                <img src="/assets/images/footer/chat-lines.svg" width="16" height="16" alt="WhatsApp" />
                WhatsApp
              </a>
              <a href="mailto:contact@jedaani.com" className="footer-button" style={{
                background: '#00ABDA',
                borderColor: '#00ABDA',
              }}>
                <img src="/assets/images/footer/mail-out.svg" width="16" height="16" alt="Email" />
                Email us
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column" style={{ flex: '0 0 auto', width: '230px', paddingTop: '48px' }}>
            <ul style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}>
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Category Links */}
          <div className="footer-column" style={{ flex: '0 0 auto', width: '230px', paddingTop: '48px' }}>
            <ul style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}>
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Links */}
          <div className="footer-column" style={{ flex: '0 0 auto', width: '230px', paddingTop: '48px' }}>
            <ul style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}>
              {mainLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Buttons Column */}
          <div className="footer-column" style={{ flex: '0 0 auto', width: '230px', paddingTop: '48px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <Link to="/book-appointment" className="footer-button">
                <img src="/assets/images/footer/calendar-plus.svg" width="24" height="24" alt="Calendar" />
                Book Appointment
              </Link>
              <button className="footer-button">
                <img src="/assets/images/footer/star.svg" width="24" height="24" alt="Star" />
                Offers
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
