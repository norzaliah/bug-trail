// frontend/components/BugForm.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bugService, userService, projectService  } from '../services/api';
import '../styles/BugForm.css';
import { useAuth } from '../context/AuthContext';

export default function BugForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEdit = Boolean(id);
  const isEditable = user && ['developer', 'tester'].includes(user.role);

  // Initial state (no change needed)
  const [bug, setBug] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Open",
    dueDate: "",
    assignedTo: "",
    project: "",
  });


  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // fetch users
        const resUsers = await userService.getUsers();
        const userList = Array.isArray(resUsers.data)
          ? resUsers.data
          : Array.isArray(resUsers.data?.data)
          ? resUsers.data.data
          : [];
        setUsers(userList);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setUsers([]);
      }

      try {
        // fetch projects
        const resProjects = await projectService.getProjects(); // or use your project service if created
        const projectList = Array.isArray(resProjects.data)
          ? resProjects.data
          : Array.isArray(resProjects.data?.data)
          ? resProjects.data.data
          : [];
        setProjects(projectList);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setProjects([]);
      }

      if (isEdit) {
        try {
          const res = await bugService.getBugById(id);
          const data = res?.data?.data || res?.data;

          setBug({
            title: data.title || '',
            description: data.description || '',
            priority: data.priority || 'medium',
            status: data.status || 'open',
            dueDate: data.dueDate?.slice(0, 10) || '',
            assignedTo: data.assignedTo?._id || '',
            project: data.project?._id || '',
          });
        } catch (err) {
          console.error('Failed to load bug:', err);
          setError('Failed to load bug details.');
        }
      }
    };

    fetchAll();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBug((prev) => ({
      ...prev,
      [name]: value || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: bug.title,
        description: bug.description,
        priority: bug.priority,
        status: bug.status,
        dueDate: bug.dueDate || null,
        assignedTo: bug.assignedTo || null,
        project: bug.project || null,
      };

      if (isEdit) {
        if (!isEditable) return;
        await bugService.updateBug(id, payload);
      } else {
        await bugService.createBug(payload);
      }

      navigate('/bugs');
    } catch (err) {
      console.error('Submission error:', err);
      setError(err?.response?.data?.error || 'Failed to submit bug.');
    }
  };

  const handleDelete = async () => {
    if (!isEditable) return;
    if (window.confirm('Are you sure you want to delete this bug?')) {
      try {
        await bugService.deleteBug(id);
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
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        <label>Status</label>
        <select
          name="status"
          value={bug.status}
          onChange={handleChange}
          disabled={isEdit && !isEditable}
        >
          <option value="Open">Open</option>
          <option value="Active">Active</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
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
          name="assignedTo"
          value={bug.assignedTo}
          onChange={handleChange}
          disabled={isEdit && !isEditable}
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>

        <label>Project (Important)</label>
        <select
          name="project"
          value={bug.project}
          onChange={handleChange}
          disabled={isEdit && !isEditable}
        >
          <option value="">None</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
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
            <button
              type="button"
              onClick={handleDelete}
              className="delete-btn"
            >
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
