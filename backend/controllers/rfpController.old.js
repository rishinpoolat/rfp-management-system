import * as rfpModel from '../models/rfpModel.js';
import * as vendorModel from '../models/vendorModel.js';
import * as aiService from '../services/aiService.js';
import * as emailService from '../services/emailService.js';

export const parseRFP = async (req, res, next) => {
  try {
    const { input } = req.body;

    if (!input || input.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Input text is required'
      });
    }

    const parsedData = await aiService.parseRFPInput(input);

    res.json({
      success: true,
      data: {
        ...parsedData,
        raw_input: input
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createRFP = async (req, res, next) => {
  try {
    const rfp = await rfpModel.create(req.body);

    res.status(201).json({
      success: true,
      data: rfp
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRFPs = async (req, res, next) => {
  try {
    const rfps = await rfpModel.getAll();

    res.json({
      success: true,
      data: rfps
    });
  } catch (error) {
    next(error);
  }
};

export const getRFPById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rfp = await rfpModel.getById(id);

    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found'
      });
    }

    res.json({
      success: true,
      data: rfp
    });
  } catch (error) {
    next(error);
  }
};

export const updateRFP = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rfp = await rfpModel.update(id, req.body);

    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found'
      });
    }

    res.json({
      success: true,
      data: rfp
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRFP = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rfp = await rfpModel.deleteRFP(id);

    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found'
      });
    }

    res.json({
      success: true,
      message: 'RFP deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const sendRFP = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vendorIds } = req.body;

    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Vendor IDs array is required'
      });
    }

    const rfp = await rfpModel.getById(id);
    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found'
      });
    }

    const vendors = await vendorModel.getByIds(vendorIds);
    if (vendors.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid vendors found'
      });
    }

    const emailResults = await emailService.sendBulkRFPEmails(vendors, rfp);

    // Record email sending in database
    for (const result of emailResults) {
      if (result.success) {
        await rfpModel.recordEmailSent(
          id,
          result.vendor_id,
          `RFP: ${rfp.title} - Response Requested by ${rfp.deadline || 'TBD'}`
        );
      }
    }

    res.json({
      success: true,
      data: {
        sent_count: emailResults.filter(r => r.success).length,
        failed_count: emailResults.filter(r => !r.success).length,
        results: emailResults
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorsForRFP = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendors = await rfpModel.getVendorsForRFP(id);

    res.json({
      success: true,
      data: vendors
    });
  } catch (error) {
    next(error);
  }
};
