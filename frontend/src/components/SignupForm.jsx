// frontend/src/components/SignupForm.jsx
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [role, setRole]           = useState('');
  const [error, setError]         = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!role) {
      setError("Please select a role");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user details to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        role,
        createdAt: new Date()
      });

      navigate('/bugs'); // Redirect after successful signup
    } catch (err) {
      setError(`Google signup failed: ${err.code}`);
      console.error('Google signup error code:', err.code);
      console.error('Google signup error message:', err.message);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Optional: save Google user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: user.displayName,
        email: user.email,
        role: 'developer', // default role
        createdAt: new Date()
      });

      navigate('/bugs');
    } catch (err) {
      setError('Google signup failed.');
      console.error(err.message);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      {error && <p className="error-message">{error}</p>}

      <label htmlFor="fullName">Full Name</label>
      <input
        type="text"
        name="fullName"
        placeholder="e.g. Aqilah Razak"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <label htmlFor="email">Email</label>
      <input
        type="email"
        name="email"
        placeholder="your.email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="password">Password</label>
      <input
        type="password"
        name="password"
        placeholder="Create a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <label htmlFor="confirmPassword">Confirm Password</label>
      <input
        type="password"
        name="confirmPassword"
        placeholder="Repeat password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />

      <label htmlFor="role">Select Role</label>
      <select
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
      >
        <option value="">-- Choose a role --</option>
        <option value="developer">Developer</option>
        <option value="tester">Tester</option>
        <option value="project_manager">Project Manager</option>
      </select>

      <button type="submit" className="signup-btn login-btn">Sign Up</button>

      <div className="or">OR</div>

      <button type="button" onClick={handleGoogleSignup} className="google-btn">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png"
          alt="G"
        />
        Sign up with Google
      </button>
    </form>
  );
};

export default SignupForm;