import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentsService, type Department } from '../services/departmentsService';
import Navbar from '../components/Navbar';

const DepartmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const data = await departmentsService.getDepartments({
          active: true,
          with_doctors_count: true,
        });
        setDepartments(data);
        setFilteredDepartments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDepartments(filtered);
    }
  }, [searchTerm, departments]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#C9F3FF',
        paddingTop: '0px',
      }}>
        <Navbar />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          fontFamily: 'Nunito, sans-serif',
          fontSize: '18px',
          color: '#061F42',
        }}>
          Loading departments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#C9F3FF',
        paddingTop: '0px',
      }}>
        <Navbar />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          fontFamily: 'Nunito, sans-serif',
          fontSize: '18px',
          color: '#EE443F',
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#C9F3FF',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Navbar />
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20px',
        marginTop: '170px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          isolation: 'isolate',
          position: 'relative',
          width: '100%',
          maxWidth: '1120px',
          background: '#C9F3FF',
          borderRadius: '15px',
          padding: '24px',
        }}>
      {/* Title Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px 8px 8px 24px',
        width: '1120px',
        height: '80px',
        background: '#FFFFFF',
        borderRadius: '15px',
        gap: '16px',
      }}>
        <h1 style={{
          fontFamily: 'Nunito, sans-serif',
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: '48px',
          lineHeight: '50px',
          color: '#061F42',
          margin: 0,
          flexGrow: 1,
        }}>
          Departments
        </h1>

        {/* Search and Sort Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          alignContent: 'flex-end',
          padding: '12px',
          gap: '8px',
          width: '780px',
          height: '64px',
          background: 'rgba(0, 0, 0, 0.001)',
          borderRadius: '12px',
        }}>
          {/* Search Input */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '0px',
            gap: '8px',
            width: '548px',
            height: '40px',
            borderRadius: '0px',
            flexGrow: 1,
          }}>
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '8px 12px',
              gap: '12px',
              width: '100%',
              height: '40px',
              border: '1.5px solid #DADADA',
              borderRadius: '8px',
            }}>
              <input
                type="text"
                placeholder="Search all departments"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: 'Nunito, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '16px',
                  color: '#6A6A6A',
                  width: '100%',
                }}
              />
              {/* Dropdown arrow */}
              <img
                src="/assets/images/departments/nav-arrow-down.png"
                alt="Dropdown arrow"
                style={{
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>

          {/* Sort Button */}
          <button style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '12px 16px',
            width: '200px',
            height: '40px',
            background: '#061F42',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            gap: '8px',
          }}>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '20px',
              lineHeight: '20px',
              color: '#FFFFFF',
            }}>
              Sort By Name
            </span>
          </button>
        </div>
      </div>

      {/* Results Text */}
      <div style={{
        width: '1120px',
        height: '40px',
        fontFamily: 'Varela Round, sans-serif',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '16px',
        lineHeight: '40px',
      }}>
        <span style={{ color: '#A4A5A5' }}>Displaying results for </span>
        <span style={{ color: '#061F42' }}>Departments &gt; Select Department &gt; All Branches</span>
      </div>

      {/* Section Title */}
      <h2 style={{
        width: '100%',
        height: '40px',
        fontFamily: 'Nunito, sans-serif',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '32px',
        lineHeight: '40px',
        color: '#061F42',
        margin: 0,
      }}>
        Select Department
      </h2>

      {/* Departments Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
        gap: '12px',
        width: '100%',
      }}>
        {filteredDepartments.map((department) => (
          <div
            key={department.id}
            onClick={() => navigate(`/departments/${department.id}`)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '12px',
              gap: '12px',
              width: '270px',
              minWidth: '270px',
              height: '79.2px',
              background:  '#FFFFFF',
              border: '1px solid #D8D8D8',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
           
                (e.currentTarget as HTMLElement).style.background = '#DAF8FF';

            }}
            onMouseLeave={(e) => {
      
                (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
      
            }}
          >
            {/* Department Content */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0px',
              width: '246px',
              height: '55.2px',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0px',
                gap: '4px',
                width: '246px',
                height: '55.2px',
              }}>
                {/* Department Icon */}
                <img 
                  src="/assets/images/departments/icon.png" 
                  alt="Department Icon" 
                  style={{
                    width: '31.2px',
                    height: '31.2px',
                    objectFit: 'contain',
                  }} 
                />

                {/* Department Title */}
                <h3 style={{
                  width: '246px',
                  height: '20px',
                  fontFamily: 'Nunito, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  fontSize: '16px',
                  lineHeight: '20px',
                  textAlign: 'center',
                  color: '#061F42',
                  margin: 0,
                }}>
                  {department.name}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results message */}
      {filteredDepartments.length === 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '200px',
          fontFamily: 'Nunito, sans-serif',
          fontSize: '18px',
          color: '#6A6A6A',
        }}>
          No departments found matching your search.
        </div>
      )}
      </div>
      </div>
    </div>
  );
};

export default DepartmentsPage;