import { useState } from 'react';
import { Button, Modal, Navbar, Container, Nav, Badge } from 'react-bootstrap';
import { FaUserPlus, FaCar, FaUserGraduate, FaHeartbeat, FaUser, FaFile } from 'react-icons/fa';
import PolicyForm from './policyForm';
import UserForm from './userForm';

const CreationMenu = () => {
  const [counts, setCounts] = useState({
    users: Number(localStorage.getItem('dailyUsers')) || 0,
    policies: Number(localStorage.getItem('dailyPolicies')) || 0
  });
  const [showModal, setShowModal] = useState(false);
  const [creationType, setCreationType] = useState('user');
  const [policyType, setPolicyType] = useState('CAR');

  const handleUserSuccess = () => {
    const newCount = counts.users + 1;
    localStorage.setItem('dailyUsers', newCount);
    setCounts(prev => ({ ...prev, users: newCount }));
    setShowModal(false);
  };

  const handlePolicySuccess = () => {
    const newCount = counts.policies + 1;
    localStorage.setItem('dailyPolicies', newCount);
    setCounts(prev => ({ ...prev, policies: newCount }));
    setShowModal(false);
  };

  return (
    <div className="p-3 p-md-5 rounded-4">
   <Navbar className="mb-4 p-2 p-md-4 bg">
      <Container>
        <div className="d-flex flex-column creation-navbar">
          {/* Heading Row */}
          <div className="w-100">
            <Navbar.Brand className="text-light creation-heading text-start  ">
             <span className='fs-5' > USERS & POLICY CREATION CENTER</span>
            </Navbar.Brand>
          </div>
          {/* Icons Row */}
          <div className="d-flex flex-row justify-content-center mt-2 creation-icons">
            <Nav.Item className="d-flex align-items-center me-3">
              <FaUser className="me-1 text-light creation-icon" />
              <span className="text-light me-1">Users:</span>
              <Badge pill className="fs-6 px-2 py-1 bg-primary">
                {counts.users}
              </Badge>
            </Nav.Item>
            <Nav.Item className="d-flex align-items-center">
              <FaFile className="me-1 text-light creation-icon" />
              <span className="text-light me-1">Policies:</span>
              <Badge pill className="fs-6 px-2 py-1 bg-success">
                {counts.policies}
              </Badge>
            </Nav.Item>
          </div>
        </div>
      </Container>
   
    </Navbar>

      <div className="row g-3 mt-md-5">
        {/* New User Button */}
        <div className="col-12 col-md-6 col-xl-3">
          <Button
            variant="primary"
            onClick={() => {
              setCreationType('user');
              setShowModal(true);
            }}
            className="w-100 h-100 d-flex flex-column flex-md-row align-items-center justify-content-center p-3"
          >
            <FaUserPlus className="mb-2 mb-md-0 me-md-3 fs-1" />
            <span className="fs-5 fs-md-6 text-center">New User</span>
          </Button>
        </div>

        {/* Policy Type Buttons */}
        {['CAR', 'STUDENT_ATTACHMENT', 'HEALTHCARE'].map((type) => (
          <div key={type} className="col-12 col-md-6 col-xl-3">
            <Button
              variant="success"
              onClick={() => {
                setCreationType('policy');
                setPolicyType(type);
                setShowModal(true);
              }}
              className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
            >
              <div className="mb-2">
                {type === 'CAR' && <FaCar className="fs-1" />}
                {type === 'STUDENT_ATTACHMENT' && <FaUserGraduate className="fs-1" />}
                {type === 'HEALTHCARE' && <FaHeartbeat className="fs-1" />}
              </div>
              <span className="fs-5 fs-md-6 text-center">
                {type.replace('_', ' ')} Policy
              </span>
            </Button>
          </div>
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title className="fs-5 fs-md-4">
            {creationType === 'user'
              ? 'New User Creation'
              : `${policyType.replace('_', ' ')} Policy Creation`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3 p-md-4">
          {creationType === 'user' ? (
            <UserForm 
              onSuccess={handleUserSuccess}
              onHide={() => setShowModal(false)}
            />
          ) : (
            <PolicyForm 
              initialPolicyType={policyType}
              onSuccess={handlePolicySuccess}
              onHide={() => setShowModal(false)}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CreationMenu;