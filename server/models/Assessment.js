const mongoose = require('mongoose');
const { RESULT_CATEGORIES } = require('../constants');

const assessmentSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    inputSnapshot: {
      family: { type: mongoose.Schema.Types.Mixed },
      members: [{ type: mongoose.Schema.Types.Mixed }],
      relationships: [{ type: mongoose.Schema.Types.Mixed }],
      conditions: [{ type: mongoose.Schema.Types.Mixed }]
    },
    facts: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    derivedFacts: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    inferenceTrace: {
      passes: [{
        passNumber: Number,
        rulesEvaluated: Number,
        rulesTriggered: [String],
        newFactsDerived: mongoose.Schema.Types.Mixed,
        evaluatedRules: [{ type: mongoose.Schema.Types.Mixed }]
      }],
      totalPasses: Number,
      conflictResolution: { type: mongoose.Schema.Types.Mixed }
    },
    conflictResolution: { type: mongoose.Schema.Types.Mixed },
    backwardChaining: {
      goal: String,
      targetValue: mongoose.Schema.Types.Mixed,
      satisfied: Boolean,
      proofSteps: [{
        step: Number,
        ruleCode: String,
        ruleName: String,
        requiredFact: String,
        operator: String,
        expectedValue: mongoose.Schema.Types.Mixed,
        actualValue: mongoose.Schema.Types.Mixed,
        satisfied: Boolean,
        derivedFromRule: String
      }]
    },
    triggeredRules: [
      {
        ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rule' },
        ruleCode: String,
        name: String,
        version: Number,
        priority: Number,
        category: String,
        resultCategory: String,
        matchingFacts: mongoose.Schema.Types.Mixed,
        explanation: String,
        guidance: [String]
      }
    ],
    resultCategory: {
      type: String,
      enum: Object.values(RESULT_CATEGORIES),
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    guidance: {
      type: [String],
      default: []
    },
    disclaimer: {
      type: String,
      default: 'This assessment is based only on the family information entered into the system. It is not a medical diagnosis or a prediction of whether a person will develop or transmit a condition. Consider discussing your family history with a qualified healthcare professional or genetic counselor.'
    },
    engineVersion: {
      type: String,
      default: '2.0.0'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
