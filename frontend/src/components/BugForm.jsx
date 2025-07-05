// frontend/components/BugForm.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/BugForm.css';

export default function BugForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine if editing or creating a new bug
  const isEdit = Boolean(id);
  const isEditable = user && ['developer', 'tester'].includes(user.role);

  // Form state for the bug fields
  const [bug, setBug] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    dueDate: '',
    owner: user?._id || '',
  });

  const [users, setUsers] = useState([]); // Team users for assignment dropdown
  const [error, setError] = useState(''); // Display errors in UI

  useEffect(() => {
    /**
     * Fetch the list of users to assign bugs to.
     */
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        const data = res.data;

        let usersArray = [];

        // Check if API returned array directly
        if (Array.isArray(data)) {
          usersArray = data;
        } else if (Array.isArray(data?.data)) {
          usersArray = data.data;
        } else {
          usersArray = [];
        }

        setUsers(usersArray);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setUsers([]); // Defensive: keep it an array
      }
    };

    /**
     * Fetch the bug details if editing.
     */
    const fetchBug = async () => {
      try {
        const res = await api.get(`/${id}`); // ✅ updated
        const data = res.data;

        setBug({
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          dueDate: data.dueDate?.slice(0, 10),
          owner: data.owner?._id || '',
        });
      } catch (err) {
        console.error('Failed to load bug:', err);
        setError('Failed to load bug details.');
      }
    };

    fetchUsers();
    if (isEdit) fetchBug();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBug((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        if (!isEditable) return;
        await api.put(`/${id}`, bug); // ✅ updated
      } else {
        await api.post('/', bug); // ✅ updated
      }

      navigate('/bugs');
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit bug.');
    }
  };

  const handleDelete = async () => {
    if (!isEditable) return;
    if (window.confirm('Are you sure you want to delete this bug?')) {
      try {
        await api.delete(`/${id}`); // ✅ updated
        navigate('/bugs');
      } catch (err) {
        console.error('Delete error:', err);
        setError('Failed to delete bug.');
      }
    }
  };

  const handleCancel = () => {
    navigate('/bugs');
  };

  return (
    <div className="bug-form-container">
      <h2>{isEdit ? 'Bug Details' : 'Report a New Bug'}</h2>
      {error && <p className="error">{error}</p>}

      <form className="bug-form" onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          name="title"
          value={bug.title}
          onChange={handleChange}
          required
          disabled={isEdit && !isEditable}
        />

        <label>Description</label>
        <textarea
          name="description"
          value={bug.description}
          onChange={handleChange}
          disabled={isEdit && !isEditable}
        />

        <label>Priority</label>
        <select
          name="priority"
          value={bug.priority}
          onChange={handleChange}
          disabled={isEdit && !isEditable}
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <label>Status</label>
        <select
          name="status"
          value={bug.status}
          onChange={handleChange}
          disabled={isEdit && !isEditable}
        >
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <label>Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={bug.dueDate}
          onChange={handleChange}
          disabled={isEdit && !isEditable}
        />

        <label>Assign to</label>
        <select
          name="owner"
          value={bug.owner}
          onChange={handleChange}
          disabled={isEdit && !isEditable}
        >
          <option value="">Unassigned</option>
          {Array.isArray(users) &&
            users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.role})
              </option>
            ))}
        </select>

        <div className="form-buttons">
          {(isEdit && isEditable) || !isEdit ? (
            <button type="submit" className="submit-btn">
              {isEdit ? 'Update Bug' : 'Create Bug'}
            </button>
          ) : null}

          {isEdit && isEditable && (
            <button type="button" onClick={handleDelete} className="delete-btn">
              Delete Bug
            </button>
          )}

          <button type="button" onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
