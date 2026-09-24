const mongoose = require('mongoose');
const { SEX_TYPES } = require('../constants');

const familyMemberSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
      maxlength: 100
    },
    sex: {
      type: String,
      enum: Object.values(SEX_TYPES),
      default: SEX_TYPES.UNKNOWN
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    isProband: {
      type: Boolean,
      default: false
    },
    deceased: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index for family lookup
familyMemberSchema.index({ familyId: 1, isProband: 1 });

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
