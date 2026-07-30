import express from 'express';
import * as vendorController from '../controllers/vendorController.js';

const router = express.Router();

// CRUD operations
router.post('/', vendorController.createVendor);
router.get('/', vendorController.getAllVendors);
router.get('/search', vendorController.searchVendors);
router.get('/:id', vendorController.getVendorById);
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

export default router;
