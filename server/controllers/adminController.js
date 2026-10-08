const { User, Family, Condition, Rule, Assessment, CounselorAssignment, AuditLog } = require('../models');
const { ROLES, CASE_STATUSES } = require('../constants');
const { logAudit } = require('../middleware/audit');

// --- USERS & COUNSELORS ---

const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    // Prevent deactivating own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot deactivate your own account.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await logAudit({
      actorId: req.user._id,
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: user._id
    });

    res.json({ success: true, message: `User status set to ${user.isActive ? 'Active' : 'Inactive'}.`, data: user });
  } catch (err) {
    next(err);
  }
};

const getCounselors = async (req, res, next) => {
  try {
    const counselors = await User.find({ role: ROLES.COUNSELOR }).select('-passwordHash').sort({ name: 1 });
    res.json({ success: true, count: counselors.length, data: counselors });
  } catch (err) {
    next(err);
  }
};

// --- CONDITIONS CATALOGUE ---

const getConditions = async (req, res, next) => {
  try {
    const conditions = await Condition.find().sort({ name: 1 });
    res.json({ success: true, count: conditions.length, data: conditions });
  } catch (err) {
    next(err);
  }
};

const createCondition = async (req, res, next) => {
  try {
    const { name, code, description, category, isActive } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'Condition name and code are required.' });
    }

    const condition = await Condition.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description ? description.trim() : '',
      category: category || 'OTHER',
      isActive: isActive !== undefined ? isActive : true
    });

    await logAudit({
      actorId: req.user._id,
      action: 'CONDITION_CREATED',
      entityType: 'Condition',
      entityId: condition._id
    });

    res.status(201).json({ success: true, message: 'Condition added to catalog.', data: condition });
  } catch (err) {
    next(err);
  }
};

const updateCondition = async (req, res, next) => {
  try {
    const condition = await Condition.findById(req.params.id);
    if (!condition) return res.status(404).json({ success: false, error: 'Condition not found.' });

    const { name, code, description, category, isActive } = req.body;
    if (name) condition.name = name.trim();
    if (code) condition.code = code.trim().toUpperCase();
    if (description !== undefined) condition.description = description.trim();
    if (category) condition.category = category;
    if (isActive !== undefined) condition.isActive = isActive;

    await condition.save();
    res.json({ success: true, message: 'Condition updated.', data: condition });
  } catch (err) {
    next(err);
  }
};

const deleteCondition = async (req, res, next) => {
  try {
    const condition = await Condition.findByIdAndDelete(req.params.id);
    if (!condition) return res.status(404).json({ success: false, error: 'Condition not found.' });

    await logAudit({
      actorId: req.user._id,
      action: 'CONDITION_DELETED',
      entityType: 'Condition',
      entityId: condition._id
    });

    res.json({ success: true, message: 'Condition removed from catalog.' });
  } catch (err) {
    next(err);
  }
};

// --- RULES ENGINE GOVERNANCE ---

const getRules = async (req, res, next) => {
  try {
    const rules = await Rule.find().sort({ priority: -1 });
    res.json({ success: true, count: rules.length, data: rules });
  } catch (err) {
    next(err);
  }
};

const createRule = async (req, res, next) => {
  try {
    const { ruleCode, name, description, category, priority, conditions, conclusion, result, explanation, guidance, isActive } = req.body;

    if (!name || !conditions || !result || !explanation) {
      return res.status(400).json({ success: false, error: 'Name, conditions, result category, and explanation are required.' });
    }

    const rule = await Rule.create({
      ruleCode: ruleCode ? ruleCode.trim().toUpperCase() : `RULE-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      description: description ? description.trim() : '',
      category: category || 'GENERAL_GENETICS',
      priority: priority !== undefined ? Number(priority) : 10,
      conditions,
      conclusion: conclusion || null,
      result,
      explanation: explanation.trim(),
      guidance: Array.isArray(guidance) ? guidance : (guidance ? [guidance] : []),
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id
    });

    await logAudit({
      actorId: req.user._id,
      action: 'RULE_CREATED',
      entityType: 'Rule',
      entityId: rule._id,
      metadata: { ruleCode: rule.ruleCode }
    });

    res.status(201).json({ success: true, message: 'Expert system rule created.', data: rule });
  } catch (err) {
    next(err);
  }
};

const updateRule = async (req, res, next) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found.' });

    const fields = ['ruleCode', 'name', 'description', 'category', 'priority', 'conditions', 'conclusion', 'result', 'explanation', 'guidance', 'isActive'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) rule[f] = req.body[f];
    });

    rule.version = (rule.version || 1) + 1;
    await rule.save();

    await logAudit({
      actorId: req.user._id,
      action: 'RULE_UPDATED',
      entityType: 'Rule',
      entityId: rule._id,
      metadata: { newVersion: rule.version }
    });

    res.json({ success: true, message: 'Rule updated.', data: rule });
  } catch (err) {
    next(err);
  }
};

const deleteRule = async (req, res, next) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found.' });

    await logAudit({
      actorId: req.user._id,
      action: 'RULE_DELETED',
      entityType: 'Rule',
      entityId: rule._id
    });

    res.json({ success: true, message: 'Rule deleted from knowledge base.' });
  } catch (err) {
    next(err);
  }
};

// --- CASE ASSIGNMENT ---

const assignCase = async (req, res, next) => {
  try {
    const { familyId, counselorId } = req.body;
    if (!familyId || !counselorId) {
      return res.status(400).json({ success: false, error: 'familyId and counselorId are required.' });
    }

    const [family, counselor] = await Promise.all([
      Family.findById(familyId),
      User.findOne({ _id: counselorId, role: ROLES.COUNSELOR })
    ]);

    if (!family) return res.status(404).json({ success: false, error: 'Family not found.' });
    if (!counselor) return res.status(404).json({ success: false, error: 'Genetic counselor not found.' });

    let assignment = await CounselorAssignment.findOne({ familyId, counselorId });
    if (!assignment) {
      assignment = await CounselorAssignment.create({
        familyId,
        counselorId,
        assignedBy: req.user._id,
        status: CASE_STATUSES.PENDING
      });
    } else {
      assignment.status = CASE_STATUSES.PENDING;
      await assignment.save();
    }

    await logAudit({
      actorId: req.user._id,
      action: 'CASE_ASSIGNED',
      entityType: 'CounselorAssignment',
      entityId: assignment._id,
      metadata: { familyId, counselorId }
    });

    res.json({ success: true, message: `Case assigned to counselor ${counselor.name}.`, data: assignment });
  } catch (err) {
    next(err);
  }
};

// --- ANALYTICS & AUDIT LOGS ---

const getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalCounselors, totalFamilies, totalAssessments, assessments] = await Promise.all([
      User.countDocuments({ role: ROLES.USER }),
      User.countDocuments({ role: ROLES.COUNSELOR }),
      Family.countDocuments(),
      Assessment.countDocuments(),
      Assessment.find().select('resultCategory triggeredRules')
    ]);

    // Compute category distribution
    const categoryDistribution = {};
    const ruleFrequency = {};

    assessments.forEach(a => {
      categoryDistribution[a.resultCategory] = (categoryDistribution[a.resultCategory] || 0) + 1;
      (a.triggeredRules || []).forEach(tr => {
        const code = tr.ruleCode || tr.name;
        ruleFrequency[code] = (ruleFrequency[code] || 0) + 1;
      });
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCounselors,
        totalFamilies,
        totalAssessments,
        categoryDistribution,
        ruleFrequency
      }
    });
  } catch (err) {
    next(err);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  toggleUserStatus,
  getCounselors,
  getConditions,
  createCondition,
  updateCondition,
  deleteCondition,
  getRules,
  createRule,
  updateRule,
  deleteRule,
  assignCase,
  getAnalytics,
  getAuditLogs
};
