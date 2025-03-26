import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Card, Badge, Button, Row, Col, Container } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';

const PolicyDetails = () => {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch(`https://insurance-v1-api.onrender.com/api/insurance/${id}`);
        if (!response.ok) throw new Error('Failed to fetch policy');
        const data = await response.json();
        console.log(data)
        setPolicy(data.policy);
      } catch (err) {
        setError(err.message);
        Swal.fire('Error', err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading Your policy details...</p>
      </div>
    );
  }

  if (error) return <Alert variant="danger" className="m-3">{error}</Alert>;

  return (
    <Container className="my-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">
              {policy.policyName} <small className="text-white ">({policy.policyNumber})</small>
            </h3>
            <Badge bg={policy.status === 'PENDING' ? 'warning' : 'success'} pill>
              {policy.status}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <h5 className="text-secondary border-bottom pb-2">Policy Holder Information</h5>
              <p><strong>Name:</strong> {policy.user.name}</p>
              <p><strong>Email:</strong> {policy.user.email}</p>
              <p><strong>Phone:</strong> {policy.user.phone}</p>
              <p><strong>ID Number:</strong> {policy.user.idNumber}</p>
              <p><strong>KRA PIN:</strong> {policy.user.kraPin}</p>
              
              <p><strong>Role:</strong> {policy.user.role || 'N/A'}</p>
              <p><strong>Last-Update:</strong> {policy.user.updatedAt || 'N/A'}</p>
            </Col>


            <Col md={6}>
           
              <h5 className="text-secondary border-bottom pb-2">Policy  Holder  Extra  Details </h5>
              <p><strong>Occupation:</strong> {policy.user.occupation || 'N/A'}</p>
              <p><strong>Company  Name| Employer:</strong> {policy.user.companyName}</p>
              <p><strong>Company | Employer Information:</strong> {policy.user.businessType}</p>
              <p><strong>Origin Country:</strong>  {policy.user.country}</p>
              <p><strong>Postal Address | Address Code :</strong> {policy.user.postalCode}</p>
              <p><strong> State :</strong> {policy.user.state}</p>
              <p><strong>Gender:</strong> {policy.user.gender}</p>

            </Col>


            <Col md={6}>
              <h5 className="text-secondary border-bottom pb-2">Policy Information</h5>
              <p><strong>Insurance Provider:</strong> {policy.insuranceProvider}</p>
              <p><strong>Policy  Name :</strong> {policy.Name}</p>
              <p><strong>Coverage Amount:</strong> KES {policy.amount.toLocaleString()}</p>
              <p><strong>Payment Frequency:</strong> {policy.paymentFrequency}</p>
              <p><strong>Policy Number:</strong> {policy.policyNumber}</p>
              <p><strong>Policy Status:</strong> {policy.status}</p>

            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <p><strong>Start Date:</strong> {formatDate(policy.startDate)}</p>
            </Col>
            <Col md={6}>
              <p><strong>End Date:</strong> {formatDate(policy.endDate)}</p>
            </Col>
          </Row>

          {/* Car Details Section */}
          {policy.type === 'CAR' && policy.carDetails && (
            <div className="mt-4">
              <h5 className="text-secondary border-bottom pb-2">Vehicle Details</h5>
              <Row>
                <Col md={4}>
                  <p><strong>Chassis Number:</strong> {policy.carDetails.chassisNumber}</p>
                  <p><strong>Vehicle Model:</strong> {policy.carDetails.vehicleModel}</p>
                </Col>
                <Col md={4}>
                  <p><strong>Body Type:</strong> {policy.carDetails.bodyType}</p>
                  <p><strong>Color:</strong> <span style={{ color: policy.carDetails.color }}>{policy.carDetails.color}</span></p>
                </Col>
                <Col md={4}>
                  <p><strong>Annual Value:</strong> KES {policy.carDetails.annualValue?.toLocaleString()}</p>
                  <p><strong>Monthly Value:</strong> KES {policy.carDetails.monthlyValue?.toLocaleString()}</p>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={6}>
                  <p><strong>Drive Type:</strong> {policy.carDetails.isRightHand ? 'Right-hand Drive' : 'Left-hand Drive'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Registration Number:</strong> {policy.carRegistrationNumber}</p>
                </Col>


                <Col md={6}>
                  <p><strong>Vehicle  Identification Number:</strong> {policy.carDetails.vin}</p>
                </Col>

                <Col md={4}>
                  <p><strong>Vehicle  Fuel  Type:</strong> {policy.carDetails.fuelType}</p>
                </Col>

                <Col md={6}>
                  <p><strong>Year  Of  Manufacturing:</strong> {policy.carDetails.yearOfManufacturing}</p>
                </Col>


              



                <Col md={6}>
                  <p><strong>Vehicle Insurance  Type:</strong> {policy.insuranceType}</p>
                </Col>


                <Col md={6}>
                  <p><strong> Vehicle Insurance   Subtype :</strong> {policy.comprehensiveType}</p>
                </Col>

              </Row>
            </div>
          )}





{policy.type === 'HEALTHCARE' && policy.healthDetails && (
  <div className="mt-4">
    <h5 className="text-secondary border-bottom pb-2">Health Insurance Details</h5>
    
    {/* Personal Information */}
    <Row className="mb-4">
      <Col>
        <h6>Personal Information</h6>
        <Row>
          <Col md={4}>
            <p><strong>Full Name:</strong> {policy.healthDetails.fullName}</p>
            <p><strong>Date of Birth:</strong> {formatDate(policy.healthDetails.dob)}</p>
          </Col>
          <Col md={4}>
            <p><strong>Social Security Number:</strong> 
              {policy.healthDetails.socialSecurityNumber || 'N/A'}
            </p>
            <p><strong>Dependents:</strong> {policy.healthDetails.dependents}</p>
          </Col>
        </Row>
      </Col>
    </Row>

    {/* Beneficiary Details */}
    <Row className="mb-4">
      <Col>
        <h6>Beneficiary Information</h6>
        <Row>
          <Col md={4}>
            <p><strong>Name:</strong> {policy.healthDetails.beneficiaryName}</p>
          </Col>
          <Col md={4}>
            <p><strong>Relationship:</strong> {policy.healthDetails.beneficiaryRelationship}</p>
          </Col>
          <Col md={4}>
            <p><strong>Allocation:</strong> {policy.healthDetails.beneficiaryAllocation}%</p>
          </Col>
        </Row>
      </Col>
    </Row>

    {/* Medical Information */}
    <Row className="mb-4">
      <Col>
        <h6>Medical History</h6>
        <Row>
          <Col md={4}>
            <p><strong>Current Health Status:</strong> {policy.healthDetails.currentHealthStatus}</p>
            <p><strong>Pre-existing Conditions:</strong> {policy.healthDetails.preExistingDetails}</p>
          </Col>
          <Col md={4}>
            <p><strong>Medical History:</strong> {policy.healthDetails.medicalHistory}</p>
          </Col>
          <Col md={4}>
            <p><strong>Family Medical History:</strong> 
              {policy.healthDetails.familyMedicalHistory || 'N/A'}
            </p>
          </Col>
        </Row>
      </Col>
    </Row>

    {/* Coverage Details */}
    <Row className="mb-4">
      <Col>
        <h6>Coverage Details</h6>
        <Row>
          <Col md={4}>
            <p><strong>Coverage Type:</strong> {policy.healthDetails.coverageType}</p>
            <p><strong>Plan Type:</strong> {policy.healthDetails.coverageOption}</p>
          </Col>
          <Col md={4}>
            <p><strong>Coverage Limit:</strong> KES {policy.healthDetails.coverageLimit?.toLocaleString()}</p>
            <p><strong>Premium Amount:</strong> KES {policy.healthDetails.premiumAmount?.toLocaleString()}</p>
          </Col>
          <Col md={4}>
            <p><strong>Payment Frequency:</strong> {policy.healthDetails.premiumFrequency}</p>
            <p><strong>Payment Methods:</strong> {policy.healthDetails.paymentMethods}</p>
          </Col>
        </Row>
      </Col>
    </Row>

    {/* Exclusions & Network Providers */}
    <Row className="mb-4">
      <Col md={6}>
        <h6>Exclusions</h6>
        <p>{policy.healthDetails.exclusions}</p>
      </Col>
      <Col md={6}>
        <h6>Network Providers</h6>
        <ul>
          {policy.healthDetails.networkProviders?.map((provider, index) => (
            <li key={index}>{provider}</li>
          ))}
        </ul>
      </Col>
    </Row>

    {/* Additional Benefits */}
    <Row className="mb-4">
      <Col>
        <h6>Additional Benefits</h6>
        <Row>
          <Col md={3}>
            <p><strong>Wellness:</strong> {policy.healthDetails.additionalBenefitsWellness}</p>
          </Col>
          <Col md={3}>
            <p><strong>Ambulance:</strong> {policy.healthDetails.additionalBenefitsAmbulance}</p>
          </Col>
          <Col md={3}>
            <p><strong>Dental:</strong> {policy.healthDetails.additionalBenefitsDental}</p>
          </Col>
          <Col md={3}>
            <p><strong>Mental Health:</strong> {policy.healthDetails.additionalBenefitsMental}</p>
          </Col>
        </Row>
      </Col>
    </Row>
  </div>
)}



          {/* Student Details Section */}
          {policy.type === 'STUDENT_ATTACHMENT' && policy.studentDetails && (
            <div className="mt-4">
              <h5 className="text-secondary border-bottom pb-2">Student Information</h5>
              <Row>
                <Col md={4}>
                  <p><strong>Student Name:</strong> {policy.studentDetails.studentName}</p>
                </Col>
                <Col md={4}>
                  <p><strong>National ID:</strong> {policy.studentDetails.nationalId}</p>
                </Col>
                <Col md={4}>
                  <p><strong>Admission No.:</strong> {policy.studentDetails.admissionNumber}</p>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={6}>
                  <p><strong>School:</strong> {policy.studentDetails.school}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Course:</strong> {policy.studentDetails.course}</p>
                </Col>
              </Row>
            </div>
          )}

          <div className="mt-4 d-flex justify-content-end gap-2">
            <Button variant="outline-primary" onClick={() => window.history.back()}>
              Back to List
            </Button>
            <Button variant="primary" onClick={() => window.print()}>
              Print Policy
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PolicyDetails;
