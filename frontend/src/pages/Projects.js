import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/Projects.css';
import ProjectModal from '../components/ProjectModal';

export default function Projects() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Display Problem',
      dueDate: '2025-05-31',
      completed: '16%',
      priority: 'High',
      updated: 'Today 10:30 am',
    },
    {
      id: 2,
      name: 'Login Bug',
      dueDate: '2025-06-30',
      completed: '45%',
      priority: 'Medium',
      updated: 'Yesterday 4:00 pm',
    },
  ]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');

  const handleSaveProject = (formData) => {
    if (editingProject) {
      const updated = { ...formData, id: editingProject.id };
      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const newProject = {
        ...formData,
        id: Date.now(),
      };
      setProjects([...projects, newProject]);
    }
  };

  const deleteProject = (id) => {
    const confirm = window.confirm("Are you sure you want to delete this project?");
    if (confirm) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  const filteredProjects =
    filter === 'All' ? projects : projects.filter((p) => p.priority === filter);

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="main-content">

          {/* 🔍 Search and ➕ Add Bug */}
          <div className="top-section">
            <div className="top-card">
              <div className="search-add">
                <input type="text" placeholder="Search projects..." />
                <Link to="/bugs/new" className="add-btn">+ Add Bug</Link>
              </div>
            </div>
          </div>

          {/* 🟪 Summary Cards */}
          <div className="widget-grid">
            <div className="widget-card"><h3>To Do</h3><p>4</p></div>
            <div className="widget-card"><h3>In Progress</h3><p>2</p></div>
            <div className="widget-card"><h3>In Review</h3><p>3</p></div>
            <div className="widget-card"><h3>Done</h3><p>6</p></div>
          </div>

          {/* 🧭 Priority Filters */}
          <div className="project-filters">
            {['All', 'High', 'Medium', 'Low'].map((level) => (
              <button
                key={level}
                className={filter === level ? 'active-filter' : ''}
                onClick={() => setFilter(level)}
              >
                {level}
              </button>
            ))}
          </div>

          {/* ✅ Combined Project List Section */}
          <section className="card">
            <div className="section-header">
              <h2>Projects</h2>
              <button
                className="add-btn"
                onClick={() => {
                  setEditingProject(null);
                  setModalOpen(true);
                }}
              >
                + Create Project
              </button>
            </div>

            <table className="table projects-table">
              <thead>
                <tr>
                  <th>Bug Name</th>
                  <th>Completed</th>
                  <th>Priority</th>
                  <th>Last Updated</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td>{project.completed}</td>
                    <td>{project.priority}</td>
                    <td>{project.updated}</td>
                    <td>{new Date(project.dueDate).toLocaleDateString('en-GB')}</td>
                    <td>
                      <button
                        className="action-btn edit"
                        onClick={() => {
                          setEditingProject(project);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => deleteProject(project.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 🔍 View Modal (optional - can remove if not needed) */}
          {selectedProject && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Project Details</h3>
                <p><b>Name:</b> {selectedProject.name}</p>
                <p><b>Due Date:</b> {selectedProject.dueDate}</p>
                <p><b>Completed:</b> {selectedProject.completed}</p>
                <p><b>Priority:</b> {selectedProject.priority}</p>
                <p><b>Updated:</b> {selectedProject.updated}</p>
                <button onClick={() => setSelectedProject(null)} className="add-btn">Close</button>
              </div>
            </div>
          )}

          {/* ✏️ Create/Edit Modal */}
          <ProjectModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSaveProject}
            initialData={editingProject}
          />
        </div>
      </div>
    </div>
  );
}