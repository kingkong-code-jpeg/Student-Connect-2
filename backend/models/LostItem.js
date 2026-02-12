const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    images: [{
        type: String, // Cloudinary URLs
    }],
    dateLost: {
        type: Date,
        required: [true, 'Estimated date lost is required'],
    },
    locationLost: {
        type: String,
        trim: true,
        default: '',
    },
    category: {
        type: String,
        enum: ['Electronics', 'Clothing', 'ID', 'Accessories', 'Books', 'Bags', 'Keys', 'Documents', 'Wallets', 'Sports Equipment', 'Other'],
        default: 'Other',
    },
    ownerName: {
        type: String,
        trim: true,
    },
    ownerContact: {
        type: String,
        trim: true,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['Lost', 'Found', 'Archived'],
        default: 'Lost',
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('LostItem', lostItemSchema);
