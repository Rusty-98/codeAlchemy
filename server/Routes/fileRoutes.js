// fileRoutes.js
import express from 'express';
import fileController from '../Controllers/fileController.js';
import { requireAuth } from '@clerk/express';

const router = express.Router();

// Protect the upload route with requireAuth middleware
router.post('/upload', requireAuth(), fileController.uploadAndParse);

export default router;
