import express from 'express';
import { createChat, getChats, getChatMessages, sendMessage, deleteChat } from '../controllers/chatController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createChat);
router.get('/', authenticateToken, getChats);
router.get('/:chatId/messages', authenticateToken, getChatMessages);
router.post('/:chatId/message', authenticateToken, sendMessage);
router.delete('/:chatId', authenticateToken, deleteChat);

export default router;
