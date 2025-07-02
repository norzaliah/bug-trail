// frontend/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Settings.css';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    address: '',
    social: '',
  });
  const [editing, setEditing] = useState(false);

  const [notifications, setNotifications] = useState({
    events: true,
    forumMessages: true,
    newDocs: true,
    timeLogsRejected: false,
  });

  const [allowances, setAllowances] = useState({
    seeProject: true,
    updateProject: false,
    copySchedule: false,
  });

  const usedStorage = 7;
  const totalStorage = 10;

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        social: user.social || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await api.put(`/users/${user.id}`, profile);
      alert('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Failed to update profile.');
    }
  };

  const handleToggle = (section, field) => {
    if (section === 'notifications') {
      setNotifications((prev) => ({ ...prev, [field]: !prev[field] }));
    } else {
      setAllowances((prev) => ({ ...prev, [field]: !prev[field] }));
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put(`/users/${user.id}/settings`, { notifications, allowances });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings.');
    }
  };

  const pieData = {
    labels: ['Used', 'Free'],
    datasets: [
      {
        data: [usedStorage, totalStorage - usedStorage],
        backgroundColor: ['#663399', '#ccc'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="main-content">
          <h1 className="page-title">Settings</h1>
          <hr />

          {/* === Profile === */}
          <h2>Profile</h2>
          <div className="card settings-card">
            <div className="profile-info">
              <img src="/default-profile.png" alt="User" className="profile-img" />
              <div className="profile-fields">
                <label>Name</label>
                <input name="name" value={profile.name} onChange={handleProfileChange} disabled={!editing} />

                <label>Role</label>
                <input value={profile.role} disabled />

                <label>Email</label>
                <input name="email" value={profile.email} onChange={handleProfileChange} disabled={!editing} />

                <label>Phone</label>
                <input name="phone" value={profile.phone} onChange={handleProfileChange} disabled={!editing} />

                <label>Address</label>
                <input name="address" value={profile.address} onChange={handleProfileChange} disabled={!editing} />

                <label>Social Media</label>
                <input name="social" value={profile.social} onChange={handleProfileChange} disabled={!editing} />
              </div>
              <button onClick={editing ? handleSaveProfile : () => setEditing(true)} className="edit-btn">
                {editing ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>

          {/* === Notifications + Allowance === */}
          <h2>Notifications</h2>
          <div className="card settings-card notification-card">
            <div className="notify-column">
              <h3>NOTIFY ME FOR THE BELOW ITEMS</h3>
              {[
                ['events', 'Notify my events'],
                ['forumMessages', 'When a message is posted in a forum/discussion'],
                ['newDocs', 'When a new document is uploaded'],
                ['timeLogsRejected', 'When a user’s time logs are rejected'],
              ].map(([key, label]) => (
                <div className="toggle-row" key={key}>
                  <span>{label}</span>
                  <button className={notifications[key] ? 'on' : 'off'} onClick={() => handleToggle('notifications', key)}>
                    {notifications[key] ? 'On' : 'Off'}
                  </button>
                </div>
              ))}
            </div>

            <div className="allowance-column">
              <h3>ALLOWANCE</h3>
              {[
                ['seeProject', 'Allow others to see my project'],
                ['updateProject', 'Allow others to update my project'],
                ['copySchedule', 'Allow others to see and copy my schedule'],
              ].map(([key, label]) => (
                <div className="toggle-row" key={key}>
                  <span>{label}</span>
                  <button className={allowances[key] ? 'on' : 'off'} onClick={() => handleToggle('allowances', key)}>
                    {allowances[key] ? 'On' : 'Off'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button className="save-btn" onClick={handleSaveSettings}>Save Settings</button>

          {/* === Premium Plan === */}
          <h2>Premium Plan</h2>
          <div className="card settings-card premium-card">
            <div className="premium-chart">
              <Pie data={pieData} />
              <p>
                {usedStorage}GB / {totalStorage}GB used (
                {Math.round((usedStorage / totalStorage) * 100)}%)
              </p>
            </div>
            <div className="premium-benefits">
              <h3>Upgrade for additional benefits:</h3>
              <ul>
                <li>✔ Business rules</li>
                <li>✔ Webhooks</li>
                <li>✔ Custom functions</li>
                <li>✔ Web to bug form</li>
                <li>✔ Custom fields</li>
                <li>✔ Service level agreement</li>
                <li>✔ Custom profiles and roles</li>
              </ul>
              <button className="upgrade-btn">Upgrade Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}