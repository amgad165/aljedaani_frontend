import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentsService, type Department } from '../services/departmentsService';
import { branchesService, type Branch } from '../services/branchesService';
import Navbar from '../components/Navbar';

const DepartmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptData, branchData] = await Promise.all([
          departmentsService.getDepartments({
            active: true,
            with_doctors: true,
          }),
          branchesService.getBranches({
            active: true,
          })
        ]);
        setDepartments(deptData);
        setFilteredDepartments(deptData);
        setBranches(branchData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBranchId === null) {
      // Show all departments when "All Branches" is selected
      setFilteredDepartments(departments);
    } else {
      // Filter departments that have at least one doctor in the selected branch
      const filtered = departments.filter(dept =>
        dept.doctors?.some(doctor => doctor.branch_id === selectedBranchId)
      );
      setFilteredDepartments(filtered);
    }
  }, [selectedBranchId, departments]);

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
          flex: 'none',
          order: 1,
          flexGrow: 0,
        }}>
          {/* Branch Filter Dropdown */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '0px',
            gap: '8px',
            width: '708px',
            height: '40px',
            borderRadius: '0px',
            flex: 'none',
            order: 0,
            flexGrow: 1,
            position: 'relative',
          }}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '8px 12px',
                gap: '12px',
                width: '708px',
                height: '40px',
                border: '1.5px solid #DADADA',
                borderRadius: '8px',
                cursor: 'pointer',
                background: '#FFFFFF',
                flex: 'none',
                order: 1,
                alignSelf: 'stretch',
                flexGrow: 0,
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '0px',
                gap: '12px',
                width: '648px',
                height: '16px',
                flex: 'none',
                order: 0,
                flexGrow: 1,
              }}>
                <span style={{
                  width: '648px',
                  height: '16px',
                  fontFamily: 'Nunito, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6A6A6A',
                  flex: 'none',
                  order: 1,
                  flexGrow: 1,
                }}>
                  {selectedBranchId === null 
                    ? 'All Branches' 
                    : branches.find(b => b.id === selectedBranchId)?.name || 'All Branches'
                  }
                </span>
              </div>
              {/* Dropdown arrow */}
              <img
                src="/assets/images/departments/nav-arrow-down.png"
                alt="Dropdown arrow"
                style={{
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain',
                  flex: 'none',
                  order: 1,
                  flexGrow: 0,
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}
              />
            </div>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '44px',
                left: 0,
                width: '100%',
                maxHeight: '300px',
                overflowY: 'auto',
                background: '#FFFFFF',
                border: '1.5px solid #DADADA',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
              }}>
                <div
                  onClick={() => {
                    setSelectedBranchId(null);
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '14px',
                    color: selectedBranchId === null ? '#00ABDA' : '#000000',
                    fontWeight: selectedBranchId === null ? 600 : 500,
                    background: selectedBranchId === null ? '#F0F9FF' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBranchId !== null) {
                      (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBranchId !== null) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  All Branches
                </div>
                {branches.map(branch => (
                  <div
                    key={branch.id}
                    onClick={() => {
                      setSelectedBranchId(branch.id);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: '14px',
                      color: selectedBranchId === branch.id ? '#00ABDA' : '#000000',
                      fontWeight: selectedBranchId === branch.id ? 600 : 500,
                      background: selectedBranchId === branch.id ? '#F0F9FF' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedBranchId !== branch.id) {
                        (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedBranchId !== branch.id) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }
                    }}
                  >
                    {branch.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort Button */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: '0px',
            gap: '10px',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            flex: 'none',
            order: 1,
            flexGrow: 0,
          }}>
            <button style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0px',
              width: '40px',
              height: '40px',
              background: '#FFFFFF',
              border: '1px solid #061F42',
              borderRadius: '8px',
              cursor: 'pointer',
              flex: 'none',
              order: 0,
              flexGrow: 0,
            }}>
              <img
                src="/assets/images/departments/sort.svg"
                alt="Sort"
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'contain',
                  flex: 'none',
                  order: 2,
                  flexGrow: 0,
                }}
              />
            </button>
          </div>
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
        <span style={{ color: '#061F42' }}>
          Departments &gt; Select Department &gt; {selectedBranchId === null 
            ? 'All Branches' 
            : branches.find(b => b.id === selectedBranchId)?.name || 'All Branches'
          }
        </span>
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
        gridTemplateColumns: 'repeat(3, 357.33px)',
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
              flexDirection: 'row',
              alignItems: 'center',
              padding: '8px 16px',
              gap: '12px',
              width: '357.33px',
              height: '48px',
              background: '#FFFFFF',
              border: '1px solid #DADADA',
              borderRadius: '8px',
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
            {/* Icon Container */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0px',
              width: '32px',
              height: '32px',
              background: '#E1F9FF',
              borderRadius: '16777200px',
              flex: 'none',
              order: 0,
              flexGrow: 0,
            }}>
              {/* Department Icon */}
              <img 
                src={department.icon || '/assets/images/departments/icon.png'} 
                alt={`${department.name} Icon`} 
                style={{
                  width: '18px',
                  height: '18px',
                  objectFit: 'contain',
                  borderRadius: '0px',
                  flex: 'none',
                  order: 0,
                  flexGrow: 0,
                }} 
              />
            </div>

            {/* Department Title */}
            <h3 style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'normal',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#000000',
              margin: 0,
              flex: 'none',
              order: 1,
              flexGrow: 0,
            }}>
              {department.name}
            </h3>
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