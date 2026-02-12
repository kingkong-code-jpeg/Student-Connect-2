const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Multer memory storage (files stored as buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Upload single buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'iccthub') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        stream.end(fileBuffer);
    });
};

// Upload multiple buffers to Cloudinary
const uploadMultipleToCloudinary = async (files, folder = 'iccthub') => {
    const urls = [];
    for (const file of files) {
        const url = await uploadToCloudinary(file.buffer, folder);
        urls.push(url);
    }
    return urls;
};

module.exports = { upload, uploadToCloudinary, uploadMultipleToCloudinary };
