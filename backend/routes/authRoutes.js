const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { login, register, getMe } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);

module.exports = router;