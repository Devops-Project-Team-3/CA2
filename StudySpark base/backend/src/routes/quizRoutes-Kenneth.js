/*
  Owner: Kenneth
  Feature: AI Quiz Generator
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Kenneth's AI Quiz Generator feature.
*/

import express from 'express';
import multer from 'multer';
import {
  generateFromDocumentPlaceholder,
  generateQuizPlaceholder,
  getQuizHistoryPlaceholder,
  saveQuizResultsPlaceholder
} from '../controllers/quizController-Kenneth.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  },
  fileFilter(req, file, callback) {
    if (file.mimetype !== 'application/pdf') {
      callback(new Error('Only PDF files are supported.'));
      return;
    }

    callback(null, true);
  }
});

function uploadDocument(req, res, next) {
  upload.single('document')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'PDF file must be 8 MB or smaller.' });
      return;
    }

    res.status(400).json({ error: error.message || 'Unable to upload this PDF.' });
  });
}

router.post('/generate', generateQuizPlaceholder);
router.post('/generate-from-document', uploadDocument, generateFromDocumentPlaceholder);
router.post('/results', saveQuizResultsPlaceholder);
router.get('/history/:userId', getQuizHistoryPlaceholder);

export default router;
