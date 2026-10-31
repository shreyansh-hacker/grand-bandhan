import { Router } from 'express';
import { StorageController } from './storage.controller';
import { authenticateOptional } from '../../middleware/auth';

const router = Router();

// Binary file storage endpoints
router.post('/upload', authenticateOptional, StorageController.uploadFile);
router.get('/:id', StorageController.getFile);
router.get('/:id/info', StorageController.getFileInfo);
router.delete('/:id', StorageController.deleteFile);

export default router;
