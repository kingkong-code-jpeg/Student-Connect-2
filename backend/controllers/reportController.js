const Event = require('../models/Event');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const User = require('../models/User');
const generatePDF = require('../utils/generatePDF');

// GET /api/reports/events
exports.eventsReport = async (req, res) => {
    try {
        const events = await Event.find().populate('author', 'name').sort({ eventDate: -1 });

        const columns = ['Title', 'Category', 'Event Date', 'Location', 'Status', 'Author', 'Created'];
        const rows = events.map(e => [
            e.title,
            e.category,
            e.eventDate ? new Date(e.eventDate).toLocaleDateString() : '',
            e.location,
            e.status,
            e.author?.name || 'N/A',
            new Date(e.createdAt).toLocaleDateString(),
        ]);

        generatePDF(res, 'Events Report', columns, rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/lost-items
exports.lostItemsReport = async (req, res) => {
    try {
        const items = await LostItem.find().populate('postedBy', 'name').sort({ createdAt: -1 });

        const columns = ['Description', 'Category', 'Date Lost', 'Location', 'Owner', 'Contact', 'Status', 'Date Posted'];
        const rows = items.map(i => [
            i.description?.substring(0, 40),
            i.category,
            i.dateLost ? new Date(i.dateLost).toLocaleDateString() : '',
            i.locationLost,
            i.ownerName,
            i.ownerContact,
            i.status,
            new Date(i.createdAt).toLocaleDateString(),
        ]);

        generatePDF(res, 'Lost Items Report', columns, rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/found-items
exports.foundItemsReport = async (req, res) => {
    try {
        const items = await FoundItem.find().populate('postedBy', 'name').sort({ createdAt: -1 });

        const columns = ['Description', 'Category', 'Date Found', 'Location', 'Finder', 'Contact', 'Status', 'Date Posted'];
        const rows = items.map(i => [
            i.description?.substring(0, 40),
            i.category,
            i.dateFound ? new Date(i.dateFound).toLocaleDateString() : '',
            i.locationFound,
            i.finderName,
            i.finderContact,
            i.status,
            new Date(i.createdAt).toLocaleDateString(),
        ]);

        generatePDF(res, 'Found Items Report', columns, rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/users
exports.usersReport = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        const columns = ['Name', 'Student ID', 'Email', 'Role', 'Status', 'Created'];
        const rows = users.map(u => [
            u.name,
            u.studentId,
            u.email,
            u.role,
            u.isArchived ? 'Archived' : 'Active',
            new Date(u.createdAt).toLocaleDateString(),
        ]);

        generatePDF(res, 'Users Report', columns, rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
