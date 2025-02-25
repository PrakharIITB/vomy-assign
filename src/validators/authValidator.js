const { body } = require('express-validator')

const validateUser = [
    body('email')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('username')
        .isAlphanumeric()
        .withMessage('Username must be alphanumeric')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('Password must contain at least one special character'),

    body('referralCode')
        .optional()
        .isString()
        .withMessage('Referral code must be a string')
];

module.exports = { validateUser }