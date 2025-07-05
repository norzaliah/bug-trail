import React, { useEffect, useState } from 'react';
import '../styles/Bugs.css';
import { bugService } from '../services/api';
import BugModal from '../components/BugModal';

export default function Bugs() {
  // 🔄 States for managing bugs, search, filters, etc.
  const [bugs, setBugs] = useState([]);
  const [bugFilter, setBugFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🧩 Modal control states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBugId, setEditingBugId] = useState(null); // null = create mode

  // 🚀 Load all bugs on first render
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

  // 🗑️ Delete a bug from the DB and remove it locally
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

  // 📝 Edit bug handler → opens modal with specific bug id
  const handleEdit = (id) => {
    setEditingBugId(id);
    setModalOpen(true);
  };

  // ➕ Add bug handler → opens modal in create mode
  const handleAdd = () => {
    setEditingBugId(null);
    setModalOpen(true);
  };

  // ✅ Save handler after modal submit → updates or inserts
  const handleSave = (savedBug) => {
    setBugs((prev) => {
      const exists = prev.find((b) => b._id === savedBug._id);
      if (exists) {
        // update
        return prev.map((b) =>
          b._id === savedBug._id ? savedBug : b
        );
      } else {
        // insert new
        return [savedBug, ...prev];
      }
    });
    setModalOpen(false);
    setEditingBugId(null);
  };

  // 🔍 Filter + search logic
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
          {/* Top Bar */}
          <div className="top-section">
            <div className="top-card">
              <div className="search-add">
                <input
                  type="text"
                  placeholder="Search bugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  className="add-btn"
                  onClick={handleAdd}
                >
                  + Add Bug
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
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

          {/* Conditional Rendering */}
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
                        <span className={`status ${bug.status?.toLowerCase().replace(/\s/g, '')}`}>
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
                            onClick={() => alert('View feature not implemented yet.')}
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

      {/* 🧩 Bug Modal */}
      <BugModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBugId(null);
        }}
        initialBugId={editingBugId}
        onSave={handleSave}
      />
    </div>
  );
}
