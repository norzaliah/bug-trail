const Project = require('../models/Project');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res, next) => {
  // Get projects where the user is a member or creator
  const projects = await Project.find({
    $or: [
      { createdBy: req.user.id },
      { members: req.user.id }
    ]
  }).populate('createdBy', 'name').populate('members', 'name email');

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects
  });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('members', 'name email');

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is project creator or member
  if (project.createdBy._id.toString() !== req.user.id && 
      !project.members.some(member => member._id.toString() === req.user.id)) {
    return next(
      new ErrorResponse(`Not authorized to access this project`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  const project = await Project.create(req.body);

  res.status(201).json({
    success: true,
    data: project
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is project creator
  if (project.createdBy.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to update this project`, 401)
    );
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is project creator
  if (project.createdBy.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to delete this project`, 401)
    );
  }

  await project.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
exports.addMember = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  const user = await User.findById(req.body.userId);

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
    );
  }

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.body.userId}`, 404)
    );
  }

  // Make sure user is project creator
  if (project.createdBy.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to add members to this project`, 401)
    );
  }

  // Check if user is already a member
  if (project.members.includes(req.body.userId)) {
    return next(
      new ErrorResponse(`User is already a member of this project`, 400)
    );
  }

  project.members.push(req.body.userId);
  await project.save();

  res.status(200).json({
    success: true,
    data: project
  });
});