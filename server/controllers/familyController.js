const { Family, FamilyMember, Relationship, Condition, FamilyMemberCondition, Assessment } = require('../models');
const { ROLES } = require('../constants');
const { logAudit } = require('../middleware/audit');

// Helper to check family ownership/access
const checkFamilyAccess = async (familyId, user) => {
  const family = await Family.findById(familyId);
  if (!family) return { error: 'Family not found', status: 404 };

  if (user.role === ROLES.ADMIN || user.role === ROLES.COUNSELOR) {
    return { family };
  }

  if (family.ownerId.toString() !== user._id.toString()) {
    return { error: 'Forbidden: You do not have permission to access this family record.', status: 403 };
  }

  return { family };
};

// --- FAMILIES ---

const getFamilies = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === ROLES.USER) {
      query.ownerId = req.user._id;
    }
    const families = await Family.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, count: families.length, data: families });
  } catch (err) {
    next(err);
  }
};

const createFamily = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Family name is required.' });
    }

    const family = await Family.create({
      ownerId: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : ''
    });

    await logAudit({
      actorId: req.user._id,
      action: 'FAMILY_CREATED',
      entityType: 'Family',
      entityId: family._id
    });

    res.status(201).json({ success: true, message: 'Family record created.', data: family });
  } catch (err) {
    next(err);
  }
};

const getFamilyById = async (req, res, next) => {
  try {
    const { family, error, status } = await checkFamilyAccess(req.params.id, req.user);
    if (error) return res.status(status).json({ success: false, error });

    const members = await FamilyMember.find({ familyId: family._id }).sort({ createdAt: 1 });
    const relationships = await Relationship.find({ familyId: family._id }).populate('fromMemberId toMemberId');
    const conditions = await FamilyMemberCondition.find({ familyId: family._id }).populate('conditionId memberId');
    const latestAssessment = await Assessment.findOne({ familyId: family._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        family,
        members,
        relationships,
        conditions,
        latestAssessment
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateFamily = async (req, res, next) => {
  try {
    const { family, error, status } = await checkFamilyAccess(req.params.id, req.user);
    if (error) return res.status(status).json({ success: false, error });

    if (req.body.name) family.name = req.body.name.trim();
    if (req.body.description !== undefined) family.description = req.body.description.trim();
    if (req.body.status) family.status = req.body.status;

    await family.save();
    res.json({ success: true, message: 'Family updated.', data: family });
  } catch (err) {
    next(err);
  }
};

const deleteFamily = async (req, res, next) => {
  try {
    const { family, error, status } = await checkFamilyAccess(req.params.id, req.user);
    if (error) return res.status(status).json({ success: false, error });

    const familyId = family._id;
    await FamilyMember.deleteMany({ familyId });
    await Relationship.deleteMany({ familyId });
    await FamilyMemberCondition.deleteMany({ familyId });
    await Assessment.deleteMany({ familyId });
    await family.deleteOne();

    await logAudit({
      actorId: req.user._id,
      action: 'FAMILY_DELETED',
      entityType: 'Family',
      entityId: familyId
    });

    res.json({ success: true, message: 'Family and all associated records deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// --- MEMBERS ---

const addMember = async (req, res, next) => {
  try {
    const { family, error, status } = await checkFamilyAccess(req.params.id, req.user);
    if (error) return res.status(status).json({ success: false, error });

    const { name, sex, dateOfBirth, isProband, deceased, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Member name is required.' });
    }

    // If setting as proband, clear previous proband flag in family
    if (isProband) {
      await FamilyMember.updateMany({ familyId: family._id }, { isProband: false });
    }

    const member = await FamilyMember.create({
      familyId: family._id,
      name: name.trim(),
      sex: sex || 'UNKNOWN',
      dateOfBirth: dateOfBirth || null,
      isProband: Boolean(isProband),
      deceased: Boolean(deceased),
      notes: notes || ''
    });

    res.status(201).json({ success: true, message: 'Family member added.', data: member });
  } catch (err) {
    next(err);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const { family, error, status } = await checkFamilyAccess(req.params.id, req.user);
    if (error) return res.status(status).json({ success: false, error });

    const member = await FamilyMember.findOne({ _id: req.params.memberId, familyId: family._id });
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found in this family.' });
    }

    const { name, sex, dateOfBirth, isProband, deceased, notes } = req.body;
    if (name) member.name = name.trim();
    if (sex) member.sex = sex;
    if (dateOfBirth !== undefined) member.dateOfBirth = dateOfBirth;
    if (notes !== undefined) member.notes = notes;
    if (deceased !== undefined) member.deceased = deceased;

    if (isProband !== undefined) {
      if (isProband) {
        await FamilyMember.updateMany({ familyId: family._id }, { isProband: false });
      }
      member.isProband = isProband;
    }

    await member.save();
    res.json({ success: true, message: 'Family member updated.', data: member });
  } catch (err) {
    next(err);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    const { family, error, status } = await checkFamilyAccess(req.params.id, req.user);
    if (error) return res.status(status).json({ success: false, error });

    const memberId = req.params.memberId;
    const member = await FamilyMember.findOne({ _id: memberId, familyId: family._id });
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found.' });
    }

    // Cascade delete relationships involving this member
    await Relationship.deleteMany({
      familyId: family._id,
      $or: [{ fromMemberId: memberId }, { toMemberId: memberId }]
    });

    // Cascade delete conditions for this member
    await FamilyMemberCondition.deleteMany({ familyId: family._id, memberId });

    await member.deleteOne();
    res.json({ success: true, message: 'Family member removed.' });
  } catch (err) {
    next(err);
  }
};

// --- RELATIONSHIPS ---

const addRelationship = async (req, res, next) => {
  try {
    const { family, error, status } = await checkFamilyAccess(req.params.id, req.user);
    if (error) return res.status(status).json({ success: false, error });

    const { fromMemberId, toMemberId, type, metadata } = req.body;

    if (!fromMemberId || !toMemberId || !type) {
      return res.status(400).json({ success: false, error: 'fromMemberId, toMemberId, and relationship type are required.' });
    }

    if (fromMemberId.toString() === toMemberId.toString()) {
      return res.status(400).json({ success: false, error: 'A member cannot have a relationship with themselves.' });
    }

    // Verify both members belong to this family
    const [fromMember, toMember] = await Promise.all([
      FamilyMember.findOne({ _id: fromMemberId, familyId: family._id }),
      FamilyMember.findOne({ _id: toMemberId, familyId: family._id })
    ]);

    if (!fromMember || !toMember) {
      return res.status(400).json({ success: false, error: 'Both members must exist within this family.' });
    }

    // Check for existing identical relationship
    const existing = await Relationship.findOne({
      familyId: family._id,
      $or: [
        { fromMemberId, toMemberId, type },
        // For reciprocal relationships (SPOUSE, PARTNER, SIBLING)
        { fromMemberId: toMemberId, toMemberId: fromMemberId, type }
      ]
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'This relationship already exists between these members.' });
    }

    const relationship = await Relationship.create({
      familyId: family._id,
      fromMemberId,
      toMemberId,
      type,
      metadata: metadata || {}
    });

    const populated = await Relationship.findById(relationship._id).populate('fromMemberId toMemberId');
    res.status(201).json({ success: true, message: 'Relationship added.', data: populated });
  } catch (err) {
    next(err);
  }
};

const deleteRelationship = async (req, res, next) => {
  try {
    const { family, error, status } = await checkFamilyAccess(req.params.id, req.user);
    if (error) return res.status(status).json({ success: false, error });

    const rel = await Relationship.findOneAndDelete({
      _id: req.params.relationshipId,
      familyId: family._id
    });

    if (!rel) {
      return res.status(404).json({ success: false, error: 'Relationship not found.' });
    }

    res.json({ success: true, message: 'Relationship removed.' });
  } catch (err) {
    next(err);
  }
};

// --- CONDITIONS ---

const addMemberCondition = async (req, res, next) => {
  try {
    const { family, error, status } = await checkFamilyAccess(req.params.id, req.user);
    if (error) return res.status(status).json({ success: false, error });

    const { memberId, conditionId, status: condStatus, ageAtOnset, notes, source } = req.body;

    if (!memberId || !conditionId) {
      return res.status(400).json({ success: false, error: 'memberId and conditionId are required.' });
    }

    const member = await FamilyMember.findOne({ _id: memberId, familyId: family._id });
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found in this family.' });
    }

    const condition = await Condition.findById(conditionId);
    if (!condition) {
      return res.status(404).json({ success: false, error: 'Condition not found in catalog.' });
    }

    // Check duplicate
    const existing = await FamilyMemberCondition.findOne({ memberId, conditionId });
    if (existing) {
      return res.status(400).json({ success: false, error: 'This condition is already recorded for this member.' });
    }

    const memberCond = await FamilyMemberCondition.create({
      familyId: family._id,
      memberId,
      conditionId,
      status: condStatus || 'AFFECTED',
      ageAtOnset: ageAtOnset ? Number(ageAtOnset) : null,
      notes: notes || '',
      source: source || 'FAMILY_HISTORY'
    });

    const populated = await FamilyMemberCondition.findById(memberCond._id).populate('conditionId memberId');
    res.status(201).json({ success: true, message: 'Condition added to member.', data: populated });
  } catch (err) {
    next(err);
  }
};

const deleteMemberCondition = async (req, res, next) => {
  try {
    const { family, error, status } = await checkFamilyAccess(req.params.id, req.user);
    if (error) return res.status(status).json({ success: false, error });

    const deleted = await FamilyMemberCondition.findOneAndDelete({
      _id: req.params.conditionRecordId,
      familyId: family._id
    });

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Condition record not found.' });
    }

    res.json({ success: true, message: 'Condition record removed.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFamilies,
  createFamily,
  getFamilyById,
  updateFamily,
  deleteFamily,
  addMember,
  updateMember,
  deleteMember,
  addRelationship,
  deleteRelationship,
  addMemberCondition,
  deleteMemberCondition
};
