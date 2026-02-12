const LostItem = require('../models/LostItem');
const { uploadMultipleToCloudinary } = require('../middleware/upload');

// GET /api/lost-items
exports.getLostItems = async (req, res) => {
    try {
        const { status, category } = req.query;
        const filter = { isArchived: false };
        if (status) filter.status = status;
        if (category) filter.category = category;

        const items = await LostItem.find(filter)
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/lost-items/:id
exports.getLostItemById = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id)
            .populate('postedBy', 'name email studentId');
        if (!item || item.isArchived) {
            return res.status(404).json({ message: 'Lost item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/lost-items
exports.createLostItem = async (req, res) => {
    try {
        const { description, dateLost, locationLost, category, ownerName, ownerContact } = req.body;

        let images = [];
        if (req.files && req.files.length > 0) {
            images = await uploadMultipleToCloudinary(req.files, 'iccthub/lost');
        }

        const item = await LostItem.create({
            description,
            images,
            dateLost,
            locationLost,
            category,
            ownerName,
            ownerContact,
            postedBy: req.user._id,
        });

        await item.populate('postedBy', 'name email');
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/lost-items/:id
exports.updateLostItem = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id);
        if (!item || item.isArchived) {
            return res.status(404).json({ message: 'Lost item not found' });
        }

        // Allow owner or admin to update
        const isOwner = item.postedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        const allowedFields = ['description', 'dateLost', 'locationLost', 'category', 'ownerName', 'ownerContact', 'status'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) item[field] = req.body[field];
        });

        if (req.files && req.files.length > 0) {
            const newImages = await uploadMultipleToCloudinary(req.files, 'iccthub/lost');
            item.images = [...item.images, ...newImages];
        }

        await item.save();
        await item.populate('postedBy', 'name email');
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/lost-items/:id (soft delete)
exports.deleteLostItem = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Lost item not found' });
        }

        // Allow owner or admin to delete
        const isOwner = item.postedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this item' });
        }

        item.isArchived = true;
        await item.save();
        res.json({ message: 'Lost item archived successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
