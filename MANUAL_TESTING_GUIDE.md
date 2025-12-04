# Manual Testing Guide

Complete step-by-step guide to manually test all features of the RFP Management System.

---

## Prerequisites

Ensure you have:
- ✅ Node.js 18+ installed
- ✅ Docker and Docker Compose installed
- ✅ OpenAI API key configured in `backend/.env`
- ✅ Gmail configured for email sending (already done)

---

## Part 1: Start All Services

### Step 1: Start Docker Services (PostgreSQL, Redis, RabbitMQ)

```bash
cd /Users/mohammedrishinpoolat/Projects/personal-projects/aerchain/rfp-management-system
docker-compose up -d
```

**Verify services are running:**
```bash
docker ps
```

**Expected output:**
- postgres container (port 5432)
- redis container (port 6379)
- rabbitmq container (ports 5672, 15672)

---

### Step 2: Start Backend Server

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Expected output:**
```
✓ Sequelize: Connected to PostgreSQL database
✓ Redis connected
✓ RabbitMQ connected
Using configured SMTP server
Email transporter is ready
Email worker started
AI worker started
Server running on port 5001
```

**IMPORTANT:** Must see "Using configured SMTP server" (not "Using Ethereal Email")

---

### Step 3: Start Frontend

**Terminal 2:**
```bash
cd frontend
npm start
```

**Expected:** Browser opens to http://localhost:3000

---

## Part 2: Manual UI Testing (30 minutes)

### Test 1: Create RFP from Natural Language (5 min)

**Goal:** Verify AI can parse natural language into structured RFP

**Steps:**

1. Open http://localhost:3000
2. Click **"Create RFP"** button
3. Enter this test input:
   ```
   I need to procure laptops and monitors for our new office. Budget is $50,000 total.
   Need delivery within 30 days. We need 20 laptops with 16GB RAM and 512GB SSD, and
   15 monitors 27-inch 4K. Payment terms should be net 30, and we need at least 2 year warranty.
   ```

4. Click **"Parse with AI"**
5. Wait 3-8 seconds for AI processing

**Expected Results:**

**Step 2 form should display:**
- **Title:** "Office Equipment Procurement" (or similar)
- **Description:** Summary of procurement needs
- **Budget:** 50000 (numeric)
- **Deadline:** Date approximately 30 days from today
- **Payment Terms:** "Net 30" or "Net 30 days"
- **Warranty Requirement:** "2 year warranty" or similar

**Items Table:**
| Item Type | Quantity | Specifications |
|-----------|----------|----------------|
| Laptop | 20 | 16GB RAM, 512GB SSD |
| Monitor | 15 | 27-inch, 4K |

6. **Edit any field if needed** (all fields are editable)
7. Click **"Save RFP"**
8. **Should redirect to RFP Detail page**

**Verify:**
- [ ] AI correctly extracts title
- [ ] Budget is numeric (50000)
- [ ] Deadline is a valid date
- [ ] Payment terms extracted
- [ ] Warranty requirement extracted
- [ ] Items separated into 2 line items
- [ ] Quantities are numbers
- [ ] Specifications are text strings
- [ ] Can edit fields before saving
- [ ] Save redirects to detail page

---

### Test 2: View RFP Details (2 min)

**Goal:** Verify RFP data displays correctly

**Steps:**

1. Should already be on RFP detail page (from Test 1)
2. Review all displayed information

**Expected Display:**

**RFP Information:**
- Title
- Description
- Budget (formatted with $ symbol)
- Deadline (formatted date)
- Payment Terms
- Warranty Requirement
- Status: "draft"

**Items Section:**
- Table with 2 rows (Laptop, Monitor)
- Columns: Item Type, Quantity, Specifications

**Actions:**
- "Send to Vendors" button
- "Edit" button (if implemented)
- "Delete" button (if implemented)

**Verify:**
- [ ] All RFP data displays correctly
- [ ] Items table formatted properly
- [ ] Budget shows $ symbol
- [ ] Deadline shows readable date format
- [ ] Action buttons visible

---

### Test 3: Manage Vendors (5 min)

**Goal:** Test vendor CRUD operations

**Steps:**

#### 3.1: View Existing Vendors

1. Click **"Vendors"** in navigation menu
2. Should see vendor table

**Expected:**
- 5 pre-seeded vendors:
  1. TechSupply Co.
  2. OfficeMax Solutions
  3. Global Hardware Inc.
  4. Business Equipment Ltd.
  5. Corporate Supplies Group
- Plus any vendors you've added (e.g., "Rishin Poolat (Test)")

**Verify:**
- [ ] All vendors display
- [ ] Table shows: Name, Email, Contact Person, Phone, Actions
- [ ] "Add Vendor" button visible

#### 3.2: Create New Vendor

1. Click **"Add Vendor"** button
2. Fill form:
   - **Name:** "Test Vendor Corp"
   - **Email:** "test@vendor.com"
   - **Contact Person:** "John Test"
   - **Phone:** "+1-555-1234"
   - **Address:** "123 Test Street, City, ST 12345"
3. Click **"Create Vendor"**

**Expected:**
- Success message displays
- Vendor appears in table immediately
- Form clears or modal closes

**Verify:**
- [ ] Vendor created successfully
- [ ] Appears in table
- [ ] All fields saved correctly

#### 3.3: Edit Vendor (Optional)

1. Click **"Edit"** on Test Vendor Corp
2. Change phone to "+1-555-9999"
3. Click **"Update Vendor"**

**Expected:**
- Success message
- Phone number updated in table

**Verify:**
- [ ] Edit form pre-populates
- [ ] Update saves successfully

#### 3.4: Try Creating Duplicate Email

1. Click "Add Vendor"
2. Use email: "test@vendor.com" (same as before)
3. Try to save

**Expected:**
- Error message: "Email already exists" or similar
- Vendor not created

**Verify:**
- [ ] Duplicate email validation works

---

### Test 4: Send RFP via Email (5 min)

**Goal:** Send RFP to vendors via Gmail and verify email delivery

**Steps:**

1. Go to RFP detail page (click Dashboard → View your RFP)
2. Click **"Send to Vendors"** button
3. **Modal should appear** with vendor checkboxes

**Modal displays:**
- List of all vendors with checkboxes
- "Send to X vendor(s)" button
- "Cancel" button

4. **Select 3 vendors:**
   - [ ] TechSupply Co.
   - [ ] OfficeMax Solutions
   - [ ] Rishin Poolat (Test) ← YOUR EMAIL

5. Click **"Send to 3 vendor(s)"**
6. Wait for processing (5-10 seconds)

**Expected Results:**

**Backend Console Output:**
```
Email sent: <message-id-1>
Email sent: <message-id-2>
Email sent: <message-id-3>
```

**Frontend:**
- Success message: "RFP sent to 3 vendors successfully"
- Modal closes
- (Optional) Shows sent count on RFP detail

7. **Check your Gmail inbox** (rishinpoolat@gmail.com)

**Expected Email:**
- **Subject:** "RFP: Office Equipment Procurement - Response Requested by [date]"
- **From:** rishinpoolat@gmail.com
- **To:** rishinpoolat@gmail.com

**Email Content:**
```
Dear Rishin,

We are pleased to invite you to submit a proposal for the following Request for Proposal (RFP):

RFP TITLE: Office Equipment Procurement

DESCRIPTION:
[Your description]

ITEMS REQUESTED:
1. Laptop - Quantity: 20
   Specifications: 16GB RAM, 512GB SSD

2. Monitor - Quantity: 15
   Specifications: 27-inch, 4K

BUDGET: $50,000
DEADLINE: [date]
PAYMENT TERMS: Net 30
WARRANTY REQUIREMENT: 2 year warranty

Please submit your proposal by replying to this email with:
- Pricing for each item (unit price and total)
- Total proposal amount
- Delivery timeline
- Payment terms you can offer
- Warranty information
- Any additional terms or conditions

We look forward to receiving your competitive proposal.

Best regards,
Procurement Team
```

**Verify:**
- [ ] Modal appears with all vendors
- [ ] Can select/deselect vendors
- [ ] Send button updates count
- [ ] Backend logs email sending
- [ ] Frontend shows success message
- [ ] Email received in inbox (check spam if not in inbox)
- [ ] Email subject is correct
- [ ] Email body includes all RFP details
- [ ] Items formatted correctly
- [ ] Budget, deadline, terms included

---

### Test 5: Receive and Parse Vendor Proposal (8 min)

**Goal:** Test AI parsing of vendor email responses

**Steps:**

1. Click **"Receive Proposal"** in navigation
2. **Select RFP:** Choose "Office Equipment Procurement" (your RFP)
3. **Select Vendor:** Choose "TechSupply Co."

4. **Paste this sample vendor response:**
```
Dear Procurement Team,

Thank you for the opportunity to submit our proposal for your office equipment needs.

PRICING BREAKDOWN:

Laptops (Dell XPS 15):
- Model: Dell XPS 15 9530
- Specifications: Intel i7, 16GB RAM, 512GB SSD
- Quantity: 20 units
- Unit Price: $1,250
- Total: $25,000

Monitors (Dell UltraSharp 27" 4K):
- Model: Dell U2723DE
- Quantity: 15 units
- Unit Price: $450
- Total: $6,750

TOTAL PROPOSAL AMOUNT: $31,750

DELIVERY INFORMATION:
- Delivery Timeline: 25 business days from order confirmation
- Shipping: Free delivery and on-site setup included

PAYMENT TERMS:
- Net 30 days from delivery date
- Early payment discount: 2% if paid within 10 days

WARRANTY:
- 2-year comprehensive warranty with on-site support
- 24/7 technical support hotline
- Next-business-day replacement for defective units

ADDITIONAL TERMS:
- Price valid for 30 days
- All equipment is brand new, not refurbished
- Installation and training included at no extra cost

We look forward to working with you on this project.

Best regards,
Michael Chen
Sales Manager
TechSupply Co.
sales@techsupply.co
```

5. Click **"Parse Proposal"**
6. Wait 5-10 seconds for AI processing

**Expected Results:**

**Parsed Proposal Display:**
- **Vendor Name:** TechSupply Co. (extracted from email)
- **Total Price:** $31,750 or 31750
- **Delivery Timeline:** "25 business days" or similar
- **Payment Terms:** "Net 30 days" or "Net 30"
- **Warranty Offered:** "2-year comprehensive warranty" or similar
- **Additional Terms:** May include notes about discounts, support, etc.

**Line Items (if extracted):**
| Item | Quantity | Unit Price | Total Price |
|------|----------|------------|-------------|
| Laptop | 20 | 1250 | 25000 |
| Monitor | 15 | 450 | 6750 |

**Verify:**
- [ ] AI extracts vendor name
- [ ] Total price correct ($31,750)
- [ ] Delivery timeline extracted
- [ ] Payment terms extracted
- [ ] Warranty information extracted
- [ ] Line items parsed (laptops and monitors)
- [ ] Unit prices extracted
- [ ] Total prices calculated
- [ ] Success message shown
- [ ] Proposal saved to database

#### Test 5.2: Parse Different Format

**Repeat steps 1-3, but select different vendor:** "OfficeMax Solutions"

**Paste this messy format email:**
```
Hi there!

Thanks for reaching out. Here's our quote:

Laptops - HP EliteBook 840 G9
Specs: 16GB RAM, 512GB SSD, i7 processor
20 units @ $1,100 each = $22,000

Monitors - LG 27" 4K
15 monitors @ $380 = $5,700

Total: $27,700 + tax (8.5%) = $30,054.50

We can ship in 20 days. Payment 50% upfront, 50% on delivery.
Standard 1-year warranty, can extend to 2 years for extra $500.

Let me know!
- Sarah
OfficeMax Solutions
```

Click **"Parse Proposal"**

**Expected:**
- **Total Price:** ~$30,054 or $27,700 (AI should extract the grand total)
- **Delivery:** "20 days"
- **Payment Terms:** "50% upfront, 50% on delivery"
- **Warranty:** "1 year" or mentions extension option
- **Items:** Laptops (20 @ $1,100), Monitors (15 @ $380)

**Verify:**
- [ ] AI handles informal/messy format
- [ ] Extracts pricing despite different structure
- [ ] Captures split payment terms
- [ ] Handles warranty variations

#### Test 5.3: Parse Third Proposal

**Select vendor:** "Global Hardware Inc."

**Paste:**
```
PROPOSAL SUBMISSION

From: Global Hardware Inc.
Contact: David Lee, Account Manager

ITEM QUOTATIONS:

1. Business Laptops
   Brand: Lenovo ThinkPad X1 Carbon
   Specifications: 16GB RAM, 512GB NVMe SSD, Intel Core i7
   Quantity: 20 units
   Unit Cost: $1,180.00
   Line Total: $23,600.00

2. Professional Monitors
   Brand: BenQ PD2725U 27" 4K
   Quantity: 15 units
   Unit Cost: $420.00
   Line Total: $6,300.00

PROPOSAL TOTAL: $29,900.00

DELIVERY SCHEDULE: 18 business days
PAYMENT STRUCTURE: Net 45 days
WARRANTY COVERAGE: 3-year manufacturer warranty + 1-year extended support
NOTES: Bulk order discount applied. Free shipping nationwide.
```

Click **"Parse Proposal"**

**Expected:**
- **Total:** $29,900
- **Delivery:** "18 business days"
- **Payment:** "Net 45 days"
- **Warranty:** "3-year" or "3-year + 1-year extended"

**Verify:**
- [ ] Handles formal proposal format
- [ ] Extracts all line items correctly
- [ ] Recognizes extended warranty

---

### Test 6: Compare Proposals with AI (10 min)

**Goal:** Test AI-powered proposal comparison and recommendation

**Prerequisites:**
- Must have created 3 proposals in Test 5

**Steps:**

1. Go to **Dashboard** (click "Dashboard" in nav)
2. Click **"View"** on your "Office Equipment Procurement" RFP
3. Scroll to **Proposals** section
4. Should see 3 proposals listed:
   - TechSupply Co. - $31,750
   - OfficeMax Solutions - ~$30,054
   - Global Hardware Inc. - $29,900

5. Click **"Compare Proposals"** button
6. Wait 10-20 seconds for AI processing

**Expected Results:**

**Comparison Dashboard displays:**

#### Vendor Score Cards (3 cards, one per vendor)

**Card Example:**
```
┌─────────────────────────────────────┐
│ TechSupply Co.                      │
│ Overall Score: 88/100               │
├─────────────────────────────────────┤
│ Price Score:        85/100 ████████ │
│ Terms Score:        95/100 █████████│
│ Completeness:      100/100 ██████████
│ Delivery Score:     90/100 █████████ │
└─────────────────────────────────────┘
```

**Score Meanings:**
- **Price Score (0-100):** How competitive vs budget ($50,000)
  - Higher price = lower score
  - Under budget = higher score
- **Terms Score (0-100):** Payment terms and warranty favorability
  - Net 30 = good
  - 50% upfront = lower score
  - Longer warranty = higher score
- **Completeness Score (0-100):** Coverage of all RFP items
  - All items quoted = 100
  - Missing items = lower
- **Delivery Score (0-100):** Timeline alignment
  - Meets 30-day requirement = high score
  - Faster = bonus points

#### Comparison Summary

**Expected text like:**
```
COMPARISON SUMMARY:

Price Comparison:
- Global Hardware Inc.: $29,900 (lowest, 40.2% under budget)
- OfficeMax Solutions: $30,054 (2nd lowest, 39.9% under budget)
- TechSupply Co.: $31,750 (highest, 36.5% under budget)

All proposals are well under the $50,000 budget.

Terms Comparison:
- TechSupply Co.: Net 30, best warranty (2-year comprehensive)
- Global Hardware Inc.: Net 45 (most favorable payment), 3+1 year warranty
- OfficeMax Solutions: 50% upfront payment (least favorable), 1-year warranty

Delivery Comparison:
- Global Hardware Inc.: 18 days (fastest)
- OfficeMax Solutions: 20 days
- TechSupply Co.: 25 days
All meet the 30-day requirement.
```

#### AI Recommendation

**Expected format:**
```
RECOMMENDATION:

We recommend: Global Hardware Inc.

REASONING:
Global Hardware Inc. offers the best overall value with the lowest price
($29,900), fastest delivery (18 days), and most favorable payment terms
(Net 45). While OfficeMax is slightly cheaper in base price, their 50%
upfront requirement and shorter warranty make them less attractive.
TechSupply has excellent warranty coverage but is $1,850 more expensive
than Global Hardware.

Global Hardware's 3-year warranty plus extended support provides excellent
long-term value and peace of mind.
```

#### Risk Analysis

**Per vendor:**
```
RISKS:

TechSupply Co.:
- Highest price among the three vendors (+6.2% vs lowest)
- Longer delivery time (25 days vs 18 days fastest)

OfficeMax Solutions:
- Requires 50% upfront payment (cash flow impact)
- Shortest warranty period (1 year vs 2-3 years from others)
- Informal proposal format may indicate less professional service

Global Hardware Inc.:
- No significant risks identified
- Well-balanced proposal across all criteria
```

**Verify:**

**Scoring:**
- [ ] Each vendor has 4 individual scores (0-100 range)
- [ ] Overall score calculated (0-100 range)
- [ ] Score bars/visualizations display correctly
- [ ] Scores make logical sense:
  - Lower price = higher price score
  - Better terms = higher terms score
  - All items = 100 completeness
  - Faster delivery = higher delivery score

**Comparison:**
- [ ] Price comparison accurate
- [ ] Under/over budget percentages calculated
- [ ] Terms compared (payment, warranty)
- [ ] Delivery timelines compared

**Recommendation:**
- [ ] AI recommends ONE vendor clearly
- [ ] Reasoning references actual proposal data
- [ ] Reasoning mentions price, terms, delivery, warranty
- [ ] Recommendation makes logical business sense

**Risks:**
- [ ] Risks identified for each vendor
- [ ] Risks are relevant (not generic)
- [ ] Risks based on actual proposal data

**Caching:**
- [ ] First load takes 10-20 seconds
- [ ] Refresh page → loads instantly (<1 second)
- [ ] Results cached for 30 minutes

---

## Part 3: API Endpoint Testing (Optional - 15 min)

### Test with cURL commands

**1. Get All RFPs**
```bash
curl http://localhost:5001/api/rfps
```

**Expected:** JSON array of all RFPs

**2. Get Specific RFP with Items**
```bash
curl http://localhost:5001/api/rfps/1
```

**Expected:** JSON object with RFP data and nested items array

**3. Get All Vendors**
```bash
curl http://localhost:5001/api/vendors
```

**Expected:** JSON array of all vendors

**4. Get Proposals for RFP**
```bash
curl http://localhost:5001/api/proposals/rfp/1
```

**Expected:** JSON array of proposals for RFP ID 1

**5. Get Comparison**
```bash
curl http://localhost:5001/api/comparison/rfp/1
```

**Expected:** JSON with scores, recommendation, risks

---

## Part 4: Error Handling Tests (5 min)

### Test 1: Invalid Natural Language Input

1. Create RFP with: "hello world"
2. Click "Parse with AI"

**Expected:**
- AI attempts to parse but may return minimal structure
- Should not crash
- May show error or basic template

### Test 2: Missing Required Fields

1. Create RFP, parse successfully
2. Clear the "Title" field
3. Try to save

**Expected:**
- Validation error
- Form does not submit
- Error message displayed

### Test 3: Send RFP Without Selecting Vendors

1. View RFP detail
2. Click "Send to Vendors"
3. Don't select any vendors
4. Try to send

**Expected:**
- Button disabled OR error message
- No emails sent

---

## Part 5: Database Verification (Optional)

### Connect to PostgreSQL

```bash
docker exec -it postgres psql -U rfpuser -d rfp_management
```

### Useful Queries

**View all RFPs:**
```sql
SELECT id, title, budget, status FROM rfps;
```

**View RFP items:**
```sql
SELECT r.title, ri.item_type, ri.quantity, ri.specifications
FROM rfps r
JOIN rfp_items ri ON r.id = ri.rfp_id;
```

**View proposals:**
```sql
SELECT p.id, r.title, v.name, p.total_price, p.status
FROM proposals p
JOIN rfps r ON p.rfp_id = r.id
JOIN vendors v ON p.vendor_id = v.id;
```

**Exit:**
```sql
\q
```

---

## Complete Testing Checklist

### ✅ Setup
- [ ] Docker services running (PostgreSQL, Redis, RabbitMQ)
- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] Gmail configured (backend shows "Using configured SMTP server")

### ✅ RFP Management
- [ ] Create RFP from natural language
- [ ] AI parses title, description, items, budget, deadline, terms, warranty
- [ ] Items separated correctly
- [ ] Can edit parsed data before saving
- [ ] Save creates RFP successfully
- [ ] View RFP details page
- [ ] All data displays correctly

### ✅ Vendor Management
- [ ] View all vendors (5 pre-seeded + any added)
- [ ] Create new vendor
- [ ] Duplicate email validation works
- [ ] Edit vendor
- [ ] Delete vendor (optional)

### ✅ Email Integration
- [ ] Send RFP to single vendor
- [ ] Send RFP to multiple vendors (3)
- [ ] Backend logs "Email sent"
- [ ] Email received in Gmail inbox
- [ ] Email subject correct
- [ ] Email body includes all RFP details
- [ ] Items formatted in email
- [ ] Budget, deadline, terms in email

### ✅ Proposal Management
- [ ] Receive proposal (formal format)
- [ ] AI extracts total price correctly
- [ ] AI extracts delivery timeline
- [ ] AI extracts payment terms
- [ ] AI extracts warranty info
- [ ] AI extracts line items with pricing
- [ ] Receive proposal (informal/messy format)
- [ ] AI handles different formats
- [ ] Create 3 proposals for same RFP

### ✅ Proposal Comparison
- [ ] Compare button appears when 2+ proposals exist
- [ ] AI generates scores for all vendors
- [ ] Price score (0-100) makes sense
- [ ] Terms score (0-100) makes sense
- [ ] Completeness score (0-100) correct
- [ ] Delivery score (0-100) makes sense
- [ ] Overall score calculated
- [ ] Comparison summary accurate
- [ ] Recommendation provided
- [ ] Reasoning references actual data
- [ ] Risks identified per vendor
- [ ] Results cached (instant on refresh)

### ✅ Error Handling
- [ ] Invalid AI input handled gracefully
- [ ] Form validation works
- [ ] Duplicate email prevented
- [ ] Missing vendor selection handled

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 5001 is in use
lsof -i :5001

# Kill process if needed
kill -9 <PID>

# Check .env file exists
ls backend/.env

# Check OpenAI API key set
cat backend/.env | grep OPENAI_API_KEY
```

### Frontend Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Clear cache and reinstall
cd frontend
rm -rf node_modules
npm install
npm start
```

### Email Not Sending
```bash
# Check backend console shows:
"Using configured SMTP server"  # Good
"Using Ethereal Email"          # Bad - .env not configured

# Verify Gmail credentials
cat backend/.env | grep SMTP

# Restart backend
# Ctrl+C then npm run dev
```

### Database Connection Error
```bash
# Check PostgreSQL running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check connection
docker exec -it postgres psql -U rfpuser -d rfp_management
```

---

## Success Criteria

Your system is working correctly if:

✅ **All 5 core features tested:**
1. Create RFPs from natural language
2. Manage vendors (CRUD)
3. Send RFPs via email (real Gmail delivery)
4. Receive and parse proposals (3 different formats)
5. Compare proposals with AI scores and recommendation

✅ **All services operational:**
- PostgreSQL, Redis, RabbitMQ, Backend, Frontend

✅ **Email working:**
- Emails delivered to Gmail inbox
- Email content properly formatted

✅ **AI working:**
- RFP parsing extracts all fields
- Proposal parsing extracts pricing/terms
- Comparison generates scores and recommendation

✅ **Data persistent:**
- RFPs, vendors, proposals survive server restart
- Database constraints enforced

---

## Testing Time Estimate

- Setup and start services: **5 minutes**
- Test 1 (Create RFP): **5 minutes**
- Test 2 (View RFP): **2 minutes**
- Test 3 (Manage Vendors): **5 minutes**
- Test 4 (Send Email): **5 minutes**
- Test 5 (Parse Proposals): **8 minutes**
- Test 6 (Compare Proposals): **10 minutes**
- Error handling: **5 minutes**

**Total: ~45 minutes for complete testing**

---

## After Testing

Once all tests pass:

1. ✅ Take screenshots of key features
2. ✅ Record demo video (5-10 minutes)
3. ✅ Update README with demo video link
4. ✅ Document any known issues
5. ✅ Prepare for submission

---

**Good luck with testing!** 🚀
