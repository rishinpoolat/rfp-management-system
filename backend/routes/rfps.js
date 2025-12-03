import express from 'express';
import * as rfpController from '../controllers/rfpController.js';

const router = express.Router();

// Parse natural language RFP
router.post('/parse', rfpController.parseRFP);

// CRUD operations
router.post('/', rfpController.createRFP);
router.get('/', rfpController.getAllRFPs);
router.get('/:id', rfpController.getRFPById);
router.put('/:id', rfpController.updateRFP);
router.delete('/:id', rfpController.deleteRFP);

// Send RFP to vendors
router.post('/:id/send', rfpController.sendRFPToVendors);

// Get vendors for an RFP
router.get('/:id/vendors', rfpController.getVendorsForRFP);

export default router;
