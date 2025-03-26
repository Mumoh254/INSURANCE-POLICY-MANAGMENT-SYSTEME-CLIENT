// App.jsx
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';

import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
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
  const [time, setTime] = React.useState(new Date());

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
      const decoded = jwt_decode(token);
      userName = decoded.name || decoded.email || 'Live';
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }
  return (
    <footer className="bg-black text-white py-4 mt-auto border-top border-secondary">
      <Container fluid className="px-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex gap-3">
            <NavLink to="/policy-holder" className="text-decoration-none">
              <FontAwesomeIcon 
                icon={faUserShield} 
                className="text-primary hover-scale px-3"
                style={{ fontSize: '1.8rem', transition: 'transform 0.2s', cursor: 'pointer' }}
              />
            </NavLink>
            <NavLink to="/sheets" className="text-decoration-none">
              <FontAwesomeIcon 
                icon={faFileContract} 
                className="text-primary hover-scale px-3"
                style={{ fontSize: '1.8rem', transition: 'transform 0.2s', cursor: 'pointer' }}
              />
            </NavLink>
            <NavLink to="/analytics" className="text-decoration-none">
              <FontAwesomeIcon 
                icon={faChartLine} 
                className="text-primary hover-scale px-3"
                style={{ fontSize: '1.8rem', transition: 'transform 0.2s', cursor: 'pointer' }}
              />
            </NavLink>
            <NavLink to="/calender" className="text-decoration-none">
              <FontAwesomeIcon 
                icon={faCalendarAlt} 
                className="text-primary hover-scale px-3"
                style={{ fontSize: '1.8rem', transition: 'transform 0.2s', cursor: 'pointer' }}
              />
            </NavLink>
            <NavLink to="/notifications" className="text-decoration-none">
              <FontAwesomeIcon 
                icon={faBell} 
                className="text-primary hover-scale px-3"
                style={{ fontSize: '1.8rem', transition: 'transform 0.2s', cursor: 'pointer' }}
              />
            </NavLink>
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
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  // Auto-logout after 5 hours (5*60*60*1000 milliseconds)
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

  const [unreadCount] = React.useState(0);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar variant="dark" expand="lg" className="shadow-sm fixed" style={{ background: "#000000" }}>
        <Container fluid className="px-2">
          <Navbar.Brand as={NavLink} to="/policies" className="d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faUserShield} className="text-primary" />
            <span className="h5 mb-0">WELT-COVER V1</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto align-items-center gap-3">
              <Nav.Link as={NavLink} to="/policies">Policies</Nav.Link>
              <Nav.Link as={NavLink} to="/sheets">Sheets</Nav.Link>
              <Nav.Link as={NavLink} to="/policy-holder">Policy-Holder</Nav.Link>
              <Nav.Link as={NavLink} to="/analytics">Analytics</Nav.Link>
              <Nav.Link as={NavLink} to="/schedule">Schedule</Nav.Link>
              <Nav.Link as={NavLink} to="/notifications">
                Notifications {unreadCount > 0 && <Badge pill bg="danger">{unreadCount}</Badge>}
              </Nav.Link>
            </Nav>
            <Nav className="align-items-center gap-4">
              <div className="text-white d-flex align-items-center gap-3">
                <span>Welcome, Admin</span>
                <RealTimeClock />
              </div>
              <Nav.Link
                onClick={handleLogout}
                className="cursor-pointer"
                style={{
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "4px",
                  padding: "0.5rem 1rem",
                  fontWeight: "bold",
                  transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c00")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "red")}
              >
                Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main className="flex-grow-1 py-4 bg-light" style={{ marginTop: '80px' }}>
        <Container fluid className="px-4">
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  );
};

// Main App with routing configuration
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
