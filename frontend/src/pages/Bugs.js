// frontend/pages/Bugs.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Bugs.css';
import { bugService } from '../services/api';
import BugModal from '../components/BugModal';

export default function Bugs() {
  // 🔄 State for bugs and UI
  const [bugs, setBugs] = useState([]);
  const [bugFilter, setBugFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal controls
  const [modalMode, setModalMode] = useState(null);
  const [editingBugId, setEditingBugId] = useState(null);

  // Load bugs on mount
  useEffect(() => {
    const fetchBugs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await bugService.getAllBugs();
        console.log('BUGS API RESPONSE:', response.data);
        setBugs(
          Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.data)
              ? response.data.data
              : []
        );
      } catch (err) {
        console.error('Error fetching bugs:', err.message);
        setError('Failed to load bugs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBugs();
  }, []);

  // Delete a bug
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bug?')) {
      try {
        await bugService.deleteBug(id);
        setBugs((prev) => prev.filter((b) => b._id !== id));
      } catch (err) {
        console.error('Delete error:', err.message);
        alert('Failed to delete bug.');
      }
    }
  };

  // Open modal for editing
  const handleEdit = (id) => {
    setEditingBugId(id);
    setModalMode('edit');
  };

  // Open modal for view mode
  const handleView = (id) => {
    setEditingBugId(id);
    setModalMode('view');
  };

  // Handle save from modal (edit or create)
  const handleSave = (savedBug) => {
    setBugs((prev) => {
      const exists = prev.find((b) => b._id === savedBug._id);
      if (exists) {
        // Update existing bug
        return prev.map((b) =>
          b._id === savedBug._id ? savedBug : b
        );
      } else {
        // Add new bug
        return [savedBug, ...prev];
      }
    });
    setModalMode(null);
    setEditingBugId(null);
  };

  // Filter and search
  const filteredBugs = bugs
    .filter((bug) =>
      bug.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((bug) =>
      bugFilter === 'All'
        ? true
        : bug.status?.toLowerCase() === bugFilter.toLowerCase()
    );

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="main-content">

          {/* 🔎 Search & Add */}
          <div className="top-section">
            <div className="top-card">
              <div className="search-add">
                <input
                  type="text"
                  placeholder="Search bugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Link to="/bugs/new" className="add-btn">
                  + Add Bug
                </Link>
              </div>
            </div>
          </div>

          {/* 🗂 Filters */}
          <div className="bug-filters">
            {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
              <button
                key={status}
                className={bugFilter === status ? 'active-filter' : ''}
                onClick={() => setBugFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          {/* 🖥️ Table or feedback */}
          {loading ? (
            <div className="loading">Loading bugs...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : filteredBugs.length === 0 ? (
            <div className="no-bugs">No bugs found.</div>
          ) : (
            <section className="card">
              <table className="table bugs-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBugs.map((bug) => (
                    <tr key={bug._id}>
                      <td>{bug.title}</td>
                      <td>
                        <span
                          className={`status ${bug.status
                            ?.toLowerCase()
                            .replace(/\s/g, '')}`}
                        >
                          {bug.status}
                        </span>
                      </td>
                      <td
                        className={`priority priority-${bug.priority?.toLowerCase()}`}
                      >
                        {bug.priority}
                      </td>
                      <td>{new Date(bug.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="bug-actions">
                          <button
                            className="view-btn"
                            onClick={() => handleView(bug._id)}
                          >
                            View
                          </button>
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(bug._id)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(bug._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </div>

      {/* Bug Modal for View/Edit */}
      <BugModal
        isOpen={!!modalMode}
        mode={modalMode}
        initialBugId={editingBugId}
        onClose={() => {
          setModalMode(null);
          setEditingBugId(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
