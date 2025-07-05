import React, { useState, useEffect } from 'react';
import { createBug, updateBug, getBug } from '../services/bugService';
import '../styles/BugModal.css';

export default function BugModal({ isOpen, onClose, onSave, initialBugId = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    completed: '',
    owner: '',
    dueDate: '',
    priority: '',
    status: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBug = async () => {
      if (!initialBugId) return;

      try {
        const res = await getBug(initialBugId);
        const data = res.data || res;

        setFormData({
          title: data.title || '',
          description: data.description || '',
          completed: data.completed || '',
          owner: data.owner || '',
          dueDate: data.dueDate?.slice(0, 10) || '',
          priority: data.priority || '',
          status: data.status || '',
        });
      } catch (err) {
        console.error('Failed to load bug for editing:', err);
        alert('Error loading bug data.');
      }
    };

    loadBug();
  }, [initialBugId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate || null,
        priority: formData.priority,
        status: formData.status,
      };

      let response;

      if (initialBugId) {
        response = await updateBug(initialBugId, payload);
      } else {
        response = await createBug(payload);
      }

      console.log('Bug saved:', response);
      onSave(response.data || response);
      onClose();
    } catch (err) {
      console.error('Failed to save bug:', err);
      alert('Error saving bug!');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialBugId ? 'Edit Bug' : 'Create Bug'}</h2>
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
              <option value="Critical">Critical</option>
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
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
