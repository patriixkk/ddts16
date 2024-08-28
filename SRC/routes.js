const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.registerUser);
router.post('/login', userController.loginUser);
router.patch('/redefinir', userController.resetPassword);

module.exports = router;
