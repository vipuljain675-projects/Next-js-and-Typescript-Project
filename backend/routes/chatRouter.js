// backend/routes/chatRouter.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const chatController = require('../controllers/chatController');
const isAuth = require('../middleware/is-auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/chat-files/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and documents
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All routes require authentication
router.use(isAuth);

// GET /api/chat/conversations - Get all conversations for logged-in user
router.get('/conversations', chatController.getConversations);

// GET /api/chat/conversation-details/:homeId - Get conversation details for a home
// IMPORTANT: This must come BEFORE /messages/:conversationId to avoid route conflict
router.get('/conversation-details/:homeId', chatController.getConversationDetails);

// GET /api/chat/messages/:conversationId - Get messages for a conversation
router.get('/messages/:conversationId', chatController.getMessages);

// POST /api/chat/send - Send a new message
router.post('/send', chatController.sendMessage);

// POST /api/chat/send-file - Send a file message
router.post('/send-file', upload.single('file'), chatController.sendFile);

// PUT /api/chat/messages/:messageId - Edit a message
router.put('/messages/:messageId', chatController.editMessage);

// DELETE /api/chat/messages/:messageId - Delete a message
router.delete('/messages/:messageId', chatController.deleteMessage);

// POST /api/chat/mark-read - Mark messages as read
router.post('/mark-read', chatController.markAsRead);

module.exports = router;