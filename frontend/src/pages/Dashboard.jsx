import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import ProgressPieChart from '../components/ProgressPieChart';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [location, setLocation] = useState('Fetching...');

  // 🐞 Bug State & Filter
  const [bugFilter, setBugFilter] = useState('All');
  const [bugs, setBugs] = useState([]); // Empty initially

  const filteredBugs = bugFilter === 'All'
    ? bugs
    : bugs.filter((bug) => bug.status === bugFilter);

  // 📁 Project State & Filter
  const [projectPriority, setProjectPriority] = useState('All');
  const [projects, setProjects] = useState([]); // Empty initially

  const filteredProjects = projectPriority === 'All'
    ? projects
    : projects.filter((project) => project.priority === projectPriority);

  // 🌍 Location Fetching
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation('Location not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.state || 'Unknown';
          setLocation(city);
        } catch (err) {
          setLocation('Unable to fetch location');
        }
      },
      () => setLocation('Permission denied')
    );
  }, []);

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0];
  const avatarUrl = currentUser?.photoURL || `https://ui-avatars.com/api/?name=${displayName}`;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="main-content">

          {/* 🟪 Top Section - Welcome + Search */}
          <div className="top-section">
            <div className="top-card">
              <div className="search-add">
                <input type="text" placeholder="Search bugs, projects..." />
                <Link to="/bugs/new" className="add-btn">+ Add Bug</Link>
              </div>
            </div>

            <div className="top-card welcome-card">
              <div>
                <h2>Welcome back, {displayName}!</h2>
                <p>📍 Location: {location}</p>
              </div>
              <div className="user-avatar">
                <img src={avatarUrl} alt="User Avatar" />
              </div>
            </div>
          </div>

          {/* 🟡 Widget Cards */}
          <div className="widget-grid">
            <div className="widget-card"><h3>Assigned Bugs</h3><p>{filteredBugs.filter(bug => bug.status === 'Active').length}</p></div>
            <div className="widget-card"><h3>Fixed Bugs</h3><p>{filteredBugs.filter(bug => bug.status === 'Resolved').length}</p></div>
            <div className="widget-card"><h3>Open Bugs</h3><p>{filteredBugs.filter(bug => bug.status === 'Open').length}</p></div>
            <div className="widget-card"><h3>Total Bugs</h3><p>{filteredBugs.length}</p></div>
          </div>

          {/* 📊 Bug Metrics Overview */}
          <div className="overview">
            <div className="bug-metrics">
              <div><span>Bugs:</span> <b>{filteredBugs.length}</b></div>
              <div><span>Completed:</span> <b>{filteredBugs.filter(bug => bug.status === 'Resolved').length}</b></div>
              <div><span>On Hold:</span> <b>{filteredBugs.filter(bug => bug.status === 'On Hold').length}</b></div>
              <div><span>Delayed:</span> <b>{filteredBugs.filter(bug => bug.status === 'Delayed').length}</b></div>
              <div><span>Canceled:</span> <b>{filteredBugs.filter(bug => bug.status === 'Canceled').length}</b></div>
            </div>
          </div>

          {/* 🐞 Bugs Table + Filters */}
          <section className="card bug-section">
            <div className="section-header">
              <h2>Bugs</h2>
              <NavLink to="/bugs">View All</NavLink>
            </div>

            <div className="bug-filters">
              {['All', 'Active', 'In Progress', 'On Hold', 'Canceled', 'Delayed'].map((status) => (
                <button
                  key={status}
                  className={bugFilter === status ? 'active-filter' : ''}
                  onClick={() => setBugFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <table className="table bugs-table">
              <thead>
                <tr>
                  <th>Bug Name</th>
                  <th>Completed</th>
                  <th>Owner</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBugs.map((bug) => (
                  <tr key={bug.id}>
                    <td>{bug.name}</td>
                    <td>{bug.completed}</td>
                    <td>{bug.owner}</td>
                    <td>{bug.dueDate}</td>
                    <td>{bug.priority}</td>
                    <td><span className={`status ${bug.status.toLowerCase().replace(/\s/g, '')}`}>{bug.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 📁 Projects Table + Filters */}
          <section className="card project-section">
            <div className="section-header">
              <h2>My Projects</h2>
              <NavLink to="/projects">View All</NavLink>
            </div>

            <div className="project-filters">
              {['All', 'High', 'Medium', 'Low'].map((level) => (
                <button
                  key={level}
                  className={projectPriority === level ? 'active-filter' : ''}
                  onClick={() => setProjectPriority(level)}
                >
                  {level}
                </button>
              ))}
            </div>

            <table className="table projects-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Completed</th>
                  <th>Priority</th>
                  <th>Last Updated</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td>{project.completed}</td>
                    <td>{project.priority}</td>
                    <td>{project.updated}</td>
                    <td>{project.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* 🧭 Right Panel Section */}
        <aside className="right-panel">
          <div className="calendar">
            <h3>Calendar</h3>
            <p>June, 2025</p>
            <div className="calendar-grid">
              <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
              {[...Array(30)].map((_, i) => (
                <div key={i} className={i === 23 ? 'highlight' : ''}>{i + 1}</div>
              ))}
            </div>
          </div>

          <div className="progress-section">
            <h3>Overall Progress</h3>
            <ProgressPieChart
              completed={filteredBugs.filter(bug => bug.status === 'Resolved').length}
              onHold={filteredBugs.filter(bug => bug.status === 'On Hold').length}
              delayed={filteredBugs.filter(bug => bug.status === 'Delayed').length}
              canceled={filteredBugs.filter(bug => bug.status === 'Canceled').length}
              total={filteredBugs.length}
            />
          </div>

          <div className="team-section">
            <div className="section-header">
              <h3>My Team</h3>
              <NavLink to="/team">Manage</NavLink>
            </div>
            <ul>
              <li><b>Zaliah Abdullah</b> - Team Leader</li>
              <li>Fasihah Asri - Member</li>
              <li>Ayuni Aziz - Member</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
