const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ROLES } = require('../constants');
const { JWT_SECRET } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Register a new User account
 * IMPORTANT: Public registration strictly creates USER role only.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Enforce USER role regardless of payload
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: ROLES.USER,
      isActive: true
    });

    const token = generateToken(user);

    await logAudit({
      actorId: user._id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user._id,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login handler for all roles
 * Supports role enforcement for dedicated login portals
 */
const login = async (req, res, next) => {
  try {
    const { email, password, requiredRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      if (email.toLowerCase().endsWith('@genetrace.local')) {
        const altEmail = email.toLowerCase().replace('@genetrace.local', '@pedigree.local');
        user = await User.findOne({ email: altEmail });
      } else if (email.toLowerCase().endsWith('@pedigree.local')) {
        const altEmail = email.toLowerCase().replace('@pedigree.local', '@genetrace.local');
        user = await User.findOne({ email: altEmail });
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account has been deactivated. Please contact support.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    // Portal role verification: if logging in through /counselor/login or /admin/login
    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: This portal is reserved for ${requiredRole} accounts only.`
      });
    }

    const token = generateToken(user);

    await logAudit({
      actorId: user._id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id,
      ipAddress: req.ip,
      metadata: { role: user.role }
    });

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Returns current authenticated profile
 */
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

module.exports = {
  register,
  login,
  getMe
};
