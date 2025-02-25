const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model.js');
const Referral = require('../models/referral.model.js');
const generateToken = require('../utils/generateToken.js');
const protect = require('../middleware/auth.middleware.js');
const { validateUser } = require('../validators/authValidator.js');
const handleValidationErrors = require('../middleware/errorHandler.js');

const router = express.Router();

// @route   POST /api/register
// @desc    Register a new user
router.post('/register', validateUser, handleValidationErrors, async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      username,
      email,
      password
    });

    // Handle referral
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
        
        // Create referral record
        await Referral.create({
          referrerId: referrer._id,
          referredUserId: user._id,
          status: 'successful'
        });
      }
    }

    await user.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      referralCode: user.referralCode,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/forgot-password
// @desc    Handle password recovery requests
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Here you would typically send an email with the reset token
    // For demo purposes, we'll just return it
    res.json({ 
      message: 'Password reset token generated',
      resetToken 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/referrals
// @desc    Get referrals for logged in user
router.get('/referrals', protect, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrerId: req.user._id })
      .populate('referredUserId', 'username email');
    res.json(referrals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/referral-stats
// @desc    Get referral statistics
router.get('/referral-stats', protect, async (req, res) => {
  try {
    const stats = await Referral.aggregate([
      { $match: { referrerId: req.user._id } },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;