const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin SDK (make sure to set up your Firebase project)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

// Protect routes with Firebase authentication
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUser = await admin.auth().getUser(decodedToken.uid);
    
    // Find or create user in our database
    let user = await User.findOne({ firebaseId: firebaseUser.uid });
    
    if (!user) {
      user = await User.create({
        firebaseId: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0]
      });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error('Error verifying Firebase token:', err);
    res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

// Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};