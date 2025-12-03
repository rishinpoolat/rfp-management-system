import { RFP, RFPItem, Vendor, RFPVendor } from '../models/index.js';
import { parseRFPInput } from '../services/aiService.js';
import { publishToQueue, QUEUES } from '../config/rabbitmq.js';
import { cacheService, cacheKeys } from '../config/redis.js';

/**
 * Parse RFP from natural language input
 */
export const parseRFP = async (req, res, next) => {
  try {
    const { input } = req.body;

    if (!input || input.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Input text is required',
      });
    }

    // Parse with AI
    const parsedData = await parseRFPInput(input);

    res.json({
      success: true,
      data: {
        ...parsedData,
        raw_input: input,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new RFP
 */
export const createRFP = async (req, res, next) => {
  try {
    const { items, ...rfpData } = req.body;

    // Create RFP with items in a transaction
    const rfp = await RFP.create(
      {
        ...rfpData,
        items: items || [],
      },
      {
        include: [{ association: 'items' }],
      }
    );

    // Fetch complete RFP with associations
    const completeRFP = await RFP.findByPk(rfp.id, {
      include: [{ association: 'items' }],
    });

    // Invalidate cache
    await cacheService.del(cacheKeys.rfpList());

    res.status(201).json({
      success: true,
      data: completeRFP,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all RFPs (with caching)
 */
export const getAllRFPs = async (req, res, next) => {
  try {
    const cacheKey = cacheKeys.rfpList();

    // Try to get from cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Fetch from database
    const rfps = await RFP.findAll({
      order: [['created_at', 'DESC']],
    });

    // Cache for 5 minutes
    await cacheService.set(cacheKey, rfps, 300);

    res.json({
      success: true,
      data: rfps,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get RFP by ID (with caching)
 */
export const getRFPById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = cacheKeys.rfp(id);

    // Try to get from cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Fetch from database
    const rfp = await RFP.findByPk(id, {
      include: [{ association: 'items' }],
    });

    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found',
      });
    }

    // Cache for 10 minutes
    await cacheService.set(cacheKey, rfp, 600);

    res.json({
      success: true,
      data: rfp,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update RFP
 */
export const updateRFP = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items, ...rfpData } = req.body;

    const rfp = await RFP.findByPk(id);

    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found',
      });
    }

    // Update RFP
    await rfp.update(rfpData);

    // Update items if provided
    if (items !== undefined) {
      // Delete old items
      await RFPItem.destroy({ where: { rfp_id: id } });

      // Create new items
      if (items.length > 0) {
        await RFPItem.bulkCreate(
          items.map((item) => ({ ...item, rfp_id: id }))
        );
      }
    }

    // Fetch updated RFP
    const updatedRFP = await RFP.findByPk(id, {
      include: [{ association: 'items' }],
    });

    // Invalidate cache
    await cacheService.del(cacheKeys.rfp(id));
    await cacheService.del(cacheKeys.rfpList());

    res.json({
      success: true,
      data: updatedRFP,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete RFP
 */
export const deleteRFP = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rfp = await RFP.findByPk(id);

    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found',
      });
    }

    await rfp.destroy();

    // Invalidate cache
    await cacheService.del(cacheKeys.rfp(id));
    await cacheService.del(cacheKeys.rfpList());
    await cacheService.delPattern(`proposals:rfp:${id}*`);
    await cacheService.delPattern(`comparison:rfp:${id}*`);

    res.json({
      success: true,
      message: 'RFP deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send RFP to vendors (using queue)
 */
export const sendRFPToVendors = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vendorIds } = req.body;

    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Vendor IDs array is required',
      });
    }

    // Fetch RFP
    const rfp = await RFP.findByPk(id, {
      include: [{ association: 'items' }],
    });

    if (!rfp) {
      return res.status(404).json({
        success: false,
        error: 'RFP not found',
      });
    }

    // Fetch vendors
    const vendors = await Vendor.findAll({
      where: { id: vendorIds },
    });

    if (vendors.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid vendors found',
      });
    }

    const rfpJSON = rfp.toJSON();

    // Queue email jobs
    const results = [];
    for (const vendor of vendors) {
      const vendorJSON = vendor.toJSON();

      // Add to email queue
      await publishToQueue(QUEUES.EMAIL, {
        vendorId: vendorJSON.id,
        rfpId: rfpJSON.id,
        vendor: vendorJSON,
        rfpData: rfpJSON,
      });

      // Record in database
      await RFPVendor.upsert({
        rfp_id: rfpJSON.id,
        vendor_id: vendorJSON.id,
        sent_at: new Date(),
        email_subject: `RFP: ${rfpJSON.title} - Response Requested by ${rfpJSON.deadline || 'TBD'}`,
      });

      results.push({
        vendor_id: vendorJSON.id,
        vendor_email: vendorJSON.email,
        status: 'queued',
      });
    }

    // Update RFP status
    if (rfp.status === 'draft') {
      await rfp.update({ status: 'sent' });
      await cacheService.del(cacheKeys.rfp(id));
    }

    res.json({
      success: true,
      message: `RFP queued for sending to ${vendors.length} vendor(s)`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vendors for an RFP
 */
export const getVendorsForRFP = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rfpVendors = await RFPVendor.findAll({
      where: { rfp_id: id },
      include: [
        {
          model: Vendor,
          as: 'vendor',
        },
      ],
      order: [['sent_at', 'DESC']],
    });

    const vendors = rfpVendors.map((rv) => ({
      ...rv.vendor.toJSON(),
      sent_at: rv.sent_at,
      email_subject: rv.email_subject,
    }));

    res.json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    next(error);
  }
};
