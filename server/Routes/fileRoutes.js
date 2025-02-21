// server/routes/fileRoutes.js
import express from 'express';
import fileController from '../Controllers/fileController.js';

const router = express.Router();

// POST /api/files/upload
router.post('/upload', fileController.uploadAndParse);

export default router;
