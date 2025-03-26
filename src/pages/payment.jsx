import { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Alert, Modal, Form, Row, Col, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

const API_URL = 'https://insurance-v1-api.onrender.com/api/insurance/policies';
const TAX_RATE = 0.16;
const ITEMS_PER_PAGE_OPTIONS = [ 5  , 10, 25,  40  , 50, 100];


const TIME_FILTER_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '1week', label: 'Last 1 Week' },
  { value: '4weeks', label: 'Last 4 Weeks' },
  { value: '1month', label: 'Last 1 Month' },
  { value: 'this_year', label: 'This Year' }
];
const PolicyList = () => {
  const [state, setState] = useState({
    policies: [],
    loading: true,
    error: null,
    showModal: false,
    currentPolicy: null,
    users: [],
    insuranceTypes: ['CAR', 'STUDENT_ATTACHMENT', 'HEALTHCARE'],
    filterStatus: 'all',
    currentPage: 1,
    itemsPerPage: 10
  });

  const [formData, setFormData] = useState({
    policyNumber: '',
    policyType: 'CAR',
    coverageAmount: '',
    startDate: '',
    endDate: '',
    premium: '',
    userId: '',
    vin: '',
    vehicleModel: '',
    healthCategory: '',
    dependents: 0,
    insuranceProvider: 'BRITAM',
    paymentFrequency: 'MONTHLY'
  });

  const [receiptData, setReceiptData] = useState({
    show: false,
    policy: null,
    taxAmount: 0,
    totalAmount: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policiesRes, usersRes] = await Promise.all([
          fetch(API_URL),
          fetch('http://localhost:8000/api/insurance/users')
        ]);

        if (!policiesRes.ok || !usersRes.ok) throw new Error('Failed to fetch data');
   
        const policiesData = await policiesRes.json();
        const usersData = await usersRes.json();

        setState(prev => ({
          ...prev,
          policies: policiesData.data,
          users: usersData.users,
          loading: false
        }));
      } catch (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
      }
    };

    fetchData();
  }, []);

  // Pagination calculations
  const indexOfLastItem = state.currentPage * state.itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - state.itemsPerPage;
  const currentItems = sortedPolicies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPolicies.length / state.itemsPerPage);

  const handlePagination = (pageNumber) => {
    setState(prev => ({ ...prev, currentPage: pageNumber }));
  };

  const handleItemsPerPageChange = (e) => {
    setState(prev => ({
      ...prev,
      itemsPerPage: Number(e.target.value),
      currentPage: 1
    }));
  };

  const getStatusBadge = (policy) => {
    const now = new Date();
    const start = new Date(policy.startDate);
    const end = new Date(policy.endDate);
    
    if (now < start) return <Badge bg="secondary">UPCOMING</Badge>;
    if (now > end) return <Badge bg="danger">EXPIRED</Badge>;
    return <Badge bg="success">ACTIVE</Badge>;
  };

  const filteredPolicies = state.policies.filter(policy => {
    if (state.filterStatus === 'all') return true;
    const status = getStatusBadge(policy).props.children;
    return status === state.filterStatus;
  });

  const sortedPolicies = [...filteredPolicies].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );


  const getTimeFilterRange = () => {
    const now = new Date();
    switch (state.timeFilter) {
      case '24h': return { start: subDays(now, 1), end: now };
      case '1week': return { start: subDays(now, 7), end: now };
      case '4weeks': return { start: subDays(now, 28), end: now };
      case '1month': return { start: subMonths(now, 1), end: now };
      case 'this_year': return { start: startOfYear(now), end: now };
      default: return null;
    }
  };


  

  const exportToExcel = () => {
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

    const printContent = `
      <html>
        <head>
          <title>Receipt ${receiptData.policy.policyNumber}</title>
          <style>
            @media print {
              body { 
                width: 80mm;
                margin: 0;
                padding: 2mm;
                font-family: 'Monospace', sans-serif;
                font-size: 12px;
              }
              .header { text-align: center; margin-bottom: 3mm; }
              .barcode { font-family: 'Libre Barcode 128', cursive; font-size: 24px; }
              .divider { border-top: 1px dashed #000; margin: 5mm 0; }
              table { width: 100%; margin: 2mm 0; }
              td { padding: 1mm 0; }
              .right { text-align: right; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="bold">WELT TALLIS INSURANCE</div>
            <div>123 Business Street, Nairobi</div>
            <div>Tel: +254740045355</div>
            <div class="divider"></div>
          </div>

          <table>
            <tr><td colspan="2" class="center bold">INSURANCE RECEIPT</td></tr>
            <tr><td>Policy No:</td><td class="right">${receiptData.policy.policyNumber}</td></tr>
            <tr><td>Date:</td><td class="right">${format(new Date(), 'dd/MM/yy HH:mm')}</td></tr>
            <tr><td>Type:</td><td class="right">${receiptData.policy.type}</td></tr>
            <tr><td>Provider:</td><td class="right">${receiptData.policy.insuranceProvider}</td></tr>
            <tr class="divider"><td colspan="2"></td></tr>
            <tr><td>Amount:</td><td class="right">KES ${receiptData.policy.amount.toFixed(2)}</td></tr>
            <tr><td>Tax (16%):</td><td class="right">KES ${receiptData.taxAmount.toFixed(2)}</td></tr>
            <tr class="bold"><td>TOTAL:</td><td class="right">KES ${receiptData.totalAmount.toFixed(2)}</td></tr>
          </table>

          <div class="divider"></div>
          <div class="center barcode">*${receiptData.policy.policyNumber}*</div>
          <div class="center small">Thank you for your business!</div>
          <div class="center small">www.welt-tallis.co.ke</div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=340,height=500');
    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setReceiptData(prev => ({ ...prev, show: false }));
    }, 500);
  };



  const handleDelete = async (policyId) => {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${policyId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Deletion failed');
      
      setState(prev => ({
        ...prev,
        policies: prev.policies.filter(p => p.id !== policyId)
      }));
      
      Swal.fire('Success!', 'Policy deleted successfully.', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  // ... (keep existing handleEdit, handleFormSubmit, and renderModalContent functions)

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Insurance Policies Management</h2>
        <div>
          <Button variant="success" onClick={exportToExcel} className="me-2">
            Export to Excel
          </Button>
          <Button variant="primary" onClick={() => {
            setFormData({
              policyNumber: '',
              policyType: 'CAR',
              coverageAmount: '',
              startDate: '',
              endDate: '',
              premium: '',
              userId: '',
              vin: '',
              vehicleModel: '',
              healthCategory: '',
              dependents: 0,
              insuranceProvider: 'BRITAM',
              paymentFrequency: 'MONTHLY'
            });
            setState(prev => ({ ...prev, showModal: true, currentPolicy: null }));
          }}>
            Create New Policy
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
          <div className="d-flex justify-content-between mb-3">
            <Form.Select 
              value={state.filterStatus}
              onChange={e => setState(prev => ({ ...prev, filterStatus: e.target.value }))}
              className="w-25"
            >
              <option value="all">All Policies</option>
              <option value="ACTIVE">Active</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="EXPIRED">Expired</option>
            </Form.Select>
            <div className="d-flex align-items-center gap-2 flex-wrap">
          <Form.Select 
            value={state.timeFilter}
            onChange={e => setState(prev => ({ ...prev, timeFilter: e.target.value }))}
            className="w-auto"
          >
            {TIME_FILTER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>

          {/* Other filters */}
        </div>
            <div className="d-flex align-items-center gap-3">
              <Form.Select 
                value={state.itemsPerPage}
                onChange={handleItemsPerPageChange}
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
                    onClick={() => handlePagination(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </div>

          <Table striped bordered hover responsive className="bg-white shadow-sm">
            <thead className="bg-light">
              <tr>
                <th>Policy #</th>
                <th>Type</th>
                <th>Holder</th>
                <th>Coverage</th>
                <th>Period</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(policy => (
                <tr key={policy.id}>
                  <td>{policy.policyNumber}</td>
                  <td>{policy.type}</td>
                  <td>
                    <Link to={`/users/${policy.userId}`} className="text-decoration-none">
                      {state.users.find(u => u.id === policy.userId)?.name || 'Unknown User'}
                    </Link>
                  </td>
                  <td>KES {policy.amount}</td>
                  <td>
                    {format(new Date(policy.startDate), 'dd/MM/yyyy')} - {' '}
                    {format(new Date(policy.endDate), 'dd/MM/yyyy')}
                  </td>
                  <td>{getStatusBadge(policy)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button variant="info" size="sm" onClick={() => navigate(`/policies/${policy.id}`)}>
                        View
                      </Button>
                      <Button 
                        variant="warning" 
                        size="sm"
                        onClick={() => handleEdit(policy)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this policy?')) {
                            setState(prev => ({
                              ...prev,
                              policies: prev.policies.filter(p => p.id !== policy.id)
                            }));
                          }
                        }}
                      >
                        Delete
                      </Button>
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => handlePrintReceipt(policy)}
                      >
                        Print
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {/* Modals remain the same as previous implementation */}
      {/* ... */}

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

export default PolicyList;