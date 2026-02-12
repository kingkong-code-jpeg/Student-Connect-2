const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/upload');

// PATCH /api/profile
exports.updateProfile = async (req, res) => {
    try {
        const { course, yearLevel, section } = req.body;
        const updates = {};
        if (course !== undefined) updates.course = course;
        if (yearLevel !== undefined) updates.yearLevel = yearLevel;
        if (section !== undefined) updates.section = section;

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/profile/password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/profile/picture
exports.changeProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const url = await uploadToCloudinary(req.file.buffer, 'iccthub/profiles');

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profilePicture: url },
            { new: true }
        );

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
