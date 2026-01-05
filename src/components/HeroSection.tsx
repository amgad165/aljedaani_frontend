import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomepageData } from '../context/HomepageContext';
import { type Branch } from '../services/branchesService';
import { type Department } from '../services/departmentsService';
import { doctorsService, type Doctor } from '../services/doctorsService';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const { data: homepageData, loading: homepageLoading } = useHomepageData();
  
  // Data states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  // Filter states
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  // Get branches from context
  const branches = homepageData?.branches || [];

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Load departments from context when available
  useEffect(() => {
    if (homepageData?.departments) {
      setDepartments(homepageData.departments);
      setFilteredDepartments(homepageData.departments);
    }
  }, [homepageData]);

  // Filter departments when branch changes
  useEffect(() => {
    if (selectedBranch) {
      const filterDepartmentsByBranch = async () => {
        try {
          const doctorsInBranch = await doctorsService.getDoctors({
            active: true,
            branch_id: parseInt(selectedBranch),
            per_page: 100,
          });
          const deptIds = new Set(doctorsInBranch.data.map(d => d.department_id));
          const filtered = departments.filter(dept => deptIds.has(dept.id));
          setFilteredDepartments(filtered);
          
          // Reset department selection if not in filtered list
          if (selectedDepartment && !filtered.find(d => d.id === parseInt(selectedDepartment))) {
            setSelectedDepartment('');
            setDoctors([]);
            setSelectedDoctor('');
          }
        } catch (err) {
          console.error('Error filtering departments:', err);
        }
      };
      filterDepartmentsByBranch();
    } else {
      setFilteredDepartments(departments);
    }
  }, [selectedBranch, departments]);

  // Load doctors when branch or department changes
  useEffect(() => {
    if (selectedBranch || selectedDepartment) {
      const fetchDoctors = async () => {
        try {
          const doctorsData = await doctorsService.getDoctors({
            active: true,
            branch_id: selectedBranch ? parseInt(selectedBranch) : undefined,
            department_id: selectedDepartment ? parseInt(selectedDepartment) : undefined,
            per_page: 50,
          });
          setDoctors(doctorsData.data);
          
          // Reset doctor selection if not in new list
          if (selectedDoctor && !doctorsData.data.find(d => d.id === parseInt(selectedDoctor))) {
            setSelectedDoctor('');
          }
        } catch (err) {
          console.error('Error loading doctors:', err);
        }
      };
      fetchDoctors();
    } else {
      setDoctors([]);
      setSelectedDoctor('');
    }
  }, [selectedBranch, selectedDepartment]);

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
    setSelectedDepartment('');
    setSelectedDoctor('');
    setDoctors([]);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedDoctor('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoctor) {
      navigate(`/doctors/${selectedDoctor}`);
    } else if (selectedDepartment || selectedBranch) {
      // Navigate to doctors page with filters applied via query params
      const params = new URLSearchParams();
      if (selectedBranch) params.set('branch', selectedBranch);
      if (selectedDepartment) params.set('department', selectedDepartment);
      navigate(`/doctors?${params.toString()}`);
    } else {
      navigate('/doctors');
    }
  };

  return (
    <section style={{ backgroundImage: "url('/assets/img/hero-img.webp')" }} className="hero-sec">
      <div className="container">
        <div 
          className="content-wrapper-1"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div style={{ maxWidth: '440px' }} className="content-wrapper">
            <h1 style={{ fontSize: '48px' }} className="fw-exbold mb-4">
              Trusted care across<br />
              the <span className="fw-exbold main-title text-primary-light">Kingdom</span>
            </h1>
            <a style={{ padding: '12px 20px' }} href="#" className="btn btn-primary w-100">
              Book appointment
            </a>
          </div>
        </div>

        <div 
          className="hero-wrapper"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
          }}
        >
          <form className="form" onSubmit={handleSearch}>
            <div className="input-wrapper d-flex flex-column position-relative">
              <select 
                className="form-select" 
                value={selectedBranch} 
                onChange={(e) => handleBranchChange(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Select Branch</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="input-wrapper d-flex flex-column position-relative">
              <select 
                className="form-select" 
                value={selectedDepartment} 
                onChange={(e) => handleDepartmentChange(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Select Department</option>
                {filteredDepartments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="input-wrapper d-flex flex-column position-relative">
              <select 
                className="form-select" 
                value={selectedDoctor} 
                onChange={(e) => setSelectedDoctor(e.target.value)}
                style={{ width: '100%' }}
                disabled={doctors.length === 0}
              >
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="icon">
              <img src="/assets/img/icons/search.svg" width="24" height="24" alt="Search Icon" />
            </button>
          </form>

          <div className="icon-wrapper">
            <ul className="pagination">
              <li className="active"></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
