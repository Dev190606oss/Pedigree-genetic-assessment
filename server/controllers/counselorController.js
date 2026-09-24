const { CounselorAssignment, CounselorNote, Family, FamilyMember, Relationship, FamilyMemberCondition, Assessment, Notification } = require('../models');
const { CASE_STATUSES, NOTIFICATION_TYPES } = require('../constants');
const { logAudit } = require('../middleware/audit');

const getAssignedCases = async (req, res, next) => {
  try {
    const assignments = await CounselorAssignment.find({ counselorId: req.user._id })
      .populate({
        path: 'familyId',
        populate: { path: 'ownerId', select: 'name email' }
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (err) {
    next(err);
  }
};

const getCaseDetails = async (req, res, next) => {
  try {
    const familyId = req.params.familyId;
    const family = await Family.findById(familyId).populate('ownerId', 'name email');
    if (!family) {
      return res.status(404).json({ success: false, error: 'Family case not found.' });
    }

    const members = await FamilyMember.find({ familyId });
    const relationships = await Relationship.find({ familyId }).populate('fromMemberId toMemberId');
    const conditions = await FamilyMemberCondition.find({ familyId }).populate('conditionId memberId');
    const assessments = await Assessment.find({ familyId }).sort({ createdAt: -1 });
    const notes = await CounselorNote.find({ familyId }).populate('counselorId', 'name email').sort({ createdAt: -1 });
    const assignment = await CounselorAssignment.findOne({ familyId, counselorId: req.user._id });

    res.json({
      success: true,
      data: {
        family,
        members,
        relationships,
        conditions,
        assessments,
        notes,
        assignment
      }
    });
  } catch (err) {
    next(err);
  }
};

const addNote = async (req, res, next) => {
  try {
    const { familyId } = req.params;
    const { assessmentId, note, recommendation } = req.body;

    if (!note) {
      return res.status(400).json({ success: false, error: 'Note content is required.' });
    }

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ success: false, error: 'Family case not found.' });
    }

    // Default to latest assessment if not specified
    let targetAssessmentId = assessmentId;
    if (!targetAssessmentId) {
      const latest = await Assessment.findOne({ familyId }).sort({ createdAt: -1 });
      targetAssessmentId = latest?._id;
    }

    if (!targetAssessmentId) {
      return res.status(400).json({ success: false, error: 'No assessment found for this family to attach notes.' });
    }

    const counselorNote = await CounselorNote.create({
      familyId,
      counselorId: req.user._id,
      assessmentId: targetAssessmentId,
      note: note.trim(),
      recommendation: recommendation ? recommendation.trim() : ''
    });

    // Update assignment status to REVIEWED or IN_REVIEW if not already
    await CounselorAssignment.findOneAndUpdate(
      { familyId, counselorId: req.user._id },
      { status: CASE_STATUSES.REVIEWED, updatedAt: new Date() }
    );

    // Notify patient
    await Notification.create({
      recipientId: family.ownerId,
      title: 'Counselor Review Added',
      message: `Genetic counselor ${req.user.name} has added clinical notes and guidance to your case.`,
      type: NOTIFICATION_TYPES.NOTE_ADDED,
      link: `/user/dashboard`
    });

    await logAudit({
      actorId: req.user._id,
      action: 'COUNSELOR_NOTE_ADDED',
      entityType: 'CounselorNote',
      entityId: counselorNote._id,
      metadata: { familyId }
    });

    res.status(201).json({
      success: true,
      message: 'Clinical note added successfully.',
      data: counselorNote
    });
  } catch (err) {
    next(err);
  }
};

const updateCaseStatus = async (req, res, next) => {
  try {
    const { familyId } = req.params;
    const { status } = req.body;

    if (!Object.values(CASE_STATUSES).includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid case status.' });
    }

    let assignment = await CounselorAssignment.findOne({ familyId, counselorId: req.user._id });
    if (!assignment) {
      // Create self-assignment if counselor chooses to review case
      assignment = await CounselorAssignment.create({
        familyId,
        counselorId: req.user._id,
        assignedBy: req.user._id,
        status
      });
    } else {
      assignment.status = status;
      await assignment.save();
    }

    await logAudit({
      actorId: req.user._id,
      action: 'CASE_STATUS_UPDATED',
      entityType: 'CounselorAssignment',
      entityId: assignment._id,
      metadata: { status, familyId }
    });

    res.json({
      success: true,
      message: `Case status updated to ${status}.`,
      data: assignment
    });
  } catch (err) {
    next(err);
  }
};

const getCounselorStats = async (req, res, next) => {
  try {
    const [totalAssigned, pendingCases, completedCases, totalNotes] = await Promise.all([
      CounselorAssignment.countDocuments({ counselorId: req.user._id }),
      CounselorAssignment.countDocuments({ counselorId: req.user._id, status: CASE_STATUSES.PENDING }),
      CounselorAssignment.countDocuments({ counselorId: req.user._id, status: CASE_STATUSES.COMPLETED }),
      CounselorNote.countDocuments({ counselorId: req.user._id })
    ]);

    res.json({
      success: true,
      data: {
        totalAssigned,
        pendingCases,
        completedCases,
        totalNotes
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAssignedCases,
  getCaseDetails,
  addNote,
  updateCaseStatus,
  getCounselorStats
};
