import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Button, Form, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import { format, parseISO, isValid } from 'date-fns';
import { 
  FaCalendarCheck, FaTrash, 
  FaUsers, FaHandshake, FaTasks, FaExclamationCircle, FaFlagCheckered 
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const colorPalette = ['#ffcc00', '#88D8B0','#5856d6', '#007aff', '#ff2d55', '#B8A9C9', '#5BC8AC', '#ff3b30'];

const InsuranceCalendar = () => {
  const [state, setState] = useState({
    events: [],
    selectedDate: null,
    showModal: false,
    loading: true,
    showDetailModal: false,
    selectedEvent: null,
    users: [],
    formData: {
      title: '',
      description: '',
      start: '',
      end: '',
      reminderHours: [],
      type: 'MEETING',
      userId: ''
    }
  });

  const eventIcons = {
    MEETING: <FaUsers className="me-4" />,
    APPOINTMENT: <FaHandshake className="me-4" />,
    TASK: <FaTasks className="me-4" />,
    REMINDER: <FaExclamationCircle className="me-4" />,
    DEADLINE: <FaFlagCheckered className="me-4" />
  };

  useEffect(() => {
    let eventSource;
    const initializeCalendar = async () => {
      try {
        await Promise.all([fetchEvents(), fetchAdminUsers()]);
        eventSource = setupSSE();
      } catch (error) {
        showErrorAlert('Initialization Error', 'Failed to initialize calendar');
      }
    };

    initializeCalendar();
    return () => eventSource?.close();
  }, []);

  const showSuccessAlert = (title, text) => {
    Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const showErrorAlert = (title, text) => {
    Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#ff3b30'
    });
  };

  const formatDateSafe = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = parseISO(dateStr);
      return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm') : 'Invalid date';
    } catch {
      return 'Invalid date';
    }
  };

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get('https://insurance-v1-api.onrender.com/api/insurance/events/event');
      const safeEvents = data.map((event, index) => ({
        id: String(event.id),
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        extendedProps: {
          description: event.description || 'No description provided',
          reminderHours: event.reminderHours || [],
          type: event.type?.toUpperCase() || 'MEETING',
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          isCompleted: event.isCompleted,
          notifications: event.notifications || []
        },
        color: colorPalette[index % colorPalette.length],
        backgroundColor: `${colorPalette[index % colorPalette.length]}90`,
        user: event.user
      }));

      setState(prev => ({ ...prev, events: safeEvents, loading: false }));
      showSuccessAlert('Calendar Loaded', 'Events fetched successfully');
    } catch (error) {
      console.error('Event fetch error:', error);
      showErrorAlert('Loading Failed', 'Failed to fetch calendar events');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const { data } = await axios.get('https://insurance-v1-api.onrender.com/api/insurance/users');
      const adminUsers = data.users?.filter(user => user.role === 'ADMIN') || [];

      setState(prev => ({
        ...prev,
        users: adminUsers,
        formData: {
          ...prev.formData,
          userId: adminUsers.length > 0 ? adminUsers[0].id : prev.formData.parseInt(userId)
        }
      }));
    } catch (error) {
      console.error('Admin users fetch error:', error);
      showErrorAlert('User Fetch Failed', 'Failed to fetch admin users');
    }
  };

  const setupSSE = () => {
    try {
      const eventSource = new EventSource('/api/notifications/stream');
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
      };
      return eventSource;
    } catch (error) {
      console.error('SSE setup failed:', error);
      return null;
    }
  };

  const handleDateSelect = (selectInfo) => {
    setState(prev => ({
      ...prev,
      selectedDate: selectInfo.start,
      showModal: true,
      formData: {
        ...prev.formData,
        start: selectInfo.startStr,
        end: selectInfo.endStr
      }
    }));
  };

  const handleEventCreate = async (e) => {
    e.preventDefault();
    const { title, start, end, description } = state.formData;
    if (!title || !start || !end) {
      showErrorAlert('Missing Fields', 'Please fill all required fields');
      return;
    }

    try {
      const sanitizedData = {
        ...state.formData,
        reminderHours: state.formData.reminderHours
          .map(h => parseInt(h, 10))
          .filter(h => !isNaN(h))
      };

      const { data } = await axios.post('https://insurance-v1-api.onrender.com/api/insurance/event', sanitizedData);
    
      const newEvent = {
        id: String(data.id),
        title: data.title,
        start: data.start,
        end: data.end,
        extendedProps: {
          description: data.description,
          reminderHours: data.reminderHours,
          type: data.type,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isCompleted: data.isCompleted
        },
        color: colorPalette[state.events.length % colorPalette.length],
        backgroundColor: `${colorPalette[state.events.length % colorPalette.length]}20`,
        user: data.user
      };

      setState(prev => ({
        ...prev,
        events: [...prev.events, newEvent],
        showModal: false,
        formData: { 
          ...prev.formData, 
          title: '',
          description: '',
          reminderHours: [] 
        }
      }));
      showSuccessAlert('Event Created!', 'New calendar event added successfully');
    } catch (error) {
      console.error('Event creation failed:', error);
      showErrorAlert('Creation Failed', error.response?.data?.message || 'Failed to create event');
    }
  };

  const deleteEvent = async () => {
    if (!state.selectedEvent?.id) return;
    try {
      await axios.delete(`/api/events/${state.selectedEvent.id}`);
      setState(prev => ({
        ...prev,
        events: prev.events.filter(e => e.id !== state.selectedEvent?.id),
        showDetailModal: false,
        selectedEvent: null
      }));
      showSuccessAlert('Event Deleted', 'Event removed successfully');
    } catch (error) {
      console.error('Deletion error:', error);
      showErrorAlert('Deletion Failed', 'Failed to delete event');
    }
  };
  const EventContent = ({ event }) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const duration = end - start;
    const dayStart = new Date(start);
    dayStart.setHours(0,0,0,0);
    
    // Calculate position relative to day start
    const position = ((start - dayStart) / (24 * 60 * 60 * 1000)) * 100;
    const width = Math.min(100, (duration / (24 * 60 * 60 * 1000)) * 100);

    return (
      <div className="event-container" style={{
        position: 'absolute',
        left: `${position}%`,
        width: `${width}%`,
        height: '20px',
        zIndex: 2,
        overflow: 'hidden'
      }}>
        <div className="event-card" style={{
          backgroundColor: event.backgroundColor,
          borderLeft: `3px solid ${event.color}`,
          padding: '2px 8px',
          height: '100%',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          <div className="d-flex align-items-center gap-1">
            {eventIcons[event.extendedProps.type]}
            <span className="event-title">{event.title}</span>
          </div>
        </div>
      </div>
    );
  };



  const calendarStyles = `
  .fc-daygrid-day-frame {
    position: relative;
    min-height: 40px;
    overflow: hidden;
  }
  
  .fc-daygrid-day-events {
    margin: 0 !important;
    position: relative;
    height: 100%;
    min-height: 40px;
  }
  
  .fc-daygrid-event-harness {
    position: absolute !important;
    top: 0;
    height: 20px;
    margin: 0 !important;
  }
  
  .fc-daygrid-day-bottom {
    display: none;
  }
  
  .fc-daygrid-day-number {
    position: absolute;
    top: 2px;
    right: 4px;
    z-index: 1;
  }
`;
  const dayCellContent = (cellInfo) => {
    const dayEvents = state.events.filter(event => 
      new Date(event.start).toDateString() === cellInfo.date.toDateString()
    );

    return (
      <div className="fc-daycell-content" style={{ 
        position: 'relative',
        height: '100%',
        padding: '4px'
      }}>
        <div className="fc-daycell-number" style={{ 
          position: 'absolute',
          top: '2px',
          right: '4px',
          fontWeight: 'bold',
          color: '#004080',
          zIndex: 1
        }}>
          {cellInfo.dayNumberText}
        </div>
        <div className="fc-daycell-events" style={{ 
          marginTop: '24px',
          height: 'calc(100% - 24px)',
          overflowY: 'auto'
        }}>
          {dayEvents.map((event, index) => (
            <div
              key={event.id}
              className="fc-day-event"
              style={{
                backgroundColor: event.color,
                color: '#fff',
                padding: '6px',
                borderRadius: '4px',
                marginBottom: '4px',
                fontSize: '0.8rem',
                width: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                zIndex: 2
              }}
              onClick={() => setState(prev => ({ 
                ...prev, 
                selectedEvent: event, 
                showDetailModal: true 
              }))}
            >
              <div className="d-flex align-items-center">
                {eventIcons[event.extendedProps.type]}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {event.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>
          <FaCalendarCheck className="header-icon" />
          Insurance Calendar
        </h1>
        <Button 
          variant="primary" 
          onClick={() => setState(prev => ({ ...prev, showModal: true }))}
          disabled={state.loading}
        >
          Create Event
        </Button>
      </div>

      {!state.loading && (
        <div className="calendar-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={state.events}
            selectable={true}
            select={handleDateSelect}
            eventClick={({ event }) => setState(prev => ({
              ...prev,
              selectedEvent: event,
              showDetailModal: true
            }))}
            eventContent={({ event }) => <EventContent event={event} />}
            dayMaxEvents={3}
            eventOrder="start"
            eventDidMount={(info) => {
              // Additional positioning logic if needed
            }}
          />
        </div>
      )}

      {/* Event Creation Modal */}
      <Modal show={state.showModal} onHide={() => setState(prev => ({ ...prev, showModal: false }))} centered>
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>Create New Event</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEventCreate}>
          <Modal.Body className="modal-body">
            <Form.Group className="mb-3">
              <Form.Label>Event Title</Form.Label>
              <Form.Control
                required
                value={state.formData.title}
                onChange={(e) => 
                  setState(prev => ({
                    ...prev,
                    formData: { ...prev.formData, title: e.target.value }
                  }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={state.formData.description}
                onChange={(e) => 
                  setState(prev => ({
                    ...prev,
                    formData: { ...prev.formData, description: e.target.value }
                  }))
                }
              />
            </Form.Group>

            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    required
                    value={state.formData.start}
                    onChange={(e) => 
                      setState(prev => ({
                        ...prev,
                        formData: { ...prev.formData, start: e.target.value }
                      }))
                    }
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    required
                    value={state.formData.end}
                    onChange={(e) => 
                      setState(prev => ({
                        ...prev,
                        formData: { ...prev.formData, end: e.target.value }
                      }))
                    }
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Reminder Hours</Form.Label>
              <Form.Control
                type="text"
                placeholder="24,2,1"
                value={state.formData.reminderHours.join(',')}
                onChange={(e) => 
                  setState(prev => ({
                    ...prev,
                    formData: { 
                      ...prev.formData, 
                      reminderHours: e.target.value.split(',').map(h => h.trim()).filter(Boolean)
                    }
                  }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Event Type</Form.Label>
              <Form.Select
                value={state.formData.type}
                onChange={(e) => 
                  setState(prev => ({
                    ...prev,
                    formData: { ...prev.formData, type: e.target.value }
                  }))
                }
              >
                {Object.entries(eventIcons).map(([type]) => (
                  <option key={type} value={type}>
                    {eventIcons[type]} {type.toLowerCase()}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Assign to Admin</Form.Label>
              <Form.Select
                value={state.formData.userId}
                onChange={(e) => 
                  setState(prev => ({
                    ...prev,
                    formData: { ...prev.formData, userId: e.target.value }
                  }))
                }
              >
                {state.users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="modal-footer">
            <Button variant="secondary" onClick={() => setState(prev => ({ ...prev, showModal: false }))}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Event
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Event Detail Modal */}
      <Modal show={state.showDetailModal} onHide={() => setState(prev => ({ ...prev, showDetailModal: false }))} centered>
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>{state.selectedEvent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          {state.selectedEvent && (
            <>
              <div className="detail-item">
                <strong>Type:</strong>
                <Badge bg="primary" text="white" className="ms-2">
                  {eventIcons[state.selectedEvent.extendedProps.type]}
                  {state.selectedEvent.extendedProps.type?.toLowerCase()}
                </Badge>
              </div>

              <div className="detail-item">
                <strong>Time:</strong>
                <div>
                  {formatDateSafe(state.selectedEvent.start)} - {formatDateSafe(state.selectedEvent.end)}
                </div>
              </div>

              <div className="detail-item">
                <strong>Status:</strong>
                <Badge bg={state.selectedEvent.extendedProps.isCompleted ? 'success' : 'warning'}>
                  {state.selectedEvent.extendedProps.isCompleted ? 'Completed' : 'Pending'}
                </Badge>
              </div>

              {state.selectedEvent.extendedProps.description && (
                <div className="detail-item">
                  <strong>Description:</strong>
                  <p>{state.selectedEvent.extendedProps.description}</p>
                </div>
              )}

              <div className="detail-item">
                <strong>Reminders:</strong>
                <div className="reminders-list">
                  {state.selectedEvent.extendedProps.reminderHours?.map(hour => (
                    <Badge key={hour} bg="light" text="dark">
                      {hour}h before
                    </Badge>
                  ))}
                </div>
              </div>

              {state.selectedEvent.user && (
                <div className="detail-item">
                  <strong>Created By:</strong>
                  <div>{state.selectedEvent.user.name} ({state.selectedEvent.user.email})</div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="danger" onClick={deleteEvent}>
            <FaTrash className="me-2" />
            Delete Event
          </Button>
          <Button variant="secondary" onClick={() => setState(prev => ({ ...prev, showDetailModal: false }))}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InsuranceCalendar;