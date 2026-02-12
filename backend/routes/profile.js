const router = require('express').Router();
const { updateProfile, changePassword, changeProfilePicture } = require('../controllers/profileController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.patch('/', auth, updateProfile);
router.patch('/password', auth, changePassword);
router.post('/picture', auth, upload.single('profilePicture'), changeProfilePicture);

module.exports = router;
