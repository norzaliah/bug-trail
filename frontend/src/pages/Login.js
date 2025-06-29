import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, signInWithGoogle } from '../firebase';
import './Login.css';

const Home = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/bugs');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error('Login error:', err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/bugs');
    } catch (error) {
      setError('Failed to login with Google.');
      console.error('Google login error:', error);
    }
  };

  return (
    <div className="home-container">
      <header>
        <h1 className="logo">BugTrail.</h1>
      </header>

      <div className="divider"></div>

      <main className="auth-form">
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleEmailLogin}>
          <div className="input-group">
            <label>E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com" 
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <div className="password-header">
              <label>Password</label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password" 
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="login-button">Log In</button>
        </form>

        <div className="or-divider">
          <span>OR</span>
        </div>

        <button 
          className="google-button"
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </button>
      </main>
    </div>
  );
};

export default Home;