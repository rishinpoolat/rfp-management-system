-- Seed Data for Testing
-- This adds sample RFPs and Proposals for testing

-- Add sample RFPs
INSERT INTO rfps (title, description, raw_input, budget, deadline, payment_terms, warranty_requirement, status, created_at, updated_at)
VALUES
  (
    'Office Laptop Procurement 2025',
    'Procurement of high-performance laptops for office use',
    'We need 20 laptops with 16GB RAM, 512GB SSD, and i5 processor for our development team',
    30000.00,
    '2025-12-31',
    'Net 30 days',
    '2 years manufacturer warranty',
    'sent',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'Conference Room Equipment',
    'Equipment for 3 conference rooms including monitors and accessories',
    'Need 15 monitors (27 inch, 4K), 3 projectors, and 3 video conferencing systems',
    25000.00,
    '2026-01-15',
    'Net 45 days',
    '1 year warranty with on-site support',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'Office Furniture Modernization',
    'Ergonomic chairs and standing desks for the office',
    'Looking for 30 ergonomic office chairs and 15 standing desks',
    45000.00,
    '2026-02-28',
    'Net 60 days',
    '5 years warranty on frames, 2 years on mechanisms',
    'draft',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT DO NOTHING;

-- Add items for RFP 1 (Laptops)
INSERT INTO rfp_items (rfp_id, item_type, quantity, specifications, created_at)
SELECT
  id,
  'Laptop',
  20,
  'Dell XPS 15 or equivalent - Intel i5 11th gen or better, 16GB RAM, 512GB SSD, 15.6" FHD display',
  CURRENT_TIMESTAMP
FROM rfps WHERE title = 'Office Laptop Procurement 2025'
ON CONFLICT DO NOTHING;

-- Add items for RFP 2 (Conference Equipment)
INSERT INTO rfp_items (rfp_id, item_type, quantity, specifications, created_at)
SELECT
  id,
  'Monitor',
  15,
  '27-inch 4K display, IPS panel, HDMI and DisplayPort',
  CURRENT_TIMESTAMP
FROM rfps WHERE title = 'Conference Room Equipment'
UNION ALL
SELECT
  id,
  'Projector',
  3,
  '1080p minimum, 3000+ lumens, HDMI connectivity',
  CURRENT_TIMESTAMP
FROM rfps WHERE title = 'Conference Room Equipment'
UNION ALL
SELECT
  id,
  'Video Conferencing System',
  3,
  'All-in-one system with 4K camera, microphone array, and speaker',
  CURRENT_TIMESTAMP
FROM rfps WHERE title = 'Conference Room Equipment'
ON CONFLICT DO NOTHING;

-- Add items for RFP 3 (Furniture)
INSERT INTO rfp_items (rfp_id, item_type, quantity, specifications, created_at)
SELECT
  id,
  'Ergonomic Office Chair',
  30,
  'Adjustable height, lumbar support, mesh back, armrests',
  CURRENT_TIMESTAMP
FROM rfps WHERE title = 'Office Furniture Modernization'
UNION ALL
SELECT
  id,
  'Standing Desk',
  15,
  'Electric height adjustment, 60x30 inch top, memory presets',
  CURRENT_TIMESTAMP
FROM rfps WHERE title = 'Office Furniture Modernization'
ON CONFLICT DO NOTHING;

-- Add proposals for RFP 1 from multiple vendors
INSERT INTO proposals (rfp_id, vendor_id, raw_email_content, total_price, delivery_timeline, payment_terms_offered, warranty_offered, status, ai_score, created_at, updated_at)
SELECT
  rfp.id,
  v.id,
  'Dear Customer, We can provide 20 Dell XPS 15 laptops (i5-11400H, 16GB RAM, 512GB NVMe SSD) at $1,350 per unit. Total: $27,000. Delivery in 15 business days. Payment terms: Net 30. Warranty: 2 years Dell ProSupport.',
  27000.00,
  '15 business days',
  'Net 30 days',
  '2 years Dell ProSupport with next-business-day on-site service',
  'received',
  85,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM rfps rfp, vendors v
WHERE rfp.title = 'Office Laptop Procurement 2025'
  AND v.name = 'TechSupply Co.'
UNION ALL
SELECT
  rfp.id,
  v.id,
  'Hello, We offer HP EliteBook 850 laptops meeting your specs. 20 units at $1,250 each = $25,000. Can deliver in 10 business days. Terms: Net 30. 3-year warranty included.',
  25000.00,
  '10 business days',
  'Net 30 days',
  '3 years HP Care Pack with on-site service',
  'received',
  92,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM rfps rfp, vendors v
WHERE rfp.title = 'Office Laptop Procurement 2025'
  AND v.name = 'Office Depot Pro'
UNION ALL
SELECT
  rfp.id,
  v.id,
  'Thank you for the opportunity. We can provide Lenovo ThinkPad E15 laptops. Price: $1,400 per unit, total $28,000. Delivery: 20 business days. Payment: Net 45. Warranty: 2 years.',
  28000.00,
  '20 business days',
  'Net 45 days',
  '2 years Lenovo warranty',
  'received',
  78,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM rfps rfp, vendors v
WHERE rfp.title = 'Office Laptop Procurement 2025'
  AND v.name = 'Global Tech Solutions'
ON CONFLICT DO NOTHING;

-- Add proposals for RFP 2
INSERT INTO proposals (rfp_id, vendor_id, raw_email_content, total_price, delivery_timeline, payment_terms_offered, warranty_offered, status, ai_score, created_at, updated_at)
SELECT
  rfp.id,
  v.id,
  'We can supply all conference room equipment. Monitors: $400 each, Projectors: $800 each, Video systems: $1,500 each. Total: $12,900. Delivery in 14 days. Net 30 terms. 2-year warranty.',
  12900.00,
  '14 business days',
  'Net 30 days',
  '2 years parts and labor',
  'received',
  88,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM rfps rfp, vendors v
WHERE rfp.title = 'Conference Room Equipment'
  AND v.name = 'Premier Equipment Inc.'
UNION ALL
SELECT
  rfp.id,
  v.id,
  'Complete conference solution available. Dell monitors $380/unit, Epson projectors $750/unit, Logitech video systems $1,400/unit. Total: $12,150. Ships in 7 days. Net 45 terms. 1 year warranty.',
  12150.00,
  '7 business days',
  'Net 45 days',
  '1 year standard warranty',
  'received',
  90,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM rfps rfp, vendors v
WHERE rfp.title = 'Conference Room Equipment'
  AND v.name = 'Budget Tech Mart'
ON CONFLICT DO NOTHING;

-- Mark RFPs as sent to vendors
INSERT INTO rfp_vendors (rfp_id, vendor_id, sent_at, email_subject)
SELECT
  rfp.id,
  v.id,
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  'RFP: Office Laptop Procurement 2025 - Response Requested by 2025-12-31'
FROM rfps rfp
CROSS JOIN vendors v
WHERE rfp.title = 'Office Laptop Procurement 2025'
  AND v.name IN ('TechSupply Co.', 'Office Depot Pro', 'Global Tech Solutions')
ON CONFLICT DO NOTHING;

INSERT INTO rfp_vendors (rfp_id, vendor_id, sent_at, email_subject)
SELECT
  rfp.id,
  v.id,
  CURRENT_TIMESTAMP - INTERVAL '3 days',
  'RFP: Conference Room Equipment - Response Requested by 2026-01-15'
FROM rfps rfp
CROSS JOIN vendors v
WHERE rfp.title = 'Conference Room Equipment'
  AND v.name IN ('Premier Equipment Inc.', 'Budget Tech Mart')
ON CONFLICT DO NOTHING;

-- Verify data
SELECT 'RFPs Created:' as info, COUNT(*) as count FROM rfps
UNION ALL
SELECT 'RFP Items Created:', COUNT(*) FROM rfp_items
UNION ALL
SELECT 'Proposals Created:', COUNT(*) FROM proposals
UNION ALL
SELECT 'Vendors:', COUNT(*) FROM vendors;
