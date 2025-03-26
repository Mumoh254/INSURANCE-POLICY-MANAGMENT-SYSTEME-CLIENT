import React, { useEffect, useState, useRef } from "react";
import { Badge, Button, Container, Row, Col, Alert, Modal, Spinner } from "react-bootstrap";
import { io } from "socket.io-client";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUser } from "@fortawesome/free-solid-svg-icons";
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
    soundEnabled: true,
  });

  const audioRef = useRef(null);
  const socketRef = useRef(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 1.0;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
      setState((prev) => ({ ...prev, socketConnected: true }));
    });

    socketRef.current.on("disconnect", () => {
      setState((prev) => ({ ...prev, socketConnected: false }));
    });

    const handleNewNotification = (notification) => {
      if (!notification?.id) return;

      if (stateRef.current.soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
          console.error("Audio playback failed:", error);
          Swal.fire({
            icon: "info",
            title: "Sound blocked",
            text: "Please interact with the page to enable notification sounds",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
          });
        });
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "NEW NOTIFICATION ALERT!",
        html: `<small>${notification.message}</small>`,
        showConfirmButton: false,
        timer: 7000,
        timerProgressBar: true,
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

  const NotificationItem = ({ notification, index }) => {
    const styleConfig = notificationStyles[notification.type] || notificationStyles.NEW;
    return (
      <div
        className="mb-3"
        onClick={() => setState((prev) => ({
          ...prev,
          selectedNotification: notification,
          showDetailModal: true,
        }))}
      >
        <div
          className="rounded p-2 p-md-3 position-relative shadow-sm"
          style={{
            width: "100%",
            backgroundColor: styleConfig.bg,
            border: `1px solid ${styleConfig.color}50`,
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Badge pill style={{ backgroundColor: styleConfig.color, color: "white", fontSize: "0.75rem" }}>
              {notification.type}
            </Badge>
            <small className="text-muted" style={{ fontSize: "0.8rem" }}>
              {new Date(notification.createdAt).toLocaleTimeString()}
            </small>
          </div>
          <div style={{ color: styleConfig.color, fontSize: "0.9rem" }}>
            {notification.message}
          </div>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="text-muted" style={{ fontSize: "0.8rem" }}>
              <FontAwesomeIcon icon={faUser} className="me-1" />
              {notification.creator?.name || "System"}
            </div>
            <Button
              variant="link"
              size="sm"
              className="text-danger p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(notification.id);
              }}
              disabled={state.deletingIds.includes(notification.id)}
            >
              {state.deletingIds.includes(notification.id) ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <FontAwesomeIcon icon={faTrash} />
              )}
            </Button>
          </div>
          {!notification.isRead && (
            <div className="position-absolute top-0 end-0 mt-1 me-1">
              <Badge pill bg="success" style={{ fontSize: "0.6rem" }}>
                New
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Container fluid className="vh-100 bg-light p-3">
      <Row className="mb-3">
        <Col>
          <h2 className="d-flex justify-content-between align-items-center" style={{ fontSize: "1.5rem" }}>
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
          <Button variant="primary" size="sm" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        </Col>
      </Row>

      {state.error && <Alert variant="danger" className="py-2">{state.error}</Alert>}

      <Row>
        <Col md={12}>
          {state.loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" size="sm" />
            </div>
          ) : (
            <div className="bg-white rounded-3 shadow-sm p-2" style={{ 
              maxHeight: "75vh", 
              overflowY: "auto",
              scrollbarWidth: "thin"
            }}>
              {state.notifications.map((notification, index) => (
                <NotificationItem key={notification.id} notification={notification} index={index} />
              ))}
              {state.notifications.length === 0 && (
                <div className="text-center text-muted py-3" style={{ fontSize: "0.9rem" }}>
                  No notifications available
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>

      <Modal
        show={state.showDetailModal}
        onHide={() => setState((prev) => ({ ...prev, showDetailModal: false }))}
        size="lg"
      >
        <Modal.Header closeButton className="p-3">
          <Modal.Title style={{ fontSize: "1.25rem" }}>Notification Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          {state.selectedNotification && (
            <>
              <p className="mb-2">
                <strong>Type:</strong> {state.selectedNotification.type}
              </p>
              <p className="mb-2">
                <strong>Received:</strong>{" "}
                {new Date(state.selectedNotification.createdAt).toLocaleString()}
              </p>
              <p className="mb-0" style={{ fontSize: "1rem" }}>
                <strong>Message:</strong> {state.selectedNotification.message}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="p-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setState((prev) => ({ ...prev, showDetailModal: false }))}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Notifications;