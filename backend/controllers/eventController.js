const Event = require('../models/Event');
const { uploadMultipleToCloudinary } = require('../middleware/upload');

// GET /api/events/public (no auth required - for landing page)
exports.getPublicEvents = async (req, res) => {
    try {
        const events = await Event.find({ isArchived: false, status: { $in: ['Upcoming', 'Ongoing'] } })
            .select('title content eventDate location status images')
            .sort({ eventDate: 1 })
            .limit(6);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/events
exports.getEvents = async (req, res) => {
    try {
        const { category, status } = req.query;
        const filter = { isArchived: false };
        if (category) filter.category = category;
        if (status) filter.status = status;

        const events = await Event.find(filter)
            .populate('author', 'name email')
            .sort({ eventDate: -1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/events/:id
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('author', 'name email');

        if (!event || event.isArchived) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/events
exports.createEvent = async (req, res) => {
    try {
        const { title, content, targetAudience, targetCourses, targetYears, targetSections, eventDate, location, status } = req.body;

        let images = [];
        if (req.files && req.files.length > 0) {
            images = await uploadMultipleToCloudinary(req.files, 'iccthub/events');
        }

        // Parse JSON arrays if they come as strings
        const parsedCourses = typeof targetCourses === 'string' ? JSON.parse(targetCourses || '[]') : (targetCourses || []);
        const parsedYears = typeof targetYears === 'string' ? JSON.parse(targetYears || '[]') : (targetYears || []);
        const parsedSections = typeof targetSections === 'string' ? JSON.parse(targetSections || '[]') : (targetSections || []);

        const event = await Event.create({
            title,
            content,
            targetAudience: targetAudience || 'All',
            targetCourses: parsedCourses,
            targetYears: parsedYears,
            targetSections: parsedSections,
            eventDate,
            location,
            status: status || 'Upcoming',
            images,
            author: req.user._id,
        });

        await event.populate('author', 'name email');
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
    try {
        const { title, content, targetAudience, targetCourses, targetYears, targetSections, eventDate, location, status } = req.body;

        const event = await Event.findById(req.params.id);
        if (!event || event.isArchived) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (title) event.title = title;
        if (content) event.content = content;
        if (targetAudience) event.targetAudience = targetAudience;
        if (targetCourses !== undefined) {
            event.targetCourses = typeof targetCourses === 'string' ? JSON.parse(targetCourses || '[]') : (targetCourses || []);
        }
        if (targetYears !== undefined) {
            event.targetYears = typeof targetYears === 'string' ? JSON.parse(targetYears || '[]') : (targetYears || []);
        }
        if (targetSections !== undefined) {
            event.targetSections = typeof targetSections === 'string' ? JSON.parse(targetSections || '[]') : (targetSections || []);
        }
        if (eventDate) event.eventDate = eventDate;
        if (location !== undefined) event.location = location;
        if (status) event.status = status;

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImages = await uploadMultipleToCloudinary(req.files, 'iccthub/events');
            event.images = [...event.images, ...newImages];
        }

        await event.save();
        await event.populate('author', 'name email');
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/events/:id (soft delete)
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.isArchived = true;
        await event.save();
        res.json({ message: 'Event archived successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
