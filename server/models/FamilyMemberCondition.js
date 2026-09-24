const mongoose = require('mongoose');

const familyMemberConditionSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
      index: true
    },
    conditionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Condition',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['AFFECTED', 'CARRIER', 'SUSPECTED', 'UNAFFECTED'],
      default: 'AFFECTED'
    },
    ageAtOnset: {
      type: Number,
      min: 0,
      max: 125,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      enum: ['CLINICAL_REPORT', 'FAMILY_HISTORY', 'GENETIC_TEST', 'SELF_REPORTED', 'UNKNOWN'],
      default: 'FAMILY_HISTORY'
    }
  },
  {
    timestamps: true
  }
);

// Prevent adding the same condition twice for the same family member
familyMemberConditionSchema.index({ memberId: 1, conditionId: 1 }, { unique: true });

module.exports = mongoose.model('FamilyMemberCondition', familyMemberConditionSchema);
