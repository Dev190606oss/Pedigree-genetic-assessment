const { User, CounselorAssignment, CounselorNote, Family, FamilyMember, Relationship, FamilyMemberCondition, Assessment, Notification } = require('../models');
const { CASE_STATUSES, NOTIFICATION_TYPES } = require('../constants');
const { logAudit } = require('../middleware/audit');
const { applyQuickFill } = require('../services/quickFillService');
const { executeAssessment } = require('../services/assessmentService');

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

const quickFillCase = async (req, res, next) => {
  try {
    const { scenarioKey = 'recessive_consanguinity' } = req.body;

    // Find a demo patient user to associate the synthetic case with
    let demoPatient = await User.findOne({ email: 'user@genetrace.local' });
    if (!demoPatient) {
      demoPatient = await User.findOne({ role: 'USER' });
    }
    if (!demoPatient) {
      return res.status(400).json({ success: false, error: 'No patient user found to associate synthetic case with.' });
    }

    // Find or create synthetic demonstration family for counselor review
    let family = await Family.findOne({
      ownerId: demoPatient._id,
      name: { $regex: /\[Synthetic Demo\]/i }
    });

    if (!family) {
      family = await Family.create({
        ownerId: demoPatient._id,
        name: '[Synthetic Demo] Clinical Counselor Review Case',
        description: 'Synthetic demonstration case for clinical genetic counselor evaluation and note-taking.',
        status: 'ACTIVE'
      });
    }

    // Apply the chosen synthetic scenario
    await applyQuickFill(family._id, scenarioKey, req.user);

    // Execute real AIES assessment so the case has clinical rule findings
    const assessmentResult = await executeAssessment(family._id, demoPatient._id);

    // Create or update counselor assignment to current counselor
    let assignment = await CounselorAssignment.findOne({
      familyId: family._id,
      counselorId: req.user._id
    });

    if (!assignment) {
      assignment = await CounselorAssignment.create({
        familyId: family._id,
        counselorId: req.user._id,
        assignedBy: req.user._id,
        status: CASE_STATUSES.IN_REVIEW
      });
    } else {
      assignment.status = CASE_STATUSES.IN_REVIEW;
      assignment.updatedAt = new Date();
      await assignment.save();
    }

    await logAudit({
      actorId: req.user._id,
      action: 'COUNSELOR_DEMO_CASE_QUICK_FILLED',
      entityType: 'CounselorAssignment',
      entityId: assignment._id,
      metadata: { familyId: family._id, scenarioKey }
    });

    res.status(201).json({
      success: true,
      message: 'Demonstration case successfully prepared and assigned for clinical review.',
      data: {
        familyId: family._id,
        familyName: family.name,
        assignmentId: assignment._id,
        scenarioKey,
        assessmentCategory: assessmentResult?.resultCategory
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
  getCounselorStats,
  quickFillCase
};
