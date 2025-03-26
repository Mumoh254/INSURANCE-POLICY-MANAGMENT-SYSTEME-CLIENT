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
    <div className="container-fluid py-4 bg-primary-subtle rounded-4 p-5">
    {/* Enhanced Statistics Section */}
    <Row className="g-4 mb-5">
      <StatCard 
        icon={<FiPackage />}
        title="Total Policies"
        value={stats.totalPolicies}
        colorFrom="#4f46e5"
        colorTo="#6366f1"
      />
      <StatCard 
        icon={<FiDollarSign />}
        title="Total Coverage Value"
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
        icon={<FiAlertCircle />}
        title="Pending Policies"
        value={stats.pendingCount}
        colorFrom="#f59e0b"
        colorTo="#fbbf24"
      />
      <StatCard 
        icon={<FiCheckCircle />}
        title="Active Policies"
        value={stats.activeCount}
        colorFrom="#2563eb"
        colorTo="#3b82f6"
      />
    </Row>
      {/* Users List */}
      <Card className="shadow-lg border-0 mb-5">
        <Card.Header className="bg-dark text-white py-3">
          <Row className="align-items-center">
            <Col md={6}>
              <h3 className="mb-0">
                <FiUser className="me-3  text-light" />
              <span className='text-light' >  Registered Users</span>
              </h3>
            </Col>
            <Col md={6} className="text-md-end">
              <Badge pill bg="light" text="dark" className="me-2">
                {users.length} Total
              </Badge>
              <Badge pill bg="light" text="dark">
                {usersWithLocation.length} Filtered
              </Badge>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {renderUserControls()}
          <ListGroup variant="flush">
            {usersWithLocation.map(user => (
              <ListGroup.Item 
                key={user.id}
                className="py-3  user-item"
                action
                onClick={() => handleUserSelect(user)}
              >
                <Row className="align-items-center g-3">
                  <Col xs="auto">
                    <div className="avatar-circle bg">
                      <FiUser className="text-white" />
                    </div>
                  </Col>
                  <Col>
                  <div className="d-flex flex-column">
  <div className="d-flex align-items-baseline gap-2">
    <h6 className="mb-0 fw-semibold"> <span  className=' me-5' >Name </span>{user.name}</h6>
    <small className="text-muted"># Id Number{user.idNumber}</small>
  </div>
  <div className="d-flex align-items-center text-muted">
    <FaPhone className="me-2 fs-6" />
    <small > <span className='me-5' >Call</span>  {user.phone || 'No occupation listed'}</small>
  </div>
</div>
                  </Col>
                  <Col md={3} className="d-none d-md-block">
                    <div className="d-flex align-items-center text-primary">
                      <FiMapPin className="me-2" />
                      <span>{user.location}</span>
                    </div>
                  </Col>
                  <Col xs="auto">
                    <Badge pill bg="success" className="px-3">
                      {policies.filter(p => p.userId === user.id).length}
                    </Badge>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      {/* User Details Sidebar */}
      <Offcanvas
        show={showSidebar}
        onHide={() => setShowSidebar(false)}
        placement="end"
        className="user-details-sidebar"
        style={{ width: 'min(90vw, 600px)' }}
      >
        <div className="d-flex flex-column h-100">
          {/* Header */}
          <Offcanvas.Header className="bg text-light py-3">
            <div className="w-100">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar-lg bg-white me-3">
                      <FiUser className="text-primary" />
                    </div>
                    <div>
                      <h2 className="mb-0 text-light">{selectedUser?.name}</h2>
                      <small className="opacity-55">{selectedUser?.role}</small>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Badge bg="white" text="dark" className="d-flex align-items-center py-2">
                      <FiBriefcase className="me-2" />
                      {selectedUser?.companyName|| 'N/A'}
                    </Badge>
                    <Badge bg="white" text="dark" className="d-flex align-items-center py-2">
                      <FiMapPin className="me-2" />
                      {selectedUser?.city} , 
                     <span className='py-1 me-2' >   { selectedUser?.state}</span>
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="link" 
                  onClick={() => setShowSidebar(false)}
                  className="p-0 text-white"
                >
                  <FiX size={24} />
                </Button>
              </div>
            </div>
          </Offcanvas.Header>

          {/* Scrollable Content */}
          <Offcanvas.Body className="p-4 h-100 overflow-auto">
            {/* User Information */}
            <section className="mb-5 bg  p-4">
              <h5 className="text-dark mb-4 fw-semibold">
                <FiFileText className="me-2 text-light" />
              <span className='text-light' >  Personal Information</span>
              </h5>
              <Row className="g-4 fw-bold fs-6">
                <Col md={6}>
                  <InfoCard 
                    icon={<FiCalendar />}
                    title="Our Member Since !"
                    value={selectedUser?.createdAt && 
                      new Date(selectedUser.createdAt).toLocaleDateString()}
                  />
                </Col>
                <Col md={6}>
  <InfoCard 
    icon={<FiShield className="text-success" />} 
    title="Account Status" 
    value={<span className="text-success fw-bold">Verified</span>}
  />
</Col>

              </Row>
            </section>

            {/* Company Information */}
            <section className="mb-5">
              <h5 className="text-dark mb-4 fw-semibold">
                <FiBriefcase className="me-2" />
                Company Details
              </h5>
              <Row className="g-3">
                <Col md={6}>
                  <InfoCard 
                    icon={<FiHome />}
                    title="Company Name"
                    value={selectedUser?.companyName || 'N/A'}
                  />
                </Col>
                <Col md={6}>
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
              <h5 className="text-dark mb-4 fw-semibold">
                <FiShield className="me-2" />
                Associated Policies
              </h5>
              
              {selectedUser && policies
                .filter(policy => policy.userId === selectedUser.id)
                .map(policy => (
                  <Card key={policy.id} className="mb-3 shadow-sm policy-card">
                    <Card.Body>
                      <div className="policy-status-indicator" 
                        style={{ backgroundColor: getStatusColor(policy) }}
                      />
                      
                      <Row className="g-3 align-items-center">
                        <Col>
                          <div className="d-flex align-items-center">
                            <h6 className="mb-0 fw-semibold me-3">
                              {policy.policyName}
                            </h6>
                            <Badge pill bg="light" text="dark">
                              #{policy.policyNumber}
                            </Badge>
                          </div>
                          <div className="text-muted small mt-2">
                            <div className="d-flex align-items-center me-3">
                              <FiCalendar className="me-1" />
                              {new Date(policy.startDate).toLocaleDateString()}
                            </div>
                            <div className="d-flex align-items-center">
                              <FiDollarSign className="me-1" />
                              {new Intl.NumberFormat('en-KE', {
                                style: 'currency',
                                currency: 'KES'
                              }).format(policy.amount)}
                            </div>
                          </div>
                        </Col>
                        <Col xs="auto">
                          <div className="d-flex flex-column gap-2">
                            {getStatusBadge(policy)}
                            <div className="d-flex gap-2">
                              <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleDeletePolicy(policy.id)}
                              >
                                Delete
                              </Button>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => handleViewPolicy(policy.id)}
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
                <div className="text-center py-4 text-muted">
                  <FiAlertCircle className="me-2" />
                  No policies found for this user
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
        }
        
        .avatar-lg {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .user-item:hover {
          background-color: #f8f9fa;
          transform: translateX(5px);
          transition: all 0.2s ease;
        }
        
        .policy-card {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease;
        }
        
        .policy-card:hover {
          transform: translateY(-3px);
        }
        
        .policy-status-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
        }
        
        .bg-gradient-primary {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
        }
        
        .alphabet-filter {
          min-width: 36px;
          padding: 0.25rem 0.5rem;
        }
        
        .search-input {
          border-radius: 8px;
          overflow: hidden;
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