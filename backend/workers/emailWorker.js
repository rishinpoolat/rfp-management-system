import { consumeFromQueue, QUEUES } from '../config/rabbitmq.js';
import { sendRFPEmail } from '../services/emailService.js';
import { Vendor, RFP } from '../models/index.js';

/**
 * Process email jobs from the queue
 */
async function processEmailJob(data) {
  const { vendorId, rfpId, rfpData } = data;

  try {
    // Fetch vendor if not provided
    let vendor = data.vendor;
    if (!vendor && vendorId) {
      vendor = await Vendor.findByPk(vendorId);
      if (!vendor) {
        throw new Error(`Vendor not found: ${vendorId}`);
      }
      vendor = vendor.toJSON();
    }

    // Fetch RFP if not provided
    let rfp = rfpData;
    if (!rfp && rfpId) {
      rfp = await RFP.findByPk(rfpId, {
        include: [{ association: 'items' }],
      });
      if (!rfp) {
        throw new Error(`RFP not found: ${rfpId}`);
      }
      rfp = rfp.toJSON();
    }

    // Send email
    const result = await sendRFPEmail(vendor, rfp);
    console.log(`✓ Email sent to ${vendor.email} for RFP ${rfp.id}`);
    return result;
  } catch (error) {
    console.error('Email worker error:', error);
    throw error;
  }
}

/**
 * Start the email worker
 */
export async function startEmailWorker() {
  console.log('Starting email worker...');
  await consumeFromQueue(QUEUES.EMAIL, processEmailJob);
}

export default { startEmailWorker, processEmailJob };
