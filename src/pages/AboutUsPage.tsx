import { useState, useEffect } from 'react';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import Footer from '../components/Footer';
import FloatingContactButtons from '../components/FloatingContactButtons';

type TabType = 'overview' | 'mission' | 'values' | 'awards' | 'leadership';

interface TabContent {
  id: TabType;
  title: string;
  tagline?: string;
  subtitle: string;
  content: string;
  imageUrl: string;
}

const AboutUsPage = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    { id: 'overview' as TabType, title: 'Overview' },
    { id: 'mission' as TabType, title: 'Mission & Vision' },
    { id: 'values' as TabType, title: 'Values' },
    { id: 'awards' as TabType, title: 'Awards & Accreditations' },

    // hidden for now don't delete
    // { id: 'leadership' as TabType, title: 'Leadership' },
  ];

  const tabContent: Record<TabType, TabContent> = {
    overview: {
      id: 'overview',
      title: 'Overview',
      tagline: 'SINCE 1992',
      subtitle: 'Al Jedaani Group of Hospitals',
      content: ``,
      imageUrl: '/assets/img/about/overview-image.jpg',
    },
    mission: {
      id: 'mission',
      title: 'Mission & Vision',
      tagline: 'OUR PURPOSE',
      subtitle: 'Mission & Vision',
      content: `Mission: To provide compassionate, high-quality healthcare services that enhance the wellbeing of our patients and community. We are committed to delivering excellence through innovation, continuous improvement, and a patient-centered approach.

Vision: To be the leading healthcare provider in Saudi Arabia, recognized for our clinical excellence, patient satisfaction, and contribution to advancing medical science. We aspire to set the standard for healthcare delivery in the region.

Our mission and vision guide every decision we make, from the technology we invest in to the way we interact with patients. We believe in treating every patient with dignity and respect, while leveraging the latest medical advancements to deliver optimal outcomes.`,
      imageUrl: '/assets/img/about/mission-image.jpg',
    },
    values: {
      id: 'values',
      title: 'Values',
      tagline: 'OUR PRINCIPLES',
      subtitle: 'Core Values',
      content: `Compassion: We treat every patient with empathy, kindness, and understanding, recognizing that healing extends beyond medical treatment.

Excellence: We strive for the highest standards in everything we do, continuously seeking to improve our services and capabilities.

Integrity: We conduct ourselves with honesty, transparency, and ethical behavior in all our interactions.

Innovation: We embrace new technologies and methodologies to enhance patient care and outcomes.

Teamwork: We believe in the power of collaboration, working together across disciplines to deliver comprehensive care.

Respect: We value the dignity of every individual – patients, families, and staff – creating an environment of mutual respect and trust.`,
      imageUrl: '/assets/img/about/values-image.jpg',
    },
    awards: {
      id: 'awards',
      title: 'Awards & Accreditations',
      tagline: 'RECOGNITION',
      subtitle: 'Awards & Accreditations',
      content: `Al Jedaani Group of Hospitals has been recognized for excellence in healthcare delivery through numerous awards and accreditations from national and international organizations.

Our accreditations demonstrate our commitment to maintaining the highest standards of patient safety, quality care, and operational excellence. We have received certifications from leading healthcare accreditation bodies, validating our clinical processes and patient care protocols.

These recognitions are not just awards on our wall – they represent our ongoing commitment to excellence and our dedication to continuously improving our services. We are proud of these achievements, but we know that the true measure of our success is the health and satisfaction of our patients.`,
      imageUrl: '/assets/img/about/awards-image.jpg',
    },
    leadership: {
      id: 'leadership',
      title: 'Leadership',
      tagline: 'OUR LEADERS',
      subtitle: 'Leadership Team',
      content: `Our leadership team brings together decades of experience in healthcare management, medical practice, and strategic planning. Led by visionary executives who are passionate about improving healthcare delivery, our leaders guide the organization with wisdom and foresight.

The team is committed to fostering a culture of excellence, innovation, and compassion throughout the organization. They work closely with medical staff, administrative teams, and support personnel to ensure that Al Jedaani Group of Hospitals continues to deliver exceptional care.

Our leaders believe in leading by example, maintaining open communication, and empowering every team member to contribute to our mission of providing world-class healthcare to our community.`,
      imageUrl: '/assets/img/about/leadership-image.jpg',
    },
  };

  const currentContent = tabContent[activeTab];

  return (
    <>
      <FloatingContactButtons />
      {ResponsiveNavbar}
      
      <div style={{
        minHeight: '100vh',
        background: '#C9F3FF',
        paddingTop: isMobile ? '80px' : '131px',
        paddingBottom: isMobile ? '30px' : '60px',
      }}>
        <div style={{
          maxWidth: '1760px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 160px',
        }}>
          {/* Page Title */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            padding: isMobile ? '10px 16px' : '10px 32px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'left',
          }}>
            <h1 style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: isMobile ? '28px' : '48px',
              lineHeight: isMobile ? '32px' : '50px',
              color: '#061F42',
              margin: 0,
            }}>
              About Us
            </h1>
          </div>

          {/* Breadcrumb */}
          <div style={{
            width: '100%',
            maxWidth: '1400px',
            height: isMobile ? 'auto' : '40px',
            fontFamily: 'Nunito, sans-serif',
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: isMobile ? '14px' : '16px',
            lineHeight: isMobile ? '24px' : '40px',
            marginBottom: '12px',
          }}>
            <span style={{ color: '#A4A5A5' }}>Displaying results for </span>
            <span style={{ color: '#061F42' }}>
              About Us &gt; {currentContent.title}
            </span>
          </div>

          {/* Main Content Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '0px',
            width: '100%',
          }}>
            {/* Main Content Box */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: isMobile ? '12px' : '24px',
              gap: isMobile ? '16px' : '24px',
              width: '100%',
              background: '#FCFCFC',
              boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
              borderRadius: '0px 12px 12px 12px',
            }}>
              {/* Content Section - Sidebar + Image */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                padding: '0px',
                gap: '16px',
                width: '100%',
              }}>
                {/* Sidebar */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'row' : 'column',
                  alignItems: 'flex-start',
                  padding: '8px',
                  gap: '8px',
                  width: isMobile ? '100%' : '287px',
                  minWidth: isMobile ? 'auto' : '287px',
                  background: '#F3F4F6',
                  borderRadius: '12px',
                  overflowX: isMobile ? 'auto' : 'visible',
                }}>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: isMobile ? '8px 12px' : '12px',
                        gap: '12px',
                        width: isMobile ? 'auto' : '100%',
                        minWidth: isMobile ? '120px' : 'auto',
                        minHeight: '44px',
                        background: activeTab === tab.id ? '#DAF8FF' : '#FFFFFF',
                        border: '1px solid #D8D8D8',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        flexShrink: isMobile ? 0 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== tab.id) {
                          e.currentTarget.style.background = '#F9FAFB';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== tab.id) {
                          e.currentTarget.style.background = '#FFFFFF';
                        }
                      }}
                    >
                      <span style={{
                        fontFamily: 'Nunito',
                        fontStyle: 'normal',
                        fontWeight: activeTab === tab.id ? 700 : 600,
                        fontSize: isMobile ? '14px' : '16px',
                        lineHeight: isMobile ? '18px' : '20px',
                        textAlign: 'center',
                        color: '#061F42',
                        whiteSpace: isMobile ? 'nowrap' : 'normal',
                      }}>
                        {tab.title}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Image Container */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-start',
                  padding: isMobile ? '16px' : '24px',
                  gap: '10px',
                  flex: '1',
                  minHeight: isMobile ? '200px' : '320px',
                  background: `linear-gradient(90deg, rgba(6, 31, 66, 0.5) 0%, rgba(0, 0, 0, 0) 100%), url(${currentContent.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '15px',
                }}>
                  {/* Text Container */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0px',
                    gap: '8px',
                    borderRadius: '0px',
                  }}>
                    {/* Tagline */}
                    {currentContent.tagline && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '3px 11px',
                        gap: '10px',
                        background: '#00ABDA',
                        borderRadius: '1000px',
                      }}>
                        <span style={{
                          fontFamily: 'Inter',
                          fontStyle: 'normal',
                          fontWeight: 700,
                          fontSize: '12px',
                          lineHeight: '16px',
                          letterSpacing: '0.6px',
                          textTransform: 'uppercase',
                          color: '#FFFFFF',
                        }}>
                          {currentContent.tagline}
                        </span>
                      </div>
                    )}

                    {/* Subtitle */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '0px',
                      gap: '10px',
                      borderRadius: '0px',
                    }}>
                      <span style={{
                        fontFamily: 'Inter',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        fontSize: isMobile ? '18px' : '24px',
                        lineHeight: isMobile ? '24px' : '32px',
                        letterSpacing: '0.0703125px',
                        color: '#FFFFFF',
                      }}>
                        {currentContent.subtitle}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Container - Dynamic based on tab */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0px',
                gap: '16px',
                width: '100%',
                borderRadius: '0px',
              }}>
                {/* Render different content based on active tab */}
                {activeTab === 'overview' && (
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '18px',
                    lineHeight: '29px',
                    color: '#4A5565',
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}>
                    {currentContent.content}
                  </p>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px', width: '100%' }}>
                    <h1 style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: isMobile ? '24px' : '31px',
                      lineHeight: isMobile ? '32px' : '42px',
                      color: '#061F42',
                      margin: 0,
                    }}>
                      Jedaani Hospitals, Over 30 Years of Clinical Excellence
                    </h1>
                    <p style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? '16px' : '18px',
                      lineHeight: isMobile ? '24px' : '29px',
                      color: '#4A5565',
                      margin: 0,
                    }}>
                      With over three decades of clinical expertise, <strong>Jedaani Hospitals stand as a cornerstone of healthcare in Jeddah.</strong>
                    </p>
                    <p style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? '16px' : '18px',
                      lineHeight: isMobile ? '24px' : '29px',
                      color: '#4A5565',
                      margin: 0,
                    }}>
                      Our practice is governed by a rigorous professional methodology summarized in our slogan, <strong>"Experienced Care"</strong>
                    </p>
                    <p style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? '16px' : '18px',
                      lineHeight: isMobile ? '24px' : '29px',
                      color: '#4A5565',
                      margin: 0,
                    }}>
                      We are dedicated to merging long-standing clinical heritage with evidence-based medical advancements to provide a safe, reliable, and patient-centric environment that enhances the quality of life for every individual we serve.
                    </p>

                    <h2 style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: isMobile ? '20px' : '24px',
                      lineHeight: isMobile ? '28px' : '32px',
                      color: '#061F42',
                      margin: '16px 0 0 0',
                    }}>
                      Comprehensive Medical Specialties
                    </h2>
                    <p style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? '16px' : '18px',
                      lineHeight: isMobile ? '24px' : '29px',
                      color: '#4A5565',
                      margin: 0,
                    }}>
                      Jedaani Hospitals relies on a distinguished faculty of <strong>high-caliber consultants and experts</strong> across more than <strong>20 medical specialties</strong>.
                    </p>
                    <p style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? '16px' : '18px',
                      lineHeight: isMobile ? '24px' : '29px',
                      color: '#4A5565',
                      margin: 0,
                    }}>
                      Our primary clinical focus centers on Pediatrics, Obstetrics, Gynecology, Cardiology, Neurology and Internal Medicine. We extend this expertise into advanced surgical and specialized domains, including General Surgery, Orthopedics, Urology, Ophthalmology, and Pediatric Surgery.
                    </p>
                    <p style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? '16px' : '18px',
                      lineHeight: isMobile ? '24px' : '29px',
                      color: '#4A5565',
                      margin: 0,
                    }}>
                      This multidisciplinary framework integrates expert management in Pulmonology, Nephrology, and Psychiatry, complemented by specialized services in Dermatology, Dentistry, and Physical Therapy to deliver accurate, diagnostic-driven treatment solutions.
                    </p>

                    <h2 style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: isMobile ? '20px' : '24px',
                      lineHeight: isMobile ? '28px' : '32px',
                      color: '#061F42',
                      margin: '16px 0 0 0',
                    }}>
                      Advanced Infrastructure
                    </h2>
                    <p style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? '16px' : '18px',
                      lineHeight: isMobile ? '24px' : '29px',
                      color: '#4A5565',
                      margin: 0,
                    }}>
                      We maintain a robust intensive care network, providing specialized Adult, Pediatric, and Neonatal <strong>Intensive Care units</strong> with full technical readiness.
                    </p>
                    <p style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? '16px' : '18px',
                      lineHeight: isMobile ? '24px' : '29px',
                      color: '#4A5565',
                      margin: 0,
                    }}>
                      Our facilities are equipped with state-of-the-art medical technologies across <strong>all laboratory, diagnostic, and imaging services</strong> to ensure rapid and precise clinical results.
                    </p>
                    <p style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? '16px' : '18px',
                      lineHeight: isMobile ? '24px' : '29px',
                      color: '#4A5565',
                      margin: 0,
                    }}>
                      Integrated within our healthcare ecosystem is the <strong>Baher Al-Arbaeen Pharmacy group</strong>, delivering seamless pharmaceutical care and retail services to both inpatients and outpatients under the highest international standards.
                    </p>

                    <h2 style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: isMobile ? '20px' : '24px',
                      lineHeight: isMobile ? '28px' : '32px',
                      color: '#061F42',
                      margin: '16px 0 0 0',
                    }}>
                      Strategic Regional Presence
                    </h2>
                    <p style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? '16px' : '18px',
                      lineHeight: isMobile ? '24px' : '29px',
                      color: '#4A5565',
                      margin: 0,
                    }}>
                      Strategically located across <strong>3 major hospitals in Jeddah</strong> with a total capacity of 300 beds, our infrastructure provides comprehensive healthcare coverage for the entire Western Region of Saudi Arabia. We ensure streamlined access to <strong>advanced medical interventions and 24/7 emergency</strong> management. Our operational effectiveness is designed to handle high patient volumes while maintaining the rapid response times essential for acute and inpatient care.
                    </p>

                    <h2 style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: isMobile ? '20px' : '24px',
                      lineHeight: isMobile ? '28px' : '32px',
                      color: '#061F42',
                      margin: '16px 0 0 0',
                    }}>
                      Specialized Excellence Centers
                    </h2>
                    <p style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? '16px' : '18px',
                      lineHeight: isMobile ? '24px' : '29px',
                      color: '#4A5565',
                      margin: 0,
                    }}>
                      Al Jedaani Hospitals is distinguished by five specialized Centers of Excellence designed to provide focused, high-tier medical care. This system includes the <strong>Women's Health Center, the Pediatrics Center, the Center of Excellence for Men's Health, the Advanced Cardiac Catheterization Lab, and the Mental Health Center</strong>. These centers utilize advanced diagnostic and therapeutic tools to implement the world's most precise medical protocols, ensuring superior clinical outcomes through directed and professional expertise.
                    </p>
                  </div>
                )}

                {/* Mission & Vision Tab */}
                {activeTab === 'mission' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px', width: '100%' }}>
                    {/* Our Mission */}
                    <div style={{
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '33px',
                      gap: '16px',
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #F3F4F6',
                      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
                      borderRadius: '20px',
                    }}>
                      {/* Content Header */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: '0px',
                        gap: '16px',
                        width: '100%',
                        height: '48px',
                      }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '0px',
                          width: '48px',
                          height: '48px',
                          background: '#E1F9FF',
                          borderRadius: '50%',
                          flexShrink: 0,
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="#00ABDA" strokeWidth="2" fill="none"/>
                            <circle cx="12" cy="12" r="6" stroke="#00ABDA" strokeWidth="2" fill="none"/>
                            <circle cx="12" cy="12" r="2" stroke="#00ABDA" strokeWidth="2" fill="none"/>
                          </svg>
                        </div>
                        <h3 style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontStyle: 'normal',
                          fontWeight: 700,
                          fontSize: '28px',
                          lineHeight: '42px',
                          color: '#061F42',
                          margin: 0,
                        }}>
                          Our Mission
                        </h3>
                      </div>
                      {/* Paragraph */}
                      <p style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        fontSize: '18px',
                        lineHeight: '29px',
                        color: '#4A5565',
                        margin: 0,
                        width: '100%',
                      }}>
                        To provide distinguished healthcare services with the highest quality standards, ensuring patient safety and satisfaction through a dedicated professional team and advanced technology.
                      </p>
                    </div>

                    {/* Our Vision */}
                    <div style={{
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '33px',
                      gap: '16px',
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #F3F4F6',
                      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
                      borderRadius: '20px',
                    }}>
                      {/* Content Header */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: '0px',
                        gap: '16px',
                        width: '100%',
                        height: '48px',
                      }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '0px',
                          width: '48px',
                          height: '48px',
                          background: '#E1F9FF',
                          borderRadius: '50%',
                          flexShrink: 0,
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" stroke="#00ABDA" strokeWidth="2" fill="none"/>
                            <circle cx="12" cy="12" r="3" stroke="#00ABDA" strokeWidth="2" fill="none"/>
                          </svg>
                        </div>
                        <h3 style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontStyle: 'normal',
                          fontWeight: 700,
                          fontSize: '28px',
                          lineHeight: '42px',
                          color: '#061F42',
                          margin: 0,
                        }}>
                          Our Vision
                        </h3>
                      </div>
                      {/* Paragraph */}
                      <p style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        fontSize: '18px',
                        lineHeight: '29px',
                        color: '#4A5565',
                        margin: 0,
                        width: '100%',
                      }}>
                        To be the leading healthcare provider in the region, recognized for our comprehensive care, community service, and commitment to medical excellence.
                      </p>
                    </div>
                  </div>
                )}

                {/* Values Tab */}
                {activeTab === 'values' && (
                  <div style={{ width: '100%' }}>
                    <h3 style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: isMobile ? '24px' : '28px',
                      lineHeight: isMobile ? '32px' : '36px',
                      color: '#061F42',
                      margin: isMobile ? '0 0 16px 0' : '0 0 24px 0',
                    }}>
                      Our Core Values
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '24px',
                      width: '100%',
                    }}>
                      {[
                        { title: 'Patient Focus', description: 'Our patients are at the heart of everything we do, receiving personalized care and attention.' },
                        { title: 'Excellence', description: 'We are committed to delivering the highest standards of medical care and safety.' },
                        { title: 'Integrity', description: 'We operate with honesty, transparency, and ethical conduct in all our dealings.' },
                        { title: 'Compassion', description: 'We treat every individual with kindness, dignity, and respect.' },
                        { title: 'Teamwork', description: 'We collaborate as a unified team to achieve the best outcomes for our patients.' },
                        { title: 'Community Service', description: 'We are dedicated to serving and improving the health of our local community.' },
                      ].map((value, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          gap: isMobile ? '12px' : '16px',
                          alignItems: 'flex-start',
                          padding: isMobile ? '16px' : '20px',
                          background: '#F9FAFB',
                          borderRadius: '12px',
                          border: '1px solid #E5E7EB',
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#00ABDA',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 700,
                              fontSize: isMobile ? '16px' : '18px',
                              lineHeight: isMobile ? '22px' : '24px',
                              color: '#061F42',
                              margin: '0 0 8px 0',
                            }}>
                              {value.title}
                            </h4>
                            <p style={{
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 400,
                              fontSize: isMobile ? '13px' : '14px',
                              lineHeight: isMobile ? '20px' : '22px',
                              color: '#6B7280',
                              margin: 0,
                            }}>
                              {value.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Awards & Accreditations Tab */}
                {activeTab === 'awards' && (
                  <div style={{ width: '100%' }}>
                    <h3 style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: isMobile ? '24px' : '28px',
                      lineHeight: isMobile ? '32px' : '36px',
                      color: '#061F42',
                      margin: isMobile ? '0 0 12px 0' : '0 0 16px 0',
                    }}>
                      Awards & Accreditations
                    </h3>
                    <p style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? '14px' : '16px',
                      lineHeight: isMobile ? '22px' : '24px',
                      color: '#6B7280',
                      margin: isMobile ? '0 0 24px 0' : '0 0 32px 0',
                    }}>
                      Al Jedaani Hospitals are proud to be accredited by national and international healthcare bodies, reflecting our unwavering commitment to quality.
                    </p>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                      gap: isMobile ? '16px' : '24px',
                      width: '100%',
                    }}>
                      {[
                        { title: 'CBAHI Accredited', image: '/assets/img/awards/cbahi.jpg', badge: 'Certified', badgeColor: '#00ABDA' },
                        { title: 'MOH Recognition', image: '/assets/img/awards/moh.jpg', badge: '2023', badgeColor: '#00ABDA' },
                        { title: 'Patient Safety Award', image: '/assets/img/awards/patient-safety.jpg', badge: '2022', badgeColor: '#00ABDA' },
                        { title: 'Best Community Hospital', image: '/assets/img/awards/community.jpg', badge: '2021', badgeColor: '#00ABDA' },
                      ].map((award, index) => (
                        <div key={index} style={{
                          background: '#FFFFFF',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid #E5E7EB',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        }}>
                          <div style={{
                            width: '100%',
                            height: '200px',
                            background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%), url(${award.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                            padding: '16px',
                          }}>
                            <div style={{
                              background: award.badgeColor,
                              color: '#FFFFFF',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 700,
                              fontSize: '12px',
                            }}>
                              {award.badge}
                            </div>
                          </div>
                          <div style={{ padding: '20px' }}>
                            <h4 style={{
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 700,
                              fontSize: '18px',
                              lineHeight: '24px',
                              color: '#061F42',
                              margin: 0,
                            }}>
                              {award.title}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leadership Tab */}
                {activeTab === 'leadership' && (
                  <div style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: isMobile ? '16px' : '24px 33px 1px 24px',
                    gap: isMobile ? '16px' : '24px',
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #F3F4F6',
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
                    borderRadius: '20px',
                  }}>
                    {/* Heading with border bottom */}
                    <div style={{
                      boxSizing: 'border-box',
                      width: '100%',
                      borderBottom: '1px solid #F3F4F6',
                      paddingBottom: isMobile ? '12px' : '16px',
                    }}>
                      <h3 style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        fontSize: isMobile ? '24px' : '28px',
                        lineHeight: isMobile ? '32px' : '42px',
                        color: '#061F42',
                        margin: 0,
                      }}>
                        Executive Leadership
                      </h3>
                    </div>

                    {/* Leaders Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                      gap: isMobile ? '16px' : '24px',
                      width: '100%',
                    }}>
                      {[
                        { name: 'Sheikh Abdullah Al Jedaani', title: 'Chairman', image: '/assets/img/leadership/chairman.jpg' },
                        { name: 'Dr. Mohammed Al Jedaani', title: 'Chief Executive Officer', image: '/assets/img/leadership/ceo.jpg' },
                        { name: 'Dr. Ahmed Al Ghamdi', title: 'Medical Director', image: '/assets/img/leadership/medical-director.jpg' },
                        { name: 'Mrs. Sarah Al Jedaani', title: 'Director of Operations', image: '/assets/img/leadership/operations.jpg' },
                      ].map((leader, index) => (
                        <div key={index} style={{
                          boxSizing: 'border-box',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: isMobile ? '12px' : '0px 0px 0px 16px',
                          gap: isMobile ? '12px' : '16px',
                          height: isMobile ? 'auto' : '114px',
                          minHeight: isMobile ? '90px' : 'auto',
                          background: '#FFFFFF',
                          border: '1px solid #F3F4F6',
                          borderRadius: '15px',
                        }}>
                          {/* Icon Container */}
                          <div style={{
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '2px',
                            width: isMobile ? '60px' : '80px',
                            height: isMobile ? '60px' : '80px',
                            border: '2px solid #F3F4F6',
                            borderRadius: '50%',
                            flexShrink: 0,
                          }}>
                            <div style={{
                              width: isMobile ? '56px' : '76px',
                              height: isMobile ? '56px' : '76px',
                              background: `linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%), url(${leader.image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              borderRadius: '50%',
                            }} />
                          </div>

                          {/* Text Container */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '0px',
                            gap: '0px',
                            flex: 1,
                          }}>
                            <h4 style={{
                              fontFamily: 'Nunito, sans-serif',
                              fontStyle: 'normal',
                              fontWeight: 700,
                              fontSize: isMobile ? '16px' : '18px',
                              lineHeight: isMobile ? '22px' : '27px',
                              color: '#061F42',
                              margin: 0,
                            }}>
                              {leader.name}
                            </h4>
                            <p style={{
                              fontFamily: 'Nunito, sans-serif',
                              fontStyle: 'normal',
                              fontWeight: 600,
                              fontSize: isMobile ? '13px' : '14px',
                              lineHeight: isMobile ? '18px' : '21px',
                              color: '#00ABDA',
                              margin: 0,
                            }}>
                              {leader.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AboutUsPage;
