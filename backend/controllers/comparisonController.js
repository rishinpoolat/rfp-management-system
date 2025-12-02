import * as rfpModel from '../models/rfpModel.js';
import * as proposalModel from '../models/proposalModel.js';
import * as aiService from '../services/aiService.js';

export const compareProposals = async (req, res, next) => {
  try {
    const { rfp_id } = req.params;

    // Get RFP details
    const rfp = await rfpModel.getById(rfp_id);
    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found'
      });
    }

    // Get all proposals for this RFP
    const proposals = await proposalModel.getByRFP(rfp_id);

    if (proposals.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No proposals found for this RFP'
      });
    }

    // Use AI to compare proposals
    const comparison = await aiService.compareProposals(rfp, proposals);

    // Update proposal scores in database
    for (const score of comparison.scores) {
      const proposal = proposals.find(p => p.vendor_id === score.vendor_id);
      if (proposal) {
        await proposalModel.update(proposal.id, {
          ai_score: score.overall_score,
          ai_summary: `Price: ${score.price_score}/100, Terms: ${score.terms_score}/100, Completeness: ${score.completeness_score}/100, Delivery: ${score.delivery_score}/100`
        });
      }
    }

    res.json({
      success: true,
      data: {
        rfp: {
          id: rfp.id,
          title: rfp.title,
          budget: rfp.budget,
          deadline: rfp.deadline
        },
        proposals: proposals.map(p => ({
          id: p.id,
          vendor_id: p.vendor_id,
          vendor_name: p.vendor_name,
          total_price: p.total_price,
          delivery_timeline: p.delivery_timeline,
          payment_terms_offered: p.payment_terms_offered,
          warranty_offered: p.warranty_offered,
          status: p.status
        })),
        comparison: comparison
      }
    });
  } catch (error) {
    next(error);
  }
};
