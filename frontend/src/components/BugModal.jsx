import React, { useState, useEffect } from 'react';
import '../styles/BugModal.css';

export default function BugModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    completed: '',
    owner: '',
    dueDate: '',
    priority: '',
    status: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        description: '',
        completed: '',
        owner: '',
        dueDate: '',
        priority: '',
        status: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialData ? 'Edit Bug' : 'Create Bug'}</h2>
        <form onSubmit={handleSubmit} className="bug-form">
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Description:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </label>
          <label>
            Completed (%):
            <input
              type="number"
              name="completed"
              value={formData.completed}
              onChange={handleChange}
              min="0"
              max="100"
            />
          </label>
          <label>
            Owner:
            <input
              type="text"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
            />
          </label>
          <label>
            Due Date:
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </label>
          <label>
            Priority:
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="">Select</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
          <label>
            Status:
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </label>
          <div className="modal-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
