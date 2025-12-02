import pool from '../database/connection.js';

export const create = async (rfpData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const rfpQuery = `
      INSERT INTO rfps (title, description, raw_input, budget, deadline, payment_terms, warranty_requirement, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const rfpValues = [
      rfpData.title,
      rfpData.description,
      rfpData.raw_input,
      rfpData.budget,
      rfpData.deadline,
      rfpData.payment_terms,
      rfpData.warranty_requirement,
      rfpData.status || 'draft'
    ];

    const rfpResult = await client.query(rfpQuery, rfpValues);
    const rfp = rfpResult.rows[0];

    // Insert items if provided
    if (rfpData.items && rfpData.items.length > 0) {
      for (const item of rfpData.items) {
        const itemQuery = `
          INSERT INTO rfp_items (rfp_id, item_type, quantity, specifications)
          VALUES ($1, $2, $3, $4)
        `;
        await client.query(itemQuery, [rfp.id, item.item_type, item.quantity, item.specifications]);
      }
    }

    await client.query('COMMIT');
    return await getById(rfp.id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getAll = async () => {
  const query = 'SELECT * FROM rfps ORDER BY created_at DESC';
  const result = await pool.query(query);
  return result.rows;
};

export const getById = async (id) => {
  const rfpQuery = 'SELECT * FROM rfps WHERE id = $1';
  const rfpResult = await pool.query(rfpQuery, [id]);

  if (rfpResult.rows.length === 0) {
    return null;
  }

  const rfp = rfpResult.rows[0];

  const itemsQuery = 'SELECT * FROM rfp_items WHERE rfp_id = $1 ORDER BY id';
  const itemsResult = await pool.query(itemsQuery, [id]);

  rfp.items = itemsResult.rows;
  return rfp;
};

export const update = async (id, rfpData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (rfpData.title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(rfpData.title);
    }
    if (rfpData.description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(rfpData.description);
    }
    if (rfpData.budget !== undefined) {
      updateFields.push(`budget = $${paramCount++}`);
      values.push(rfpData.budget);
    }
    if (rfpData.deadline !== undefined) {
      updateFields.push(`deadline = $${paramCount++}`);
      values.push(rfpData.deadline);
    }
    if (rfpData.payment_terms !== undefined) {
      updateFields.push(`payment_terms = $${paramCount++}`);
      values.push(rfpData.payment_terms);
    }
    if (rfpData.warranty_requirement !== undefined) {
      updateFields.push(`warranty_requirement = $${paramCount++}`);
      values.push(rfpData.warranty_requirement);
    }
    if (rfpData.status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(rfpData.status);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE rfps
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    // Update items if provided
    if (rfpData.items !== undefined) {
      await client.query('DELETE FROM rfp_items WHERE rfp_id = $1', [id]);

      for (const item of rfpData.items) {
        const itemQuery = `
          INSERT INTO rfp_items (rfp_id, item_type, quantity, specifications)
          VALUES ($1, $2, $3, $4)
        `;
        await client.query(itemQuery, [id, item.item_type, item.quantity, item.specifications]);
      }
    }

    await client.query('COMMIT');
    return await getById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const deleteRFP = async (id) => {
  const query = 'DELETE FROM rfps WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const recordEmailSent = async (rfpId, vendorId, emailSubject) => {
  const query = `
    INSERT INTO rfp_vendors (rfp_id, vendor_id, sent_at, email_subject)
    VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
    ON CONFLICT (rfp_id, vendor_id)
    DO UPDATE SET sent_at = CURRENT_TIMESTAMP, email_subject = $3
    RETURNING *
  `;
  const result = await pool.query(query, [rfpId, vendorId, emailSubject]);
  return result.rows[0];
};

export const getVendorsForRFP = async (rfpId) => {
  const query = `
    SELECT v.*, rv.sent_at, rv.email_subject
    FROM vendors v
    JOIN rfp_vendors rv ON v.id = rv.vendor_id
    WHERE rv.rfp_id = $1
    ORDER BY rv.sent_at DESC
  `;
  const result = await pool.query(query, [rfpId]);
  return result.rows;
};
