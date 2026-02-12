const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/messages (inbox)
exports.getInbox = async (req, res) => {
    try {
        const { label, search } = req.query;
        const filter = { to: req.user._id, isArchived: false };

        if (label) {
            filter.labels = label;
        }

        let query = Message.find(filter);

        // Text search on subject and body
        if (search) {
            filter.$text = { $search: search };
            query = Message.find(filter);
        }

        const messages = await query
            .populate('from', 'name email studentId')
            .sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/messages/sent
exports.getSent = async (req, res) => {
    try {
        const messages = await Message.find({ from: req.user._id, isArchived: false })
            .populate('to', 'name email studentId')
            .sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/messages
exports.sendMessage = async (req, res) => {
    try {
        const { to, subject, body, labels } = req.body;

        // Find recipient by email or studentId
        const recipient = await User.findOne({
            $or: [{ email: to }, { studentId: to }],
            isArchived: false,
        });

        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        const message = await Message.create({
            from: req.user._id,
            to: recipient._id,
            subject: subject || '(No Subject)',
            body,
            labels: labels || [],
        });

        await message.populate('from', 'name email');
        await message.populate('to', 'name email');
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/messages/:id
exports.getMessageById = async (req, res) => {
    try {
        const message = await Message.findOne({
            _id: req.params.id,
            $or: [{ to: req.user._id }, { from: req.user._id }],
            isArchived: false,
        })
            .populate('from', 'name email studentId')
            .populate('to', 'name email studentId');

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Mark as read if recipient is viewing
        if (message.to._id.toString() === req.user._id.toString() && !message.read) {
            message.read = true;
            await message.save();
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/messages/:id/read
exports.markRead = async (req, res) => {
    try {
        const message = await Message.findOne({ _id: req.params.id, to: req.user._id });
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.read = true;
        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/messages/:id/labels
exports.updateLabels = async (req, res) => {
    try {
        const { labels } = req.body;
        const message = await Message.findOne({
            _id: req.params.id,
            $or: [{ to: req.user._id }, { from: req.user._id }],
        });

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.labels = labels;
        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/messages/:id (soft delete)
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findOne({
            _id: req.params.id,
            $or: [{ to: req.user._id }, { from: req.user._id }],
        });

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.isArchived = true;
        await message.save();
        res.json({ message: 'Message archived successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
