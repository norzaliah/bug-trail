// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import BugForm from './components/BugForm';
import Login from './pages/Auth';
import Bugs from './pages/Bugs';
import Projects from './pages/Projects';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar';
import Discuss from './pages/Discuss';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bugs" element={<Bugs />} />
          <Route path="bugs/new" element={<BugForm />} />
          <Route path="bugs/:id" element={<BugForm />} />
          <Route path="projects" element={<Projects />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="discuss" element={<Discuss />} />

          {/* Optional: match the "Manage" link in Dashboard's team section */}
          <Route path="team" element={<div><h1>Team Management Page</h1></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;