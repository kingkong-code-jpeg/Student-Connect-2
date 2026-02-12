const mongoose = require('mongoose');

const COURSES = [
    'BS in Accountancy',
    'BS in Accounting Technology',
    'BS in Business Administration',
    'BS in Computer Engineering',
    'BS in Computer Science',
    'BS in Information Technology',
    'BS in Hotel and Restaurant Management',
    'BS in Tourism',
    'Bachelor of Elementary Education',
    'Bachelor of Secondary Education',
    'BS in Electronics & Communications Engineering',
    'BS in Criminology',
    'BS in Psychology',
];

const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SECTIONS = ['A', 'B', 'C'];

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
    },
    targetAudience: {
        type: String,
        enum: ['All', 'Specific'],
        default: 'All',
    },
    targetCourses: [{
        type: String,
        enum: COURSES,
    }],
    targetYears: [{
        type: String,
        enum: YEAR_LEVELS,
    }],
    targetSections: [{
        type: String,
        enum: SECTIONS,
    }],
    eventDate: {
        type: Date,
        required: [true, 'Event date is required'],
    },
    location: {
        type: String,
        trim: true,
        default: '',
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Finished'],
        default: 'Upcoming',
    },
    images: [{
        type: String, // Cloudinary URLs
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
module.exports.COURSES = COURSES;
module.exports.YEAR_LEVELS = YEAR_LEVELS;
module.exports.SECTIONS = SECTIONS;
