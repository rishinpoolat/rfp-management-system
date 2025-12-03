import { consumeFromQueue, QUEUES } from '../config/rabbitmq.js';
import { parseRFPInput, parseProposal, compareProposals } from '../services/aiService.js';
import { RFP, Proposal } from '../models/index.js';
import { cacheService, cacheKeys } from '../config/redis.js';

/**
 * Process AI parsing jobs from the queue
 */
async function processAIParsingJob(data) {
  const { type, input, rfpId, proposalId } = data;

  try {
    if (type === 'rfp_parsing') {
      // Parse RFP from natural language
      const parsedData = await parseRFPInput(input);
      console.log('✓ RFP parsed successfully');
      return parsedData;
    } else if (type === 'proposal_parsing') {
      // Parse proposal email
      const rfp = await RFP.findByPk(rfpId, {
        include: [{ association: 'items' }],
      });

      if (!rfp) {
        throw new Error(`RFP not found: ${rfpId}`);
      }

      const parsedData = await parseProposal(input, rfp.toJSON());
      console.log('✓ Proposal parsed successfully');
      return parsedData;
    }
  } catch (error) {
    console.error('AI parsing worker error:', error);
    throw error;
  }
}

/**
 * Process proposal comparison jobs from the queue
 */
async function processComparisonJob(data) {
  const { rfpId } = data;

  try {
    // Fetch RFP with items
    const rfp = await RFP.findByPk(rfpId, {
      include: [{ association: 'items' }],
    });

    if (!rfp) {
      throw new Error(`RFP not found: ${rfpId}`);
    }

    // Fetch all proposals for this RFP
    const proposals = await Proposal.findAll({
      where: { rfp_id: rfpId },
      include: [
        { association: 'vendor' },
        { association: 'line_items' },
      ],
    });

    if (proposals.length === 0) {
      throw new Error('No proposals found for comparison');
    }

    // Perform AI comparison
    const comparison = await compareProposals(
      rfp.toJSON(),
      proposals.map(p => p.toJSON())
    );

    // Cache the comparison result
    await cacheService.set(
      cacheKeys.comparison(rfpId),
      comparison,
      1800 // 30 minutes
    );

    console.log(`✓ Proposals compared for RFP ${rfpId}`);
    return comparison;
  } catch (error) {
    console.error('Comparison worker error:', error);
    throw error;
  }
}

/**
 * Start AI workers
 */
export async function startAIWorkers() {
  console.log('Starting AI workers...');
  await consumeFromQueue(QUEUES.AI_PARSING, processAIParsingJob);
  await consumeFromQueue(QUEUES.PROPOSAL_COMPARISON, processComparisonJob);
}

export default {
  startAIWorkers,
  processAIParsingJob,
  processComparisonJob,
};
