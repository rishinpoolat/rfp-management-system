import * as vendorModel from '../models/vendorModel.js';

export const createVendor = async (req, res, next) => {
  try {
    const vendor = await vendorModel.create(req.body);

    res.status(201).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    if (error.constraint === 'vendors_email_key') {
      return res.status(400).json({
        success: false,
        error: 'A vendor with this email already exists'
      });
    }
    next(error);
  }
};

export const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await vendorModel.getAll();

    res.json({
      success: true,
      data: vendors
    });
  } catch (error) {
    next(error);
  }
};

export const searchVendors = async (req, res, next) => {
  try {
    const { name } = req.query;
    const vendors = await vendorModel.searchByName(name);

    res.json({
      success: true,
      data: vendors
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await vendorModel.getById(id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await vendorModel.update(id, req.body);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    if (error.constraint === 'vendors_email_key') {
      return res.status(400).json({
        success: false,
        error: 'A vendor with this email already exists'
      });
    }
    next(error);
  }
};

export const deleteVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await vendorModel.deleteVendor(id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
