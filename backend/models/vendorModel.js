import pool from '../database/connection.js';

export const create = async (vendorData) => {
  const query = `
    INSERT INTO vendors (name, email, contact_person, phone, address)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [
    vendorData.name,
    vendorData.email,
    vendorData.contact_person,
    vendorData.phone,
    vendorData.address
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getAll = async () => {
  const query = 'SELECT * FROM vendors ORDER BY name ASC';
  const result = await pool.query(query);
  return result.rows;
};

export const getById = async (id) => {
  const query = 'SELECT * FROM vendors WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const getByIds = async (ids) => {
  const query = 'SELECT * FROM vendors WHERE id = ANY($1)';
  const result = await pool.query(query, [ids]);
  return result.rows;
};

export const update = async (id, vendorData) => {
  const updateFields = [];
  const values = [];
  let paramCount = 1;

  if (vendorData.name !== undefined) {
    updateFields.push(`name = $${paramCount++}`);
    values.push(vendorData.name);
  }
  if (vendorData.email !== undefined) {
    updateFields.push(`email = $${paramCount++}`);
    values.push(vendorData.email);
  }
  if (vendorData.contact_person !== undefined) {
    updateFields.push(`contact_person = $${paramCount++}`);
    values.push(vendorData.contact_person);
  }
  if (vendorData.phone !== undefined) {
    updateFields.push(`phone = $${paramCount++}`);
    values.push(vendorData.phone);
  }
  if (vendorData.address !== undefined) {
    updateFields.push(`address = $${paramCount++}`);
    values.push(vendorData.address);
  }

  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE vendors
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteVendor = async (id) => {
  const query = 'DELETE FROM vendors WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
