import React, { useEffect, useState } from 'react';
import { 
  Table, Button, Badge, Spinner, Alert, Modal, Form, Pagination, InputGroup, Card 
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { getCachedData } from '../utils/catche-utils';

const API_URL = 'https://insurance-v1-api.onrender.com/api/insurance';
const TAX_RATE = 0.00;
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100];

const Policies = () => {
  const [state, setState] = useState({
    policies: [],
    loading: true,
    error: null,
    users: [],
    filterStatus: 'all',
    currentPage: 1,
    itemsPerPage: 5,
    searchTerm: ''
  });
  const [receiptData, setReceiptData] = useState({
    show: false,
    policy: null,
    taxAmount: 0,
    totalAmount: 0
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  // Track window size changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Modified data fetching with caching
        const [policiesData, usersData] = await Promise.all([
          getCachedData(`${API_URL}/all-policies`),
          getCachedData(`${API_URL}/users`)
        ]);

        setState(prev => ({
          ...prev,
          policies: policiesData?.data || [],
          users: usersData?.users || [],
          loading: false,
          error: !policiesData || !usersData ? 'Failed to fetch data' : null
        }));

      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error.message, 
          loading: false 
        }));
      }
    };

    fetchData();
  }, []);


  const getStatusBadge = (policy) => {
    const now = new Date();
    const start = new Date(policy.startDate);
    const end = new Date(policy.endDate);
    
    if (now < start) return <Badge className='bg-up'>UPCOMING</Badge>;
    if (now > end) return <Badge className='bg-red'>EXPIRED</Badge>;
    return <Badge className='bg-green'>ACTIVE</Badge>;
  };

  const filteredPolicies = state.policies.filter(policy => {
    const statusText = getStatusBadge(policy).props.children;
    const matchesStatus = state.filterStatus === 'all' || statusText === state.filterStatus;
    const matchesSearch = policy.policyNumber.toLowerCase().includes(state.searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedPolicies = [...filteredPolicies].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const indexOfLastItem = state.currentPage * state.itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - state.itemsPerPage;
  const currentItems = sortedPolicies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPolicies.length / state.itemsPerPage);

  const handleDeletePolicy = async (policyId) => {
    try {
      const response = await fetch(`${API_URL}/${policyId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete policy');
      
      setState(prev => ({
        ...prev,
        policies: prev.policies.filter(p => p.id !== policyId)
      }));
      Swal.fire('Deleted!', 'Policy has been deleted.', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handlePrintReceipt = (policy) => {
    if (!policy || typeof policy.amount !== 'number' || policy.amount <= 0) {
      Swal.fire('Error', 'Invalid policy amount for receipt generation', 'error');
      return;
    }
    const amount = Number(policy.amount) || 0;
    const taxAmount = amount * TAX_RATE;
    const totalAmount = amount + taxAmount;
    setReceiptData({
      show: true,
      policy,
      taxAmount,
      totalAmount
    });
  };

  const printReceipt = () => {
    if (!receiptData.policy?.amount) {
      Swal.fire('Error', 'Invalid policy data for printing', 'error');
      return;
    }
    // For demonstration, this function is left empty.
  };

  return (
    <div className="p-4">
        <OfflineToast />
      <div className="d-flex justify-content-between align-items-center mb-4 exel-container">
        <h2 className="color">Insurance Policies Management</h2>
        <div>
          <Button variant="success" onClick={() => {
            const worksheet = XLSX.utils.json_to_sheet(sortedPolicies.map(policy => ({
              'Policy Number': policy.policyNumber,
              'Type': policy.type,
              'Holder': state.users.find(u => u.id === policy.userId)?.name,
              'Coverage': policy.amount,
              'Premium': policy.premium,
              'Start Date': format(new Date(policy.startDate), 'yyyy-MM-dd'),
              'End Date': format(new Date(policy.endDate), 'yyyy-MM-dd'),
              'Status': getStatusBadge(policy).props.children
            })));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Policies');
            XLSX.writeFile(workbook, `policies_${Date.now()}.xlsx`);
          }} className="me-2 exel bg-green">
            Export to Excel
          </Button>
          <Button className="bg" onClick={() => navigate('/create-admin')}>
            Create Admin
          </Button>
        </div>
      </div>

      {state.loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading policies...</p>
        </div>
      ) : state.error ? (
        <Alert variant="danger">{state.error}</Alert>
      ) : (
        <>
          <div className="d-flex flex-column flex-md-row justify-content-between mb-3">
            <InputGroup className="w-100 w-md-50 me-3 mb-2 mb-md-0">
              <Form.Control
                placeholder="Search by policy number..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
            </InputGroup>
            <div className="d-flex align-items-center gap-3">
              <Form.Select 
                value={state.filterStatus}
                onChange={e => setState(prev => ({ ...prev, filterStatus: e.target.value }))}
                className="w-100"
              >
                <option value="all">All Policies</option>
                <option value="ACTIVE">Active</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="EXPIRED">Expired</option>
              </Form.Select>
              <Form.Select 
                value={state.itemsPerPage}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  itemsPerPage: Number(e.target.value),
                  currentPage: 1
                }))}
                style={{ width: '120px' }}
              >
                {ITEMS_PER_PAGE_OPTIONS.map(option => (
                  <option key={option} value={option}>Show {option}</option>
                ))}
              </Form.Select>
              <Pagination>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item 
                    key={i + 1}
                    active={i + 1 === state.currentPage}
                    onClick={() => setState(prev => ({ ...prev, currentPage: i + 1 }))}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </div>

          {isMobile ? (
            // Mobile Card View
            <div className="d-flex flex-column gap-3">
              {currentItems.map(policy => (
                <Card key={policy.id} className="shadow-sm">
                  <Card.Body>
                    <Card.Title>{policy.policyNumber}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{policy.type}</Card.Subtitle>
                    <Card.Text>
                      Holder: <Link to={`/users/${policy.userId}`} className="text-decoration-none">{state.users.find(u => u.id === policy.userId)?.name || 'Unknown User'}</Link><br/>
                      Coverage: KES {policy.amount}<br/>
                      Period: {format(new Date(policy.startDate), 'dd/MM/yyyy')} - {format(new Date(policy.endDate), 'dd/MM/yyyy')}<br/>
                      Status: {getStatusBadge(policy)}
                    </Card.Text>
                    <div className="d-flex gap-2">
                      <Button variant="warning" size="sm" onClick={() => navigate(`/policies/${policy.id}`)}>View</Button>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/edit-policy/${policy.id}`)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={async () => {
                        const result = await Swal.fire({
                          title: 'Are you sure?',
                          text: "You won't be able to revert this!",
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#3085d6',
                          cancelButtonColor: '#d33',
                          confirmButtonText: 'Yes, delete it!'
                        });
                        if (result.isConfirmed) {
                          handleDeletePolicy(policy.id);
                        }
                      }}>Delete</Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            // Laptop Table View
            <Table striped bordered hover responsive className="bg-white shadow-sm">
              <thead className="bg-primary">
                <tr>
                  <th>Policy Number #</th>
                  <th>Type</th>
                  <th>Holder</th>
                  <th>Coverage ^</th>
                  <th>Period *</th>
                  <th>Status !</th>
                  <th>Actions ?</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(policy => (
                  <tr key={policy.id}>
                    <td>{policy.policyNumber}</td>
                    <td>{policy.type}</td>
                    <td>
                      <Link to={`/users/${policy.userId}`} className="text-decoration-none color fw-bolder ">
                        {state.users.find(u => u.id === policy.userId)?.name || 'Unknown User'}
                      </Link>
                    </td>
                    <td>KES {policy.amount}</td>
                    <td>
                      {format(new Date(policy.startDate), 'dd/MM/yyyy')} - {format(new Date(policy.endDate), 'dd/MM/yyyy')}
                    </td>
                    <td>{getStatusBadge(policy)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button variant="warning" size="sm" onClick={() => navigate(`/policies/${policy.id}`)}>
                          View
                        </Button>
                        <Button size="sm" onClick={() => navigate(`/edit-policy/${policy.id}`)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={async () => {
                          const result = await Swal.fire({
                            title: 'Are you sure?',
                            text: "You won't be able to revert this!",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, delete it!'
                          });
                          if (result.isConfirmed) {
                            handleDeletePolicy(policy.id);
                          }
                        }}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}

      <Modal show={receiptData.show} onHide={() => setReceiptData(prev => ({ ...prev, show: false }))}>
        <Modal.Header closeButton>
          <Modal.Title>Receipt Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {receiptData.policy && (
            <div className="receipt-preview">
              <div className="text-center mb-3">
                <h5>WELT TALLIS INSURANCE</h5>
                <p className="mb-0">123 Business Street, Nairobi</p>
                <p className="mb-0">Tel: +254740045355</p>
              </div>
              <hr />
              <p className="mb-1">Policy: {receiptData.policy.policyNumber}</p>
              <p className="mb-1">Total: KES {receiptData.totalAmount.toFixed(2)}</p>
              <p className="mb-1">Date: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setReceiptData(prev => ({ ...prev, show: false }))}>
            Cancel
          </Button>
          <Button variant="primary" onClick={printReceipt}>
            Print Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Policies;
