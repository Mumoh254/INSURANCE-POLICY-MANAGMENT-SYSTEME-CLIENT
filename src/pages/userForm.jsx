import React, { useState } from 'react';
import { Button, Form, Spinner, Row, Col, InputGroup } from 'react-bootstrap';
import Swal from 'sweetalert2';
import * as yup from 'yup';

// Yup validation schema updated for new fields
const userSchema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  gender: yup.string().required('Gender is required'),
  occupation: yup.string().required('Occupation is required'),
  companyName: yup.string(), // optional
  businessType: yup.string(), // optional
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  idNumber: yup.string().required('National ID is required'),
  kraPin: yup.string().required('KRA PIN is required'),
  streetAddress: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State/County is required'),
  postalCode: yup.string().required('Postal code is required'),
  country: yup.string().required('Country is required')
});

const UserForm = ({ onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    occupation: '',
    companyName: '',
    businessType: '',
    email: '',
    phone: '',
    password: '',
    idNumber: '',
    kraPin: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await userSchema.validate(formData, { abortEarly: false });
      
      const response = await fetch('https://insurance-v1-api.onrender.com/api/insurance/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User created successfully',
        showConfirmButton: false,
        timer: 1500
      });

      if (typeof onSuccess === "function") {
        onSuccess(data);
      }
      
      onHide();
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
        Swal.fire('Validation Error', 'Please check the form fields', 'error');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: error.message,
          showConfirmButton: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0 15px' }}>
      <Form onSubmit={handleSubmit} noValidate>
        {/* Personal Information Section */}
        <div className="mb-4">
          <h5 className="text-primary mb-3 border-bottom pb-2">Personal Information</h5>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  isInvalid={!!errors.name}
                  placeholder="Enter your full name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="gender" className="mb-3">
                <Form.Label>Gender <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  value={formData.gender} 
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  isInvalid={!!errors.gender}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.gender}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="occupation" className="mb-3">
                <Form.Label>Occupation <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  value={formData.occupation} 
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  isInvalid={!!errors.occupation}
                  placeholder="Type your occupation"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.occupation}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="companyName" className="mb-3">
                <Form.Label>Company Name (If applicable)</Form.Label>
                <Form.Control 
                  value={formData.companyName} 
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Enter your company name"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="businessType" className="mb-3">
                <Form.Label>Business Type (If related to work)</Form.Label>
                <Form.Control 
                  value={formData.businessType} 
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  placeholder="Enter your business type"
                />
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Contact Information Section */}
        <div className="mb-4">
          <h5 className="text-primary mb-3 border-bottom pb-2">Contact Information</h5>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="email" className="mb-3">
                <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  isInvalid={!!errors.email}
                  placeholder="john.doe@example.com"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="phone" className="mb-3">
                <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  isInvalid={!!errors.phone}
                  placeholder="+254 7XX XXX XXX"
                />
                <Form.Text className="text-muted">
                  Format: +254 7XX XXX XXX
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Identity Information Section */}
        <div className="mb-4">
          <h5 className="text-primary mb-3 border-bottom pb-2">Identity Information</h5>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="idNumber" className="mb-3">
                <Form.Label>National ID <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  isInvalid={!!errors.idNumber}
                  placeholder="12345678"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.idNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="kraPin" className="mb-3">
                <Form.Label>KRA PIN <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  value={formData.kraPin}
                  onChange={(e) => setFormData({ ...formData, kraPin: e.target.value })}
                  isInvalid={!!errors.kraPin}
                  placeholder="A00123..."
                />
                <Form.Control.Feedback type="invalid">
                  {errors.kraPin}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Address Section */}
        <div className="mb-4">
          <h5 className="text-primary mb-3 border-bottom pb-2">Address Information</h5>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="streetAddress" className="mb-3">
                <Form.Label>Street Address <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  isInvalid={!!errors.streetAddress}
                  placeholder="123 Main Street"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.streetAddress}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="city" className="mb-3">
                <Form.Label>City <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  isInvalid={!!errors.city}
                  placeholder="Nairobi"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.city}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="state" className="mb-3">
                <Form.Label>State/County <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  isInvalid={!!errors.state}
                  placeholder="Nairobi County"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.state}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="postalCode" className="mb-3">
                <Form.Label>Postal Code <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  isInvalid={!!errors.postalCode}
                  placeholder="00100"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.postalCode}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="country" className="mb-3">
                <Form.Label>Country <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="select"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  isInvalid={!!errors.country}
                >
                  <option value="">Select Country</option>
                  <option>Kenya</option>
                  <option>Uganda</option>
                  <option>Tanzania</option>
                  <option>Rwanda</option>
                  <option>Somalia</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.country}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Security Section */}
        <div className="mb-4">
          <h5 className="text-primary mb-3 border-bottom pb-2">Security Information</h5>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="password" className="mb-3">
                <Form.Label>System Password <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  isInvalid={!!errors.password}
                  placeholder="Your password"
                />
                <Form.Text className="text-muted">
                  Minimum 8 characters
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </div>

        <div className="d-flex justify-content-end sticky-bottom bg-white pt-3 border-top">
          <Button variant="outline-secondary" onClick={onHide} className="me-2 px-4">
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading} className="px-4">
            {loading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : 'Create User'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UserForm;
