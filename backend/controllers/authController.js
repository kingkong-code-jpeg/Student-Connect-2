const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, studentId, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { studentId }],
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or student ID already exists' });
        }

        const user = await User.create({ name, studentId, email, password });
        const token = generateToken(user._id);

        res.status(201).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { name, studentId, email, password } = req.body;

        // Validate all fields are provided
        if (!name || !studentId || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Find user by email and studentId
        const user = await User.findOne({
            email,
            studentId,
            isArchived: false
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify name matches (case-insensitive)
        if (user.name.toLowerCase() !== name.toLowerCase()) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/auth/admin-login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Allow login with email or admin ID
        const user = await User.findOne({
            $or: [{ email }, { studentId: email }],
            isArchived: false
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
