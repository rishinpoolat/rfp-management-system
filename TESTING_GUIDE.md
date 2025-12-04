# Complete Manual Testing Guide

## Prerequisites

Before testing, ensure you have:
- Node.js 18+ installed
- Docker and Docker Compose installed
- OpenAI API key
- Gmail account (for real email testing) OR use Ethereal (test emails)

---

## Part 1: Environment Setup

### Option A: Testing with Ethereal Email (Recommended for Testing)

**What is Ethereal?**
- Fake SMTP service for testing
- Captures emails without actually sending them
- Provides preview URLs to view emails
- No configuration needed - auto-creates test accounts

**Setup:**

1. **Start PostgreSQL, Redis, RabbitMQ:**
```bash
cd /Users/mohammedrishinpoolat/Projects/personal-projects/aerchain/rfp-management-system
docker-compose up -d
```

2. **Verify services are running:**
```bash
docker ps
# Should see: postgres, redis, rabbitmq containers
```

3. **Setup backend with Ethereal (default):**
```bash
cd backend
cp .env.example .env
nano .env  # or your preferred editor
```

**Edit backend/.env:**
```env
PORT=5001
NODE_ENV=development

# Database (Docker defaults)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rfp_management
DB_USER=rfpuser
DB_PASSWORD=rfppassword

# OpenAI (REQUIRED - get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-your-actual-key-here

# Email - Ethereal (will auto-create test account)
# Leave these blank or remove them - Ethereal will be used automatically
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASS=

# Frontend
FRONTEND_URL=http://localhost:3000

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

4. **Install backend dependencies and start:**
```bash
npm install
npm run dev
```

**Expected output:**
```
Server running on port 5001
Connected to PostgreSQL
RabbitMQ connected
Redis connected
Email worker started
AI worker started
Ethereal email account created:
  User: random-user@ethereal.email
  Pass: random-password
  Preview: https://ethereal.email
```

5. **Setup frontend:**
```bash
# New terminal
cd frontend
cp .env.example .env
npm install
npm start
```

**Expected:** Browser opens to `http://localhost:3000`

---

### Option B: Testing with Real Gmail

**Why Gmail?**
- Send real emails to actual vendor addresses
- Test complete email workflow
- More realistic production scenario

**Setup Steps:**

1. **Enable 2-Factor Authentication on Gmail:**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Edit backend/.env:**
```env
PORT=5001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rfp_management
DB_USER=rfpuser
DB_PASSWORD=rfppassword

# OpenAI
OPENAI_API_KEY=sk-proj-your-actual-key-here

# Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop  # 16-char app password (no spaces)

# Frontend
FRONTEND_URL=http://localhost:3000

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

4. **Restart backend:**
```bash
cd backend
npm run dev
```

**Expected output:**
```
Server running on port 5001
Connected to PostgreSQL
RabbitMQ connected
Redis connected
Email worker started
AI worker started
Gmail SMTP configured: your-email@gmail.com
```

5. **Test Gmail connection:**
```bash
# In a new terminal, test sending email
curl -X POST http://localhost:5001/api/rfps/1/send \
  -H "Content-Type: application/json" \
  -d '{"vendorIds": [1]}'
```

**Check:** Email should arrive in vendor's inbox (check spam folder)

---

## Part 2: Complete UI Testing Workflow

### Test 1: Dashboard (View RFPs)

**Endpoint:** `GET /api/rfps`

**Steps:**
1. Open http://localhost:3000
2. You should see the Dashboard with table headers:
   - ID, Title, Budget, Deadline, Status, Actions

**Expected Results:**
- Initially empty or shows pre-existing RFPs
- Clean table layout
- "Create RFP" button visible
- Header navigation shows "Dashboard" as active

**Verify:**
- [ ] Dashboard loads without errors
- [ ] Navigation bar present
- [ ] "Create RFP" button works (clicks to /rfps/create)

---

### Test 2: Create RFP from Natural Language

**Endpoints:**
- `POST /api/rfps/parse` (AI parsing)
- `POST /api/rfps` (create RFP)

**Steps:**

1. Click "Create RFP" button
2. You should see Step 1: Input form with textarea
3. **Enter test input:**

```
I need to procure laptops and monitors for our new office. Budget is $50,000 total.
Need delivery within 30 days. We need 20 laptops with 16GB RAM and 512GB SSD, and
15 monitors 27-inch 4K. Payment terms should be net 30, and we need at least 2 year warranty.
```

4. Click "Parse with AI" button
5. Wait 2-5 seconds for AI processing
6. **Step 2 should appear** with parsed data:
   - Title: "Office Equipment Procurement" (or similar)
   - Description: Summary of request
   - Budget: 50000
   - Deadline: Date ~30 days from now
   - Payment Terms: "Net 30" or "Net 30 days"
   - Warranty: "2 year warranty" or similar
   - Items table with 2 rows:
     - Laptop | 20 | 16GB RAM, 512GB SSD
     - Monitor | 15 | 27-inch, 4K

7. **Edit fields if needed** (all fields are editable)
8. Click "Save RFP"
9. Should redirect to RFP detail page

**Expected Results:**
- AI correctly extracts all information
- Items are parsed into separate line items
- Quantities are numbers (not text)
- Budget is numeric (50000)
- Deadline is a valid date

**Verify:**
- [ ] Parse button shows loading state
- [ ] AI parsing completes in <10 seconds
- [ ] All fields populated correctly
- [ ] Can edit fields before saving
- [ ] Save creates RFP successfully
- [ ] Redirects to detail page

**Test Variations:**

**Simple Request:**
```
Need 10 office chairs. Budget $2000. Delivery in 15 days.
```

**Complex Request:**
```
We need to purchase IT equipment for 50 employees:
- 50 Dell laptops with i7 processor, 16GB RAM, 512GB SSD
- 50 wireless keyboards and mice combos
- 25 dual monitors 24-inch
- 10 docking stations
Total budget: $150,000
Delivery required: Within 45 days
Payment: Net 60 days
Warranty: 3 years comprehensive
```

---

### Test 3: View RFP Details

**Endpoint:** `GET /api/rfps/:id`

**Steps:**
1. From Dashboard, click "View" on any RFP
2. Should see RFP Detail page

**Expected Results:**
- **RFP Information section:**
  - Title
  - Description
  - Budget (formatted as currency)
  - Deadline (formatted date)
  - Payment Terms
  - Warranty Requirement
  - Status (Draft, Sent, Active, etc.)

- **Items section:**
  - Table with columns: Item Type, Quantity, Specifications
  - All line items from RFP

- **Actions section:**
  - "Send to Vendors" button
  - "Edit" button (optional)
  - "Delete" button (optional)

- **Proposals section:**
  - "No proposals yet" or list of received proposals
  - "Compare Proposals" button (if multiple proposals exist)

**Verify:**
- [ ] All RFP data displays correctly
- [ ] Items table formatted properly
- [ ] Budget shows with $ symbol
- [ ] Deadline shows formatted date
- [ ] Action buttons visible

---

### Test 4: Vendor Management

**Endpoints:**
- `GET /api/vendors` (list)
- `POST /api/vendors` (create)
- `PUT /api/vendors/:id` (update)
- `DELETE /api/vendors/:id` (delete)

**Steps:**

**4.1: View Vendors**
1. Click "Vendors" in navigation
2. Should see vendor table with 5 pre-seeded vendors:
   - TechSupply Co.
   - OfficeMax Solutions
   - Global Hardware Inc.
   - Business Equipment Ltd.
   - Corporate Supplies Group

**Verify:**
- [ ] All 5 vendors display
- [ ] Table shows: Name, Email, Contact Person, Phone, Actions
- [ ] "Add Vendor" button visible

**4.2: Create Vendor**
1. Click "Add Vendor" button
2. Fill form:
   - **Name:** "Test Vendor Inc."
   - **Email:** "test@vendor.com"
   - **Contact Person:** "John Smith"
   - **Phone:** "+1-555-0123"
   - **Address:** "123 Business St, Tech City, CA 94000"

3. Click "Create Vendor"

**Expected:**
- Success message appears
- Vendor appears in table
- Form clears

**Verify:**
- [ ] Form validation works (try empty email)
- [ ] Duplicate email rejected (try existing email)
- [ ] Vendor appears immediately after creation
- [ ] All fields saved correctly

**4.3: Edit Vendor**
1. Click "Edit" on Test Vendor Inc.
2. Change phone to "+1-555-9999"
3. Click "Update Vendor"

**Expected:**
- Success message
- Phone updated in table

**Verify:**
- [ ] Edit form pre-populates with existing data
- [ ] Update saves successfully
- [ ] Changes reflect immediately

**4.4: Delete Vendor**
1. Click "Delete" on Test Vendor Inc.
2. Confirm deletion (if confirmation exists)

**Expected:**
- Vendor removed from table
- Success message

**Verify:**
- [ ] Deletion works
- [ ] Cannot delete vendor with associated RFPs (if constraint exists)

---

### Test 5: Send RFP to Vendors

**Endpoint:** `POST /api/rfps/:id/send`

**Steps:**

1. Go to RFP detail page (from Test 3)
2. Click "Send to Vendors" button
3. **Modal should appear** with:
   - Checkbox list of all vendors
   - "Send to X vendor(s)" button
   - "Cancel" button

4. **Select 3 vendors** (e.g., TechSupply Co., OfficeMax, Global Hardware)
5. Click "Send to 3 vendor(s)"
6. Wait for processing

**Expected Results:**

**With Ethereal Email:**
```
Backend console output:
Email sent to TechSupply Co. (tech@supply.co)
Preview URL: https://ethereal.email/message/xxxxx
Email sent to OfficeMax Solutions (sales@officemax.com)
Preview URL: https://ethereal.email/message/yyyyy
Email sent to Global Hardware Inc. (info@globalhw.com)
Preview URL: https://ethereal.email/message/zzzzz
```

7. **Open preview URLs** in browser to verify email content

**Email should contain:**
- Subject: "Request for Proposal: [RFP Title]"
- Professional greeting
- RFP details (budget, deadline, payment, warranty)
- Items table with quantities and specifications
- Call to action to respond

**With Gmail:**
- Check vendor email inboxes (or your own email if testing)
- Email should arrive within 1-2 minutes
- Check spam folder if not in inbox

**Verify:**
- [ ] Modal appears with all vendors
- [ ] Can select/deselect vendors
- [ ] Send button updates count
- [ ] Email sent successfully (check console/inbox)
- [ ] Preview URLs work (Ethereal)
- [ ] Email content formatted correctly
- [ ] All RFP details included in email

---

### Test 6: Receive & Parse Vendor Proposal

**Endpoint:** `POST /api/proposals/receive`

**Steps:**

1. Click "Receive Proposal" in navigation
2. **Select RFP** from dropdown (choose the RFP you created)
3. **Select Vendor** from dropdown (choose one you sent RFP to)
4. **Paste vendor email response** OR click "Load Sample Email"

**Sample Email 1 (Simple):**
```
Dear Procurement Team,

Thank you for the opportunity to submit our proposal for your office equipment needs.

PRICING:

Laptops (Dell XPS 15):
- Quantity: 20 units
- Specifications: Intel i7, 16GB RAM, 512GB SSD
- Unit Price: $1,250
- Total: $25,000

Monitors (Dell UltraSharp 27" 4K):
- Quantity: 15 units
- Unit Price: $450
- Total: $6,750

TOTAL PROPOSAL AMOUNT: $31,750

TERMS:
- Delivery Timeline: 25 business days
- Payment Terms: Net 30 days from delivery
- Warranty: 2-year comprehensive warranty with on-site support
- Shipping: Free delivery and setup

We look forward to working with you.

Best regards,
Michael Chen
Sales Manager
TechSupply Co.
```

**Sample Email 2 (Complex):**
```
Hello,

Here's our quote for your equipment request:

Item 1: HP EliteBook Laptops
20x laptops @ $1,100 each = $22,000
Specs: 16GB RAM, 512GB SSD, 3-year warranty included

Item 2: LG 27" Monitors
15x monitors @ $380 each = $5,700

Subtotal: $27,700
Tax (8.5%): $2,354.50
Grand Total: $30,054.50

We can deliver in 20 days. Payment: 50% upfront, 50% on delivery.
Extended warranty available for additional $500.

Contact: sales@officemax.com
Phone: 555-0199

OfficeMax Solutions
```

**Sample Email 3 (Messy Format):**
```
Hi there!

Thanks for reaching out. Here's what we can do:

Laptops - we have the Dell Latitude 5420 with 16gb ram and 512 ssd
Price is 1150 per unit so for 20 that would be 23000 total

For the monitors we recommend the Samsung 27" 4k - really great quality!
$420 each x 15 = $6,300

So total comes to $29,300

We usually ship within 3 weeks, payment terms negotiable but typically net-45
Standard 1 year warranty, can extend to 2 years for extra $15/unit

Let me know!
- Sarah
Global Hardware Inc.
```

5. Click "Parse Proposal"
6. Wait 3-8 seconds for AI processing

**Expected Results:**
- Success message: "Proposal parsed successfully"
- **Parsed data displayed:**
  - Vendor Name: (extracted from email)
  - Total Price: (extracted amount)
  - Delivery Timeline: (extracted)
  - Payment Terms: (extracted)
  - Warranty: (extracted)
  - Items breakdown with unit prices

- **Redirect or display:**
  - Should show parsed proposal details
  - OR redirect to proposals list

**Verify:**
- [ ] AI correctly extracts vendor name
- [ ] Total price extracted accurately
- [ ] Delivery timeline parsed
- [ ] Payment terms captured
- [ ] Warranty details extracted
- [ ] Line items with pricing extracted
- [ ] Works with messy/informal email formats
- [ ] Handles different currency formats

**Test Edge Cases:**

**Missing Information:**
```
We can provide laptops for $25,000 and monitors for $7,000.
Delivery in 30 days.
```
- Should handle missing warranty/payment terms

**Multiple Currencies:**
```
Price: €35,000 EUR
```
- Should extract amount (may not convert)

**Informal Language:**
```
yo, we can totally do this for like 28k, shipped in a month, lmk
```
- Should extract key info despite informal tone

---

### Test 7: View Proposals for RFP

**Endpoint:** `GET /api/proposals/rfp/:rfp_id`

**Steps:**
1. After creating 2-3 proposals (repeat Test 6)
2. Go to RFP detail page
3. Scroll to "Proposals" section

**Expected:**
- Table showing all proposals:
  - Vendor Name
  - Total Price
  - Delivery Timeline
  - Status
  - Actions (View, Delete)

**Verify:**
- [ ] All proposals display
- [ ] Prices formatted correctly
- [ ] Status shows "received"
- [ ] Can view individual proposal

---

### Test 8: Compare Proposals (AI Scoring)

**Endpoint:** `GET /api/comparison/rfp/:rfp_id`

**Prerequisites:**
- Need at least 2 proposals for same RFP

**Steps:**
1. On RFP detail page with 2+ proposals
2. Click "Compare Proposals" button
3. Wait 5-15 seconds for AI processing

**Expected Results:**

**Comparison Dashboard should show:**

**1. Vendor Score Cards** (one per vendor)
Each card displays:
- Vendor Name
- Overall Score (0-100) with color coding:
  - Green (80-100): Excellent
  - Yellow (60-79): Good
  - Orange (40-59): Fair
  - Red (0-39): Poor

- **Individual Scores:**
  - Price Score (0-100): How competitive vs budget
  - Terms Score (0-100): Payment/warranty favorability
  - Completeness Score (0-100): Item coverage
  - Delivery Score (0-100): Timeline alignment

- Visual score bars for each dimension

**2. Comparison Summary**
- Key differences highlighted
- Price comparison table
- Terms comparison table
- Delivery comparison

**3. AI Recommendation**
- Clear recommendation: "We recommend [Vendor Name]"
- **Reasoning section** explaining why:
  - Best value
  - Better terms
  - Faster delivery
  - More complete response

**4. Risk Analysis**
For each vendor:
- Identified risks or concerns
- E.g., "Price is 15% over budget"
- E.g., "Delivery timeline is tight"
- E.g., "Warranty shorter than required"

**Example Expected Output:**

```
VENDOR 1: TechSupply Co.
Overall Score: 88/100

Price Score: 85/100 (within budget, competitive)
Terms Score: 95/100 (favorable payment terms, strong warranty)
Completeness Score: 100/100 (all items quoted)
Delivery Score: 90/100 (meets deadline with buffer)

---

VENDOR 2: OfficeMax Solutions
Overall Score: 78/100

Price Score: 95/100 (lowest price, under budget)
Terms Score: 60/100 (requires 50% upfront, shorter warranty)
Completeness Score: 100/100 (all items quoted)
Delivery Score: 80/100 (meets deadline)

---

RECOMMENDATION:
We recommend TechSupply Co.

REASONING:
While OfficeMax offers a lower price ($30,054 vs $31,750), TechSupply Co.
provides superior terms with Net 30 payment (vs 50% upfront), a 2-year
comprehensive warranty (vs 1 year), and a more comfortable delivery timeline.
The additional $1,696 cost is justified by the better terms and lower risk.

RISKS:
- TechSupply Co.: Slightly higher price (+5.6% vs lowest)
- OfficeMax: Requires 50% upfront payment, shorter warranty period
```

**Verify:**
- [ ] All vendors scored
- [ ] Scores are 0-100 range
- [ ] Score bars display correctly
- [ ] Overall score calculated properly
- [ ] Recommendation makes logical sense
- [ ] Reasoning references actual data
- [ ] Risks are relevant
- [ ] Results cached (refresh page - should load instantly)

**Test Caching:**
1. First load: Takes 5-15 seconds
2. Refresh page: Loads instantly (<1 second)
3. Wait 31 minutes: Should re-compute

---

## Part 3: API Endpoint Testing (with cURL)

### RFP Endpoints

**1. Parse Natural Language to RFP**
```bash
curl -X POST http://localhost:5001/api/rfps/parse \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Need 50 office desks and 50 office chairs. Budget $15,000. Delivery in 20 days. Net 30 payment. 1 year warranty."
  }'
```

**Expected Response:**
```json
{
  "title": "Office Furniture Procurement",
  "description": "Procurement of office desks and chairs",
  "items": [
    {
      "item_type": "Office Desk",
      "quantity": 50,
      "specifications": "Standard office desk"
    },
    {
      "item_type": "Office Chair",
      "quantity": 50,
      "specifications": "Ergonomic office chair"
    }
  ],
  "budget": 15000,
  "deadline": "2025-12-24",
  "payment_terms": "Net 30",
  "warranty_requirement": "1 year warranty"
}
```

**2. Create RFP**
```bash
curl -X POST http://localhost:5001/api/rfps \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Office Furniture Procurement",
    "description": "Furniture for new office space",
    "raw_input": "Need 50 desks and chairs",
    "budget": 15000,
    "deadline": "2025-12-31",
    "payment_terms": "Net 30",
    "warranty_requirement": "1 year",
    "items": [
      {
        "item_type": "Desk",
        "quantity": 50,
        "specifications": "Standard office desk"
      },
      {
        "item_type": "Chair",
        "quantity": 50,
        "specifications": "Ergonomic"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "id": 2,
  "title": "Office Furniture Procurement",
  "budget": 15000,
  "status": "draft",
  "created_at": "2025-12-04T10:30:00Z"
}
```

**3. Get All RFPs**
```bash
curl http://localhost:5001/api/rfps
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "title": "Office Equipment Procurement",
    "budget": 50000,
    "deadline": "2025-12-30",
    "status": "sent",
    "created_at": "2025-12-03T15:20:00Z"
  },
  {
    "id": 2,
    "title": "Office Furniture Procurement",
    "budget": 15000,
    "deadline": "2025-12-31",
    "status": "draft",
    "created_at": "2025-12-04T10:30:00Z"
  }
]
```

**4. Get RFP by ID (with items)**
```bash
curl http://localhost:5001/api/rfps/1
```

**Expected Response:**
```json
{
  "id": 1,
  "title": "Office Equipment Procurement",
  "description": "Laptops and monitors for new office",
  "budget": 50000,
  "deadline": "2025-12-30",
  "payment_terms": "Net 30",
  "warranty_requirement": "2 year warranty",
  "status": "sent",
  "items": [
    {
      "id": 1,
      "item_type": "Laptop",
      "quantity": 20,
      "specifications": "16GB RAM, 512GB SSD"
    },
    {
      "id": 2,
      "item_type": "Monitor",
      "quantity": 15,
      "specifications": "27-inch, 4K"
    }
  ],
  "created_at": "2025-12-03T15:20:00Z"
}
```

**5. Update RFP**
```bash
curl -X PUT http://localhost:5001/api/rfps/1 \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 55000,
    "deadline": "2026-01-15"
  }'
```

**6. Delete RFP**
```bash
curl -X DELETE http://localhost:5001/api/rfps/2
```

**7. Send RFP to Vendors**
```bash
curl -X POST http://localhost:5001/api/rfps/1/send \
  -H "Content-Type: application/json" \
  -d '{
    "vendorIds": [1, 2, 3]
  }'
```

**Expected Response:**
```json
{
  "message": "RFP sent to 3 vendors",
  "emailPreviews": [
    "https://ethereal.email/message/xxxxx",
    "https://ethereal.email/message/yyyyy",
    "https://ethereal.email/message/zzzzz"
  ]
}
```

**8. Get Vendors for RFP**
```bash
curl http://localhost:5001/api/rfps/1/vendors
```

---

### Vendor Endpoints

**1. Get All Vendors**
```bash
curl http://localhost:5001/api/vendors
```

**2. Get Vendor by ID**
```bash
curl http://localhost:5001/api/vendors/1
```

**3. Create Vendor**
```bash
curl -X POST http://localhost:5001/api/vendors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Innovation Tech Corp",
    "email": "sales@innovationtech.com",
    "contact_person": "Jane Doe",
    "phone": "+1-555-0156",
    "address": "456 Innovation Blvd, Silicon Valley, CA 94025"
  }'
```

**4. Update Vendor**
```bash
curl -X PUT http://localhost:5001/api/vendors/1 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1-555-9999",
    "address": "New address"
  }'
```

**5. Delete Vendor**
```bash
curl -X DELETE http://localhost:5001/api/vendors/6
```

---

### Proposal Endpoints

**1. Receive and Parse Proposal**
```bash
curl -X POST http://localhost:5001/api/proposals/receive \
  -H "Content-Type: application/json" \
  -d '{
    "rfpId": 1,
    "vendorId": 1,
    "emailContent": "Dear Team,\n\nOur pricing:\nLaptops: $1,200 x 20 = $24,000\nMonitors: $450 x 15 = $6,750\nTotal: $30,750\n\nDelivery: 25 days\nPayment: Net 30\nWarranty: 2 years\n\nBest,\nTechSupply"
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "rfp_id": 1,
  "vendor_id": 1,
  "total_price": 30750,
  "delivery_timeline": "25 days",
  "payment_terms_offered": "Net 30",
  "warranty_offered": "2 years",
  "status": "received",
  "parsed_at": "2025-12-04T11:00:00Z",
  "items": [
    {
      "item_type": "Laptop",
      "quantity": 20,
      "unit_price": 1200,
      "total_price": 24000
    },
    {
      "item_type": "Monitor",
      "quantity": 15,
      "unit_price": 450,
      "total_price": 6750
    }
  ]
}
```

**2. Get Proposal by ID**
```bash
curl http://localhost:5001/api/proposals/1
```

**3. Get All Proposals for RFP**
```bash
curl http://localhost:5001/api/proposals/rfp/1
```

**4. Update Proposal Status**
```bash
curl -X POST http://localhost:5001/api/proposals/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted"
  }'
```

**Valid statuses:** received, under_review, accepted, rejected

**5. Delete Proposal**
```bash
curl -X DELETE http://localhost:5001/api/proposals/1
```

---

### Comparison Endpoint

**1. Compare Proposals for RFP**
```bash
curl http://localhost:5001/api/comparison/rfp/1
```

**Expected Response:**
```json
{
  "rfpId": 1,
  "vendors": [
    {
      "vendorId": 1,
      "vendorName": "TechSupply Co.",
      "scores": {
        "price": 85,
        "terms": 95,
        "completeness": 100,
        "delivery": 90,
        "overall": 92.5
      }
    },
    {
      "vendorId": 2,
      "vendorName": "OfficeMax Solutions",
      "scores": {
        "price": 95,
        "terms": 70,
        "completeness": 100,
        "delivery": 85,
        "overall": 87.5
      }
    }
  ],
  "summary": "TechSupply Co. offers the best overall value...",
  "recommendation": {
    "vendorId": 1,
    "vendorName": "TechSupply Co.",
    "reasoning": "Superior terms and warranty despite slightly higher price..."
  },
  "risks": {
    "1": ["Price is 5% higher than lowest bid"],
    "2": ["Requires 50% upfront payment", "Shorter warranty period"]
  }
}
```

---

## Part 4: Testing Error Cases

### 1. Invalid RFP Parsing
```bash
curl -X POST http://localhost:5001/api/rfps/parse \
  -H "Content-Type: application/json" \
  -d '{
    "input": "hello world"
  }'
```

**Expected:** AI should try to extract or return minimal structure

### 2. Duplicate Vendor Email
```bash
curl -X POST http://localhost:5001/api/vendors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate Test",
    "email": "tech@supply.co"
  }'
```

**Expected:**
```json
{
  "error": "Email already exists"
}
```

### 3. Missing Required Fields
```bash
curl -X POST http://localhost:5001/api/rfps \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test"
  }'
```

**Expected:** Validation error

### 4. Non-existent RFP
```bash
curl http://localhost:5001/api/rfps/99999
```

**Expected:**
```json
{
  "error": "RFP not found"
}
```

### 5. Invalid OpenAI API Key
- Set `OPENAI_API_KEY=invalid` in .env
- Try parsing RFP
**Expected:** Error message about API key

---

## Part 5: Testing Checklist

### Complete Test Suite

**RFP Management:**
- [ ] Create RFP from natural language (simple case)
- [ ] Create RFP from natural language (complex case)
- [ ] View RFP details
- [ ] Edit RFP
- [ ] Delete RFP
- [ ] List all RFPs

**Vendor Management:**
- [ ] View all vendors (5 pre-seeded)
- [ ] Create new vendor
- [ ] Edit vendor
- [ ] Delete vendor
- [ ] Duplicate email validation

**Email Integration:**
- [ ] Send RFP to single vendor
- [ ] Send RFP to multiple vendors
- [ ] Verify email content (Ethereal preview)
- [ ] Verify email delivery (Gmail)
- [ ] Check RabbitMQ queue processing

**Proposal Management:**
- [ ] Receive proposal (simple email)
- [ ] Receive proposal (complex email)
- [ ] Receive proposal (messy format)
- [ ] AI extracts pricing correctly
- [ ] AI extracts terms correctly
- [ ] AI extracts delivery timeline
- [ ] View all proposals for RFP

**Comparison:**
- [ ] Compare 2 proposals
- [ ] Compare 3+ proposals
- [ ] Scores are calculated (0-100)
- [ ] Recommendation provided
- [ ] Reasoning makes sense
- [ ] Risks identified
- [ ] Results cached (2nd load instant)

**Error Handling:**
- [ ] Invalid API key handling
- [ ] Network error handling
- [ ] Validation errors display
- [ ] 404 errors for missing resources
- [ ] Database connection errors

**Performance:**
- [ ] RFP parsing: <10 seconds
- [ ] Proposal parsing: <10 seconds
- [ ] Comparison: <20 seconds
- [ ] Cached comparison: <1 second
- [ ] Email sending: Non-blocking

---

## Part 6: Database Verification

### Check Data in PostgreSQL

**Connect to database:**
```bash
docker exec -it postgres psql -U rfpuser -d rfp_management
```

**Useful queries:**
```sql
-- View all RFPs
SELECT id, title, budget, status FROM rfps;

-- View RFP items
SELECT r.title, ri.item_type, ri.quantity, ri.specifications
FROM rfps r
JOIN rfp_items ri ON r.id = ri.rfp_id;

-- View vendors
SELECT * FROM vendors;

-- View which RFPs were sent to which vendors
SELECT r.title, v.name, rv.sent_at
FROM rfps r
JOIN rfp_vendors rv ON r.id = rv.rfp_id
JOIN vendors v ON rv.vendor_id = v.id;

-- View proposals
SELECT p.id, r.title, v.name, p.total_price, p.status
FROM proposals p
JOIN rfps r ON p.rfp_id = r.id
JOIN vendors v ON p.vendor_id = v.id;

-- View proposal items
SELECT v.name, pi.item_type, pi.quantity, pi.unit_price, pi.total_price
FROM proposal_items pi
JOIN proposals p ON pi.proposal_id = p.id
JOIN vendors v ON p.vendor_id = v.id;
```

**Exit psql:**
```sql
\q
```

---

## Part 7: Monitoring & Logs

### Check Backend Logs
```bash
# Backend terminal should show:
- Server startup
- Database connection
- RabbitMQ connection
- Redis connection
- Email worker activity
- AI parsing requests/responses
- Email sending confirmations
```

### Check RabbitMQ Queue
```bash
# Access RabbitMQ Management UI
open http://localhost:15672
# Login: guest / guest

# Check queues:
- email_queue (should process messages)
- ai_parsing (optional)
- proposal_comparison (optional)
```

### Check Redis Cache
```bash
# Connect to Redis
docker exec -it redis redis-cli

# Check cached keys
KEYS *

# View cached RFP list
GET rfps:list

# View cached comparison
GET comparison:rfp:1

# Check TTL
TTL comparison:rfp:1

# Exit Redis
exit
```

---

## Troubleshooting Common Issues

### Issue 1: "Cannot connect to PostgreSQL"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Issue 2: "OpenAI API Error"
```bash
# Verify API key
echo $OPENAI_API_KEY

# Check backend .env
cat backend/.env | grep OPENAI

# Test API key manually
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Issue 3: "Email not sending"
```bash
# Check email worker logs in backend console
# Should see: "Email worker started"

# Check RabbitMQ
docker ps | grep rabbitmq

# Check backend .env email settings
cat backend/.env | grep SMTP
```

### Issue 4: "Frontend cannot connect to backend"
```bash
# Check backend is running
curl http://localhost:5001/api/rfps

# Check CORS settings in backend
# Should allow http://localhost:3000

# Check frontend .env
cat frontend/.env | grep API
```

---

## Success Criteria

Your system is working correctly if:

✅ All 5 functional requirements tested successfully:
1. Create RFPs from natural language
2. Manage vendors and send RFPs
3. Receive and parse proposals
4. Compare proposals with AI scoring
5. Get clear recommendation

✅ All services running:
- PostgreSQL (Docker)
- Redis (Docker)
- RabbitMQ (Docker)
- Backend (Express)
- Frontend (React)

✅ Email working:
- Ethereal previews generate
- OR Gmail sends real emails

✅ AI working:
- RFP parsing extracts data
- Proposal parsing extracts pricing
- Comparison generates scores

✅ Database persistent:
- Data survives server restart
- Foreign keys enforced
- Unique constraints work

---

## Next Steps After Testing

1. **Record Demo Video** showing complete workflow
2. **Document any issues** found during testing
3. **Add screenshots** to README (optional)
4. **Test on clean environment** (fresh clone)
5. **Prepare for submission**

---

**Testing Time Estimate:**
- Full UI testing: 30-45 minutes
- API endpoint testing: 15-20 minutes
- Error case testing: 10 minutes
- **Total: ~60-75 minutes**

Good luck with testing! 🚀
