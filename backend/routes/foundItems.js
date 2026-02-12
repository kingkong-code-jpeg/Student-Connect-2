const router = require('express').Router();
const { getFoundItems, getFoundItemById, createFoundItem, updateFoundItem, deleteFoundItem } = require('../controllers/foundItemController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', auth, getFoundItems);
router.get('/:id', auth, getFoundItemById);
router.post('/', auth, upload.array('images', 5), createFoundItem);
router.patch('/:id', auth, upload.array('images', 5), updateFoundItem);
router.delete('/:id', auth, deleteFoundItem);

module.exports = router;
