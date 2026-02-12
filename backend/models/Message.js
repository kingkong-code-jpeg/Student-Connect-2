const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subject: {
        type: String,
        trim: true,
        default: '(No Subject)',
    },
    body: {
        type: String,
        required: [true, 'Message body is required'],
    },
    labels: [{
        type: String,
        trim: true,
    }],
    read: {
        type: Boolean,
        default: false,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Index for search
messageSchema.index({ subject: 'text', body: 'text' });

module.exports = mongoose.model('Message', messageSchema);
