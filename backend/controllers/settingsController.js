const User = require('../models/User');
const FAQ = require('../models/FAQ');

// PATCH /api/settings/darkmode
exports.toggleDarkMode = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.darkMode = !user.darkMode;
        await user.save();
        res.json({ darkMode: user.darkMode });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/settings/faqs
exports.getFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ order: 1 });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
