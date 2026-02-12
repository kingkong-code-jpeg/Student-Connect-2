const router = require('express').Router();
const { getLostItems, getLostItemById, createLostItem, updateLostItem, deleteLostItem } = require('../controllers/lostItemController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', auth, getLostItems);
router.get('/:id', auth, getLostItemById);
router.post('/', auth, upload.array('images', 5), createLostItem);
router.patch('/:id', auth, upload.array('images', 5), updateLostItem);
router.delete('/:id', auth, deleteLostItem);

module.exports = router;
