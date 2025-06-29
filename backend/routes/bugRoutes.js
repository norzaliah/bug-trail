const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getBugs,
  getBug,
  createBug,
  updateBug,
  deleteBug,
  addComment
} = require('../controllers/bugController');

router.route('/')
  .get(protect, getBugs)
  .post(protect, createBug);

router.route('/:id')
  .get(protect, getBug)
  .put(protect, updateBug)
  .delete(protect, deleteBug);

router.route('/:id/comments')
  .post(protect, addComment);

module.exports = router;