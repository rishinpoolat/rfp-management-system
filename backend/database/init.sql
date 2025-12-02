-- RFPs table
CREATE TABLE IF NOT EXISTS rfps (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  raw_input TEXT,
  budget DECIMAL(12, 2),
  deadline DATE,
  payment_terms VARCHAR(100),
  warranty_requirement VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RFP Line Items
CREATE TABLE IF NOT EXISTS rfp_items (
  id SERIAL PRIMARY KEY,
  rfp_id INTEGER REFERENCES rfps(id) ON DELETE CASCADE,
  item_type VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  specifications TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RFP-Vendor relationship (tracks which vendors received which RFPs)
CREATE TABLE IF NOT EXISTS rfp_vendors (
  id SERIAL PRIMARY KEY,
  rfp_id INTEGER REFERENCES rfps(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  sent_at TIMESTAMP,
  email_subject VARCHAR(255),
  UNIQUE(rfp_id, vendor_id)
);

-- Proposals (vendor responses)
CREATE TABLE IF NOT EXISTS proposals (
  id SERIAL PRIMARY KEY,
  rfp_id INTEGER REFERENCES rfps(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  raw_email_content TEXT,
  total_price DECIMAL(12, 2),
  delivery_timeline VARCHAR(255),
  payment_terms_offered VARCHAR(255),
  warranty_offered VARCHAR(255),
  additional_terms TEXT,
  parsed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'received',
  ai_score INTEGER,
  ai_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(rfp_id, vendor_id)
);

-- Proposal Line Items (pricing for each item)
CREATE TABLE IF NOT EXISTS proposal_items (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
  rfp_item_id INTEGER REFERENCES rfp_items(id),
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(12, 2),
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rfp_items_rfp_id ON rfp_items(rfp_id);
CREATE INDEX IF NOT EXISTS idx_rfp_vendors_rfp_id ON rfp_vendors(rfp_id);
CREATE INDEX IF NOT EXISTS idx_rfp_vendors_vendor_id ON rfp_vendors(vendor_id);
CREATE INDEX IF NOT EXISTS idx_proposals_rfp_id ON proposals(rfp_id);
CREATE INDEX IF NOT EXISTS idx_proposals_vendor_id ON proposals(vendor_id);
CREATE INDEX IF NOT EXISTS idx_proposal_items_proposal_id ON proposal_items(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_items_rfp_item_id ON proposal_items(rfp_item_id);

-- Insert sample vendors for testing
INSERT INTO vendors (name, email, contact_person, phone, address) VALUES
  ('TechSupply Co.', 'contact@techsupply.com', 'John Smith', '+1-555-0101', '123 Tech Street, San Francisco, CA 94105'),
  ('Office Depot Pro', 'sales@officedepotpro.com', 'Sarah Johnson', '+1-555-0102', '456 Business Ave, New York, NY 10001'),
  ('Global Tech Solutions', 'info@globaltechsol.com', 'Michael Chen', '+1-555-0103', '789 Enterprise Blvd, Austin, TX 78701'),
  ('Premier Equipment Inc.', 'orders@premierequip.com', 'Emily Davis', '+1-555-0104', '321 Commerce Dr, Seattle, WA 98101'),
  ('Budget Tech Mart', 'support@budgettechmart.com', 'Robert Wilson', '+1-555-0105', '654 Value Lane, Chicago, IL 60601')
ON CONFLICT (email) DO NOTHING;
