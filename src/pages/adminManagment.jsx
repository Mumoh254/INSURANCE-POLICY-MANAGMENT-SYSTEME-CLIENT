import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Alert, Modal, Form, InputGroup, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { format, formatDistanceToNow } from 'date-fns';
import { FiDollarSign, FiPackage, FiAlertCircle, FiCalendar, FiBriefcase, FiCheckCircle, FiClock, FiUser, FiX, FiMapPin } from 'react-icons/fi';
import { FaTrash, FaUser } from 'react-icons/fa';
import Cookies from 'js-cookie';
import * as jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://insurance-v1-api.onrender.com/api/insurance';

const AdminManagement = () => {
  const [state, setState] = useState({
    admins: [],
    loading: true,
    error: null,
    showCreateModal: false,
    submitting: false,
    totalAdmins: 0,
    activeSessions: 0,
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    idNumber: '',
    kraPin: '',
    occupation: ''
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);

  const navigate = useNavigate();

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 576);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch admins on mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();

      // Filter only admin users
      const admins = data.users.filter(user => user.role?.toLowerCase() === 'admin');
      console.log("Filtered admins:", admins);

      const active = admins.filter(a => a.isActive === true).length;
      console.log("Active admins count:", active);

      setState(prev => ({
        ...prev,
        admins: admins.map(admin => ({
          ...admin,
          lastActivity: admin.lastActivity ? new Date(admin.lastActivity) : null,
          lastLogin: admin.lastLogin ? new Date(admin.lastLogin) : null
        })),
        totalAdmins: admins.length,
        activeSessions: active,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      setState(prev => ({ ...prev, submitting: true }));
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'ADMIN' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create admin');
      }

      await fetchAdmins();
      setState(prev => ({ 
        ...prev, 
        showCreateModal: false,
        submitting: false 
      }));
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        address: '',
        idNumber: '',
        kraPin: '',
        occupation: ''
      });
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'SUCCESS!',
        html: `<small>Admin created successfully ✅</small>`,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
      setState(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    Swal.fire({
      title: 'Delete Admin Account?',
      html: `<div class="text-start">
             <strong class="text-center">Warning:</strong><br>
             This action will permanently delete:
             <ul>
               <li>The admin account</li>
               <li>All associated policies</li>
               <li>All related data</li>
             </ul>
             This action cannot be undone!
           </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Confirm Admin Delete',
      cancelButtonText: 'Cancel',
      focusCancel: true,
      customClass: { htmlContainer: 'text-start' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${API_URL}/users/${adminId}?deletePolicies=true`, {
            method: 'DELETE'
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete admin');
          }
          setState(prev => ({
            ...prev,
            admins: prev.admins.filter(admin => admin.id !== adminId),
            totalAdmins: prev.totalAdmins - 1
          }));
          Swal.fire('Deleted!', 'Admin and related policies removed successfully', 'success');
        } catch (error) {
          Swal.fire('Error', error.message, 'error');
        }
      }
    });
  };

  const handleResetPassword = async (adminId) => {
    const { value: formValues } = await Swal.fire({
      title: 'Reset Password',
      html:
        '<input id="currentPassword" class="swal2-input" placeholder="Current Password" type="password">' +
        '<input id="newPassword" class="swal2-input" placeholder="New Password (min 8 characters)" type="password">',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => ({
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value
      }),
      inputValidator: (values) => {
        if (!values.currentPassword) return 'Current password is required!';
        if (!values.newPassword) return 'New password is required!';
        if (values.newPassword.length < 8) return 'Password must be at least 8 characters!';
        if (values.currentPassword === values.newPassword) return 'New password must be different!';
      }
    });

    if (formValues) {
      try {
        const response = await fetch(`${API_URL}/users/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: adminId,
            currentPassword: formValues.currentPassword,
            newPassword: formValues.newPassword
          })
        });
        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.message || 'Password reset failed');
        Swal.fire('Success!', 'Password reset successfully!', 'success');
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  // Render table headers based on screen width
  const renderTableHeader = () => {
    if (isMobile) {
      return (
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      );
    }
    return (
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Last Login</th>
        <th>Last Activity</th>
        <th>Actions</th>
      </tr>
    );
  };

  // Render table rows based on screen width
  const renderTableRow = (admin) => {
    if (isMobile) {
      return (
        <tr key={admin.id}>
          <td>{admin.name}</td>
          <td>{admin.email}</td>
          <td>
            <Badge bg="info" pill>{admin.role}</Badge>
            <div className="d-flex gap-2 mt-1">
              <Button variant="warning" size="sm" onClick={() => handleResetPassword(admin.id)}>
                Reset
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDeleteAdmin(admin.id)}>
                Remove
              </Button>
            </div>
          </td>
        </tr>
      );
    }
    return (
      <tr key={admin.id}>
        <td>{admin.name}</td>
        <td>{admin.email}</td>
        <td>
          <Badge bg="info" pill>{admin.role}</Badge>
        </td>
        <td>{admin.lastLogin ? format(admin.lastLogin, 'dd/MM/yyyy HH:mm') : 'Never logged in'}</td>
        <td>{admin.lastActivity ? formatDistanceToNow(admin.lastActivity, { addSuffix: true }) : 'No recent activity'}</td>
        <td>
          <Button variant="warning" size="sm" onClick={() => handleResetPassword(admin.id)} className="me-2">
            Reset Password
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDeleteAdmin(admin.id)}>
            Remove
          </Button>
        </td>
      </tr>
    );
  };

  // Render the header section with admin management info for mobile
  const renderHeaderSection = () => {
    if (isMobile) {
      return (
        <div className="mb-4 text-center">
          <h3>Admin Management</h3>
          <Row className="justify-content-center mt-3">
            <Col xs={5}>
              <Badge bg="secondary" className="w-100 py-2">
                Total Admins: {state.totalAdmins}
              </Badge>
            </Col>
            <Col xs={5}>
              <Badge bg="success" className="w-100 py-2">
                Active Sessions: {state.activeSessions}
              </Badge>
            </Col>
          </Row>
          <div className="mt-3">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => navigate('/create-admin')}
              className="w-100"
            >
              Create Admin
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="d-flex justify-content-between align-items-center bg-danger-subtle px-4 py-3 mb-4 rounded shadow-sm">
        <div>
          <h2>Admin Management</h2>
          <div className="d-flex gap-3 mt-2">
            <Badge className="fs-6 p-2 bg-secondary">
              Total Admins: {state.totalAdmins}
            </Badge>
            <Badge bg="success" className="fs-6 p-2">
              Active Sessions: {state.activeSessions}
            </Badge>
          </div>
        </div>
        <Button variant="primary" onClick={() => setState(prev => ({ ...prev, showCreateModal: true }))}>
          Create New Admin
        </Button>
      </div>
    );
  };

  return (
    <div className="p-4">
      {renderHeaderSection()}
      {state.loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading admins...</p>
        </div>
      ) : state.error ? (
        <Alert variant="danger">{state.error}</Alert>
      ) : (
        <Table striped bordered hover responsive className="bg-white shadow-sm">
          <thead className="bg-light">
            {renderTableHeader()}
          </thead>
          <tbody>
            {state.admins.map(admin => renderTableRow(admin))}
          </tbody>
        </Table>
      )}

      <Modal show={state.showCreateModal} onHide={() => setState(prev => ({ ...prev, showCreateModal: false }))} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Admin</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateAdmin}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} 
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <PasswordInput 
                    value={formData.password} 
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} 
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control 
                    required 
                    value={formData.phone} 
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Number</Form.Label>
                  <Form.Control 
                    required 
                    value={formData.idNumber} 
                    onChange={e => setFormData(prev => ({ ...prev, idNumber: e.target.value }))} 
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>KRA PIN</Form.Label>
                  <Form.Control 
                    required 
                    value={formData.kraPin} 
                    onChange={e => setFormData(prev => ({ ...prev, kraPin: e.target.value }))} 
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Occupation</Form.Label>
                  <Form.Control 
                    required 
                    value={formData.occupation} 
                    onChange={e => setFormData(prev => ({ ...prev, occupation: e.target.value }))} 
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    required 
                    value={formData.address} 
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))} 
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setState(prev => ({ ...prev, showCreateModal: false }))}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={state.submitting}>
              {state.submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" /> Creating Admin...
                </>
              ) : 'Create Admin'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style jsx>{`
        @media (max-width: 576px) {
          /* Mobile Table: show only Name, Email, Role */
          table thead tr th:nth-child(n+4) {
            display: none;
          }
          table tbody tr td:nth-child(n+4) {
            display: none;
          }
          /* Adjust font sizes for mobile */
          h3, h2 {
            font-size: 1.2rem;
          }
          table {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

const PasswordInput = ({ value, onChange }) => (
  <InputGroup>
    <Form.Control
      type="password"
      value={value}
      onChange={onChange}
      required
      minLength="8"
    />
    <Button variant="outline-secondary" onClick={() => {}} aria-label="Toggle password visibility">
      👁️
    </Button>
  </InputGroup>
);

export default AdminManagement;
