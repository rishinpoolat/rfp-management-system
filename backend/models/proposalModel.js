import pool from '../database/connection.js';

export const create = async (proposalData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const proposalQuery = `
      INSERT INTO proposals (
        rfp_id, vendor_id, raw_email_content, total_price,
        delivery_timeline, payment_terms_offered, warranty_offered,
        additional_terms, parsed_at, status, ai_score, ai_summary
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9, $10, $11)
      ON CONFLICT (rfp_id, vendor_id)
      DO UPDATE SET
        raw_email_content = $3,
        total_price = $4,
        delivery_timeline = $5,
        payment_terms_offered = $6,
        warranty_offered = $7,
        additional_terms = $8,
        parsed_at = CURRENT_TIMESTAMP,
        status = $9,
        ai_score = $10,
        ai_summary = $11,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const proposalValues = [
      proposalData.rfp_id,
      proposalData.vendor_id,
      proposalData.raw_email_content,
      proposalData.total_price,
      proposalData.delivery_timeline,
      proposalData.payment_terms_offered,
      proposalData.warranty_offered,
      proposalData.additional_terms,
      proposalData.status || 'received',
      proposalData.ai_score,
      proposalData.ai_summary
    ];

    const proposalResult = await client.query(proposalQuery, proposalValues);
    const proposal = proposalResult.rows[0];

    // Delete existing proposal items and insert new ones
    await client.query('DELETE FROM proposal_items WHERE proposal_id = $1', [proposal.id]);

    // Insert proposal line items if provided
    if (proposalData.line_items && proposalData.line_items.length > 0) {
      for (const item of proposalData.line_items) {
        const itemQuery = `
          INSERT INTO proposal_items (proposal_id, rfp_item_id, unit_price, total_price, notes)
          VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(itemQuery, [
          proposal.id,
          item.rfp_item_id || null,
          item.unit_price,
          item.total_price,
          item.notes
        ]);
      }
    }

    await client.query('COMMIT');
    return await getById(proposal.id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getById = async (id) => {
  const proposalQuery = `
    SELECT p.*, v.name as vendor_name, v.email as vendor_email
    FROM proposals p
    JOIN vendors v ON p.vendor_id = v.id
    WHERE p.id = $1
  `;
  const proposalResult = await pool.query(proposalQuery, [id]);

  if (proposalResult.rows.length === 0) {
    return null;
  }

  const proposal = proposalResult.rows[0];

  const itemsQuery = `
    SELECT pi.*, ri.item_type, ri.quantity as rfp_quantity, ri.specifications
    FROM proposal_items pi
    LEFT JOIN rfp_items ri ON pi.rfp_item_id = ri.id
    WHERE pi.proposal_id = $1
    ORDER BY pi.id
  `;
  const itemsResult = await pool.query(itemsQuery, [id]);

  proposal.line_items = itemsResult.rows;
  return proposal;
};

export const getByRFP = async (rfpId) => {
  const proposalsQuery = `
    SELECT p.*, v.name as vendor_name, v.email as vendor_email
    FROM proposals p
    JOIN vendors v ON p.vendor_id = v.id
    WHERE p.rfp_id = $1
    ORDER BY p.created_at DESC
  `;
  const proposalsResult = await pool.query(proposalsQuery, [rfpId]);

  const proposals = [];
  for (const proposal of proposalsResult.rows) {
    const itemsQuery = `
      SELECT pi.*, ri.item_type, ri.quantity as rfp_quantity, ri.specifications
      FROM proposal_items pi
      LEFT JOIN rfp_items ri ON pi.rfp_item_id = ri.id
      WHERE pi.proposal_id = $1
      ORDER BY pi.id
    `;
    const itemsResult = await pool.query(itemsQuery, [proposal.id]);
    proposal.line_items = itemsResult.rows;
    proposals.push(proposal);
  }

  return proposals;
};

export const update = async (id, proposalData) => {
  const updateFields = [];
  const values = [];
  let paramCount = 1;

  if (proposalData.total_price !== undefined) {
    updateFields.push(`total_price = $${paramCount++}`);
    values.push(proposalData.total_price);
  }
  if (proposalData.delivery_timeline !== undefined) {
    updateFields.push(`delivery_timeline = $${paramCount++}`);
    values.push(proposalData.delivery_timeline);
  }
  if (proposalData.payment_terms_offered !== undefined) {
    updateFields.push(`payment_terms_offered = $${paramCount++}`);
    values.push(proposalData.payment_terms_offered);
  }
  if (proposalData.warranty_offered !== undefined) {
    updateFields.push(`warranty_offered = $${paramCount++}`);
    values.push(proposalData.warranty_offered);
  }
  if (proposalData.additional_terms !== undefined) {
    updateFields.push(`additional_terms = $${paramCount++}`);
    values.push(proposalData.additional_terms);
  }
  if (proposalData.status !== undefined) {
    updateFields.push(`status = $${paramCount++}`);
    values.push(proposalData.status);
  }
  if (proposalData.ai_score !== undefined) {
    updateFields.push(`ai_score = $${paramCount++}`);
    values.push(proposalData.ai_score);
  }
  if (proposalData.ai_summary !== undefined) {
    updateFields.push(`ai_summary = $${paramCount++}`);
    values.push(proposalData.ai_summary);
  }

  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE proposals
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteProposal = async (id) => {
  const query = 'DELETE FROM proposals WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
