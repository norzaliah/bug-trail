import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import ProgressPieChart from '../components/ProgressPieChart';

// API services
import { getBugs } from '../services/bugService';
import { getProjects } from '../services/projectService';

export default function Dashboard() {
  const { currentUser } = useAuth();

  // State for user's current location
  const [location, setLocation] = useState('Fetching...');

  // State for bug and project filters
  const [bugFilter, setBugFilter] = useState('All');
  const [bugs, setBugs] = useState([]);
  const [projectPriority, setProjectPriority] = useState('All');
  const [projects, setProjects] = useState([]);

  // Apply selected bug filter
  const filteredBugs = bugFilter === 'All'
    ? bugs
    : bugs.filter((bug) => bug.status === bugFilter);

  // Apply selected project priority filter
  const filteredProjects = Array.isArray(projects)
    ? (
      projectPriority === 'All'
        ? projects
        : projects.filter((project) => project.priority === projectPriority)
    )
    : [];

  // Fetch bugs and projects from backend on component mount
  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const res = await getBugs();
        setBugs(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Error fetching bugs:', err);
        setBugs([]);
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setProjects([]);
      }
    };

    fetchBugs();
    fetchProjects();
  }, []);

  // Detect user's location using browser geolocation + reverse geocoding
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
        } catch {
          setLocation('Unable to fetch location');
        }
      },
      () => setLocation('Permission denied')
    );
  }, []);

  // Prepare user display name and avatar fallback
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0];
  const avatarUrl = currentUser?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;

  // === Bug Status Counts (for dashboard + pie chart) ===
  const openBugs = filteredBugs.filter((b) => b.status === 'Open').length;

  // Grouped as "In Progress": includes both 'Active' and 'In Progress'
  const inProgressBugs = filteredBugs.filter(
    (b) => b.status === 'Active' || b.status === 'In Progress'
  ).length;

  // Grouped as "Resolved": includes both 'Resolved' and 'Closed'
  const resolvedBugs = filteredBugs.filter(
    (b) => b.status === 'Resolved' || b.status === 'Closed'
  ).length;

  const totalBugs = filteredBugs.length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="main-content">

          {/* === Top Section: Search + Welcome === */}
          <div className="top-section">
            <div className="top-card">
              <div className="search-add">
                <input type="text" placeholder="Search bugs, projects..." />
                <Link to="/bugs/new" className="add-btn">
                  + Add Bug
                </Link>
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

          {/* === Summary Widget Cards === */}
          <div className="widget-grid">
            <div className="widget-card">
              <h3>Open Bugs</h3>
              <p>{openBugs}</p>
            </div>
            <div className="widget-card">
              <h3>In Progress</h3>
              <p>{inProgressBugs}</p>
            </div>
            <div className="widget-card">
              <h3>Resolved</h3>
              <p>{resolvedBugs}</p>
            </div>
            <div className="widget-card">
              <h3>Total Bugs</h3>
              <p>{totalBugs}</p>
            </div>
          </div>

          {/* === Bug Metrics Overview === */}
          <div className="overview">
            <div className="bug-metrics">
              <div><span>Bugs:</span> <b>{totalBugs}</b></div>
              <div><span>Open:</span> <b>{openBugs}</b></div>
              <div><span>In Progress:</span> <b>{inProgressBugs}</b></div>
              <div><span>Resolved:</span> <b>{resolvedBugs}</b></div>
            </div>
          </div>

          {/* === Bug Table Section === */}
          <section className="card bug-section">
            <div className="section-header">
              <h2>Bugs</h2>
              <NavLink to="/bugs">View All</NavLink>
            </div>

            {/* Bug Filter Buttons */}
            <div className="bug-filters">
              {['All', 'Open', 'Active', 'In Progress', 'Resolved', 'Closed'].map(
                (status) => (
                  <button
                    key={status}
                    className={bugFilter === status ? 'active-filter' : ''}
                    onClick={() => setBugFilter(status)}
                  >
                    {status}
                  </button>
                )
              )}
            </div>

            {/* Bug Table */}
            <table className="table bugs-table">
              <thead>
                <tr>
                  <th>Bug Title</th>
                  <th>Owner</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBugs.map((bug) => (
                  <tr key={bug._id}>
                    <td>{bug.title}</td>
                    <td>{bug.createdBy?.name || '-'}</td>
                    <td>
                      {bug.dueDate
                        ? new Date(bug.dueDate).toLocaleDateString('en-GB')
                        : '-'}
                    </td>
                    <td>{bug.priority || '-'}</td>
                    <td>
                      <span className={`status ${bug.status?.toLowerCase().replace(/\s/g, '')}`}>
                        {bug.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* === Project Section === */}
          <section className="card project-section">
            <div className="section-header">
              <h2>My Projects</h2>
              <NavLink to="/projects">View All</NavLink>
            </div>

            {/* Priority Filter Buttons */}
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

            {/* Projects Table */}
            <table className="table projects-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project._id}>
                    <td>{project.name}</td>
                    <td>{project.description || '-'}</td>
                    <td>{project.status || '-'}</td>
                    <td>{project.createdBy?.name || '-'}</td>
                    <td>
                      {project.endDate
                        ? new Date(project.endDate).toLocaleDateString('en-GB')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* === Right Panel: Calendar + Progress Pie + Team === */}
        <aside className="right-panel">

          {/* Mini Calendar */}
          <div className="calendar">
            <h3>Calendar</h3>
            <p>June, 2025</p>
            <div className="calendar-grid">
              <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
              {[...Array(30)].map((_, i) => (
                <div key={i} className={i === 23 ? 'highlight' : ''}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Pie Chart for Bug Statuses */}
          <div className="progress-section" style={{ height: 250 }}>
            <h3>Overall Progress</h3>
            <ProgressPieChart
              open={openBugs}
              inProgress={inProgressBugs}
              resolved={resolvedBugs}
              total={totalBugs}
            />
          </div>

          {/* Team Section */}
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
