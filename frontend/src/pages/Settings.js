// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Settings.css';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Settings() {
  const { currentUser, userProfile } = useAuth();
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    address: '',
    social: '',
  });

  const [notifications, setNotifications] = useState({
    events: true,
    forumMessages: true,
    newDocs: true,
    timeLogsRejected: true,
  });

  const [allowances, setAllowances] = useState({
    seeProject: true,
    updateProject: true,
    copySchedule: true,
  });

  const usedStorage = 7;
  const totalStorage = 10;

  // Load user profile from context
  useEffect(() => {
    if (userProfile) {
      setProfile({
        name: userProfile.name,
        role: userProfile.role,
        email: userProfile.email,
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        social: userProfile.social || '',
      });

      // Load preferences if stored in profile
      setNotifications((prev) => userProfile.notifications || prev);
      setAllowances((prev) => userProfile.allowances || prev);

    }
  }, [userProfile]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { ...profile });
      alert('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Failed to update profile.');
    }
  };

  const handleToggle = (section, key) => {
    if (section === 'notifications') {
      setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    } else {
      setAllowances((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleSaveSettings = async () => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        notifications,
        allowances,
      });
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
        backgroundColor: ['#663399', '#e0e0e0'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="main-content">
          {/* Top bar (reusable layout header will appear) */}
          <div className="top-section">
            <div className="top-card">
              <div className="search-add">
                <input type="text" placeholder="Search..." />
                <button className="add-btn">+ Add Bug</button>
              </div>
            </div>
          </div>

          <h1 className="page-title">Setting</h1>

          {/* === Profile === */}
        <h2>Profile</h2>
        <div className="card profile-card">
          <div className="left">
            <img src="/default-profile.png" alt="User" className="profile-img" />
            <div className="profile-name">
              <label>Name</label>
              <input name="name" value={profile.name} onChange={handleProfileChange} disabled={!editing} />

              <label>Role</label>
              <input value={profile.role} disabled />
            </div>
          </div>

          <div className="right">
              <div className="contact-info">
              <label>Email</label>
              <input name="email" value={profile.email} onChange={handleProfileChange} disabled={!editing} />

              <label>Phone</label>
              <input name="phone" value={profile.phone} onChange={handleProfileChange} disabled={!editing} />

              <label>Address</label>
              <input name="address" value={profile.address} onChange={handleProfileChange} disabled={!editing} />
            </div>
            <div className="social-links">
              <label>Social Media</label>
              <input name="social" value={profile.social} onChange={handleProfileChange} disabled={!editing} />
            </div>
            <button onClick={editing ? handleSaveProfile : () => setEditing(true)} className="edit-btn">
              {editing ? 'Save' : 'Edit'}
            </button>
          </div>
        </div>

          {/* === Notification & Allowance === */}
          <div className="card dual-card">
            <div className="notify-col">
              <h4>NOTIFY ME FOR THE BELOW ITEMS</h4>
              {[
                ['events', 'Notify my events'],
                ['forumMessages', 'When a message is posted in a forum'],
                ['newDocs', 'When a new document is uploaded'],
                ['timeLogsRejected', "When a user's time logs are rejected"],
              ].map(([key, label]) => (
                <div className="switch-row" key={key}>
                  <span>{label}</span>
                  <label className="switch">
                    <input type="checkbox" checked={notifications[key]} onChange={() => handleToggle('notifications', key)} />
                    <span className="slider" />
                  </label>
                </div>
              ))}
            </div>

            <div className="allowance-column">
            <h4>ALLOWANCE</h4>
            {[
              ['seeProject', 'Allow others to see my project'],
              ['updateProject', 'Allow others to update my project'],
              ['copySchedule', 'Allow others to see and copy my schedule'],
            ].map(([key, label]) => (
              <div className="switch-row" key={key}>
                <span>{label}</span>
                <label className="switch">
                    <input type="checkbox" checked={notifications[key]} onChange={() => handleToggle('notifications', key)} />
                    <span className="slider" />
                  </label>
              </div>
            ))}
          </div>
        </div>
        <button className="save-btn" onClick={handleSaveSettings}>Save Settings</button>

         {/* === Premium Plan === */}
          <div className="card premium-section">
            <div className="chart-col">
              <Pie data={pieData} />
              <p className="storage-text">{usedStorage} GB / {totalStorage} GB Used</p>
            </div>
            <div className="benefits-col">
              <h4>Upgrade for additional benefits:</h4>
              <ul>
                <li>✔ Business rules</li>
                <li>✔ Webhooks</li>
                <li>✔ Custom functions</li>
                <li>✔ Web to bug form</li>
                <li>✔ Custom fields</li>
                <li>✔ Service level agreement</li>
                <li>✔ Custom profiles & roles</li>
              </ul>
              <div className="upgrade-row">
                <span className="upgrade-text">Upgrade to Pro to get unlimited storage</span>
                <button className="upgrade-btn">Upgrade Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}