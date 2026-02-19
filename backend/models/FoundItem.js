const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    images: [{
        type: String, // Cloudinary URLs
    }],
    dateFound: {
        type: Date,
        required: [true, 'Date found is required'],
    },
    locationFound: {
        type: String,
        trim: true,
        default: '',
    },
    category: {
        type: String,
        enum: ['Electronics', 'Clothing', 'ID', 'Accessories', 'Books', 'Bags', 'Keys', 'Documents', 'Wallets', 'Sports Equipment', 'Other'],
        default: 'Other',
    },
    finderName: {
        type: String,
        trim: true,
    },
    finderContact: {
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
        enum: ['Found', 'Returned', 'Archived'],
        default: 'Found',
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('FoundItem', foundItemSchema);
