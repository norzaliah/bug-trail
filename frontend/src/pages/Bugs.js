// frontend/pages/Bugs.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Bugs.css';
import { bugService } from '../services/api';

export default function Bugs() {
  const [bugs, setBugs] = useState([]);
  const [bugFilter, setBugFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBugs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await bugService.getAllBugs();
        setBugs(response.data || []);
      } catch (err) {
        console.error('Error fetching bugs:', err.message);
        setError('Failed to load bugs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBugs();
  }, []);

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

  const filteredBugs = bugs
    .filter((bug) =>
      bug.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((bug) =>
      bugFilter === 'All' ? true : bug.status.toLowerCase() === bugFilter.toLowerCase()
    );

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="main-content">
          <div className="top-section">
            <div className="top-card">
              <div className="search-add">
                <input
                  type="text"
                  placeholder="Search bugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Link to="/bugs/new" className="add-btn">+ Add Bug</Link>
              </div>
            </div>
          </div>

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
                        <span className={`status status-${bug.status?.toLowerCase().replace(/\s/g, '')}`}>
                          {bug.status}
                        </span>
                      </td>
                      <td className={`priority priority-${bug.priority?.toLowerCase()}`}>
                        {bug.priority}
                      </td>
                      <td>{new Date(bug.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="view-btn" onClick={() => navigate(`/bugs/${bug._id}`)}>View</button>
                        <button className="edit-btn" onClick={() => navigate(`/bugs/${bug._id}`)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(bug._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}