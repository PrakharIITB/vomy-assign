const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'successful'],
    default: 'pending'
  },
  dateReferred: {
    type: Date,
    default: Date.now
  }
});

const Referral = mongoose.model('Referral', referralSchema);
module.exports = Referral;