import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner, Card, Container } from 'react-bootstrap';
import axios from 'axios';
import styled, { createGlobalStyle } from 'styled-components';
import Swal from 'sweetalert2';

const GlobalStyle = createGlobalStyle`
  input:focus, textarea:focus, select:focus {
    outline: none !important;
    box-shadow: none !important;
  }
`;

const LoginContainer = styled.div`
  min-height: 80vh;
  background: linear-gradient(135deg, rgb(212, 212, 212) 0%, rgb(252, 252, 252) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 900px;
  min-height: 500px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.25);
  border: none;
  overflow: hidden;
  padding: 3rem;

  @media (max-width: 576px) {
    padding: 1.5rem;
    min-height: 400px;
  }
`;

const BrandHeader = styled.div`
  background: #0a192f;
  color: white;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;

  @media (max-width: 576px) {
    font-size: 1rem;
    padding: 0.75rem;
  }
`;

const RoleBadge = styled.span`
  background: ${(props) => (props.active ? '#2980b9' : '#ecf0f1')};
  color: ${(props) => (props.active ? 'white' : '#7f8c8d')};
  border: 2px solid #bdc3c7;
  padding: 0.75rem 1rem;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1rem;

  &:hover {
    border-color: #0a192f;
  }

  @media (max-width: 576px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'admin' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    Swal.fire({
      title: 'Logging in...',
      text: 'Please wait while we process your request',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.post(
        'https://insurance-v1-api.onrender.com/api/insurance/users/login',
        formData,
        { withCredentials: true }
      );

      localStorage.setItem('authToken', response.data.accessToken);
      localStorage.setItem('userRole', response.data.user.role);

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'System Redirecting ...',
        timer: 3000,
        showConfirmButton: true,
      });

      setTimeout(() => {
        navigate(response.data.user.role === 'ADMIN' ? '/policies' : '/policies');
      }, 2000);
    } catch (err) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.message || 'Please check your credentials.',
      });
    }
  };

  return (
    <>
      <GlobalStyle />
      <LoginContainer style={{ background: "#fff" }}>
        <Container>
          <LoginCard>
            <BrandHeader>
              <h3 className='text-white'>Insurance Management System</h3>
              <p className='text-white'>Secure Admin Login Portal.</p>
            </BrandHeader>

            <div className="px-4 pb-4">
              <div className="d-flex justify-content-center gap-3 mb-4">
                <RoleBadge
                  active={formData.role === 'admin'}
                  onClick={() => handleRoleChange('admin')}
                  className='px-5 btn-toolbar'
                >
                  Admin
                </RoleBadge>
                <RoleBadge
                  active={formData.role === 'super-admin'}
                  onClick={() => handleRoleChange('super-admin')}
                >
                  Super Admin
                </RoleBadge>
              </div>

              {error && <Alert variant="danger" className="text-center">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your Email"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-100 py-3"
                  style={{ fontSize: '1.2rem', fontWeight: 'bold', background: "#0a192f" }}
                >
                  {loading ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    `Sign In as ${formData.role === 'super-admin' ? 'Super Admin' : 'Admin'}`
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <small className="text-muted">
                  Forgot Your password? Contact system administrator for help!
                </small>
              </div>
            </div>
          </LoginCard>
        </Container>
      </LoginContainer>
    </>
  );
};

export default Login;
