import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar.jsx';
import '../components/pages.css';

const NewProject = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    businessSector: '',
    customSector: '',
    location: '',
    employeeCount: '',
    investmentType: '',
  });

  useEffect(() => {
    document.body.classList.remove('page-exit');
    const timer = window.setTimeout(() => setIsLoaded(true), 100);

    return () => window.clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalSector =
      formData.businessSector === 'Others'
        ? formData.customSector
        : formData.businessSector;

    const dataToSave = {
      ...formData,
      businessSector: finalSector,
    };

    sessionStorage.setItem('temp_project_base', JSON.stringify(dataToSave));
    document.body.classList.add('page-exit');
    window.setTimeout(() => {
      navigate('/new-project/survey');
    }, 250);
  };

  const arrowIcon =
    'https://img.icons8.com/?size=100&id=5jRysPx2JtDa&format=png&color=053B29';

  const indonesianProvinces = [
    'Aceh', 'Bali', 'Banten', 'Bengkulu', 'DI Yogyakarta', 'DKI Jakarta',
    'Gorontalo', 'Jambi', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur',
    'Kalimantan Barat', 'Kalimantan Selatan', 'Kalimantan Tengah', 'Kalimantan Timur', 'Kalimantan Utara',
    'Kepulauan Bangka Belitung', 'Kepulauan Riau', 'Lampung', 'Maluku', 'Maluku Utara',
    'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Papua', 'Papua Barat',
    'Papua Barat Daya', 'Papua Pegunungan', 'Papua Selatan', 'Papua Tengah',
    'Riau', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tengah', 'Sulawesi Tenggara', 'Sulawesi Utara',
    'Sumatera Barat', 'Sumatera Selatan', 'Sumatera Utara',
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar activeMenu="New Project" />
      <main className={`main-content ${isLoaded ? 'page-fade-in' : ''}`}>
        <h1 className="page-title">Business Profile</h1>
        <p className="page-subtitle">
          Fill in a few details about your business to generate your IT investment analysis
        </p>

        <div className="content-card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  name="projectName"
                  placeholder="Enter Your Name Project"
                  value={formData.projectName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Business Sector</label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="businessSector"
                    value={formData.businessSector}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select Sector...</option>
                    <option value="Culinary">Culinary (Food &amp; Beverages)</option>
                    <option value="Fashion">Fashion &amp; Apparel</option>
                    <option value="Agriculture">Agriculture &amp; Livestock</option>
                    <option value="Retail">Retail &amp; Trade</option>
                    <option value="Services">Services (Laundry, Barbershop, etc.)</option>
                    <option value="Creative">Creative Industry &amp; Handicraft</option>
                    <option value="Digital">Digital &amp; Technology Services</option>
                    <option value="Beauty">Beauty &amp; Health Wellness</option>
                    <option value="Education">Education &amp; Training Services</option>
                    <option value="Manufacturing">Manufacturing &amp; Home Industry</option>
                    <option value="Fishery">Fishery &amp; Marine Products</option>
                    <option value="Tourism">Tourism &amp; Hospitality</option>
                    <option value="Logistics">Transportation &amp; Logistics</option>
                    <option value="Others">Others</option>
                  </select>
                  <img src={arrowIcon} className="dropdown-icon" alt="arrow" />
                </div>

                {formData.businessSector === 'Others' && (
                  <input
                    type="text"
                    name="customSector"
                    placeholder="Please specify your sector..."
                    value={formData.customSector}
                    onChange={handleChange}
                    style={{ marginTop: '10px' }}
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label>Location</label>
                <div style={{ position: 'relative' }}>
                  <select name="location" value={formData.location} onChange={handleChange} required>
                    <option value="" disabled>Select Province...</option>
                    {indonesianProvinces.map((province) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                  <img src={arrowIcon} className="dropdown-icon" alt="arrow" />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Number of Employee</label>
                <input
                  type="number"
                  name="employeeCount"
                  placeholder="Input number..."
                  value={formData.employeeCount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>IT Investment Type</label>
                <input
                  type="text"
                  name="investmentType"
                  placeholder="What do you want to invest?"
                  value={formData.investmentType}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ overflow: 'hidden', marginTop: '20px' }}>
              <button type="submit" className="btn-next">Next</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewProject;
