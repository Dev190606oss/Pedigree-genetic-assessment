const mongoose = require('mongoose');
const { RELATIONSHIP_TYPES } = require('../constants');

const relationshipSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true
    },
    fromMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true
    },
    toMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true
    },
    type: {
      type: String,
      enum: Object.values(RELATIONSHIP_TYPES),
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate relationship between same two members of same type
relationshipSchema.index({ familyId: 1, fromMemberId: 1, toMemberId: 1, type: 1 }, { unique: true });

// Validation: fromMemberId cannot equal toMemberId
relationshipSchema.pre('validate', function (next) {
  if (this.fromMemberId && this.toMemberId && this.fromMemberId.toString() === this.toMemberId.toString()) {
    return next(new Error('A family member cannot have a relationship with themselves.'));
  }
  next();
});

module.exports = mongoose.model('Relationship', relationshipSchema);
