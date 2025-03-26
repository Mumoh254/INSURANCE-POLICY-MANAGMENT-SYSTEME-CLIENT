import React, { useEffect, useState, useRef } from "react";
import { Badge, Button, Container, Row, Col, Alert, Modal, Spinner } from "react-bootstrap";
import { io } from "socket.io-client";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUser, faBellSlash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css"; 

const API_BASE_URL = "https://insurance-v1-api.onrender.com";
const SOCKET_URL = "https://insurance-v1-api.onrender.com";

const notificationStyles = {
  EXPIRED: { bg: "#ffeef0", color: "#cf222e" },
  NEW: { bg: "#e6f4ff", color: "#1a73e8" },
  REMINDER: { bg: "#fff8e6", color: "#e6a700" },
  TASK: { bg: "#e6f4ea", color: "#1e8e3e" },
};

const Notifications = () => {
  const [state, setState] = useState({
    notifications: [],
    unreadCount: 0,
    error: "",
    selectedNotification: null,
    showDetailModal: false,
    loading: true,
    socketConnected: false,
    deletingIds: [],
  });

  const socketRef = useRef(null);
  const stateRef = useRef(state);


  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`);
      const validNotifications = response.data.notifications
        .filter((n) => n?.id && n?.message)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setState((prev) => ({
        ...prev,
        notifications: validNotifications,
        unreadCount: validNotifications.filter((n) => !n.isRead).length,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: "Failed to load notifications", loading: false }));
    }
  };

  useEffect(() => {
    fetchNotifications();

    socketRef.current = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      setState((prev) => ({ ...prev, socketConnected: true }));
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
      setState((prev) => ({ ...prev, socketConnected: false }));
    });

    const handleNewNotification = (notification) => {
      console.log("handleNewNotification triggered with:", notification);
      if (!notification?.id) return;

      console.log("About to show Swal popup for notification:", notification.message);
      

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "NEW NOTIFICATION ALERT!",
        html: `
          <div style="font-size: 14px;">
            <p>${notification.message}</p>
            <p><strong>Policy:</strong> ${notification.policy.policyName}</p>
            <p><strong>User:</strong> ${notification.user.name}</p>
          </div>
        `,
        showConfirmButton: true,
        timer: 9000,
        timerProgressBar: true,
      }).then(() => {
        console.log("Swal popup closed");
      });
      

   
      setState((prev) => ({
        ...prev,
        notifications: [
          {
            ...notification,
            creator: notification.user || { name: "System", email: "N/A" },
            policy: notification.policy || { policyNumber: "N/A" },
          },
          ...prev.notifications,
        ],
        unreadCount: prev.unreadCount + (notification.isRead ? 0 : 1),
      }));
    };

    socketRef.current.on("new_notification", handleNewNotification);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("new_notification", handleNewNotification);
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleDelete = async (notificationId) => {
    const result = await Swal.fire({
      title: "Delete Notification?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;
    try {
      setState((prev) => ({ ...prev, deletingIds: [...prev.deletingIds, notificationId] }));
      await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`);
      await fetchNotifications();
    } catch (err) {
      Swal.fire("Error!", err.response?.data?.error || "Deletion failed", "error");
    } finally {
      setState((prev) => ({
        ...prev,
        deletingIds: prev.deletingIds.filter((id) => id !== notificationId),
      }));
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/mark-all-read`);
      await fetchNotifications();
    } catch (err) {
      Swal.fire("Error!", "Failed to mark all as read", "error");
    }
  };

  // Render 
  const NotificationItem = ({ notification, index }) => {
    const align = index % 2 === 0 ? "left" : "right";
    const styleConfig = notificationStyles[notification.type] || notificationStyles.NEW;
    return (
      <div
        className={`d-flex justify-content-${align} mb-4`}
        onClick={() =>
          setState((prev) => ({
            ...prev,
            selectedNotification: notification,
            showDetailModal: true,
          }))
        }
      >
        <div
          className="rounded p-3 position-relative shadow-sm"
          style={{
            width: "100%",
            maxWidth: "45%",
            backgroundColor: styleConfig.bg,
            marginLeft: align === "right" ? "auto" : "0",
            border: `1px solid ${styleConfig.color}50`,
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Badge pill style={{ backgroundColor: styleConfig.color, color: "white" }}>
              {notification.type}
            </Badge>
            <small className="text-muted">
              {new Date(notification.createdAt).toLocaleTimeString()}
            </small>
          </div>
          <div className="mb-2" style={{ color: styleConfig.color, fontSize: "1.1rem" }}>
            {notification.message}
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">
              <FontAwesomeIcon icon={faUser} className="me-1" />
              Created By: {notification.creator?.name || "System"}
            </div>
            <Button
              variant="link"
              size="sm"
              className="text-danger p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(notification.id);
              }}
              disabled={state.deletingIds && state.deletingIds.includes(notification.id)}
            >
              {state.deletingIds && state.deletingIds.includes(notification.id) ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <FontAwesomeIcon icon={faTrash} />
              )}
            </Button>
          </div>
          {!notification.isRead && (
            <div className="position-absolute top-0 end-0 mt-1 me-1">
              <Badge pill bg="success">
                New
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Container fluid className="vh-100 bg-light p-4">
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex justify-content-between align-items-center">
            Insurance Real-Time Notifications
            <div className="d-flex gap-2">
              <Badge pill bg="danger">
                {state.unreadCount}
              </Badge>
              <Badge pill bg={state.socketConnected ? "success" : "danger"}>
                {state.socketConnected ? "Live" : "Offline"}
              </Badge>
            </div>
          </h2>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col className="d-flex gap-2">
          <Button variant="primary" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        </Col>
      </Row>

      {state.error && <Alert variant="danger">{state.error}</Alert>}

      <Row>
        <Col md={12}>
          {state.loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="bg-white rounded-3 shadow-sm p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {state.notifications.map((notification, index) => (
                <NotificationItem key={notification.id} notification={notification} index={index} />
              ))}
              {state.notifications.length === 0 && (
                <div className="text-center text-muted py-4">No notifications available</div>
              )}
            </div>
          )}
        </Col>
      </Row>

      {/* Notification Detail Modal */}
      <Modal
        show={state.showDetailModal}
        onHide={() => setState((prev) => ({ ...prev, showDetailModal: false }))}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Notification Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {state.selectedNotification && (
            <>
              <h5 className="mb-3">Notification Info</h5>
              <p>
                <strong>Type:</strong> {state.selectedNotification.type}
              </p>
              <p>
                <strong>Received:</strong> {new Date(state.selectedNotification.createdAt).toLocaleString()}
              </p>
              <p style={{ fontSize: "1.1rem", fontWeight: "500" }}>
                <strong>Message:</strong> {state.selectedNotification.message}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setState((prev) => ({ ...prev, showDetailModal: false }))}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Notifications;
