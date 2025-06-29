import React, { useState } from 'react';
import '../styles/Auth.css';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import { AnimatePresence, motion } from 'framer-motion';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="logo">BugTrail<span>.</span></h1>

        <div className="tab">
          <span
            className={isLogin ? 'active' : 'inactive'}
            onClick={() => setIsLogin(true)}
          >
            Log in
          </span>
          <span
            className={!isLogin ? 'active' : 'inactive'}
            onClick={() => setIsLogin(false)}
          >
            Sign up
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {isLogin ? <LoginForm /> : <SignupForm />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Auth;