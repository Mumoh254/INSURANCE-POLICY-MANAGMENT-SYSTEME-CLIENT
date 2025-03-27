import React, { useState, useEffect } from 'react';
import { 
  Card, Spinner, Badge, Row, Col, Button, ListGroup, Offcanvas, Form, InputGroup 
} from 'react-bootstrap';
import { 
  FiDollarSign, FiPackage, FiAlertCircle, FiCalendar, FiBriefcase, 
  FiCheckCircle, FiUser, FiX, FiMapPin, FiSearch, FiFileText, FiHome, 
  FiActivity, FiShield, FiUserCheck, FiGlobe 
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FaPhone } from 'react-icons/fa';

const dummyLocations = [
  'Nairobi, Kenya', 'Mombasa, Kenya', 'Kisumu, Kenya', 
  'Nakuru, Kenya', 'Eldoret, Kenya', 'Thika, Kenya'
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const PolicyList = () => {
  const [policies, setPolicies] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [policiesRes, usersRes] = await Promise.all([
        fetch('https://insurance-v1-api.onrender.com/api/insurance/all-policies'),
        fetch('https://insurance-v1-api.onrender.com/api/insurance/users')
      ]);
      
      if (!policiesRes.ok || !usersRes.ok) throw new Error('Data fetch failed');
      
      const policiesData = await policiesRes.json();
      const usersData = await usersRes.json();
      
      setPolicies(policiesData.data || []);
      setUsers(usersData.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const usersWithLocation = users
    .map(user => ({
      ...user,
      location: user.city || dummyLocations[Math.floor(Math.random() * dummyLocations.length)]
    }))
    .filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.idNumber && user.idNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  const stats = policies.reduce((acc, policy) => {
    acc.totalPolicies++;
    acc.totalAmount += policy.amount || 0;
    const status = policy.status?.toUpperCase() || '';
    acc.pendingCount += status === 'PENDING' ? 1 : 0;
    acc.activeCount += status === 'ACTIVE' ? 1 : 0;
    acc.expiredCount += status === 'UPCOMING' ? 1 : 0;
    return acc;
  }, {
    totalPolicies: 0,
    totalAmount: 0,
    pendingCount: 0,
    activeCount: 0,
    expiredCount: 0,
    userCount: users.length
  });

  const getStatusBadge = (policy) => {
    const now = new Date();
    const start = new Date(policy.startDate);
    const end = new Date(policy.endDate);
    
    if (now < start) return <Badge bg="warning" className="text-dark">UPCOMING</Badge>;
    if (now > end) return <Badge bg="danger">EXPIRED</Badge>;
    return <Badge bg="success">ACTIVE</Badge>;
  };

  const getStatusColor = (policy) => {
    const now = new Date();
    const start = new Date(policy.startDate);
    const end = new Date(policy.endDate);
    
    if (now < start) return '#f59e0b';
    if (now > end) return '#dc2626';
    return '#16a34a';
  };

  const handleDeletePolicy = async (policyId) => {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-secondary'
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`https://insurance-v1-api.onrender.com/api/insurance/${policyId}`, { 
          method: 'DELETE' 
        });
        
        if (!res.ok) throw new Error('Delete failed');
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Policy removed successfully',
          icon: 'success',
          timer: 1500
        });
        
        fetchData();
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  const handleViewPolicy = (policyId) => {
    navigate(`/policies/${policyId}`);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowSidebar(true);
  };

  const renderUserControls = () => (
    <div className="mb-4">
      <Row className="g-2 align-items-center">
        <Col md={8}>
          <InputGroup className="search-input">
            <InputGroup.Text className="bg-light border-end-0">
              <FiSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-start-0"
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="form-select-sm shadow-sm"
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </Form.Select>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <div className="d-flex flex-wrap gap-2">
            {alphabet.map(letter => (
              <Button 
                key={letter} 
                variant="outline-primary" 
                size="sm" 
                onClick={() => setSearchQuery(letter)}
                className="alphabet-filter"
              >
                {letter}
              </Button>
            ))}
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={() => setSearchQuery("")}
              className="clear-filter"
            >
              Clear
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (error) return (
    <div className="d-flex justify-content-center align-items-center vh-100 text-danger">
      <FiAlertCircle className="me-2" />
      Error: {error}
    </div>
  );

  return (
    <div className="container-fluid py-4 rounded-4 p-5">
    {/* Enhanced Statistics Section */}
    <Row className="g-3 g-md-4 mb-4 mb-md-5">
        <StatCard 
          icon={<FiPackage className="text-white" />}
          title="Total Policies"
          value={stats.totalPolicies}
          colorFrom="#4f46e5"
          colorTo="#6366f1"
        />
        <StatCard 
          icon={<FiDollarSign className="text-white" />}
          title="Total Coverage"
          value={new Intl.NumberFormat('en-KE', { 
            style: 'currency', 
            currency: 'KES',
            notation: stats.totalAmount > 1e6 ? 'compact' : 'standard',
            maximumFractionDigits: 1
          }).format(stats.totalAmount)}
          colorFrom="#10b981"
          colorTo="#34d399"
        />
        <StatCard 
          icon={<FiAlertCircle className="text-white" />}
          title="Pending Policies"
          value={stats.pendingCount}
          colorFrom="#f59e0b"
          colorTo="#fbbf24"
        />
        <StatCard 
          icon={<FiCheckCircle className="text-white" />}
          title="Active Policies"
          value={stats.activeCount}
          colorFrom="#2563eb"
          colorTo="#3b82f6"
        />
      </Row>
      {/* Users List */}
      <Card className="shadow-sm border-0 mb-4">
          <Card.Header className="bg-dark text-white py-2 py-md-3">
            <Row className="align-items-center">
              <Col xs={8} md={6}>
                <h3 className="h5 h4-md mb-0">
                  <FiUser className="me-2 text-light" />
                  <span className="text-light">Registered Users</span>
                </h3>
              </Col>
              <Col xs={4} md={6} className="text-end">
                <div className="d-flex flex-column flex-md-row gap-2 justify-content-end">
                  <Badge pill bg="light" text="dark" className="me-md-2">
                    {users.length} Total
                  </Badge>
                  <Badge pill bg="light" text="dark">
                    {usersWithLocation.length} Filtered
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-2 p-md-3">
            {renderUserControls()}
            <ListGroup variant="flush">
              {usersWithLocation.map(user => (
                <ListGroup.Item 
                  key={user.id}
                  className="py-3 user-item"
                  action
                  onClick={() => handleUserSelect(user)}
                >
                  <Row className="align-items-center g-2">
                    <Col xs="auto">
                      <div className="avatar-circle bg-primary">
                        <FiUser className="text-white" size={18} />
                      </div>
                    </Col>
                    <Col>
                      <div className="d-flex flex-column">
                        <div className="d-flex flex-column flex-md-row align-items-baseline gap-1 gap-md-2">
                          <h6 className="mb-0 fw-semibold">{user.name}</h6>
                          <small className="text-muted">#{user.idNumber}</small>
                        </div>
                        <div className="d-flex align-items-center text-muted">
                          <FaPhone className="me-1 fs-6" />
                          <small>{user.phone || 'No phone listed'}</small>
                        </div>
                      </div>
                    </Col>
                    <Col xs="auto" className="d-none d-md-block">
                      <div className="d-flex align-items-center text-primary">
                        <FiMapPin className="me-1" />
                        <small>{user.location}</small>
                      </div>
                    </Col>
                    <Col xs="auto">
                      <Badge pill bg="success" className="px-2">
                        {policies.filter(p => p.userId === user.id).length}
                      </Badge>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
  
        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          placement="end"
          className="user-details-sidebar"
          style={{ width: '90%', maxWidth: '600px' }}
        >
          <div className="d-flex flex-column h-100">
            <Offcanvas.Header className="bg-dark text-light py-3 border-bottom border-secondary">
              <div className="w-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center">
                    <div className="avatar-lg bg-white me-2 p-3 rounded-circle">
                      <FiUser className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="h5 mb-0 text-light">{selectedUser?.name}</h3>
                      <small className="opacity-75">{selectedUser?.role}</small>
                    </div>
                  </div>
                  <Button 
                    variant="link" 
                    onClick={() => setShowSidebar(false)}
                    className="p-0 text-white opacity-75 hover-opacity-100"
                  >
                    <FiX size={24} />
                  </Button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <Badge bg="light" text="dark" className="d-flex align-items-center py-2 px-3">
                    <FiBriefcase className="me-2" />
                    <small>{selectedUser?.companyName|| 'N/A'}</small>
                  </Badge>
                  <Badge bg="light" text="dark" className="d-flex align-items-center py-2 px-3">
                    <FiMapPin className="me-2" />
                    <small>{selectedUser?.city}, {selectedUser?.state}</small>
                  </Badge>
                </div>
              </div>
            </Offcanvas.Header>

          <Offcanvas.Body className="p-3 h-100 overflow-auto">
            {/* Personal Information */}
            <section className="mb-4">
              <h5 className="text-dark mb-3 fw-semibold d-flex align-items-center">
                <FiFileText className="me-2 text-primary" size={20} />
                Personal Info
              </h5>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <InfoCard 
                    icon={<FiCalendar className="text-success" size={18} />}
                    title="Member Since"
                    value={selectedUser?.createdAt && 
                      new Date(selectedUser.createdAt).toLocaleDateString()}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <InfoCard 
                    icon={<FiUserCheck className="text-info" size={18} />}
                    title="Verification Status"
                    value={<span className="text-success">Verified</span>}
                  />
                </Col>
              </Row>
            </section>

            {/* Company Information */}
            <section className="mb-4">
              <h5 className="text-dark mb-3 fw-semibold">
                <FiBriefcase className="me-2" />
                Company Details
              </h5>
              <Row className="g-2">
                <Col xs={12} md={6}>
                  <InfoCard 
                    icon={<FiHome />}
                    title="Company"
                    value={selectedUser?.companyName || 'N/A'}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <InfoCard 
                    icon={<FiActivity />}
                    title="Industry"
                    value={selectedUser?.businessType || 'N/A'}
                  />
                </Col>
              </Row>
            </section>

            {/* Policies Section */}
            <section>
              <h5 className="text-dark mb-3 fw-semibold">
                <FiShield className="me-2" />
                Policies
              </h5>
              
              {selectedUser && policies
                .filter(policy => policy.userId === selectedUser.id)
                .map(policy => (
                  <Card key={policy.id} className="mb-2 shadow-sm">
                    <Card.Body className="p-2">
                      <div className="policy-status-indicator" 
                        style={{ backgroundColor: getStatusColor(policy) }}
                      />
                      <Row className="g-2 align-items-center">
                        <Col xs={8}>
                          <div className="d-flex flex-column">
                            <div className="d-flex align-items-center">
                              <h6 className="mb-0 fw-semibold me-2">
                                {policy.policyName}
                              </h6>
                              <Badge pill bg="light" text="dark">
                                #{policy.policyNumber}
                              </Badge>
                            </div>
                            <div className="text-muted small">
                              <div className="d-flex align-items-center">
                                <FiCalendar className="me-1" />
                                {new Date(policy.startDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col xs={4} className="text-end">
                          <div className="d-flex flex-column gap-1">
                            {getStatusBadge(policy)}
                            <div className="d-flex gap-1 justify-content-end">
                              <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleDeletePolicy(policy.id)}
                                className="py-0 px-2"
                              >
                                Delete
                              </Button>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => handleViewPolicy(policy.id)}
                                className="py-0 px-2"
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}

              {selectedUser && policies.filter(p => p.userId === selectedUser.id).length === 0 && (
                <div className="text-center py-3 text-muted small">
                  <FiAlertCircle className="me-1" />
                  No policies found
                </div>
              )}
            </section>
          </Offcanvas.Body>
        </div>
      </Offcanvas>


      <style jsx>{`
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .avatar-lg {
          width: 70px;
          height: 70px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .user-item:hover {
          background-color: #f8f9fa;
          transform: translateX(3px);
          transition: all 0.2s ease;
        }
        
        .policy-status-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: 2px;
        }
        
        @media (max-width: 768px) {
          .container-fluid {
            padding: 1rem !important;
          }
          
          .user-details-sidebar {
            width: 90% !important;
            max-width: 90% !important;
          }
          
          .stat-card {
            margin-bottom: 1rem;
          }
          
          .user-item {
            padding: 1rem;
          }
          
          .avatar-lg {
            width: 50px;
            height: 50px;
          }
        }
        
        @media (min-width: 769px) {
          .user-details-sidebar {
            width: 600px !important;
          }
        }
        
        .info-card {
          transition: transform 0.2s ease;
        }
        
        .info-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

// StatCard Component
const StatCard = ({ icon, title, value, colorFrom, colorTo }) => (
  <Col xs={12} sm={6} xl={3} className="mb-3 mb-xl-0">
    <Card 
      className="shadow-lg border-0 h-100 stat-card"
      style={{
        background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
        color: 'white',
        minWidth: '240px'
      }}
    >
      <Card.Body className="p-3 d-flex align-items-center">
        <div className="icon-container bg-white bg-opacity-20 p-3 rounded me-3">
          {React.cloneElement(icon, { size: 24, className: 'text-white' })}
        </div>
        <div className="flex-grow-1">
          <div className="h6 mb-1 text-truncate" title={title}>{title}</div>
          <div className="d-flex align-items-baseline">
            <h3 
              className="mb-0 fw-bold text-nowrap"
              style={{
                fontSize: typeof value === 'number' ? '1.75rem' : '1.4rem',
                letterSpacing: '-0.5px'
              }}
            >
              {typeof value === 'number' ? 
                value.toLocaleString() : 
                value.startsWith('KES') ?
                value.replace('KES', 'KSh') : value
              }
            </h3>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>
);

// InfoCard Component
const InfoCard = ({ icon, title, value }) => (
  <Card className="shadow-sm border-0 h-100">
    <Card.Body className="p-3">
      <div className="d-flex align-items-center">
        <div className="icon-container bg-light p-2 rounded me-3">
          {React.cloneElement(icon, { className: 'text-primary' })}
        </div>
        <div>
          <div className="text-muted small">{title}</div>
          <div className="h6 mb-0">{value || 'N/A'}</div>
        </div>
      </div>
    </Card.Body>
  </Card>
);

export default PolicyList;