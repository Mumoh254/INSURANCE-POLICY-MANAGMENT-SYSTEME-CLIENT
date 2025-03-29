import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Offcanvas, Button, Dropdown, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faFileContract,
  faChartLine,
  faCalendarAlt,
  faBell,
  faUserShield,
  faHeart,
  faCar,
  faUser,
  faShieldHalved,
  faPhone,
  faEnvelope,
  faShield,
  faCircleCheck,
  faUserGraduate,
  faGlobe,
  faInfoCircle,
  faBuilding,
  faCodeBranch
} from '@fortawesome/free-solid-svg-icons';
import { Alert } from 'react-bootstrap';
import Policies from '../policies';
import Charts from '../chart';
import Notifications from '../notifications';
import Payment from '../payment';
import InsuranceCalendar from '../calender';
import PolicyList from '../shetts';
import CreationMenu from '../creation';
import Login from '../login';
import AdminManagement from '../adminManagment';
import PolicyDetails from '../view';
import EditPolicy from '../updatepolicy';
import UserDetails from '../singleUser';
import Cookies from 'js-cookie';
import * as jwt_decode from 'jwt-decode';
import GlobalNotifications from '../globalNotificationsListener';

// Company Information Modal
const CompanyInfoModal = ({ show, handleClose }) => (
  <Modal show={show} onHide={handleClose} centered size="lg">
  <Modal.Header closeButton className="bg-dark text-light border-0">
    <Modal.Title className="fw-bold">
      <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
      WELT TALLIS - Company Profile
    </Modal.Title>
  </Modal.Header>
  
  <Modal.Body className="bg-gradient-light p-4">
    <div className="row g-4">
      {/* Company Info Section */}
      <div className="col-12">
        <div className="company-logo mb-4 text-center">
          <div className="bg-primary text-white rounded-circle d-inline-block p-3">
            <FontAwesomeIcon icon={faBuilding} size="2x" />
          </div>
          <h3 className="mt-3 text-dark">WELT TALLIS GROUP</h3>
        </div>

        <div className="info-section border rounded p-3 mb-4 bg-white">
          <h5 className="text-primary mb-3 border-bottom pb-2">
            <FontAwesomeIcon icon={faUserShield} className="me-2" />
            Corporate Details
          </h5>
          <ul className="list-unstyled mb-0">
            <li className="d-flex align-items-center mb-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-muted me-3" fixedWidth />
              <a href="mailto:infowelttallis@gmail.com" className="text-dark">infowelttallis@gmail.com</a>
            </li>
            <li className="d-flex align-items-center mb-2">
              <FontAwesomeIcon icon={faPhone} className="text-muted me-3" fixedWidth />
              <a href="tel:+254740045355" className="text-dark">+254 740 045 355</a>
            </li>
            <li className="d-flex align-items-center mb-2">
              <FontAwesomeIcon icon={faGlobe} className="text-muted me-3" fixedWidth />
              <span className="text-dark">Nairobi, Kenya</span>
            </li>
          </ul>
        </div>
      </div>

      {/* System Info Section */}
      <div className="col-12 mt-4">
        <div className="system-info border rounded p-3 bg-white">
          <h5 className="text-primary mb-3 border-bottom pb-2">
            <FontAwesomeIcon icon={faCodeBranch} className="me-2" />
            System Information
          </h5>
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <FontAwesomeIcon icon={faCodeBranch} className="text-muted me-2" />
                <span className="text-dark">Version: V1.1.4</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-muted me-2" />
                <span className="text-dark">Last Updated: 2025-03-15</span>
              </div>
            </div>
          </div>
          <div className="mt-2 text-muted small">
            <FontAwesomeIcon icon={faUserShield} className="me-2" />
            Licensed exclusively to Welt-Tallis Group
          </div>
        </div>
      </div>
    </div>
  </Modal.Body>

  <Modal.Footer className="bg-light border-top">
    <small className="text-muted">
      © {new Date().getFullYear()} WELT TALLIS GROUP. All rights reserved.
    </small>
  </Modal.Footer>
</Modal>

);

// Admin Profile Dropdown
const AdminDropdown = ({ loginTime, handleLogout }) => {
  const [remaining, setRemaining] = useState(4 * 60 * 60 * 1000);
  const [location] = useState("Nairobi, Kenya");
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwt_decode.jwtDecode(token);
        setAdminName(decoded.name || "Admin");
      } catch (error) {
        console.error('Token decode error:', error);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - loginTime;
      setRemaining(4 * 60 * 60 * 1000 - elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [loginTime]);

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="dark" id="admin-dropdown" className="d-flex align-items-center gap-2">
        <FontAwesomeIcon icon={faUserShield} />
        <span className="d-none d-lg-inline">{adminName}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow-lg border-0" style={{ minWidth: '250px' }}>
        <div className="px-3 py-2 bg-primary text-white rounded-top">
          <h6 className="mb-0">Admin Profile</h6>
        </div>
        <div className="p-3">
          <div className="d-flex align-items-center gap-2 mb-3">
            <FontAwesomeIcon icon={faGlobe} className="text-muted" />
            <span>{location}</span>
          </div>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FontAwesomeIcon icon={faClock} className="text-muted" />
            <span>Logged in at: {new Date(loginTime).toLocaleTimeString()}</span>
          </div>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FontAwesomeIcon icon={faClock} className="text-danger" />
            <span>{formatTime(remaining)}</span>
          </div>
          <Button 
            variant="danger" 
            onClick={handleLogout} 
            className="w-100 mt-2"
          >
            Logout
          </Button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

// Real-time Clock component
const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  return (
    <div className="d-flex align-items-center gap-2">
      <FontAwesomeIcon icon={faClock} className="text-primary fs-6" />
      <span className="text-white">{time.toLocaleTimeString()}</span>
    </div>
  );
};

// RealtimeInfo component for Offcanvas (mobile sidebar)
const RealtimeInfo = ({ loginTime }) => {
  const [date, setDate] = useState(new Date());
  const [remaining, setRemaining] = useState(4 * 60 * 60 * 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - loginTime;
      setRemaining(4 * 60 * 60 * 1000 - elapsed);
      setDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [loginTime]);

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = date.toLocaleDateString(undefined, options);
  
  return (
    <div className="realtime-info p-3 my-3 rounded-3" style={{ background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)' }}>
      <div className="d-flex align-items-center mb-2 text-info">
        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
        <span>{formattedDate}</span>
      </div>
      <div className="d-flex align-items-center mb-2 text-warning">
        <FontAwesomeIcon icon={faClock} className="me-2" />
        <span>{date.toLocaleTimeString()}</span>
      </div>
      <div className="d-flex align-items-center mb-2 text-success">
        <FontAwesomeIcon icon={faGlobe} className="me-2" />
        <span>Nairobi, Kenya</span>
      </div>
      <div className="d-flex align-items-center text-danger">
        <FontAwesomeIcon icon={faClock} className="me-2" />
        <span>{formatTime(remaining)} remaining</span>
      </div>
    </div>
  );
};

// Footer component with security warning
const Footer = () => {
  const token = localStorage.getItem('authToken');
  let userName = 'Live';
  if (token) {
    try {
      const decoded = jwt_decode.jwtDecode(token);
      userName = decoded.name || decoded.email || 'Live';
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }
  return (
    <footer className="bg-black text-white py-4 mt-auto border-top border-secondary">
      <Container fluid className="px-2 px-md-4">
        <Alert variant="danger" className="d-flex align-items-center mb-4" dismissible>
          <FontAwesomeIcon icon={faShieldHalved} className="me-2 fs-4" />
          <div>
            <strong>SECURITY ALERT:</strong> In case of suspected data breach, immediately contact:
            <div className="mt-1">
              <a href="tel:+2547400453555" className="text-white text-decoration-none me-3">
                <FontAwesomeIcon icon={faPhone} className="me-1" />
                +254 740 0453555
              </a>
              <a href="mailto:infowelttallis@gmail.com" className="text-white text-decoration-none">
                <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                infowelttallis@gmail.com
              </a>
            </div>
          </div>
        </Alert>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex flex-wrap justify-content-center gap-2 gap-md-3">
            {[
              { to: "/policy-holder", icon: faUserShield },
              { to: "/sheets", icon: faFileContract },
              { to: "/analytics", icon: faChartLine },
              { to: "/calender", icon: faCalendarAlt },
              { to: "/notifications", icon: faBell },
              { to: "/create-admin", icon: faUserShield },
            ].map((link) => (
              <NavLink 
                key={link.to}
                to={link.to} 
                className="text-decoration-none"
              >
                <FontAwesomeIcon 
                  icon={link.icon}
                  className="text-primary hover-scale px-2 px-md-3"
                  style={{ fontSize: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }}
                />
              </NavLink>
            ))}
          </div>

          <div className="d-flex align-items-center gap-2 text-center">
            <span className="text-muted">Active Admin User:</span>
            <Badge pill bg="danger" className="fs-6 px-3 py-2">
              <FontAwesomeIcon icon={faUserShield} className="me-2" />
              {userName}
            </Badge>
          </div>
        </div>

        <div className="row mt-4 text-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="d-flex justify-content-center gap-3">
              <a href="tel:+2547400453555" className="text-white text-decoration-none">
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                Emergency Support
              </a>
              <a href="mailto:infowelttallis@gmail.com" className="text-white text-decoration-none">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                Security Team
              </a>
            </div>
          </div>
          <div className="col-md-6">
            <small className="text-secondary">
              &copy; {new Date().getFullYear()} Welt-Cover V1.1.4  Automated-insure-Sys. All rights reserved.
              <span className="mx-2">|</span>
              <span className="d-block d-md-inline mt-1 mt-md-0">
                Secure Admin Portal | ISO 27001 Certified | GDPR Compliant
              </span>
            </small>
          </div>
        </div>

        <div className="text-center mt-3">
          <a 
            href="/welt_tallis_insurance_software_guide.pdf" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-outline-light btn-sm"
          >
            Download Software Guide (PDF)
          </a>
        </div>

        <div className="text-center mt-3">
          <Badge bg="dark" className="px-3 py-2">
            <FontAwesomeIcon icon={faShield} className="text-success me-2" />
            Real-time System Monitoring Active
            <FontAwesomeIcon icon={faCircleCheck} className="text-success ms-2" />
          </Badge>
        </div>
      </Container>
    </footer>
  );
};

// Protected Layout with responsive mobile sidebar
const ProtectedLayout = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [theme] = useState('dark');
  const [loginTime] = useState(Date.now());
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleLogout();
    }, 4 * 60 * 60 * 1000); // 4 hours

    return () => clearTimeout(timer);
  }, []);

  if (!authToken || userRole !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar variant="dark" expand="lg" className="shadow-sm fixed-top py-2" style={{ background: "#0a0a0a" }}>
        <Container fluid className="px-3">
          <div className="d-flex justify-content-between w-100 align-items-center">
            <Navbar.Brand as={NavLink} to="/policies" className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faUserShield} className="text-primary fs-4" />
              <span className="h6 mb-0 d-none d-md-block">WELT-COVER V1</span>
            </Navbar.Brand>

            <div className="d-flex align-items-center gap-3">
              <Button 
                variant="link" 
                className="text-light"
                onClick={() => setShowCompanyInfo(true)}
              >
                <FontAwesomeIcon icon={faInfoCircle} size="lg" />
              </Button>
              <AdminDropdown loginTime={loginTime} handleLogout={handleLogout} />
            </div>
          </div>

          <Navbar.Collapse id="main-nav">
            <Nav className="mx-auto align-items-center gap-4">
              {[
                { to: "/policies", text: "Policies" },
                { to: "/sheets", text: "Sheets" },
                { to: "/policy-holder", text: "Policy-Holder" },
                { to: "/analytics", text: "Analytics" },
                { to: "/schedule", text: "Schedule" },
                { to: "/notifications", text: "Notifications" },
              ].map((link) => (
                <Nav.Link
                  key={link.to}
                  as={NavLink}
                  to={link.to}
                  className="px-2 text-nowrap"
                  style={{ fontSize: '0.95rem' }}
                >
                  {link.text}
                </Nav.Link>
              ))}
            </Nav>
            
            <Nav className="align-items-center gap-3 d-none d-lg-flex">
              <RealTimeClock />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Mobile Menu Button */}
      <div className="d-lg-none fixed-bottom pe-3 pb-3" style={{ zIndex: 1000 }}>
        <Button
          onClick={() => setShowMobileMenu(true)}
          variant="primary"
          size="lg"
          className="shadow-lg"
          style={{ width: '55px', height: '55px', bottom: '20px', right: '20px', position: 'fixed' }}
        >
          ☰
        </Button>
      </div>

      {/* Enhanced Mobile Sidebar */}
      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="end"
        className=" bg-black"
        style={{ 
          background: '#0000',
          width: '300px'
        }}
      >
        <Offcanvas.Header className="border-bottom border-secondary">
          <Offcanvas.Title className="text-light">
            <FontAwesomeIcon icon={faUserShield} className="me-2" />
            Admin Panel
          </Offcanvas.Title>
        </Offcanvas.Header>
        
        <Offcanvas.Body className="pt-4">
          <RealtimeInfo loginTime={loginTime} />
          
          <Button 
            variant="outline-info" 
            className="w-100 mb-3 d-flex align-items-center gap-2"
            onClick={() => setShowCompanyInfo(true)}
          >
            <FontAwesomeIcon icon={faInfoCircle} />
            Company Info
          </Button>

          <Nav className="flex-column gap-2">
            {[
              { to: "/policies", text: "Policies", icon: faUserShield },
              { to: "/sheets", text: "Sheets", icon: faFileContract },
              { to: "/policy-holder", text: "Policy-Holder", icon: faChartLine },
              { to: "/analytics", text: "Analytics", icon: faCalendarAlt },
              { to: "/schedule", text: "Schedule", icon: faBell },
              { to: "/notifications", text: "Notifications", icon: faBell },
              { to: "/create-admin", text: "Admin Management", icon: faUserShield },
            ].map((link) => (
              <Nav.Link
                key={link.to}
                as={NavLink}
                to={link.to}
                onClick={() => setShowMobileMenu(false)}
                className="py-2 px-3 d-flex align-items-center gap-3 text-light"
                style={{ fontSize: '0.9rem' }}
              >
                <FontAwesomeIcon icon={link.icon} className="text-primary fs-5" />
                {link.text}
              </Nav.Link>
            ))}
          </Nav>

          <div className="mt-4 pt-3 border-top border-secondary">
            <Button 
              variant="danger" 
              onClick={handleLogout}
              className="w-100 d-flex align-items-center gap-2"
            >
              <FontAwesomeIcon icon={faUserShield} />
              Logout
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <CompanyInfoModal 
        show={showCompanyInfo} 
        handleClose={() => setShowCompanyInfo(false)} 
      />

      <main className="flex-grow-1 py-4 bg-light" style={{ marginTop: '70px' }}>
        <Container fluid className="px-3 px-lg-4">
          <Outlet />
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <GlobalNotifications />
      <Routes>   
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/policies" element={<Policies />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/schedule" element={<InsuranceCalendar />} />
          <Route path="/sheets" element={<PolicyList />} />
          <Route path="/policy-holder" element={<CreationMenu />} />
          <Route path="/analytics" element={<Charts />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/policies/:id" element={<PolicyDetails />} />
          <Route path="/edit-policy/:id" element={<EditPolicy />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/create-admin" element={<AdminManagement />} />
          <Route path="/" element={<Navigate to="/policies" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;