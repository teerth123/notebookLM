import express from 'express';
import { uploadDocument, getDocuments, deleteDocument } from '../controllers/documentController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.post('/', authenticateToken, upload.single('file'), uploadDocument);
router.get('/', authenticateToken, getDocuments);
router.delete('/:id', authenticateToken, deleteDocument);

export default router;
