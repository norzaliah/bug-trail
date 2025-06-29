const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember
} = require('../controllers/projectController');

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.route('/:id/members')
  .post(protect, addMember);

module.exports = router;