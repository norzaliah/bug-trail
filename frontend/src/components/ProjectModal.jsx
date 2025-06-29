import React, { useEffect, useState } from 'react';
import '../styles/ProjectModal.css';

export default function ProjectModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    dueDate: '',
    completed: '',
    priority: '',
    updated: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        dueDate: '',
        completed: '',
        priority: '',
        updated: '',
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
    onClose(); // close modal after save
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialData ? 'Edit Project' : 'Create Project'}</h2>
        <form onSubmit={handleSubmit} className="project-form">
          <label>
            Project Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Due Date:
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
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
            Priority:
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>

          <label>
            Last Updated:
            <input
              type="text"
              name="updated"
              value={formData.updated}
              onChange={handleChange}
              placeholder="e.g. Today 10:30 am"
            />
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