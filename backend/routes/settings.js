const router = require('express').Router();
const { toggleDarkMode, getFAQs } = require('../controllers/settingsController');
const auth = require('../middleware/auth');

router.patch('/darkmode', auth, toggleDarkMode);
router.get('/faqs', getFAQs);

module.exports = router;
