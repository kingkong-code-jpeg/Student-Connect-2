const router = require('express').Router();
const { eventsReport, lostItemsReport, foundItemsReport, usersReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/events', auth, admin, eventsReport);
router.get('/lost-items', auth, admin, lostItemsReport);
router.get('/found-items', auth, admin, foundItemsReport);
router.get('/users', auth, admin, usersReport);

module.exports = router;
