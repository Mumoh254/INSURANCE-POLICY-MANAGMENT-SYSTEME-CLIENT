import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Offcanvas, Button, Modal } from 'react-bootstrap';
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
  faSignOutAlt,
  faDownload,
  faExpand
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

// Enhanced RealtimeInfo component with location name
const RealtimeInfo = () => {
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState("Nairobi, Kenya");
  const [showExtended, setShowExtended] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLocationName = async (lat, lon) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await response.json();
        if (data.address) {
          const city = data.address.city || data.address.town || data.address.village;
          const country = data.address.country;
          setLocation(`${city}, ${country}`);
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchLocationName(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          setLocation("Nairobi, Kenya");
        }
      );
    }
  }, []);

  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = date.toLocaleDateString(undefined, options);
  
  return (
    <div className="realtime-info p-3 my-3 border rounded">
      <div className="d-flex align-items-center mb-2">
        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
        <span>{formattedDate}</span>
      </div>
      <div className="d-flex align-items-center mb-2">
        <FontAwesomeIcon icon={faGlobe} className="me-2" />
        <span>{location}</span>
      </div>
      {showExtended && (
        <div className="mt-2">
          <Button variant="outline-light" size="sm" onClick={() => window.open('/software-guide.pdf')}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Download Software Guide
          </Button>
        </div>
      )}
    </div>
  );
};

// Enhanced Footer component
const Footer = () => {
  const [showExtendedInfo, setShowExtendedInfo] = useState(false);
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
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex flex-wrap justify-content-center gap-2 gap-md-3">
            {[
              { to: "/policy-holder", icon: faUserShield },
              { to: "/sheets", icon: faFileContract },
              { to: "/analytics", icon: faChartLine },
              { to: "/calender", icon: faCalendarAlt },
              { to: "/notifications", icon: faBell },
            ].map((link) => (
              <NavLink key={link.to} to={link.to} className="text-decoration-none">
                <FontAwesomeIcon 
                  icon={link.icon}
                  className="text-primary hover-scale px-2 px-md-3"
                  style={{ fontSize: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }}
                />
              </NavLink>
            ))}
          </div>

          <Button 
            variant="link" 
            className="text-white"
            onClick={() => setShowExtendedInfo(!showExtendedInfo)}
          >
            <FontAwesomeIcon icon={faExpand} className="me-2" />
            {showExtendedInfo ? 'Show Less' : 'View More'}
          </Button>
        </div>

        {showExtendedInfo && (
          <div className="mt-4 text-center">
            <div className="row">
              <div className="col-md-6 mb-3">
                <h5>Contact Information</h5>
                <p>
                  <FontAwesomeIcon icon={faPhone} className="me-2" />
                  +254 740 0453555<br />
                  <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                  infowelttallis@gmail.com
                </p>
              </div>
              <div className="col-md-6">
                <h5>Software Details</h5>
                <p>Version 1.1.4 | Last Updated: 2023-08-20</p>
                <Button variant="outline-light" size="sm">
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  Download User Manual
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </footer>
  );
};

// Enhanced Protected Layout
const ProtectedLayout = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [theme, setTheme] = useState('light');
  const [logoutTimer, setLogoutTimer] = useState(4 * 60 * 60); // 4 hours in seconds
  const [showExtendSession, setShowExtendSession] = useState(false);
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  let userName = 'Live';
  if (authToken) {
    try {
      const decoded = jwt_decode.jwtDecode(authToken);
      userName = decoded.name || decoded.email || 'Live';
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }

  // Auto-logout functionality
  useEffect(() => {
    let timer = setInterval(() => {
      setLogoutTimer(prev => {
        if (prev <= 1) {
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const activityListener = () => {
      setLogoutTimer(4 * 60 * 60);
      setShowExtendSession(false);
    };

    window.addEventListener('mousemove', activityListener);
    window.addEventListener('keypress', activityListener);

    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', activityListener);
      window.removeEventListener('keypress', activityListener);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  if (!authToken || userRole !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark'}`}>
      {/* Session Timeout Modal */}
      <Modal show={logoutTimer <= 300} onHide={() => setShowExtendSession(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Session Expiring</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Your session will expire in {formatTime(logoutTimer)}</p>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="danger" onClick={handleLogout}>
              Logout Now
            </Button>
            <Button variant="primary" onClick={() => setLogoutTimer(4 * 60 * 60)}>
              Extend Session
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Navigation Bar */}
      <Navbar variant={theme} expand="lg" className="shadow-sm fixed-top py-2">
        <Container fluid className="px-3">
          <div className="d-flex justify-content-between w-100 align-items-center">
            <Navbar.Brand as={NavLink} to="/policies" className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faUserShield} className="text-primary fs-4" />
              <span className="h6 mb-0 d-none d-md-block">WELT-COVER V1</span>
            </Navbar.Brand>

            <div className="d-flex align-items-center gap-3">
              <RealTimeClock />
              <Button onClick={handleLogout} variant="danger" size="sm" className="px-3">
                <FontAwesomeIcon icon={faSignOutAlt} />
              </Button>
            </div>
          </div>
        </Container>
      </Navbar>

      {/* Mobile Menu Offcanvas */}
      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="end"
        className={theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark'}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Navigation</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column gap-2">
            {/* Navigation items */}
            <div className="mt-auto pt-4 border-top">
              <div className="d-flex align-items-center gap-3">
                <div className="profile-icon bg-primary text-white rounded-circle p-3">
                  <FontAwesomeIcon icon={faUser} size="2x" />
                </div>
                <div>
                  <h6 className="mb-0">{userName}</h6>
                  <small className="text-muted">Logged in for {formatTime(logoutTimer)}</small>
                </div>
              </div>
              <Button 
                variant="link" 
                className="text-danger mt-2"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Logout
              </Button>
            </div>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content */}
      <main className="flex-grow-1 py-4" style={{ marginTop: '70px' }}>
        <Container fluid className="px-3 px-lg-4">
          <Outlet />
        </Container>
      </main>

      <Footer />
    </div>
  );
};

// Main App Component remains the same
const App = () => {
  return (
    <Router>
      <GlobalNotifications />
      <Routes>   
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          {/* Existing routes */}

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
          <Route path="/create-health" element={<div>Health Policy Creation</div>} />
          <Route path="/create-car" element={<div>Car Policy Creation</div>} />
          <Route path="/create-user" element={<div>User Profile Creation</div>} />
          <Route path="/create-student" element={<div>Student Policy Creation</div>} />
          <Route path="/" element={<Navigate to="/policies" replace />} />

        </Route>
      </Routes>
    </Router>
  );
};



export default App;
