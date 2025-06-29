// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { signInWithEmailPassword } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login with email/password
  const login = async (email, password) => {
    try {
      const user = await signInWithEmailPassword(email, password);
      const token = await user.getIdToken();
      localStorage.setItem('token', token);
      setCurrentUser(user);
      await fetchUserProfile(user.uid);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Fetch user profile (name, role, etc.)
  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        console.warn('No user profile found in Firestore');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Listen for Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
        await fetchUserProfile(user.uid);
      } else {
        localStorage.removeItem('token');
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile, // role, fullName, etc.
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}