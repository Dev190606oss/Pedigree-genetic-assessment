const { Assessment, Family } = require('../models');
const { executeAssessment } = require('../services/assessmentService');
const { ROLES } = require('../constants');

const runAssessment = async (req, res, next) => {
  try {
    const { familyId } = req.body;
    if (!familyId) {
      return res.status(400).json({ success: false, error: 'familyId is required.' });
    }

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ success: false, error: 'Family not found.' });
    }

    // Role check: Only owner or Counselor/Admin can trigger assessment
    if (req.user.role === ROLES.USER && family.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized to run assessment on this family.' });
    }

    const assessment = await executeAssessment(familyId, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Assessment completed successfully.',
      data: assessment
    });
  } catch (err) {
    next(err);
  }
};

const getFamilyAssessments = async (req, res, next) => {
  try {
    const { familyId } = req.params;
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ success: false, error: 'Family not found.' });
    }

    if (req.user.role === ROLES.USER && family.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    const assessments = await Assessment.find({ familyId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (err) {
    next(err);
  }
};

const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('familyId');
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found.' });
    }

    if (
      req.user.role === ROLES.USER &&
      assessment.userId.toString() !== req.user._id.toString() &&
      assessment.familyId?.ownerId?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  runAssessment,
  getFamilyAssessments,
  getAssessmentById
};
