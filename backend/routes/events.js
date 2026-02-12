const router = require('express').Router();
const { getEvents, getEvent, getPublicEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { upload } = require('../middleware/upload');

router.get('/public', getPublicEvents);
router.get('/', auth, getEvents);
router.get('/:id', auth, getEvent);
router.post('/', auth, admin, upload.array('images', 5), createEvent);
router.put('/:id', auth, admin, upload.array('images', 5), updateEvent);
router.delete('/:id', auth, admin, deleteEvent);

module.exports = router;
