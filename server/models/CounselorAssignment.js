const mongoose = require('mongoose');
const { CASE_STATUSES } = require('../constants');

const counselorAssignmentSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true
    },
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(CASE_STATUSES),
      default: CASE_STATUSES.PENDING
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index
counselorAssignmentSchema.index({ familyId: 1, counselorId: 1 });

module.exports = mongoose.model('CounselorAssignment', counselorAssignmentSchema);
