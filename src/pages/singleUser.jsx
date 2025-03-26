import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spinner, Container, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`https://insurance-v1-api.onrender.com/api/insurance/users/${id}`)
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch user details");
        setLoading(false);
        Swal.fire("Error", "Failed to fetch user details", "error");
      });
  }, [id]);

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Deleting this user will also remove all related policies and associated data! This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`https://insurance-v1-api.onrender.com/api/insurance/users/${id}`)
          .then(() => {
            Swal.fire("Deleted!", "User has been deleted.", "success");
            navigate("/");
          })
          .catch(() => {
            Swal.fire("Error!", "Failed to delete user.", "error");
          });
      }
    });
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-5 text-danger">
        {error}
      </div>
    );

  return (
    <Container className="my-5">
      <Card className="shadow-lg">
        <Card.Header className="bg text-white">
          <h3 className="mb-0 text-white ">Policy  Holder  Credentials / User Details</h3>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <p>
                <strong   style={{   color:  "red" }} > System id ! :</strong> {user.id}
              </p>
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Address:</strong> {user.address}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>

              <p>
                <strong>Role:</strong> {user.role}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Phone:</strong> {user.phone}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <p>
                <strong>ID Number:</strong> {user.idNumber}
              </p>

              <p>
                <strong>Gender:</strong> {user.gender}
              </p>


              <p>
                <strong>Occupation:</strong> {user.occupation}
              </p>  
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <p>
                <strong>KRA PIN:</strong> {user.kraPin}
              </p>
            </Col>
            
            <Col md={6}>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-3">
            <Button variant="secondary" onClick={() => navigate("/")}>
              Back to List
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete User
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserDetails;
