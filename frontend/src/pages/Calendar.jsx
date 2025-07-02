import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/Calendar.css';
import EventModal from '../components/EventModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', time: '', description: '' });
  const [selectedEvents, setSelectedEvents] = useState([]);

  const [events, setEvents] = useState([
    { id: 1, title: 'Project Deadline', date: '2025-07-01', time: '10:00', description: 'Final submission for client' },
    { id: 2, title: 'Team Meeting', date: '2025-07-02', time: '15:00', description: 'Weekly catch-up' },
    { id: 3, title: 'Code Review', date: '2025-07-03', time: '17:00', description: 'Bug fixes check' },
  ]);

  const filteredEvents = events.filter(event =>
    new Date(event.date).toDateString() === selectedDate.toDateString()
  );

  useEffect(() => {
    const now = new Date();
    const upcoming = events.filter(event => {
      const eventDate = new Date(`${event.date}T${event.time}`);
      return eventDate > now && eventDate - now <= 5 * 60 * 1000;
    });

    upcoming.forEach(event => {
      const eventDate = new Date(`${event.date}T${event.time}`);
      const timeDiff = eventDate - now;

      setTimeout(() => {
        alert(`🔔 Reminder: ${event.title} at ${event.time}`);
      }, timeDiff);
    });
  }, [events]);

  const handleAddEvent = (newEvent) => {
    const id = events.length ? Math.max(...events.map(ev => ev.id)) + 1 : 1;
    setEvents([...events, { ...newEvent, id }]);
    setShowModal(false);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      date: event.date,
      time: event.time,
      description: event.description,
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== id));
      setSelectedEvents(selectedEvents.filter(eid => eid !== id));
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setEvents(events.map(ev => ev.id === editingEvent.id ? { ...editingEvent, ...form } : ev));
    setEditingEvent(null);
  };

  const handleCheckboxChange = (id) => {
    if (selectedEvents.includes(id)) {
      setSelectedEvents(selectedEvents.filter(eid => eid !== id));
    } else {
      setSelectedEvents([...selectedEvents, id]);
    }
  };

  const handleExportPDF = () => {
    if (selectedEvents.length === 0) {
      alert("Please select at least one event to export.");
      return;
    }

    const input = document.getElementById('selected-events-section');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`events-${selectedDate.toDateString()}.pdf`);
    });
  };

  const handleShare = () => {
    const selected = events.filter(ev => selectedEvents.includes(ev.id));
    if (selected.length === 0) {
      alert("Please select events to share.");
      return;
    }

    const text = selected.map(ev =>
      `• ${ev.title} on ${ev.date} at ${ev.time}\n${ev.description}`
    ).join('\n\n');

    navigator.clipboard.writeText(text)
      .then(() => alert("Events copied to clipboard!"))
      .catch(() => alert("Failed to copy."));
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="main-content">

          {/* Top Section */}
          <div className="top-section">
            <div className="top-card calendar-header-bar">
              <div className="calendar-actions">
                <input type="text" placeholder="Search events..." className="calendar-search" />
                <button className="create-event-btn" onClick={() => setShowModal(true)}>
                  + Create Event
                </button>
              </div>
            </div>
          </div>

          {/* Main Calendar Card */}
          <div className="card calendar-card">
            <div className="calendar-header">
              <h3>Calendar</h3>
              <hr />
            </div>
            <div className="calendar-body">

              {/* Event List Column */}
              <div className="event-column">
                <h4>Upcoming Events</h4>
                {events.map(event => (
                  <div
                    key={event.id}
                    className="event-card"
                    onClick={() => setSelectedDate(new Date(event.date))}
                  >
                    <input
                      type="checkbox"
                      className="event-checkbox"
                      checked={selectedEvents.includes(event.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(event.id);
                      }}
                    />
                    <h5>{event.title}</h5>
                    <p>{event.date} at {event.time}</p>
                    <small>{event.description}</small>
                    <div className="event-actions">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(event); }}>✏️</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendar Column */}
              <div className="calendar-column">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  className="custom-calendar"
                />
                <div className="calendar-buttons">
                  <button className="share-btn" onClick={handleShare}>🔗 Share Events</button>
                  <button className="share-btn" onClick={handleExportPDF}>📄 Download PDF</button>
                </div>
              </div>
            </div>

            {/* Selected Date Events */}
            {filteredEvents.length > 0 && (
              <div className="selected-event-details" id="selected-events-section">
                <h4>Events on {selectedDate.toDateString()}</h4>
                {filteredEvents.map(ev => (
                  <div key={ev.id}>
                    <p><strong>{ev.title}</strong> — {ev.time}</p>
                    <p>{ev.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Modal */}
          {editingEvent && (
            <div className="event-modal">
              <div className="modal-content">
                <h3>Edit Event</h3>
                <form onSubmit={handleFormSubmit}>
                  <input name="title" value={form.title} onChange={handleFormChange} placeholder="Title" required />
                  <input type="date" name="date" value={form.date} onChange={handleFormChange} required />
                  <input type="time" name="time" value={form.time} onChange={handleFormChange} required />
                  <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Description" />
                  <div className="modal-actions">
                    <button type="submit">✅ Save</button>
                    <button type="button" onClick={() => setEditingEvent(null)}>❌ Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Event Modal */}
          {showModal && (
            <EventModal onClose={() => setShowModal(false)} onSave={handleAddEvent} />
          )}
        </div>
      </div>
    </div>
  );
}