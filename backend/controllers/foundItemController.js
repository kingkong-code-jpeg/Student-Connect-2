const FoundItem = require('../models/FoundItem');
const { uploadMultipleToCloudinary } = require('../middleware/upload');

// GET /api/found-items
exports.getFoundItems = async (req, res) => {
    try {
        const { status, category } = req.query;
        const filter = { isArchived: false };
        if (status) filter.status = status;
        if (category) filter.category = category;

        const items = await FoundItem.find(filter)
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/found-items/:id
exports.getFoundItemById = async (req, res) => {
    try {
        const item = await FoundItem.findById(req.params.id)
            .populate('postedBy', 'name email studentId');
        if (!item || item.isArchived) {
            return res.status(404).json({ message: 'Found item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/found-items
exports.createFoundItem = async (req, res) => {
    try {
        const { description, dateFound, locationFound, category, finderName, finderContact } = req.body;

        let images = [];
        if (req.files && req.files.length > 0) {
            images = await uploadMultipleToCloudinary(req.files, 'iccthub/found');
        }

        const item = await FoundItem.create({
            description,
            images,
            dateFound,
            locationFound,
            category,
            finderName,
            finderContact,
            postedBy: req.user._id,
        });

        await item.populate('postedBy', 'name email');
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/found-items/:id
exports.updateFoundItem = async (req, res) => {
    try {
        const item = await FoundItem.findById(req.params.id);
        if (!item || item.isArchived) {
            return res.status(404).json({ message: 'Found item not found' });
        }

        // Allow owner or admin to update
        const isOwner = item.postedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        const allowedFields = ['description', 'dateFound', 'locationFound', 'category', 'finderName', 'finderContact', 'status'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) item[field] = req.body[field];
        });

        if (req.files && req.files.length > 0) {
            const newImages = await uploadMultipleToCloudinary(req.files, 'iccthub/found');
            item.images = [...item.images, ...newImages];
        }

        await item.save();
        await item.populate('postedBy', 'name email');
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/found-items/:id (soft delete)
exports.deleteFoundItem = async (req, res) => {
    try {
        const item = await FoundItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Found item not found' });
        }

        // Allow owner or admin to delete
        const isOwner = item.postedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this item' });
        }

        item.isArchived = true;
        await item.save();
        res.json({ message: 'Found item archived successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
