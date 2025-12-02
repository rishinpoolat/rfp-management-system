import express from 'express';
import * as comparisonController from '../controllers/comparisonController.js';

const router = express.Router();

// Compare proposals for an RFP
router.get('/rfp/:rfp_id', comparisonController.compareProposals);

export default router;
