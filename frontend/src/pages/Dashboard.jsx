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

  const [location, setLocation] = useState('Fetching...');
  const [bugFilter, setBugFilter] = useState('All');
  const [bugs, setBugs] = useState([]);
  const [projectStatus, setProjectStatus] = useState('All');
  const [projects, setProjects] = useState([]);

  // ✅ NEW: Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  const filteredBugs =
    bugFilter === 'All'
      ? bugs
      : bugs.filter((bug) => bug.status === bugFilter);

  const filteredProjects = Array.isArray(projects)
    ? projectStatus === 'All'
      ? projects
      : projects.filter(
          (project) =>
            (project.status || '').toLowerCase() ===
            projectStatus.toLowerCase()
        )
    : [];

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const res = await getBugs();
        console.log('Fetched bugs:', res);
        setBugs(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Error fetching bugs:', err);
        setBugs([]);
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        console.log('Fetched projects:', res);
        setProjects(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setProjects([]);
      }
    };

    fetchBugs();
    fetchProjects();
  }, []);

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
          const city =
            data.address.city ||
            data.address.town ||
            data.address.state ||
            'Unknown';
          setLocation(city);
        } catch {
          setLocation('Unable to fetch location');
        }
      },
      () => setLocation('Permission denied')
    );
  }, []);

  const displayName =
    currentUser?.displayName || currentUser?.email?.split('@')[0];
  const avatarUrl =
    currentUser?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;

    // ✅ BUG METRICS logic (Progress Overview):
  const openBugs = filteredBugs.filter((b) => b.status === 'Open').length;
  const activeBugs = filteredBugs.filter((b) => b.status === 'Active').length;
  const inProgressBugs = filteredBugs.filter((b) => b.status === 'In Progress').length;
  const resolvedBugs = filteredBugs.filter((b) => b.status === 'Resolved').length;
  const closedBugs = filteredBugs.filter((b) => b.status === 'Closed').length;
  const totalBugs = filteredBugs.length;

  // ✅ CALENDAR logic:
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  };

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const blanks = Array.from({ length: firstDay }, (_, i) => (
    <div key={`blank-${i}`} className="blank"></div>
  ));

  const days = Array.from({ length: daysInMonth }, (_, i) => (
    <div key={i} className={i + 1 === currentDate.getDate() ? 'highlight' : ''}>
      {i + 1}
    </div>
  ));

  const calendarCells = [...blanks, ...days];

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="main-content">
          {/* TOP AREA */}
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

          <div className="overview">
            <div className="bug-metrics">
              <div>
                <span>Bugs:</span> <b>{totalBugs}</b>
              </div>
              <div>
                <span>Open:</span> <b>{openBugs}</b>
              </div>
              <div>
                <span>In Progress:</span> <b>{inProgressBugs}</b>
              </div>
              <div>
                <span>Resolved:</span> <b>{resolvedBugs}</b>
              </div>
            </div>
          </div>

          {/* BUG TABLE */}
          <section className="card bug-section">
            <div className="section-header">
              <h2>Bugs</h2>
              <NavLink to="/bugs">View All</NavLink>
            </div>

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
                      <span
                        className={`status ${bug.status
                          ?.toLowerCase()
                          .replace(/\s/g, '')}`}
                      >
                        {bug.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* PROJECT TABLE */}
          <section className="card project-section">
            <div className="section-header">
              <h2>My Projects</h2>
              <NavLink to="/projects">View All</NavLink>
            </div>

            <div className="project-filters">
              {['All', 'Active', 'On Hold', 'Completed', 'Archived'].map((level) => (
                <button
                  key={level}
                  className={
                    projectStatus === level ? 'active-filter' : ''
                  }
                  onClick={() => setProjectStatus(level)}
                >
                  {level}
                </button>
              ))}
            </div>

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
                    <td>
                      <span
                        className={`status ${project.status
                          ?.toLowerCase()
                          .replace(/\s/g, '')}`}
                      >
                        {project.status}
                      </span>
                    </td>
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

        {/* ✅ NEW DYNAMIC CALENDAR */}
        <aside className="right-panel">
          <div className="calendar">
            <h3>Calendar</h3>
            <div className="calendar-header">
              <button onClick={goToPrevMonth}>«</button>
              <p>{monthName}, {year}</p>
              <button onClick={goToNextMonth}>»</button>
            </div>
            <div className="calendar-grid">
              {dayNames.map((d) => (
                <div key={d} className="day-name">{d}</div>
              ))}
              {calendarCells}
            </div>
          </div>

          <div className="progress-section" style={{ height: 250 }}>
            <h3>Overall Progress</h3>
            <ProgressPieChart
              open={openBugs}
              active={activeBugs}
              inProgress={inProgressBugs}
              resolved={resolvedBugs}
              closed={closedBugs}
              total={totalBugs}
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
