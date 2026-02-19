const User = require('../models/User');

// GET /api/users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ isArchived: false }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/users (create user/admin)
exports.createUser = async (req, res) => {
    try {
        const { name, studentId, email, password, role } = req.body;

        const existing = await User.findOne({
            $or: [{ email }, { studentId }],
        });
        if (existing) {
            return res.status(400).json({ message: 'User with this email or student ID already exists' });
        }

        const user = await User.create({
            name,
            studentId,
            email,
            password,
            role: role || 'student',
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
    try {
        const { name, email, studentId, role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (studentId) user.studentId = studentId;
        if (role) user.role = role;

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/users/:id (soft delete)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isArchived = true;
        await user.save();
        res.json({ message: 'User archived successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
