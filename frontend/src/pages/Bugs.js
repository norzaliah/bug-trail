import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { format } from 'date-fns'; // For date formatting
import './Bugs.css'; // You'll need to create this CSS file

export default function Bugs() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const { data } = await api.get('/bugs');
        setBugs(data);
      } catch (err) {
        console.error('Error fetching bugs:', err);
        setError('Failed to load bugs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBugs();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'priority-critical';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-open';
    }
  };

  if (loading) return <div className="loading">Loading bugs...</div>;
  if (error) return <div className="error">{error}</div>;
  if (bugs.length === 0) return <div className="no-bugs">No bugs found</div>;

  return (
    <div className="bugs-container">
      <h2 className="bugs-header">Bug Tracker</h2>
      
      <div className="bugs-grid">
        <div className="grid-header">
          <div>Bug Name</div>
          <div>Owner</div>
          <div>Due Date</div>
          <div>Priority</div>
          <div>Status</div>
        </div>
        
        {bugs.map(bug => (
          <div key={bug._id} className="bug-item">
            <div className="bug-name">
              <strong>{bug.title}</strong>
              <div className="bug-description">{bug.description}</div>
            </div>
            <div>{bug.owner?.name || 'Unassigned'}</div>
            <div>{bug.dueDate ? format(new Date(bug.dueDate), 'MMM dd, yyyy') : 'No due date'}</div>
            <div className={`priority ${getPriorityColor(bug.priority)}`}>
              {bug.priority}
            </div>
            <div className={`status ${getStatusColor(bug.status)}`}>
              {bug.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}