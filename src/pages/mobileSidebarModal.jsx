// src/components/Modals.jsx
import React from 'react';
import { Button, Modal } from 'react-bootstrap';

export const UserPolicyModal = ({ onSuccess, onHide }) => {
  return (
    <Modal show onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>User Creation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Your User Creation form components go here */}
        <p>User Creation Form Content</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={onSuccess}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export const StudentPolicyModal = ({ onSuccess, onHide }) => {
  return (
    <Modal show onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Student Policy Creation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Your Student Policy form components go here */}
        <p>Student Policy Form Content</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={onSuccess}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export const HealthPolicyModal = ({ onSuccess, onHide }) => {
  return (
    <Modal show onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Health Policy Creation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Your Health Policy form components go here */}
        <p>Health Policy Form Content</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={onSuccess}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export const CarPolicyModal = ({ onSuccess, onHide }) => {
  return (
    <Modal show onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Car Policy Creation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Your Car Policy form components go here */}
        <p>Car Policy Form Content</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={onSuccess}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};
