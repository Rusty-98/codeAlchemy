// Routes/fileRoutes.js
import express from 'express';
import fileController from '../Controllers/fileController.js';
import { requireAuth } from '@clerk/express';

const router = express.Router();

router.post('/upload', requireAuth(), fileController.uploadAndParse);
router.get('/stats', requireAuth(), fileController.getStats);

export default router;