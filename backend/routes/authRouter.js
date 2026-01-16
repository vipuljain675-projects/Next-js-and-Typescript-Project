const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Decoupled API only needs POST routes for authentication
router.post('/login', authController.postLogin);
router.post('/signup', authController.postSignup);

// Logout is handled on the frontend by removing the token, 
// but we keep the endpoint for consistency.
router.post('/logout', authController.postLogout);

module.exports = router;