import React, { useState, useEffect, memo } from 'react';
import { Form, Button, Spinner, Card, Container, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaCar, FaUserGraduate, FaHeartbeat } from 'react-icons/fa';
import { printReceipt } from './printReceipt';
const API_URL = 'https://insurance-v1-api.onrender.com/api/insurance';

// Car Policy Fields
const CarFormFields = memo(({ formData, setFormData }) => {
  const handleNumberInput = (field, value) => {
    if (!isNaN(value) || value === '') {
      setFormData(prev => ({
        ...prev,
        details: { ...prev.details, [field]: value }
      }));
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
                  setFormData(prev => ({
                    ...prev,
                    insuranceType: e.target.value,
                    comprehensiveType: ''
                  }))
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
                  setFormData(prev => ({
                    ...prev,
                    comprehensiveType: e.target.value
                  }))
                }
                required
              >
                <option value="">Select subtype</option>
                {(formData.insuranceType === 'THIRD_PARTY' || formData.insuranceType === 'COMPREHENSIVE') && (
                  <>
                    <option value="PRIVATE">Private</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="PSV">PSV</option>
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
                  setFormData(prev => ({
                    ...prev,
                    details: { ...prev.details, chassisNumber: e.target.value }
                  }))
                }
                required
                placeholder="Enter chassis number"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>VIN</Form.Label>
              <Form.Control
                value={formData.details.vin || ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    details: { ...prev.details, vin: e.target.value }
                  }))
                }
                required
                placeholder="Enter Vehicle Identification Number"
              />
            </Form.Group>
          </Col>
        </Row>
  
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Year of Manufacturing</Form.Label>
              <Form.Control
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.details.yearOfManufacturing || ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    details: { ...prev.details, yearOfManufacturing: e.target.value }
                  }))
                }
                required
                placeholder="e.g., 2020"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Fuel Type</Form.Label>
              <Form.Select
                value={formData.details.fuelType || ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    details: { ...prev.details, fuelType: e.target.value }
                  }))
                }
                required
              >
                <option value="">Select fuel type</option>
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
  
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Car Registration Number</Form.Label>
              <Form.Control
                value={formData.details.carRegistrationNumber || ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    details: { ...prev.details, carRegistrationNumber: e.target.value }
                  }))
                }
                required
                placeholder="Enter registration number"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Vehicle Model</Form.Label>
              <Form.Control
                value={formData.details.vehicleModel || ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    details: { ...prev.details, vehicleModel: e.target.value }
                  }))
                }
                required
                placeholder="Enter vehicle model"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Body Type</Form.Label>
              <Form.Control
                value={formData.details.bodyType || ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    details: { ...prev.details, bodyType: e.target.value }
                  }))
                }
                required
                placeholder="SUV, Sedan, etc."
              />
            </Form.Group>
          </Col>
        </Row>
  
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Steering Side</Form.Label>
              <Form.Select
                value={formData.details.isRightHand ? "true" : "false"}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    details: { 
                      ...prev.details, 
                      isRightHand: e.target.value === 'true' 
                    }
                  }))
                }
              >
                <option value="true">Right Hand</option>
                <option value="false">Left Hand</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Annual Value (KES)</Form.Label>
              <Form.Control
                type="number"
                value={formData.details.annualValue || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, annualValue: e.target.value } }))}
                required
                min="0"
                placeholder="e.g., 1000000"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Monthly Value (KES)</Form.Label>
              <Form.Control
                type="number"
                value={formData.details.monthlyValue || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, monthlyValue: e.target.value } }))}
                required
                min="0"
                placeholder="e.g., 100000"
              />
            </Form.Group>
          </Col>
        </Row>
  
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Color</Form.Label>
              <Form.Control
                value={formData.details.color || ''}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, details: { ...prev.details, color: e.target.value } }))
                }
                required
                placeholder="Enter color (e.g., White, Red)"
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
});

// Health Policy Fields
const HealthFormFields = memo(({ formData, setFormData }) => (
  <Card className="mb-4 shadow-sm">
    <Card.Header className="bg-info text-white d-flex align-items-center">
      <FaHeartbeat className="me-2" />
      <span>Health Insurance Details</span>
    </Card.Header>
    <Card.Body>
      <h5 className="mb-3">Personal Information</h5>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Full Name</Form.Label>
            <Form.Control 
              value={formData.healthDetails.fullName || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, fullName: e.target.value }
              }))}
              placeholder="Enter full name"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control 
              type="date"
              value={formData.healthDetails.dob || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, dob: e.target.value }
              }))}
              required
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Social Security Number (Optional)</Form.Label>
            <Form.Control 
              value={formData.healthDetails.socialSecurityNumber || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, socialSecurityNumber: e.target.value }
              }))}
              placeholder="Enter SSN (if applicable)"
            />
          </Form.Group>
        </Col>
      </Row>

      <h5 className="mb-3">Beneficiary Information</h5>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Beneficiary Name</Form.Label>
            <Form.Control
              value={formData.healthDetails.beneficiaryName || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, beneficiaryName: e.target.value }
              }))}
              placeholder="Enter beneficiary name"
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Relationship</Form.Label>
            <Form.Control
              value={formData.healthDetails.beneficiaryRelationship || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, beneficiaryRelationship: e.target.value }
              }))}
              placeholder="Relationship to policyholder"
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Benefit Allocation (%)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="100"
              value={formData.healthDetails.beneficiaryAllocation || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, beneficiaryAllocation: e.target.value }
              }))}
              placeholder="e.g., 50"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <h5 className="mb-3">Medical Information</h5>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Current Health Status</Form.Label>
            <Form.Control 
              value={formData.healthDetails.currentHealthStatus || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, currentHealthStatus: e.target.value }
              }))}
              placeholder="e.g., Good, Fair, Poor"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Pre-existing Conditions</Form.Label>
            <Form.Control
              value={formData.healthDetails.preExistingDetails || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, preExistingDetails: e.target.value }
              }))}
              placeholder="List any pre-existing conditions (e.g., Diabetes)"
              required
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Medical History</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.healthDetails.medicalHistory || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, medicalHistory: e.target.value }
              }))}
              placeholder="Provide details of past surgeries, chronic illnesses, etc."
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Family Medical History (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.healthDetails.familyMedicalHistory || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, familyMedicalHistory: e.target.value }
              }))}
              placeholder="List any family history of diseases"
            />
          </Form.Group>
        </Col>
      </Row>

      <h5 className="mb-3">Coverage Details</h5>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Type of Plan</Form.Label>
            <Form.Select
              value={formData.healthDetails.coverageOption || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, coverageOption: e.target.value }
              }))}
              required
            >
              <option value="">Select Plan Type</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="FAMILY">Family</option>
              <option value="CORPORATE">Corporate</option>
            </Form.Select>
          </Form.Group>
        </Col>

        // Change this in HealthFormFields component
<Form.Select
  value                    
                      
                      
  ={formData.healthDetails.coverageType || ''}
  onChange={e => setFormData(prev => ({
    ...prev,
    healthDetails: { ...prev.healthDetails, coverageType: e.target.value }
  }))}
  required
>
  {/* options */}


</Form.Select>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Coverage Limit</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.healthDetails.coverageLimit || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, coverageLimit: e.target.value }
              }))}
              placeholder="Maximum coverage amount"
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Premium Amount</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.healthDetails.premiumAmount || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, premiumAmount: e.target.value }
              }))}
              placeholder="Enter premium amount"
              required
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Payment Frequency</Form.Label>
            <Form.Select
              value={formData.healthDetails.premiumFrequency || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, premiumFrequency: e.target.value }
              }))}
              required
            >
              <option value="">Select Frequency</option>
              <option value="MONTHLY">Monthly</option>
              <option value="ANNUALLY">Annually</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={8}>
          <Form.Group>
            <Form.Label>Payment Methods</Form.Label>
            <Form.Control
              value={formData.healthDetails.paymentMethods || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, paymentMethods: e.target.value }
              }))}
              placeholder="e.g., Bank Transfer, Mobile Money, Payroll Deduction"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <h5 className="mb-3">Exclusions</h5>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Exclusions</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.healthDetails.exclusions || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, exclusions: e.target.value }
              }))}
              placeholder="List conditions or procedures not covered"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <h5 className="mb-3">Network Hospitals and Clinics</h5>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Approved Providers</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.healthDetails.networkProviders || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, networkProviders: e.target.value }
              }))}
              placeholder="Enter list of approved healthcare providers"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <h5 className="mb-3">Additional Benefits</h5>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Wellness Programs & Checkups</Form.Label>
            <Form.Control
              value={formData.healthDetails.additionalBenefitsWellness || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, additionalBenefitsWellness: e.target.value }
              }))}
              placeholder="Enter details"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Ambulance & Emergency Services</Form.Label>
            <Form.Control
              value={formData.healthDetails.additionalBenefitsAmbulance || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, additionalBenefitsAmbulance: e.target.value }
              }))}
              placeholder="Enter details"
              required
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Dental & Vision Coverage</Form.Label>
            <Form.Control
              value={formData.healthDetails.additionalBenefitsDental || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, additionalBenefitsDental: e.target.value }
              }))}
              placeholder="Enter details"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Mental Health & Counseling</Form.Label>
            <Form.Control
              value={formData.healthDetails.additionalBenefitsMental || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, additionalBenefitsMental: e.target.value }
              }))}
              placeholder="Enter details"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <h5 className="mb-3">Digital Signature</h5>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Signature</Form.Label>
            <Form.Control
              value={formData.healthDetails.signature || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                healthDetails: { ...prev.healthDetails, signature: e.target.value }
              }))}
              placeholder="Enter digital signature"
              required
            />
          </Form.Group>
        </Col>
      </Row>
    </Card.Body>
  </Card>
));

// Student Policy Fields
const StudentFormFields = memo(({ formData, setFormData }) => (
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
                setFormData(prev => ({
                  ...prev,
                  studentDetails: { ...prev.studentDetails, studentName: e.target.value }
                }))
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
                setFormData(prev => ({
                  ...prev,
                  studentDetails: { ...prev.studentDetails, nationalId: e.target.value }
                }))
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
                setFormData(prev => ({
                  ...prev,
                  studentDetails: { ...prev.studentDetails, admissionNumber: e.target.value }
                }))
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
                setFormData(prev => ({
                  ...prev,
                  studentDetails: { ...prev.studentDetails, school: e.target.value }
                }))
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
                setFormData(prev => ({
                  ...prev,
                  studentDetails: { ...prev.studentDetails, course: e.target.value }
                }))
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

const PolicyForm = ({ initialPolicyType = 'CAR', onSuccess, onHide }) => {
  const [policyType, setPolicyType] = useState(initialPolicyType);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    policyName: '',
    insuranceProvider: 'BRITAM',
    paymentFrequency: 'MONTHLY',
    amount: 0,
    startDate: '',
    endDate: '',
    insuranceType: '',
    comprehensiveType: '',
    details: {
      chassisNumber: '',
      vin: '',
      yearOfManufacturing: '',
      fuelType: '',
      bodyType: '',
      vehicleModel: '',
      annualValue: '',
      monthlyValue: '',
      color: '',
      carRegistrationNumber: ''
    
    },
    studentDetails: {
      studentName: '',
      nationalId: '',
      admissionNumber: '',
      school: '',
      course: ''
    },
    healthDetails: {
      fullName: '',
      dob: '',
      socialSecurityNumber: '',
      beneficiaryName: '',
      beneficiaryRelationship: '',
      beneficiaryAllocation: '',
      currentHealthStatus: '',
      preExistingDetails: '',
      medicalHistory: '',
      familyMedicalHistory: '',
      coverageType: '',
      coverageOption: '',
      coverageLimit: '',
      premiumAmount: '',
      premiumFrequency: '',
      paymentMethods: '',
      exclusions: '',
      networkProviders: '',
      additionalBenefitsWellness: '',
      additionalBenefitsAmbulance: '',
      additionalBenefitsDental: '',
      additionalBenefitsMental: '',
      signature: ''
    }
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://insurance-v1-api.onrender.com/api/insurance/users');
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        Swal.fire('Error', 'Failed to load users', 'error');
      }
    };
    fetchUsers();
  }, []);

  const generatePolicyNumber = () => {
    const prefix = {
      CAR: 'CAR',
      STUDENT_ATTACHMENT: 'STU',
      HEALTHCARE: 'HLT'
    }[policyType];
    return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    Swal.fire({
      title: "Processing data...",
      text: "Please wait while we submit your policy.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const payload = {
        policyNumber: generatePolicyNumber(),
        userId: Number(formData.userId),
        policyName: formData.policyName.trim(),
        insuranceProvider: formData.insuranceProvider,
        paymentFrequency: formData.paymentFrequency,
        amount: Number(formData.amount),
        type: policyType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: "PENDING"
      };

      if (policyType === 'CAR') {
        payload.insuranceType = formData.insuranceType.trim();
        payload.comprehensiveType = formData.comprehensiveType.trim();
        payload.details = {
          ...Object.fromEntries(
            Object.entries(formData.details).map(([key, value]) => [
              key,
              typeof value === "string" ? value.trim() : value
            ])
          ),
          annualValue: Number(formData.details.annualValue),
          monthlyValue: Number(formData.details.monthlyValue)
        };
      } else if (policyType === 'HEALTHCARE') {
        payload.healthDetails = formData.healthDetails;
      } else if (policyType === 'STUDENT_ATTACHMENT') {
        payload.studentDetails = formData.studentDetails;
      }

      let endpoint = '';
      switch (policyType) {
        case 'CAR':
          endpoint = '/create-car';
          break;
        case 'HEALTHCARE':
          endpoint = '/create-health';
          break;
        case 'STUDENT_ATTACHMENT':
          endpoint = '/create-student';
          break;
        default:
          throw new Error('Invalid policy type');
      }

      const response = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Submission failed");

      Swal.fire({
        title: "Success!",
        html: `Policy created successfully!<br><br>
          <small>Email notification: ${data.emailStatus?.success ? 'Sent ✅' : 'Failed to send ❌'}</small>`,
        icon: "success",
        confirmButtonText: "OK",
      });


       // Show detailed email status if there was an issue
    if (data.emailStatus && !data.emailStatus.success) {
      Swal.fire({
        title: 'Email Notification Status',
        text: data.emailStatus.message,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }

      printReceipt({
        policy: data.policy,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount
      });

      onSuccess?.();
      onHide?.();
    } catch (error) {
      console.error("Error submitting policy:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "An unexpected error occurred.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-3">
      <Card className="shadow-lg">
        <Card.Header className="bg-dark text-white">
          <h3 className="mb-0 text-white">New Insurance Policy</h3>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Select User</Form.Label>
                  <Form.Select
                    value={formData.userId}
                    onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                    required
                  >
                    <option value="">Select user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Policy Type</Form.Label>
                  <Form.Select
                    value={policyType}
                    onChange={(e) => {
                      setPolicyType(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        insuranceType: '',
                        comprehensiveType: '',
                        details: {
                          chassisNumber: '',
                          vin: '',
                          yearOfManufacturing: '',
                          fuelType: '',
                          bodyType: '',
                          vehicleModel: '',
                          annualValue: '',
                          monthlyValue: '',
                          color: '',
                          carRegistrationNumber: '',
                        
                        },
                        studentDetails: {
                          studentName: '',
                          nationalId: '',
                          admissionNumber: '',
                          school: '',
                          course: ''
                        },
                        healthDetails: {
                          fullName: '',
                          dob: '',
                          socialSecurityNumber: '',
                          beneficiaryName: '',
                          beneficiaryRelationship: '',
                          beneficiaryAllocation: '',
                          currentHealthStatus: '',
                          preExistingDetails: '',
                          medicalHistory: '',
                          familyMedicalHistory: '',
                          coverageType: '',
                          coverageOption: '',
                          coverageLimit: '',
                          premiumAmount: '',
                          premiumFrequency: '',
                          paymentMethods: '',
                          exclusions: '',
                          networkProviders: '',
                          additionalBenefitsWellness: '',
                          additionalBenefitsAmbulance: '',
                          additionalBenefitsDental: '',
                          additionalBenefitsMental: '',
                          signature: ''
                        }
                      }));
                    }}
                    required
                  >
                    <option value="CAR"><FaCar /> Car Insurance</option>
                    <option value="HEALTHCARE"><FaHeartbeat /> Health Insurance</option>
                    <option value="STUDENT_ATTACHMENT"><FaUserGraduate /> Student Insurance</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Policy Name</Form.Label>
                  <Form.Control
                    value={formData.policyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, policyName: e.target.value }))}
                    required
                    placeholder="Enter policy name"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Insurance Provider</Form.Label>
                  <Form.Select
                    value={formData.insuranceProvider}
                    onChange={(e) => setFormData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                    required
                  >
                    <option value="BRITAM">BRITAM</option>
                    <option value="CIC">CIC</option>
                    <option value="MADISON">MADISON</option>
                    <option value="DIRECT_LINE">DIRECT_LINE</option>
                    <option value="ARR">AAR</option>
                    <option value="OLD_MUTUAL">OLD_MUTUAL</option>
                    <option value="APA">APA</option>
                    <option value="GA">GA</option>
                    <option value="PIONER">PIONER</option>
                    <option value="JUBILEE">JUBILEE</option>
                    <option value="LIBERTY">LIBERTY</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {policyType === 'CAR' && <CarFormFields formData={formData} setFormData={setFormData} />}
            {policyType === 'HEALTHCARE' && <HealthFormFields formData={formData} setFormData={setFormData} />}
            {policyType === 'STUDENT_ATTACHMENT' && <StudentFormFields formData={formData} setFormData={setFormData} />}

            <Row className="mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Payment Frequency</Form.Label>
                  <Form.Select
                    value={formData.paymentFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentFrequency: e.target.value }))}
                    required
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUALLY">Annually</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Create Policy'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PolicyForm;