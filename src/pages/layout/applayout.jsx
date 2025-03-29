import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Offcanvas, Button, Dropdown } from 'react-bootstrap';
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
  faDownload,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import * as jwtDecodeImport from 'jwt-decode';
import Cookies from 'js-cookie';

// Import your pages/components
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

// Helper to decode JWT (handles default export issues)
const jwt_decode = (token) =>
  jwtDecodeImport.default ? jwtDecodeImport.default(token) : jwtDecodeImport(token);

// A simple real-time clock component (for display)
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

// RealtimeInfo for extra information (used on mobile sidebar)
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

// Extended Sidebar for mobile extra info (includes contact details, version, etc.)
const ExtendedSidebar = ({ show, handleClose, userName, extendSession }) => {
  return (
    <Offcanvas 
      show={show} 
      onHide={handleClose} 
      placement="end" 
      className="modern-sidebar"
      style={{ maxWidth: '300px' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Contact & Extra Info</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="contact-info mb-4">
          <h5>
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />System Information
          </h5>
          <div className="mb-3">
            <FontAwesomeIcon icon={faEnvelope} className="me-2" />
            <strong>Email:</strong> infowelttallis@gmail.com
          </div>
          <div className="mb-3">
            <FontAwesomeIcon icon={faPhone} className="me-2" />
            <strong>Phone:</strong> +254 740 045355
          </div>
          <div className="mb-3">
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            <strong>Version:</strong> 1.1.4
          </div>
        </div>

        <RealtimeInfo />

        <div className="mt-3">
          <Button variant="outline-secondary" onClick={extendSession} className="w-100">
            Extend Session
          </Button>
        </div>

        <div className="mt-4 pt-2 border-top">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">Logged in as:</span>
            <Badge pill bg="danger" className="fs-8">
              <FontAwesomeIcon icon={faUserShield} className="me-2" />
              {userName}
            </Badge>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

// Desktop Dropdown for "More Info" (shows user details, login time, session countdown, extend button)
const UserInfoDropdown = ({ userName, loginTime, timeRemaining, extendSession }) => {
  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="secondary" id="dropdown-userinfo">
        More Info
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.ItemText>
          <div>
            <strong>Logged in as:</strong> {userName}
          </div>
          <div>
            <strong>Login Time:</strong> {loginTime.toLocaleTimeString()}
          </div>
          <div>
            <strong>Session Ends In:</strong> {formatTime(timeRemaining)}
          </div>
        </Dropdown.ItemText>
        <Dropdown.Divider />
        <Dropdown.Item onClick={extendSession}>Extend Session</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

// Main Protected Layout Component
const ProtectedLayout = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showExtendedSidebar, setShowExtendedSidebar] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [sessionExpiryTime, setSessionExpiryTime] = useState(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
  const [timeRemaining, setTimeRemaining] = useState(4 * 60 * 60); // in seconds
  const [loginTime] = useState(new Date());
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  let userName = 'Live';
  if (authToken) {
    try {
      const decoded = jwt_decode(authToken);
      userName = decoded.name || decoded.email || 'Live';
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }

  // Extend session by resetting expiry time to 4 hours from now
  const extendSession = () => {
    const newExpiry = Date.now() + 4 * 60 * 60 * 1000;
    setSessionExpiryTime(newExpiry);
  };

  // Update remaining session time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.max(0, Math.floor((sessionExpiryTime - Date.now()) / 1000));
      setTimeRemaining(seconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionExpiryTime]);

  // Auto-logout when session expires
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      navigate('/login');
    }, sessionExpiryTime - Date.now());
    return () => clearTimeout(timer);
  }, [sessionExpiryTime, navigate]);

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
      {/* Main Navbar (Desktop) */}
      <Navbar variant="dark" expand="lg" className="shadow-sm fixed-top py-2" style={{ background: "#0a0a0a" }}>
        <Container fluid className="px-3">
          <div className="d-flex justify-content-between w-100 align-items-center">
            {/* Brand Logo */}
            <Navbar.Brand as={NavLink} to="/policies" className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faUserShield} className="text-primary fs-4" />
              <span className="h6 mb-0 d-none d-md-block">WELT-COVER V1</span>
            </Navbar.Brand>

            {/* Desktop Navigation */}
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

              {/* Right side items */}
              <Nav className="align-items-center gap-3 d-none d-lg-flex">
                <div className="text-white d-flex align-items-center gap-2">
                  <RealTimeClock />
                </div>
                <UserInfoDropdown 
                  userName={userName} 
                  loginTime={loginTime} 
                  timeRemaining={timeRemaining} 
                  extendSession={extendSession} 
                />
                <Button onClick={handleLogout} variant="danger" size="lg" className="px-3">
                  Logout
                </Button>
              </Nav>
            </Navbar.Collapse>
          </div>
        </Container>
      </Navbar>

      {/* Floating Mobile Menu Button */}
      <div className="d-lg-none fixed-bottom pe-3 pb-3" style={{ zIndex: 1000 }}>
        <Button
          onClick={() => setShowMobileMenu(true)}
          variant="primary"
          size="lg"
          className="shadow-lg"
          style={{ width: '55px', height: '55px' }}
        >
          ☰
        </Button>
      </div>

      {/* Mobile Offcanvas Navigation */}
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
        <Offcanvas.Header closeButton closeVariant={theme === 'light' ? "dark" : "white"}>
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

          {/* Extra info in mobile sidebar */}
          <div className="mt-3 px-3 pt-2 border-top border-secondary">
            <RealtimeInfo />
          </div>

          <div className="mt-3 px-3">
            <Button
              variant="outline-secondary"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="w-100"
            >
              {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            </Button>
          </div>

          <div className="mt-4 pt-2 border-top border-secondary">
            <div className="d-flex align-items-center gap-2 text-center pt-2">
              <span className="text-muted">Logged in as:</span>
              <Badge pill className="fs-8 px-3 py-2 bg-danger">
                <FontAwesomeIcon icon={faUserShield} className="me-2" />
                {userName}
              </Badge>
            </div>
            <div className="mt-2">
              <Button variant="outline-secondary" onClick={extendSession} className="w-100">
                Extend Session
              </Button>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Extended Sidebar for mobile (Extra contact/info) */}
      <ExtendedSidebar 
        show={showExtendedSidebar} 
        handleClose={() => setShowExtendedSidebar(false)} 
        userName={userName}
        extendSession={extendSession}
      />

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

// Main App Component with Routes
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
