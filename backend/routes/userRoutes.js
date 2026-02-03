const express = require('express');
const router = express.Router();
const { authUser, registerUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);

module.exports = router;
