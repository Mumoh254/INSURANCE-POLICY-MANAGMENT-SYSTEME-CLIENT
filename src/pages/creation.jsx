import { useState } from 'react';
import { Button, Modal, Navbar, Nav, Badge } from 'react-bootstrap';
import { FaUserPlus, FaCar, FaUserGraduate, FaHeartbeat, FaUser, FaFile } from 'react-icons/fa';
import PolicyForm from './policyForm';
import UserForm from './userForm';

const CreationMenu = () => {
  // Parse counts as numbers; default to 0 if not present.
  const [counts, setCounts] = useState({
    users: Number(localStorage.getItem('dailyUsers')) || 0,
    policies: Number(localStorage.getItem('dailyPolicies')) || 0
  });
  const [showModal, setShowModal] = useState(false);
  const [creationType, setCreationType] = useState('user'); // 'user' or 'policy'
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
    <div className="p-5  rounded-4 ">
      <Navbar  className="mb-4 px-5  bg ">
        <Navbar.Brand>   <span   className='text-light' > USERS &&  POLICY  CREATION CENTRE .</span> </Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Item className="me-3 d-flex align-items-center">
            <FaUser size={38} className="me-2 text-light " />
           <span className='text-light' >Created Users Count:</span> <Badge   style={{ fontSize: "1.4rem" , margin: "4px",  padding: "10px" , color: "#fff"}}> {counts.users}</Badge>
          </Nav.Item>
          <Nav.Item className="d-flex align-items-center  ">
            <FaFile size={38} className="me-2 text-light" />
         <span className='text-light' >  Created   Policies Count: </span> <Badge  style={{ fontSize: "1.4rem" , margin: "4px",  padding: "10px"}}>{counts.policies}</Badge>
          </Nav.Item>
        </Nav>
      </Navbar>

      <div className="d-flex gap-3 flex-wrap mt-5 min-vw-100">
        {/* New User Button */}
        <Button  
          variant="outline-primary"
          onClick={() => {
            setCreationType('user');
            setShowModal(true);
          }}
          className="d-flex align-items-center gap-2 bg-primary text-white px-4"
        >
          <FaUserPlus size={100} />
          <span>New User</span>
        </Button>

        {/* Policy Type Buttons */}
        {['CAR', 'STUDENT_ATTACHMENT', 'HEALTHCARE'].map((type) => (
          <Button
            key={type}
            variant="outline-success"
            onClick={() => {
              setCreationType('policy');
              setPolicyType(type);
              setShowModal(true);
            }}
            className="d-flex align-items-center gap-5 m-2 py-5 bg-success text-white px-4"
          >
            {type === 'CAR' && <FaCar size={48} />}
            {type === 'STUDENT_ATTACHMENT' && <FaUserGraduate size={48} />}
            {type === 'HEALTHCARE' && <FaHeartbeat size={48} />}
            <span>{type.replace('_', ' ')} Policy</span>
          </Button>
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {creationType === 'user'
              ? 'New User Creation'
              : `${policyType.replace('_', ' ')} Policy Creation`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
