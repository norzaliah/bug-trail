const Bug = require('../models/Bug');
const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// @desc    Get all bugs
// @route   GET /api/bugs
// @access  Private
exports.getBugs = async (req, res, next) => {
  try {
    const bugs = await Bug.find()
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name');
    res.status(200).json({ success: true, data: bugs });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single bug
// @route   GET /api/bugs/:id
// @access  Private
exports.getBug = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.createdBy', 'name avatar')
      .populate('attachments.uploadedBy', 'name avatar');

    if (!bug) {
      return res.status(404).json({ success: false, error: 'Bug not found' });
    }

    res.status(200).json({ success: true, data: bug });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new bug
// @route   POST /api/bugs
// @access  Private
exports.createBug = async (req, res, next) => {
  try {
    // Check if project exists
    const project = await Project.findById(req.body.project);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Check if assigned user exists (if provided)
    if (req.body.assignedTo) {
      const user = await User.findById(req.body.assignedTo);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Assigned user not found' });
      }
    }

    const bug = await Bug.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: bug });
  } catch (err) {
    next(err);
  }
};

// @desc    Update bug
// @route   PUT /api/bugs/:id
// @access  Private
exports.updateBug = async (req, res, next) => {
  try {
    let bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({ success: false, error: 'Bug not found' });
    }

    // Check if user is the creator or has permission
    if (bug.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to update this bug' });
    }

    // Check if assigned user exists (if provided)
    if (req.body.assignedTo) {
      const user = await User.findById(req.body.assignedTo);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Assigned user not found' });
      }
    }

    bug = await Bug.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: bug });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete bug
// @route   DELETE /api/bugs/:id
// @access  Private (Admin or creator)
exports.deleteBug = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({ success: false, error: 'Bug not found' });
    }

    // Check if user is the creator or admin
    if (bug.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this bug' });
    }

    await bug.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to bug
// @route   POST /api/bugs/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({ success: false, error: 'Bug not found' });
    }

    const comment = {
      text: req.body.text,
      createdBy: req.user.id
    };

    bug.comments.push(comment);
    await bug.save();

    res.status(200).json({ success: true, data: bug.comments });
  } catch (err) {
    next(err);
  }
};