// App.jsx
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
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
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

// Footer component
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
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex flex-wrap justify-content-center gap-2 gap-md-3">
            {[
              { to: "/policy-holder", icon: faUserShield },
              { to: "/sheets", icon: faFileContract },
              { to: "/analytics", icon: faChartLine },
              { to: "/calender", icon: faCalendarAlt },
              { to: "/notifications", icon: faBell },
            ].map((link) => (
              <NavLink 
                key={link.to}
                to={link.to} 
                className="text-decoration-none"
              >
                <FontAwesomeIcon 
                  icon={link.icon}
                  className="text-primary hover-scale px-2 px-md-3"
                  style={{ 
                    fontSize: '1.5rem', 
                    transition: 'transform 0.2s', 
                    cursor: 'pointer' 
                  }}
                />
              </NavLink>
            ))}
          </div>
          <div className="d-flex align-items-center gap-2 text-center">
            <span className="text-muted">Active Admin User:</span>
            <Badge pill bg="primary" className="fs-6 px-3 py-2">
              <FontAwesomeIcon icon={faUserShield} className="me-2" />
              {userName}
            </Badge>
          </div>
        </div>
        <div className="text-center mt-3 text-secondary">
          <small>
            &copy; {new Date().getFullYear()} Welt-Cover V1.1.4 insure-Sys. All rights reserved.
            <span className="mx-2">|</span>
            Secure Admin Portal | System Scan Approved |
          </small>
        </div>
      </Container>
    </footer>
  );
};

// Protected Layout using Outlet to render nested routes
const ProtectedLayout = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount] = useState(0);
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

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
      <Navbar 
        variant="dark" 
        expand="lg" 
        className="shadow-sm fixed-top py-2" 
        style={{ background: "#0a0a0a" }}
      >
        <Container fluid className="px-3">
          <div className="d-flex justify-content-between w-100 align-items-center">
            {/* Brand Logo */}
            <Navbar.Brand as={NavLink} to="/policies" className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faUserShield} className="text-primary fs-4" />
              <span className="h6 mb-0 d-none d-md-block">WELT-COVER V1</span>
            </Navbar.Brand>

            {/* Mobile Logout Button */}
            <div className="d-lg-none">
              <Button
                onClick={handleLogout}
                variant="danger"
                size="sm"
                className="bg-red px-3"
              >
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
                { 
                  to: "/notifications", 
                  text: `Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}` 
                },
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
                <span className="small">Admin Online</span>
                <RealTimeClock />
              </div>
              <Button
                onClick={handleLogout}
                variant="danger"
                size="lg"
                className="px-3  bg-red"
              >
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
          className="shadow-lg bg-red"
          style={{ 
            width: '55px', 
            height: '55px',
            position: 'fixed',
            bottom: '20px',
            right: '20px'
          }}
        >
          ☰
        </Button>
      </div>

      {/* Mobile Menu Offcanvas */}
      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="end"
        style={{ 
          background: "#111111",
          color: "white",
          width: '280px' 
        }}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="pb-2">
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
            <div className="mt-3 px-3 pt-2 border-top border-secondary">
              <RealTimeClock />
            </div>
          </Nav>
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
          <Route path="/" element={<Navigate to="/policies" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;