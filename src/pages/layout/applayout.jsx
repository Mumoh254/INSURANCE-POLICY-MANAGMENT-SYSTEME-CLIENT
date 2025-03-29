import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Offcanvas, Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock, faFileContract, faChartLine, faCalendarAlt, faBell,
  faUserShield, faHeart, faCar, faUser, faShieldHalved, faPhone,
  faEnvelope, faShield, faCircleCheck, faUserGraduate, faGlobe,
  faInfoCircle, faDownload, faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import * as jwt_decode from 'jwt-decode';
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
import GlobalNotifications from '../globalNotificationsListener';

// Extended Sidebar Component
const ExtendedSidebar = ({ show, handleClose }) => {
  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" className="extended-sidebar">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Contact & Support</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="contact-info mb-4">
          <h5><FontAwesomeIcon icon={faInfoCircle} className="me-2" />System Information</h5>
          <div className="mb-3">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
            <strong>Location:</strong> Nairobi, Kenya
          </div>
          <div className="mb-3">
            <FontAwesomeIcon icon={faEnvelope} className="me-2" />
            <strong>Email:</strong> infowelttallis@gmail.com
          </div>
          <div className="mb-3">
            <FontAwesomeIcon icon={faPhone} className="me-2" />
            <strong>Support:</strong> +254 740 045355
          </div>
        </div>

        <Button 
          variant="primary" 
          className="w-100 mb-4"
          onClick={() => window.open('/software-guide.pdf', '_blank')}
        >
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Download Software Guide
        </Button>

        <div className="system-status">
          <h5><FontAwesomeIcon icon={faShieldHalved} className="me-2" />System Status</h5>
          <Badge bg="success" className="me-2">Secure Connection</Badge>
          <Badge bg="info">Version 1.1.4</Badge>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

// Protected Layout Component
const ProtectedLayout = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showExtendedSidebar, setShowExtendedSidebar] = useState(false);
  const [theme, setTheme] = useState('light');
  const [logoutWarning, setLogoutWarning] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState(null);
  const authToken = localStorage.getItem('authToken');
  const navigate = useNavigate();

  // Auto-logout functionality
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    const timer = setTimeout(() => {
      setLogoutWarning(true);
      setTimeout(handleLogout, 300000); // 5-minute grace period
    }, 3600000); // 1 hour
    setInactivityTimer(timer);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click'];
    events.forEach(event => 
      window.addEventListener(event, resetInactivityTimer)
    );
    resetInactivityTimer();
    return () => {
      events.forEach(event => 
        window.removeEventListener(event, resetInactivityTimer)
      );
      clearTimeout(inactivityTimer);
    };
  }, []);

  const getUserDetails = () => {
    if (!authToken) return { name: 'Administrator' };
    try {
      const decoded = jwt_decode.jwtDecode(authToken);
      return { name: decoded.name || 'Administrator' };
    } catch (error) {
      return { name: 'Administrator' };
    }
  };

  const { name } = getUserDetails();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Mobile Menu Component
  const MobileMenu = () => (
    <Offcanvas show={showMobileMenu} onHide={() => setShowMobileMenu(false)} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Navigation Menu</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className="flex-column gap-2">
          {[
            { to: "/policies", text: "Policies", icon: faUserShield },
            { to: "/sheets", text: "Sheets", icon: faFileContract },
            { to: "/analytics", text: "Analytics", icon: faChartLine },
            { to: "/notifications", text: "Notifications", icon: faBell },
          ].map((link) => (
            <Nav.Link
              key={link.to}
              as={NavLink}
              to={link.to}
              className="py-2 px-3 d-flex align-items-center gap-3"
              onClick={() => setShowMobileMenu(false)}
            >
              <FontAwesomeIcon icon={link.icon} className="text-primary fs-5" />
              {link.text}
            </Nav.Link>
          ))}
        </Nav>

        <div className="mt-4">
          <Button
            variant="outline-primary"
            className="w-100"
            onClick={() => {
              setShowMobileMenu(false);
              setShowExtendedSidebar(true);
            }}
          >
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            More Information
          </Button>
        </div>

        <div className="user-profile mt-4 pt-3 border-top">
          <div className="d-flex align-items-center gap-3">
            <FontAwesomeIcon icon={faUser} className="fs-4 text-primary" />
            <div>
              <h6 className="mb-0">Logged in as</h6>
              <p className="mb-0 fw-bold">{name}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="outline-secondary"
            className="w-100"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </Button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );

  return (
    <div className={`theme-${theme} d-flex flex-column min-vh-100`}>
      {/* Auto-logout Warning Modal */}
      <Modal show={logoutWarning} onHide={() => setLogoutWarning(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Session Timeout Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Your session will expire in 5 minutes due to inactivity.</p>
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="secondary" onClick={() => setLogoutWarning(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {
              resetInactivityTimer();
              setLogoutWarning(false);
            }}>
              Extend Session
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Main Navbar */}
      <Navbar variant={theme === 'light' ? 'light' : 'dark'} expand="lg" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand as={NavLink} to="/policies">
            <FontAwesomeIcon icon={faShieldHalved} className="me-2" />
            WELT-COVER Admin
          </Navbar.Brand>
          
          <div className="d-flex align-items-center gap-3">
            <RealTimeClock />
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Mobile FABs */}
      <div className="mobile-fab-container d-lg-none">
        <Button
          variant="primary"
          className="fab-main"
          onClick={() => setShowMobileMenu(true)}
        >
          ☰
        </Button>
        <Button
          variant="info"
          className="fab-extension"
          onClick={() => setShowExtendedSidebar(true)}
        >
          <FontAwesomeIcon icon={faInfoCircle} />
        </Button>
      </div>

      <MobileMenu />
      <ExtendedSidebar 
        show={showExtendedSidebar} 
        handleClose={() => setShowExtendedSidebar(false)}
      />

      {/* Main Content */}
      <main className="flex-grow-1 py-4">
        <Container fluid>
          <Outlet />
        </Container>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-3 border-top">
        <Container fluid className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted">
              © {new Date().getFullYear()} WELT-COVER V1.1.4 • Nairobi, Kenya
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button variant="link" size="sm" onClick={() => setShowExtendedSidebar(true)}>
              Contact Support
            </Button>
          </div>
        </Container>
      </footer>
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
          {/* ... other routes remain the same ... */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;