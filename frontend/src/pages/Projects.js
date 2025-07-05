import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import '../styles/Projects.css';
import ProjectModal from '../components/ProjectModal';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject as deleteProjectAPI,
} from '../services/projectService';

export default function Projects() {
  // 🔄 States for project data and UI handling
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // 📦 Load projects from the API on first render
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(res.data);
        setError(false);
      } catch (err) {
        console.error('❌ Failed to fetch projects:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 💾 Save new or updated project
  const handleSaveProject = async (formData) => {
    try {
      if (editingProject) {
        // Update existing project
        const updatedProject = await updateProject(editingProject._id, formData);
        setProjects((prev) =>
          prev.map((proj) =>
            proj._id === editingProject._id ? updatedProject.data : proj
          )
        );
      } else {
        // Create new project
        const newProject = await createProject(formData);
        setProjects((prev) => [...prev, newProject.data]);
      }
    } catch (error) {
      console.error('❌ Failed to save project:', error);
    } finally {
      setModalOpen(false);
    }
  };

  // 🗑️ Delete a project
  const deleteProject = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this project?');
    if (!confirm) return;

    try {
      await deleteProjectAPI(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error('❌ Failed to delete project:', error);
    }
  };

  // 🔍 Filter + search logic
  const filteredProjects = projects.filter((proj) => {
    const matchesPriority =
      filter === 'All' || proj.priority === filter; // priority is optional in backend
    const matchesSearch =
      proj.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  // 📊 Status breakdowns
  const totalProjects = projects.length;
  const activeCount = projects.filter((p) => p.status === 'Active').length;
  const holdCount = projects.filter((p) => p.status === 'On Hold').length;
  const completedCount = projects.filter((p) => p.status === 'Completed').length;
  const archivedCount = projects.filter((p) => p.status === 'Archived').length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="main-content">
          {/* 🔍 Search bar and ➕ Add button */}
          <div className="top-section">
            <div className="top-card">
              <div className="search-add">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
            </div>
          </div>

          {/* 🟪 Status summary cards + total */}
          <div className="widget-grid">
            <div className="widget-card total">
              <h3>Total Projects</h3>
              <p>{totalProjects}</p>
            </div>
            <div className="widget-card">
              <h3>Active</h3>
              <p>{activeCount}</p>
            </div>
            <div className="widget-card">
              <h3>On Hold</h3>
              <p>{holdCount}</p>
            </div>
            <div className="widget-card">
              <h3>Completed</h3>
              <p>{completedCount}</p>
            </div>
            <div className="widget-card">
              <h3>Archived</h3>
              <p>{archivedCount}</p>
            </div>
          </div>

          {/* 🧭 Priority filters (optional UI if you support priority field) */}
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

          {/* 📋 Project Table */}
          <section className="card">
            <div className="section-header">
              <h2>Projects</h2>
            </div>

            {/* ⏳ Loading / ❌ Error / 📭 Empty states */}
            {loading ? (
              <p>Loading projects...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>❌ Failed to load projects. Please try again later.</p>
            ) : filteredProjects.length === 0 ? (
              <p style={{ opacity: 0.6 }}>📭 No projects yet.</p>
            ) : (
              <table className="table projects-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project._id}>
                      <td>{project.name}</td>
                      <td>{project.description}</td>
                      <td>{project.status}</td>
                      <td>{project.createdBy?.name || 'N/A'}</td>
                      <td>
                        {project.endDate
                          ? new Date(project.endDate).toLocaleDateString('en-GB')
                          : 'N/A'}
                      </td>
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
                          onClick={() => deleteProject(project._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* 🔎 Project Details Modal (if selectedProject used in future) */}
          {selectedProject && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Project Details</h3>
                <p><b>Name:</b> {selectedProject.name}</p>
                <p><b>Description:</b> {selectedProject.description}</p>
                <p><b>Status:</b> {selectedProject.status}</p>
                <p><b>Due Date:</b> {selectedProject.endDate}</p>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="add-btn"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ✏️ Project Create/Edit Modal */}
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
