import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Offcanvas, Button } from 'react-bootstrap';
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

// RealtimeInfo component for Offcanvas (mobile sidebar)
const RealtimeInfo = () => {
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState("Fetching location...");
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`Lat: ${pos.coords.latitude.toFixed(2)}, Lon: ${pos.coords.longitude.toFixed(2)}`);
        },
        (err) => {
          setLocation("Location unavailable");
        }
      );
    } else {
      setLocation("Geolocation not supported");
    }
  }, []);
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = date.toLocaleDateString(undefined, options);
  const formattedTime = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric' });
  return (
    <div className="realtime-info p-3 my-3 border rounded">
      <div className="d-flex align-items-center mb-2">
        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
        <span>{formattedDate}</span>
      </div>
      <div className="d-flex align-items-center mb-2">
        <FontAwesomeIcon icon={faClock} className="me-2" />
        <span>{formattedTime}</span>
      </div>
      <div className="d-flex align-items-center">
        <FontAwesomeIcon icon={faGlobe} className="me-2" />
        <span>{location}</span>
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
        {/* Security Alert */}
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
          {/* Navigation Icons */}
          <div className="d-flex flex-wrap justify-content-center gap-2 gap-md-3">
            {[
              { to: "/policy-holder", icon: faUserShield },
              { to: "/sheets", icon: faFileContract },
              { to: "/analytics", icon: faChartLine },
              { to: "/calender", icon: faCalendarAlt },
              { to: "/notifications", icon: faBell },
              { to: "/create-admin", icon: faUser },
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

          {/* Admin Status */}
          <div className="d-flex align-items-center gap-2 text-center">
            <span className="text-muted">Active Admin User:</span>
            <Badge pill bg="danger" className="fs-6 px-3 py-2" style={{ 
              backgroundColor: '#dc3545', 
              border: '1px solid #ff6b6b',
              boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)'
            }}>
              <FontAwesomeIcon icon={faUserShield} className="me-2" />
              {userName}
            </Badge>
          </div>
        </div>

        {/* Contact & Legal */}
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
              &copy; {new Date().getFullYear()} Welt-Cover V1.1.4 insure-Sys. All rights reserved.
              <span className="mx-2">|</span>
              <span className="d-block d-md-inline mt-1 mt-md-0">
                Secure Admin Portal | ISO 27001 Certified | GDPR Compliant
              </span>
            </small>
          </div>
        </div>

        {/* Continuous Monitoring */}
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
  const [unreadCount] = useState(0);
  const [theme, setTheme] = useState('dark');
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

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      navigate('/login');
    }, 5 * 60 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  if (!authToken || userRole !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Main Navigation Bar */}
      <Navbar variant="dark" expand="lg" className="shadow-sm fixed-top py-2" style={{ background: "#0a0a0a" }}>
        <Container fluid className="px-3">
          <div className="d-flex justify-content-between w-100 align-items-center">
            {/* Brand Logo */}
            <Navbar.Brand as={NavLink} to="/policies" className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faUserShield} className="text-primary fs-4" />
              <span className="h6 mb-0 d-none d-md-block">WELT-COVER V1</span>
            </Navbar.Brand>

            {/* Mobile Logout Button */}
            <div className="d-lg-none">
              <Button onClick={handleLogout} variant="danger" size="sm" className="px-3">
                Logout
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <Navbar.Collapse id="main-nav">
            <Nav className="mx-auto align-items-center gap-4">
              {[
                { to: "/policies", text: "Policies" },
                { to: "/sheets", text: "Sheets" },
                { to: "/policy-holder", text: "Policy-Holder" },
                { to: "/analytics", text: "Analytics" },
                { to: "/schedule", text: "Schedule" },
                { to: "/notifications", text: `Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
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
            
            {/* Desktop Right Side Items */}
            <Nav className="align-items-center gap-3 d-none d-lg-flex">
              <div className="text-white d-flex align-items-center gap-2">
                <RealTimeClock />
              </div>
              <Button onClick={handleLogout} variant="danger" size="lg" className="px-3">
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Floating Mobile Menu Button */}
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

      {/* Mobile Menu Offcanvas */}
  {/* Mobile Menu Offcanvas */}
<Offcanvas
  show={showMobileMenu}
  onHide={() => setShowMobileMenu(false)}
  placement="end"
  style={{
    background: theme === 'light' ? "#f4f4f4" : "#111111",
    color: theme === 'light' ? "black" : "white",
    width: '280px'
  }}
>
  <Offcanvas.Header closeButton closeVariant={theme === 'light' ? "dark" : "white"} className="pb-2">
    <Offcanvas.Title className="fs-6">Navigation Menu</Offcanvas.Title>
  </Offcanvas.Header>
  <Offcanvas.Body className="pt-2">
    <Nav className="flex-column gap-2">
      {[
        { to: "/policies", text: "Policies", icon: faUserShield },
        { to: "/sheets", text: "Sheets", icon: faFileContract },
        { to: "/policy-holder", text: "Policy-Holder", icon: faChartLine },
        { to: "/analytics", text: "Analytics", icon: faCalendarAlt },
        { to: "/schedule", text: "Schedule", icon: faBell },
        { to: "/notifications", text: "Notifications", icon: faBell },
      ].map((link) => (
        <Nav.Link
          key={link.to}
          as={NavLink}
          to={link.to}
          onClick={() => setShowMobileMenu(false)}
          className="py-2 px-3 d-flex align-items-center gap-3"
          style={{ fontSize: '0.9rem' }}
        >
          <FontAwesomeIcon icon={link.icon} className="text-primary fs-5" />
          {link.text}
        </Nav.Link>
      ))}
    </Nav>

    {/* Add dedicated Admin Management Button */}
    <div className="mt-3">
      <Button
        variant="outline-primary"
        className="w-100"
        onClick={() => {
          setShowMobileMenu(false);
          navigate('/create-admin');
        }}
      >
        Admin Management
      </Button>
    </div>

    {/* Realtime Information Section */}
    <div className="mt-3 px-3 pt-2 border-top border-secondary">
      <RealtimeInfo />
    </div>

    {/* Theme Toggle Section */}
    <div className="mt-3 px-3">
      <Button
        variant="outline-secondary"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="w-100"
      >
        {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      </Button>
    </div>

    {/* Logged In As Section */}
    <div className="mt-4 pt-2 border-top border-secondary">
      <div className="d-flex align-items-center gap-2 text-center pt-2">
        <span className="text-muted">Logged in as:</span>
        <Badge pill className="fs-8 px-3 py-2 bg-red" style={{ 
          backgroundColor: 'red', 
          border: '1px solid red',
          boxShadow: '0 2px 4px rgba(255, 0, 25)'
        }}>
          <FontAwesomeIcon icon={faUserShield} className="me-2" />
          {userName}
        </Badge>
      </div>
    </div>
  </Offcanvas.Body>
</Offcanvas>


      {/* Main Content Area */}
      <main className="flex-grow-1 py-4 bg-light" style={{ marginTop: '70px' }}>
        <Container fluid className="px-3 px-lg-4">
          <Outlet />
        </Container>
      </main>
      
      {/* Footer */}
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
          <Route path="/create-health" element={<div>Health Policy Creation</div>} />
          <Route path="/create-car" element={<div>Car Policy Creation</div>} />
          <Route path="/create-user" element={<div>User Profile Creation</div>} />
          <Route path="/create-student" element={<div>Student Policy Creation</div>} />
          <Route path="/" element={<Navigate to="/policies" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
