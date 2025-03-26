import React, { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';
import Swal from 'sweetalert2';
import { FaCar, FaUserGraduate, FaHeartbeat } from 'react-icons/fa';

const API_URL = 'https://insurance-v1-api.onrender.com/api/insurance';

// ---------- Additional Details Components ----------

const CarFormFields = memo(({ formData, updateFormData }) => {
  const handleNumberInput = (field, value) => {
    if (!isNaN(value) || value === '') {
      updateFormData({ details: { ...formData.details, [field]: value } });
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-primary text-white d-flex align-items-center">
        <FaCar className="me-2" />
        <span>Car Insurance Details</span>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Insurance Type</Form.Label>
              <Form.Select
                value={formData.insuranceType}
                onChange={(e) =>
                  updateFormData({ 
                    insuranceType: e.target.value, 
                    comprehensiveType: '' 
                  })
                }
                required
              >
                <option value="">Select type</option>
                <option value="THIRD_PARTY">Third Party</option>
                <option value="COMPREHENSIVE">Comprehensive</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Policy Subtype</Form.Label>
              <Form.Select
                value={formData.comprehensiveType}
                onChange={(e) =>
                  updateFormData({ comprehensiveType: e.target.value })
                }
                required
              >
                <option value="">Select subtype</option>
                {formData.insuranceType === 'THIRD_PARTY' && (
                  <>
                    <option value="PRIVATE">Private</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </>
                )}
                {formData.insuranceType === 'COMPREHENSIVE' && (
                  <>
                    <option value="PRIVATE">Private</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="CORPORATE">Corporate</option>
                  </>
                )}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Chassis Number</Form.Label>
              <Form.Control
                value={formData.details.chassisNumber || ''}
                onChange={(e) =>
                  updateFormData({ 
                    details: { ...formData.details, chassisNumber: e.target.value } 
                  })
                }
                required
                placeholder="Enter chassis number"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Vehicle Model</Form.Label>
              <Form.Control
                value={formData.details.vehicleModel || ''}
                onChange={(e) =>
                  updateFormData({ 
                    details: { ...formData.details, vehicleModel: e.target.value } 
                  })
                }
                required
                placeholder="Enter vehicle model"
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Body Type</Form.Label>
              <Form.Control
                value={formData.details.bodyType || ''}
                onChange={(e) =>
                  updateFormData({ 
                    details: { ...formData.details, bodyType: e.target.value } 
                  })
                }
                required
                placeholder="SUV, Sedan, Sport, etc."
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Color</Form.Label>
              <Form.Control
                value={formData.details.color || ''}
                onChange={(e) =>
                  updateFormData({ 
                    details: { ...formData.details, color: e.target.value } 
                  })
                }
                required
                placeholder="Vehicle color, e.g., Red, Pearl White"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Steering Side</Form.Label>
              <Form.Select
                value={formData.details.isRightHand === true ? 'true' : 'false'}
                onChange={(e) =>
                  updateFormData({ 
                    details: { ...formData.details, isRightHand: e.target.value === 'true' } 
                  })
                }
                required
              >
                <option value="">Select side</option>
                <option value="true">Right Hand</option>
                <option value="false">Left Hand</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Annual Value (KES)</Form.Label>
              <Form.Control
                type="number"
                value={formData.details.annualValue || ''}
                onChange={(e) => handleNumberInput('annualValue', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Monthly Value (KES)</Form.Label>
              <Form.Control
                type="number"
                value={formData.details.monthlyValue || ''}
                onChange={(e) => handleNumberInput('monthlyValue', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Car Registration Number</Form.Label>
              <Form.Control
                value={formData.details.carRegistrationNumber || ''}
                onChange={(e) =>
                  updateFormData({ 
                    details: { ...formData.details, carRegistrationNumber: e.target.value } 
                  })
                }
                required
                placeholder="Enter registration number"
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
});

const HealthFormFields = memo(({ formData, updateFormData }) => (
  <Card className="mb-4 shadow-sm">
    <Card.Header className="bg-info text-white d-flex align-items-center">
      <FaHeartbeat className="me-2" />
      <span>Health Insurance Details</span>
    </Card.Header>
    <Card.Body>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Coverage Type</Form.Label>
            <Form.Control
              value={formData.healthDetails.coverageType || ''}
              onChange={(e) =>
                updateFormData({ 
                  healthDetails: { ...formData.healthDetails, coverageType: e.target.value } 
                })
              }
              required
              placeholder="Enter coverage type"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Hospital</Form.Label>
            <Form.Control
              value={formData.healthDetails.hospital || ''}
              onChange={(e) =>
                updateFormData({ 
                  healthDetails: { ...formData.healthDetails, hospital: e.target.value } 
                })
              }
              required
              placeholder="Enter hospital name"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Number of Dependents</Form.Label>
            <Form.Control
              type="number"
              value={formData.healthDetails.dependents || ''}
              onChange={(e) =>
                updateFormData({ 
                  healthDetails: { ...formData.healthDetails, dependents: e.target.value } 
                })
              }
              required
              min="0"
            />
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-center">
          <Form.Check
            type="checkbox"
            label="Pre-Existing Conditions"
            checked={formData.healthDetails.preExisting}
            onChange={(e) =>
              updateFormData({ 
                healthDetails: { ...formData.healthDetails, preExisting: e.target.checked } 
              })
            }
          />
        </Col>
      </Row>
    </Card.Body>
  </Card>
));

const StudentFormFields = memo(({ formData, updateFormData }) => (
  <Card className="mb-4 shadow-sm">
    <Card.Header className="bg-warning text-dark d-flex align-items-center">
      <FaUserGraduate className="me-2" />
      <span>Student Insurance Details</span>
    </Card.Header>
    <Card.Body>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Student Name</Form.Label>
            <Form.Control
              value={formData.studentDetails.studentName || ''}
              onChange={(e) =>
                updateFormData({ 
                  studentDetails: { ...formData.studentDetails, studentName: e.target.value } 
                })
              }
              required
              placeholder="Enter student name"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>National ID</Form.Label>
            <Form.Control
              value={formData.studentDetails.nationalId || ''}
              onChange={(e) =>
                updateFormData({ 
                  studentDetails: { ...formData.studentDetails, nationalId: e.target.value } 
                })
              }
              required
              placeholder="Enter national ID"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Admission Number</Form.Label>
            <Form.Control
              value={formData.studentDetails.admissionNumber || ''}
              onChange={(e) =>
                updateFormData({ 
                  studentDetails: { ...formData.studentDetails, admissionNumber: e.target.value } 
                })
              }
              required
              placeholder="Enter admission number"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>School</Form.Label>
            <Form.Control
              value={formData.studentDetails.school || ''}
              onChange={(e) =>
                updateFormData({ 
                  studentDetails: { ...formData.studentDetails, school: e.target.value } 
                })
              }
              required
              placeholder="Enter school name"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Course</Form.Label>
            <Form.Control
              value={formData.studentDetails.course || ''}
              onChange={(e) =>
                updateFormData({ 
                  studentDetails: { ...formData.studentDetails, course: e.target.value } 
                })
              }
              required
              placeholder="Enter course"
            />
          </Form.Group>
        </Col>
      </Row>
    </Card.Body>
  </Card>
));

// ------------------ EditPolicy Component ------------------

const EditPolicy = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({
    policy: null,
    loading: true,
    error: null,
    updateCount: 0,
    formData: {
      policyNumber: '',
      type: '',
      amount: '',
      startDate: '',
      endDate: '',
      insuranceProvider: '',
      paymentFrequency: '',
      policyName: '',
      comprehensiveType: '',
      details: {
        chassisNumber: '',
        bodyType: '',
        isRightHand: true,
        vehicleModel: '',
        annualValue: '',
        monthlyValue: '',
        color: '',
        carRegistrationNumber: ''
      },
      healthDetails: {
        coverageType: '',
        preExisting: false,
        dependents: '',
        hospital: ''
      },
      studentDetails: {
        studentName: '',
        nationalId: '',
        admissionNumber: '',
        school: '',
        course: ''
      }
    },
    userDetails: null
  });

  const adminName = localStorage.getItem('adminName') || 'Administrator';

  // Function to update formData within state
  const updateFormData = (newData) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...newData }
    }));
  };

  useEffect(() => {
    const fetchPolicyDetails = async () => {
      try {
        const [policyRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/${id}`),
          fetch(`${API_URL}/users`)
        ]);

        if (!policyRes.ok) throw new Error('Failed to fetch policy');
        if (!usersRes.ok) throw new Error('Failed to fetch users');

        const policyData = await policyRes.json();
        const usersData = await usersRes.json();

        const fetchedPolicy = policyData.policy;
        const policyUser = usersData.users.find(u => u.id === fetchedPolicy.userId);

        setState(prev => ({
          ...prev,
          policy: fetchedPolicy,
          userDetails: policyUser,
          formData: {
            policyNumber: fetchedPolicy.policyNumber,
            type: fetchedPolicy.type,
            amount: fetchedPolicy.amount,
            startDate: format(parseISO(fetchedPolicy.startDate), 'yyyy-MM-dd'),
            endDate: format(parseISO(fetchedPolicy.endDate), 'yyyy-MM-dd'),
            insuranceProvider: fetchedPolicy.insuranceProvider || '',
            paymentFrequency: fetchedPolicy.paymentFrequency || '',
            policyName: fetchedPolicy.policyName || '',
            comprehensiveType: fetchedPolicy.comprehensiveType || '',
            details: fetchedPolicy.details || {},
            healthDetails: fetchedPolicy.healthDetails || {},
            studentDetails: fetchedPolicy.studentDetails || {}
          },
          loading: false
        }));
      } catch (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
      }
    };

    fetchPolicyDetails();
  }, [id]);

  const generatePolicyNumber = () => {
    const prefix = {
      CAR: 'CAR',
      STUDENT_ATTACHMENT: 'STU',
      HEALTHCARE: 'HLT'
    }[state.formData.type] || 'POL';
    return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, loading: true }));

    try {
      const payload = {
        policyNumber: state.formData.policyNumber || generatePolicyNumber(),
        userId: Number(state.formData.userId),
        policyName: state.formData.policyName,
        insuranceProvider: state.formData.insuranceProvider,
        paymentFrequency: state.formData.paymentFrequency,
        amount: Number(state.formData.amount),
        type: state.formData.type,
        startDate: new Date(state.formData.startDate).toISOString(),
        endDate: new Date(state.formData.endDate).toISOString(),
        status: "PENDING",
        updatedBy: adminName,
        updateCount: state.updateCount + 1
      };

      if (state.formData.type === 'CAR') {
        payload.details = {
          ...state.formData.details,
          annualValue: Number(state.formData.details.annualValue),
          monthlyValue: Number(state.formData.details.monthlyValue)
        };
      } else if (state.formData.type === 'HEALTHCARE') {
        payload.healthDetails = state.formData.healthDetails;
      } else if (state.formData.type === 'STUDENT_ATTACHMENT') {
        payload.studentDetails = state.formData.studentDetails;
      }

      console.log("Final Payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Update failed');

      const resultData = await response.json();

      Swal.fire({
        title: 'Update Successful!',
        html: `<b>${state.userDetails?.name}'s</b> policy updated successfully!<br>
               <small>Updated by: ${adminName}</small>`,
        icon: 'success',
        confirmButtonColor: '#1a237e',
        showDenyButton: true,
        denyButtonColor: '#388e3c',
        confirmButtonText: 'View Policies',
        denyButtonText: 'Stay Here'
      }).then((result) => {
        if (result.isConfirmed) navigate('/policies');
      });

      setState(prev => ({
        ...prev,
        updateCount: prev.updateCount + 1,
        policy: resultData.policy,
        loading: false
      }));
    } catch (error) {
      Swal.fire('Update Failed', error.message, 'error');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  if (state.loading) {
    return (
      <Container className="policy-loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="loading-text">Loading Policy Details...</p>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container className="policy-error-container">
        <Alert variant="danger" className="error-alert">
          {state.error}
          <Button variant="outline-danger" className="mt-3" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="policy-edit-container py-4">
      <Card className="policy-card shadow-lg">
        <Card.Header className="policy-card-header bg-dark text-white">
          <h2 className="policy-title">Policy Management</h2>
          <div className="policy-meta">
            <Badge bg="dark" className="policy-badge">
              ID: {state.formData.policyNumber}
            </Badge>
            <Badge bg="secondary" className="policy-badge">
              Updated {state.updateCount} time{state.updateCount === 1 ? '' : 's'}
            </Badge>
          </div>
        </Card.Header>

        <Card.Body className="policy-card-body">
          <Form onSubmit={handleSubmit}>
            {/* Policy Holder Section */}
            <section className="user-details-section">
              <h5 className="section-title">Policy Holder Information</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control plaintext readOnly defaultValue={state.userDetails?.name} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Contact Email</Form.Label>
                    <Form.Control plaintext readOnly defaultValue={state.userDetails?.email} />
                  </Form.Group>
                </Col>
              </Row>
            </section>

            {/* Policy Details Section */}
            <section className="policy-details-section">
              <h5 className="section-title">Policy Details</h5>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-4">
                    <Form.Label>Policy Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={state.formData.policyNumber}
                      onChange={e =>
                        setState(prev => ({
                          ...prev,
                          formData: { ...prev.formData, policyNumber: e.target.value }
                        }))
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label>Policy Type</Form.Label>
                    <Form.Select
                      value={state.formData.type}
                      onChange={e =>
                        setState(prev => ({
                          ...prev,
                          formData: { ...prev.formData, type: e.target.value }
                        }))
                      }
                    >
                      <option value="HEALTHCARE">Health Insurance</option>
                      <option value="CAR">Auto Insurance</option>
                      <option value="STUDENT_ATTACHMENT">Student Attachment</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Coverage Amount (KES)</Form.Label>
                    <Form.Control
                      type="number"
                      value={state.formData.amount}
                      onChange={e =>
                        setState(prev => ({
                          ...prev,
                          formData: { ...prev.formData, amount: e.target.value }
                        }))
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </section>

            {/* Additional Policy Information */}
            <section className="additional-info-section">
              <h5 className="section-title">Additional Policy Information</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Insurance Provider</Form.Label>
                    <Form.Control
                      type="text"
                      value={state.formData.insuranceProvider}
                      onChange={e =>
                        setState(prev => ({
                          ...prev,
                          formData: { ...prev.formData, insuranceProvider: e.target.value }
                        }))
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Payment Frequency</Form.Label>
                    <Form.Control
                      type="text"
                      value={state.formData.paymentFrequency}
                      onChange={e =>
                        setState(prev => ({
                          ...prev,
                          formData: { ...prev.formData, paymentFrequency: e.target.value }
                        }))
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-4">
                    <Form.Label>Policy Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={state.formData.policyName}
                      onChange={e =>
                        setState(prev => ({
                          ...prev,
                          formData: { ...prev.formData, policyName: e.target.value }
                        }))
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label>Comprehensive Type</Form.Label>
                    <Form.Control
                      type="text"
                      value={state.formData.comprehensiveType}
                      onChange={e =>
                        setState(prev => ({
                          ...prev,
                          formData: { ...prev.formData, comprehensiveType: e.target.value }
                        }))
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </section>

            {/* Date Section */}
            <section className="date-section">
              <h5 className="section-title">Policy Period</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Effective Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={state.formData.startDate}
                      onChange={e =>
                        setState(prev => ({
                          ...prev,
                          formData: { ...prev.formData, startDate: e.target.value }
                        }))
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Expiration Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={state.formData.endDate}
                      onChange={e =>
                        setState(prev => ({
                          ...prev,
                          formData: { ...prev.formData, endDate: e.target.value }
                        }))
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </section>

            {/* Conditionally render additional details based on policy type */}
            {state.formData.type === 'CAR' && (
              <CarFormFields formData={state.formData} updateFormData={updateFormData} />
            )}
            {state.formData.type === 'HEALTHCARE' && (
              <HealthFormFields formData={state.formData} updateFormData={updateFormData} />
            )}
            {state.formData.type === 'STUDENT_ATTACHMENT' && (
              <StudentFormFields formData={state.formData} updateFormData={updateFormData} />
            )}

            <div className="form-actions">
              <Button variant="outline-secondary" className="action-button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" className="action-button save-button" style={{ backgroundColor: 'navy', borderColor: 'navy' }}>
                Save Changes
              </Button>
            </div>
          </Form>
        </Card.Body>

        <Card.Footer className="policy-card-footer">
          <small className="text-muted">
            Last modified: {format(parseISO(state.policy.updatedAt), 'MMM dd, yyyy HH:mm')}
          </small>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default EditPolicy;
