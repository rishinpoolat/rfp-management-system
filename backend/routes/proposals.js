import express from 'express';
import * as proposalController from '../controllers/proposalController.js';

const router = express.Router();

// Receive and parse proposal
router.post('/receive', proposalController.receiveProposal);

// CRUD operations
router.get('/:id', proposalController.getProposalById);
router.put('/:id', proposalController.updateProposal);
router.delete('/:id', proposalController.deleteProposal);

// Update status
router.post('/:id/status', proposalController.updateProposalStatus);

// Get proposals by RFP
router.get('/rfp/:rfp_id', proposalController.getProposalsByRFP);

export default router;
