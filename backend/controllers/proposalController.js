import * as proposalModel from '../models/proposalModel.js';
import * as rfpModel from '../models/rfpModel.js';
import * as aiService from '../services/aiService.js';

export const receiveProposal = async (req, res, next) => {
  try {
    const { rfp_id, vendor_id, email_content } = req.body;

    if (!rfp_id || !vendor_id || !email_content) {
      return res.status(400).json({
        success: false,
        error: 'RFP ID, Vendor ID, and email content are required'
      });
    }

    // Get RFP details
    const rfp = await rfpModel.getById(rfp_id);
    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found'
      });
    }

    // Parse proposal with AI
    const parsedProposal = await aiService.parseProposal(email_content, rfp);

    // Create proposal in database
    const proposalData = {
      rfp_id,
      vendor_id,
      raw_email_content: email_content,
      total_price: parsedProposal.total_price,
      delivery_timeline: parsedProposal.delivery_timeline,
      payment_terms_offered: parsedProposal.payment_terms_offered,
      warranty_offered: parsedProposal.warranty_offered,
      additional_terms: parsedProposal.additional_terms,
      line_items: parsedProposal.line_items || [],
      status: 'received'
    };

    const proposal = await proposalModel.create(proposalData);

    res.status(201).json({
      success: true,
      data: proposal,
      parsed: parsedProposal
    });
  } catch (error) {
    next(error);
  }
};

export const getProposalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const proposal = await proposalModel.getById(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }

    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    next(error);
  }
};

export const getProposalsByRFP = async (req, res, next) => {
  try {
    const { rfp_id } = req.params;
    const proposals = await proposalModel.getByRFP(rfp_id);

    res.json({
      success: true,
      data: proposals
    });
  } catch (error) {
    next(error);
  }
};

export const updateProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const proposal = await proposalModel.update(id, req.body);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }

    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    next(error);
  }
};

export const updateProposalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['received', 'reviewed', 'selected', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required (received, reviewed, selected, rejected)'
      });
    }

    const proposal = await proposalModel.update(id, { status });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }

    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const proposal = await proposalModel.deleteProposal(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }

    res.json({
      success: true,
      message: 'Proposal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
