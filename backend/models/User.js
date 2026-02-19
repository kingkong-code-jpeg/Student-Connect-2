const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
    },
    profilePicture: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
    },
    course: {
        type: String,
        default: '',
    },
    yearLevel: {
        type: String,
        default: '',
    },
    section: {
        type: String,
        default: '',
    },
    darkMode: {
        type: Boolean,
        default: false,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Exclude password from JSON
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
