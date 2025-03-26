import React, { useState, useEffect } from "react";
import { PieChart, LineChart, ColumnChart } from "react-chartkick";
import "chartkick/chart.js";
import { Chart, registerables } from "chart.js";
import { Container, Row, Col, Card, Spinner, Modal, Button, ListGroup, Badge } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Form } from "react-bootstrap";

Chart.register(...registerables, ChartDataLabels);

const Charts = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    policyStatus: {},
    revenue: { total: {}, providers: {}, frequencies: {} },
    agents: [],
    insuranceTypes: {},
    paymentFrequency: {},
    claims: {},
    policies: [],
    revenueMeta: {},
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [showFrequencyLegend, setShowFrequencyLegend] = useState(true);

  const CHART_COLORS = ["#ff3b30", "#5856d6", "#ffcc00", "#ff2d55", "#007aff"];
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Add this function to get available years from the data
  const getAvailableYears = () => {
    const years = new Set();
    Object.keys(dashboardData.revenue.total).forEach(monthYear => {
      const year = monthYear.split(' ')[1];
      if (year) years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  };
  
  const parseMonth = (monthStr) => {
    const [month, year] = monthStr.split(' ');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return new Date(year, months.indexOf(month));
  };

  const processPolicyStatus = (policies) =>
    policies?.reduce((acc, { status }) => {
      const normalizedStatus = status.toUpperCase(); // Normalize status values
      acc[normalizedStatus] = (acc[normalizedStatus] || 0) + 1;
      return acc;
    }, {}) || {};

  const processRevenue = (revenueData) => {
    const sorted = [...(revenueData || [])].sort((a, b) => 
      parseMonth(a.month) - parseMonth(b.month));
    
    return sorted.reduce((acc, { month, total, providers, frequencies }) => {
      acc.total[month] = total;
      
      providers?.forEach(([provider, amount]) => {
        acc.providers[provider] = acc.providers[provider] || {};
        acc.providers[provider][month] = amount;
      });
      
      frequencies?.forEach(([frequency, amount]) => {
        acc.frequencies[frequency] = acc.frequencies[frequency] || {};
        acc.frequencies[frequency][month] = amount;
      });
      
      return acc;
    }, { total: {}, providers: {}, frequencies: {} });
  };

  const processAgents = (agents) =>
    agents?.map(({ company, policiesCount }) => [company, policiesCount]) || [];

  const processInsuranceTypes = (policies) =>
    policies?.reduce((acc, { type, insuranceType }) => {
      const key = type === "CAR" ? insuranceType : type;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}) || {};

  const processPaymentFrequency = (policies) =>
    policies?.reduce((acc, { paymentFrequency }) => {
      acc[paymentFrequency] = (acc[paymentFrequency] || 0) + 1;
      return acc;
    }, {}) || {};

  const processClaims = (users) =>
    users?.reduce((acc, { policies = [] }) => {
      policies.forEach(({ type }) => {
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    }, {}) || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policiesRes, usersRes, revenueRes, agentsRes] = await Promise.all([
          axios.get("https://insurance-v1-api.onrender.com/api/insurance/all-policies"),
          axios.get("https://insurance-v1-api.onrender.com/api/insurance/users"),
          axios.get("https://insurance-v1-api.onrender.com/api/insurance/revenue"),
          axios.get("https://insurance-v1-api.onrender.com/api/insurance/agents"),
        ]);

        setDashboardData({
          policyStatus: processPolicyStatus(policiesRes.data?.data),
          revenue: processRevenue(revenueRes.data?.data),
          agents: processAgents(agentsRes.data?.data),
          insuranceTypes: processInsuranceTypes(policiesRes.data?.data),
          paymentFrequency: processPaymentFrequency(policiesRes.data?.data),
          claims: processClaims(usersRes.data?.users),
          policies: policiesRes.data?.data || [],
          revenueMeta: revenueRes.data?.meta || {},
        });

    

        setLoading(false);
      } catch (error) {
        Swal.fire("Error", "Failed to load dashboard data", "error");
        console.error("API Fetch Error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChartClick = async (item, type) => {
    if (!item) return;
    setLoadingPolicies(true);
    setShowModal(true);

    try {
      let filteredPolicies = [];
      if (["status", "insuranceType", "agent"].includes(type)) {
        const response = await axios.get(`/api/policies`, {
          params: { filter: type, value: encodeURIComponent(item[0]) },
        });
        filteredPolicies = response.data?.slice(0, 100) || [];
   
      } else {
        filteredPolicies = dashboardData.policies.filter(policy => {
          const policyDate = new Date(policy.startDate);
          const policyMonth = policyDate.toLocaleString('default', { 
            month: 'short', year: 'numeric' 
          });
          
          switch(type) {
            case 'revenue':
              return policyMonth === item[0];
            case 'provider':
              return policy.insuranceProvider === item[0];
            case 'paymentFrequency':
              return policy.paymentFrequency === item[0];
            default:
              return true;
          }
        }).slice(0, 100);
      }

      setSelectedData({
        label: item[0],
        value: item[1],
        policies: filteredPolicies,
      });
    } catch (error) {
      console.error("Policy fetch error:", error);
      Swal.fire("Error", "Failed to load policy details", "error");
    } finally {
      setLoadingPolicies(false);
    }
  };

  const renderModalContent = () => {
    if (!selectedData) return <p>No data selected</p>;

    return (
      <div>
        <h5>{selectedData.label}</h5>
        <p className="mb-3">Total: {selectedData.value} records</p>

        {loadingPolicies ? (
          <Spinner animation="border" />
        ) : selectedData.policies?.length > 0 ? (
          <ListGroup style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {selectedData.policies.map((policy) => (
              <ListGroup.Item key={policy.id}>
                <div className="d-flex justify-content-between">
                  <div>
                    <strong>{policy.policyNumber}</strong> - {policy.policyName}
                  </div>
                  <Badge bg="info">{policy.status}</Badge>
                </div>
                <small className="text-muted">
                  {policy.insuranceProvider} - {policy.type} - {policy.paymentFrequency}
                </small>
                <div className="text-end">
                  <small>
                    {new Date(policy.startDate).toLocaleDateString()} - 
                    {new Date(policy.endDate).toLocaleDateString()}
                  </small>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted">No records found.</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <h2 className="text-start p-3 mb-5 bg text-white fw-bold">Welcome To  Insurance Analytics Dashboard ..</h2>

      <Row className="g-4">
        {/* Revenue Section */}
        <Col xl={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-4">
                Monthly Revenue ({dashboardData.revenueMeta.currency})
              </h5>
              <LineChart
                data={dashboardData.revenue.total}
                colors={[CHART_COLORS[0]]}
                suffix={dashboardData.revenueMeta.currency}
                library={{
                  onClick: (e, elements) => {
                    if (elements?.length > 0) {
                      const chart = e.chart;
                      const pointIndex = elements[0].index;
                      const month = chart.data.labels[pointIndex];
                      const value = chart.data.datasets[0].data[pointIndex];
                      handleChartClick([month, value], 'revenue');
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>


        

        <Col xl={6}>
  <Card className="h-100 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="card-title mb-0">
          Payment Frequency Revenue ({dashboardData.revenueMeta.currency})
        </h5>
        <Button 
          variant="link" 
          size="sm"
          onClick={() => setShowFrequencyLegend(prev => !prev)}
        >
          {showFrequencyLegend ? 'Hide Legend' : 'Show Legend'}
        </Button>
      </div>
      
      {Object.keys(dashboardData.revenue.frequencies).length === 0 ? (
        <div className="text-center text-muted py-4">
          No payment frequency data available
        </div>
      ) : (
        <LineChart
          data={Object.entries(dashboardData.revenue.frequencies).map(([frequency, data]) => ({
            name: frequency.charAt(0).toUpperCase() + frequency.slice(1).toLowerCase(),
            data
          }))}
          colors={CHART_COLORS}
          suffix={dashboardData.revenueMeta.currency}
          library={{
            plugins: {
              legend: {
                display: showFrequencyLegend,
                position: 'bottom',
                labels: { boxWidth: 18, padding: 40 }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.dataset.label || '';
                    const value = context.raw || 0;
                    return `${label}: ${dashboardData.revenueMeta.currency}${value.toLocaleString()}`;
                  }
                }
              }
            },
            interaction: {
              mode: 'nearest',
              intersect: false
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `${dashboardData.revenueMeta.currency}${value.toLocaleString()}`
                }
              }
            },
            elements: {
              line: {
                tension: 0.4,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.9)'
              },
              point: {
                radius: 4,
                hoverRadius: 6
              }
            },
            onClick: (e, elements) => {
              if (elements?.length > 0) {
                const { datasetIndex, index } = elements[0];
                const frequency = e.chart.data.datasets[datasetIndex].label;
                const value = e.chart.data.datasets[datasetIndex].data[index];
                handleChartClick([frequency, value], 'paymentFrequency');
              }
            }
          }}
        />
      )}
    </Card.Body>
  </Card>
</Col>
        {/* Policy Status */}
        <Col xl={4} lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-4">Policy Status Distribution</h5>
              <PieChart
                data={dashboardData.policyStatus}
                colors={CHART_COLORS}
                bar
                library={{ onClick: (e, item) => handleChartClick(item, "status") }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Insurance Types */}
        <Col xl={4} lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-4">Insurance Type Distribution</h5>
              <PieChart
                data={dashboardData.insuranceTypes}
                colors={CHART_COLORS}
                bar
                library={{ onClick: (e, item) => handleChartClick(item, "insuranceType") }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Agent Performance */}
        <Col xl={4} lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-4">Agent Performance</h5>
              <ColumnChart
                data={dashboardData.agents}
                colors={CHART_COLORS}
                library={{ 
                  onClick: (e, item) => handleChartClick(item, "agent"),
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Payment Frequency */}
        <Col xl={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-5">Payment Frequency Distribution</h5>
              <ColumnChart
                data={dashboardData.paymentFrequency}
                colors={CHART_COLORS}
                library={{
                  onClick: (e, item) => handleChartClick(item, "paymentFrequency"),
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Revenue by Providers */}
        <Col xl={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-4">
                Revenue by Providers ({dashboardData.revenueMeta.currency})
              </h5>
              <LineChart
                data={Object.entries(dashboardData.revenue.providers).map(([provider, data]) => ({
                  name: provider,
                  data
                }))}
                colors={CHART_COLORS}
                suffix={dashboardData.revenueMeta.currency}
                library={{
                  onClick: (e, elements) => {
                    if (elements?.length > 0) {
                      const chart = e.chart;
                      const datasetIndex = elements[0].datasetIndex;
                      const pointIndex = elements[0].index;
                      const provider = chart.data.datasets[datasetIndex].label;
                      const value = chart.data.datasets[datasetIndex].data[pointIndex];
                      handleChartClick([provider, value], 'provider');
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col xl={12}>
  <Card className="h-100 shadow-sm   ">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="card-title m-0">
          Monthly Revenue Breakdown ({dashboardData.revenueMeta.currency})
        </h5>
        <Form.Select 
          style={{ width: '120px' }}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {getAvailableYears().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Form.Select>
      </div>
      <ColumnChart
        data={Object.entries(dashboardData.revenue.total)
          .filter(([monthYear]) => monthYear.endsWith(selectedYear))
          .sort((a, b) => {
            // Proper month parsing with full month names
            const parseDate = (str) => {
              const [month, year] = str.split(' ');
              return new Date(`${month} 1, ${year}`);
            };
            return parseDate(a[0]) - parseDate(b[0]);
          })
          .map(([monthYear, amount]) => {
            // Extract and format month abbreviation
            const [monthName, year] = monthYear.split(' ');
            const date = new Date(`${monthName} 1, ${year}`);
            return [
              date.toLocaleString('default', { month: 'short' }), // Jan, Feb, etc
              amount
            ];
          })}
        colors={['#ffcc00', '#5856d6', '#ffcc00', '#96CEB4', '#007aff', '#ff2d55',
                '#D4A5A5', '#88D8B0', '#007aff', '#B8A9C9', '#5BC8AC', '#ff3b30']}
        suffix={dashboardData.revenueMeta.currency}
        library={{
          plugins: {
            datalabels: {
              display: true,
              color: "#000000",
              anchor: "end",
              align: "top",
              formatter: (value) => value.toLocaleString()
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Revenue" },
              ticks: { callback: (value) => value.toLocaleString() }
            },
            x: {
              title: { display: true, text: "Months" },
              ticks: { 
                // Display proper month abbreviations
                callback: (value, index, values) => {
                  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return monthLabels[index] || value;
                }
              }
            }
          },
          elements: {
            bar: {
              backgroundColor: (context) => {
                // Consistent color mapping by month index
                const monthIndex = context.dataIndex;
                const hue = (monthIndex * 30) % 360;
                return `hsl(${hue}, 100%, 100%)`;
              },
              borderWidth: 20,
              borderRadius: 3,
              borderColor: '#333',
              hoverBorderColor: '#666'
            }
          },
          onClick: (e, elements) => {
            if (elements.length > 0) {
              const chart = e.chart;
              const index = elements[0].index;
              const monthAbbr = chart.data.labels[index];
              const monthIndex = chart.data.labels.indexOf(monthAbbr);
              const fullMonth = new Date(selectedYear, monthIndex).toLocaleString('default', { month: 'long' });
              handleChartClick([`${fullMonth} ${selectedYear}`, chart.data.datasets[0].data[index]], 'revenue');
            }
          }
        }}
      />
    </Card.Body>
  </Card>
</Col>
      </Row>

      {/* Policy Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>{selectedData?.label} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderModalContent()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Charts;