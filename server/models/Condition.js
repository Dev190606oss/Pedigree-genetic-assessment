const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Condition name is required'],
      trim: true,
      unique: true
    },
    code: {
      type: String,
      required: [true, 'Condition code is required'],
      trim: true,
      uppercase: true,
      unique: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      enum: ['AUTOSOMAL_RECESSIVE', 'AUTOSOMAL_DOMINANT', 'X_LINKED', 'MITOCHONDRIAL', 'MULTIFACTORIAL', 'CHROMOSOMAL', 'OTHER'],
      default: 'OTHER'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Condition', conditionSchema);
