const mongoose = require('mongoose');
const { RESULT_CATEGORIES, RULE_OPERATORS } = require('../constants');

const conditionRuleSchema = new mongoose.Schema(
  {
    fact: {
      type: String,
      required: true,
      trim: true
    },
    operator: {
      type: String,
      enum: Object.values(RULE_OPERATORS),
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  { _id: false }
);

const ruleSchema = new mongoose.Schema(
  {
    ruleCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      default: 'GENERAL_GENETICS'
    },
    priority: {
      type: Number,
      default: 10,
      index: true
    },
    conditions: {
      type: [conditionRuleSchema],
      validate: [val => val.length > 0, 'At least one condition is required']
    },
    result: {
      category: {
        type: String,
        enum: Object.values(RESULT_CATEGORIES),
        required: true
      },
      severity: {
        type: String,
        enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
        default: 'MODERATE'
      }
    },
    conclusion: {
      fact: {
        type: String,
        trim: true
      },
      value: {
        type: mongoose.Schema.Types.Mixed
      }
    },
    explanation: {
      type: String,
      required: [true, 'Explanation template is required']
    },
    guidance: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    version: {
      type: Number,
      default: 1
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Rule', ruleSchema);
