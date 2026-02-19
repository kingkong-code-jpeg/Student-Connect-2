const router = require('express').Router();
const { getInbox, getSent, getMessageById, sendMessage, markRead, updateLabels, deleteMessage } = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.get('/', auth, getInbox);
router.get('/sent', auth, getSent);
router.get('/:id', auth, getMessageById);
router.post('/', auth, sendMessage);
router.patch('/:id/read', auth, markRead);
router.patch('/:id/labels', auth, updateLabels);
router.delete('/:id', auth, deleteMessage);

module.exports = router;
