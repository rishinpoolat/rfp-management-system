# AI-Powered RFP Management System

A full-stack web application that streamlines the Request for Proposal (RFP) process using artificial intelligence. This system helps procurement managers create RFPs from natural language, manage vendors, send RFPs via email, receive and parse vendor responses automatically, and compare proposals with AI-powered recommendations.

## Project Overview

This single-user system provides:

- **Natural Language RFP Creation**: Describe your procurement needs in plain English, and AI structures them into formal RFPs
- **Vendor Management**: Maintain a database of vendors with complete contact information
- **Email Integration**: Send RFPs to selected vendors automatically via email
- **AI-Powered Proposal Parsing**: Automatically extract pricing, terms, and conditions from vendor email responses
- **Smart Comparison**: Compare multiple proposals with AI-generated scores and recommendations

## How It Works: Complete Workflow

### 1. Create RFP from Natural Language

**User Input (Plain English):**

```
I need 20 laptops with 16GB RAM and 512GB SSD, plus 15 27-inch 4K monitors.
Total budget is $50,000. Need delivery within 30 days.
Payment terms net 30, and I need at least 2-year warranty.
```

**AI Processing:**

- Uses OpenAI GPT-4o-mini with temperature 0.3 for consistent outputs
- Structured prompt engineering extracts specific fields
- Returns JSON-only format for reliable parsing

**Output (Structured RFP):**

```json
{
  "title": "Office Equipment Procurement",
  "description": "Procurement of laptops and monitors for office",
  "items": [
    {
      "item_type": "Laptop",
      "quantity": 20,
      "specifications": "16GB RAM, 512GB SSD"
    },
    {
      "item_type": "Monitor",
      "quantity": 15,
      "specifications": "27-inch, 4K"
    }
  ],
  "budget": 50000,
  "deadline": "2025-01-05",
  "payment_terms": "Net 30",
  "warranty_requirement": "2 year warranty"
}
```

**What Happens Behind the Scenes:**

1. Frontend sends natural language to `/api/rfps/parse` endpoint
2. Backend calls OpenAI API with carefully crafted prompt
3. AI response stripped of markdown code blocks (if present)
4. JSON parsed and validated
5. User can review and edit before saving
6. Data saved to PostgreSQL with referential integrity

### 2. Send RFP to Vendors

**Process:**

1. User selects vendors from the vendor list
2. System generates professional email with all RFP details
3. Nodemailer sends via Gmail SMTP (or Ethereal for testing)
4. Tracking record created in `rfp_vendors` junction table

**Email Template:**

- Subject: "RFP: [Title] - Response Requested by [Deadline]"
- Body includes: Title, description, line items table, budget, terms, warranty
- Professional formatting with clear response instructions

**Database Updates:**

- `rfp_vendors` table records which vendors received which RFPs
- Timestamp (`sent_at`) for audit trail
- Email subject stored for reference

### 3. Receive & Parse Vendor Proposals

**Vendor Response Example:**

```
Dear Procurement Team,

Laptops (Dell XPS 15): 20 units @ $1,200 = $24,000
Monitors (Dell 27" 4K): 15 units @ $400 = $6,000
Total: $30,000

Delivery: 25 business days
Payment Terms: Net 30 days
Warranty: 2-year comprehensive
```

**AI Parsing Process:**

1. User pastes vendor email into form
2. System sends to `/api/proposals/receive` endpoint
3. AI extracts structured data:
   - Total price: $30,000
   - Line items with unit prices and quantities
   - Delivery timeline: "25 business days"
   - Payment terms: "Net 30 days"
   - Warranty: "2-year comprehensive"
   - Additional terms/notes

**Flexible Parsing:**

- Handles formal proposals with tables
- Handles informal emails with bullet points
- Handles different date formats ("25 days", "Jan 15", "2025-01-15")
- Maps proposal items back to original RFP items

**Error Handling:**

- Raw email content stored for manual verification
- If AI parsing fails, user can manually enter data
- Validation ensures required fields present

### 4. Compare Proposals with AI

**When:** User has 2+ proposals for an RFP

**AI Comparison Analysis:**

```
Input: RFP requirements + All vendor proposals
Output: Objective scoring and recommendation
```

**Scoring Dimensions (0-100 each):**

1. **Price Score:**

   - Formula: Compare to budget and competitors
   - $29,900 vs $50,000 budget = High score (100)
   - Most expensive proposal = Lower score (85)

2. **Terms Score:**

   - Payment terms: Net 30 (good), Net 45 (better), 50% upfront (worse)
   - Warranty: 3-year (excellent), 2-year (good), 1-year (acceptable)
   - Additional benefits: Free shipping, installation, support

3. **Completeness Score:**

   - All RFP items addressed = 100
   - Missing items = Proportional reduction

4. **Delivery Score:**

   - Meets deadline = 100
   - Earlier than deadline = Bonus points
   - Misses deadline = Lower score

5. **Overall Score:**
   - Weighted average of all dimensions
   - Price: 35%, Terms: 25%, Delivery: 20%, Completeness: 20%

**Example Output:**

```json
{
  "scores": [
    {
      "vendor_id": 1,
      "vendor_name": "TechSupply Co.",
      "price_score": 85,
      "terms_score": 95,
      "completeness_score": 100,
      "delivery_score": 90,
      "overall_score": 91
    }
  ],
  "comparison_summary": "All proposals are under budget. Global Hardware offers lowest price ($29,900) with fastest delivery (18 days). TechSupply has best warranty (2-year comprehensive)...",
  "recommendation": {
    "vendor_id": 3,
    "vendor_name": "Global Hardware Inc.",
    "reasoning": "Best overall value with lowest price, fastest delivery, and favorable Net 45 payment terms. 3-year warranty provides long-term value."
  },
  "risks": [
    {
      "vendor_id": 1,
      "vendor_name": "TechSupply Co.",
      "concerns": [
        "Highest price (+6.2% vs lowest)",
        "Longer delivery time (25 days)"
      ]
    }
  ]
}
```

**Caching Strategy:**

- First comparison: 10-20 seconds (OpenAI API call)
- Subsequent loads: Instant (Redis cache, 30-minute TTL)
- Cache key: `comparison:rfp:{rfp_id}`

### 5. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  - Create RFP   - Manage Vendors   - Compare Proposals │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────┐
│              Express.js Backend                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Controllers │  │   Services   │  │  Middleware  │ │
│  │  (Routing)   │  │  (Business)  │  │   (Error)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────┬────────┬────────┬────────┬────────────────────────┘
      │        │        │        │
      │        │        │        └──────> OpenAI API
      │        │        │                (GPT-4o-mini)
      │        │        │
      │        │        └──────> Nodemailer → Gmail SMTP
      │        │
      │        └──────> Redis (Caching)
      │
      └──────> PostgreSQL Database
               ┌─────────────────────────┐
               │ - rfps                  │
               │ - rfp_items             │
               │ - vendors               │
               │ - rfp_vendors (junction)│
               │ - proposals             │
               │ - proposal_items        │
               └─────────────────────────┘
```

### 6. AI Prompt Engineering Details

**RFP Parsing Prompt Structure:**

```javascript
{
  role: 'system',
  content: 'You are a procurement expert that converts natural language into structured JSON data.'
}
{
  role: 'user',
  content: `Parse this RFP request: "${input}"
  Extract: title, items, budget, deadline, payment_terms, warranty_requirement
  Return ONLY valid JSON.`
}
```

**Key Techniques:**

- **Explicit JSON requirement:** "Return ONLY valid JSON with no additional text"
- **Current date injection:** Helps AI calculate relative dates ("30 days from now")
- **Field definitions:** Clear specification of expected output structure
- **Temperature 0.3:** Balance between creativity and consistency
- **Token limit 1500:** Sufficient for complex RFPs without waste

**Error Handling:**

- Strip markdown code blocks: ` content.replace(/```json\n?/g, '') `
- Graceful degradation: Show raw content if JSON parsing fails
- User validation: All AI outputs are editable before saving



## Prerequisites

Before running this application, ensure you have:

- **Node.js** v18 or higher
- **Docker** and **Docker Compose**
- **OpenAI API Key** (for AI features)
- **Gmail Account** (for real email sending - configured for production use)

## Tech Stack

### Backend

- **Express.js**: Web framework
- **PostgreSQL**: Database (running in Docker)
- **Sequelize**: ORM for database operations
- **OpenAI API**: AI-powered parsing and comparison (using GPT-4o-mini)
- **Nodemailer**: Email sending via Gmail SMTP
- **RabbitMQ**: Message queue for async job processing
- **Redis**: Caching layer for performance optimization
- **dotenv**: Environment variable management
- **CORS**: Cross-origin resource sharing

### Frontend

- **React 18**: UI framework
- **React Router DOM v6**: Client-side routing
- **Axios**: HTTP client for API calls
- **CSS3**: Custom styling (no external CSS framework)

### Infrastructure

- **Docker Compose**: Orchestrates PostgreSQL, Redis, and RabbitMQ
- **RESTful API**: Backend architecture
- **Message Queue (RabbitMQ)**: Async job processing for email sending and AI operations
- **Cache Layer (Redis)**: Performance optimization for API responses and comparison results

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd rfp-management-system
```

### 2. Set Up Database

Start PostgreSQL using Docker Compose OR use local PostgreSQL:

**Option A: Docker (Recommended)**

```bash
docker-compose up -d
```

**Option B: Local PostgreSQL**

```bash
brew services start postgresql@17
```

This will:

- Start PostgreSQL on port 5432
- Create the `rfp_management` database (if using Docker)
- Run initialization scripts to create tables (if using Docker)
- Seed 5 sample vendors automatically (if using Docker):
  1. TechSupply Co. (tech@supply.co)
  2. OfficeMax Solutions (sales@officemax.com)
  3. Global Hardware Inc. (info@globalhw.com)
  4. Business Equipment Ltd. (contact@bizequip.com)
  5. Corporate Supplies Group (orders@corpsupply.com)

Verify the database is running:

```bash
docker ps  # for Docker
# OR
brew services list | grep postgresql  # for local installation
```

### 3. Backend Setup

Navigate to backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

**IMPORTANT:** Edit the `.env` file and add your OpenAI API key:

```bash
nano .env  # or use your preferred editor
```

Required configuration:

- **OPENAI_API_KEY**: Get from https://platform.openai.com/api-keys
- All other settings have working defaults

For complete testing instructions and email setup, see **[MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md)**.

Start the backend server:

```bash
npm run dev
```

The backend API will be available at `http://localhost:5001/api`

### 4. Frontend Setup

Open a new terminal, navigate to frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env` file (uses defaults, usually no changes needed):

```bash
cp .env.example .env
```

The frontend is configured to connect to `http://localhost:5001/api` by default.

Start the frontend development server:

```bash
npm start
```

The application will open at `http://localhost:3000`

### 5. Configure Email

**Gmail SMTP Setup** (required for real email sending):

1. Enable 2-factor authentication on your Gmail account: https://myaccount.google.com/security
2. Generate an app-specific password: https://myaccount.google.com/apppasswords
   - Select app: Mail
   - Select device: Other (Custom name) - enter "RFP System"
   - Copy the 16-character password
3. Update your backend `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

4. Restart the backend server for changes to take effect

**Note**: The system is already configured for Gmail. For testing without real email, you can leave SMTP credentials blank and the system will auto-configure Ethereal Email (test email service with preview URLs).

## API Documentation

### RFPs

| Method | Endpoint             | Description                                |
| ------ | -------------------- | ------------------------------------------ |
| POST   | `/api/rfps/parse`    | Parse natural language into structured RFP |
| POST   | `/api/rfps`          | Create a new RFP                           |
| GET    | `/api/rfps`          | List all RFPs                              |
| GET    | `/api/rfps/:id`      | Get specific RFP with items                |
| PUT    | `/api/rfps/:id`      | Update RFP                                 |
| DELETE | `/api/rfps/:id`      | Delete RFP                                 |
| POST   | `/api/rfps/:id/send` | Send RFP to selected vendors               |

### Vendors

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| POST   | `/api/vendors`     | Create vendor       |
| GET    | `/api/vendors`     | List all vendors    |
| GET    | `/api/vendors/:id` | Get specific vendor |
| PUT    | `/api/vendors/:id` | Update vendor       |
| DELETE | `/api/vendors/:id` | Delete vendor       |

### Proposals

| Method | Endpoint                     | Description                       |
| ------ | ---------------------------- | --------------------------------- |
| POST   | `/api/proposals/receive`     | Receive and parse vendor response |
| GET    | `/api/proposals/:id`         | Get specific proposal             |
| GET    | `/api/proposals/rfp/:rfp_id` | Get all proposals for an RFP      |
| PUT    | `/api/proposals/:id`         | Update proposal                   |
| POST   | `/api/proposals/:id/status`  | Update proposal status            |

### Comparison

| Method | Endpoint                      | Description                          |
| ------ | ----------------------------- | ------------------------------------ |
| GET    | `/api/comparison/rfp/:rfp_id` | Get AI comparison and recommendation |

### Example API Requests

**Parse RFP (Natural Language):**

```bash
curl -X POST http://localhost:5001/api/rfps/parse \
  -H "Content-Type: application/json" \
  -d '{
    "input": "I need 20 laptops with 16GB RAM and 15 monitors. Budget is $50,000. Delivery in 30 days."
  }'
```

**Response:**

```json
{
  "title": "Office Equipment Procurement",
  "description": "Procurement of laptops and monitors",
  "items": [
    { "item_type": "Laptop", "quantity": 20, "specifications": "16GB RAM" },
    { "item_type": "Monitor", "quantity": 15, "specifications": "27-inch" }
  ],
  "budget": 50000,
  "deadline": "2025-01-03",
  "payment_terms": "Net 30",
  "warranty_requirement": "Standard warranty"
}
```

**Create RFP:**

```bash
curl -X POST http://localhost:5001/api/rfps \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Office Equipment Procurement",
    "budget": 50000,
    "deadline": "2025-01-30",
    "items": [
      {"item_type": "Laptop", "quantity": 20, "specifications": "16GB RAM, 512GB SSD"},
      {"item_type": "Monitor", "quantity": 15, "specifications": "27 inch, 4K"}
    ]
  }'
```

**Response:**

```json
{
  "id": 1,
  "title": "Office Equipment Procurement",
  "budget": 50000,
  "status": "draft",
  "created_at": "2025-12-04T10:30:00Z"
}
```

**Send RFP to Vendors:**

```bash
curl -X POST http://localhost:5001/api/rfps/1/send \
  -H "Content-Type: application/json" \
  -d '{
    "vendorIds": [1, 2, 3]
  }'
```

**Response:**

```json
{
  "message": "RFP sent to 3 vendors successfully",
  "emailsSent": 3
}
```

## Database Schema

### Tables

**rfps**: Main RFP records

- `id`, `title`, `description`, `raw_input`, `budget`, `deadline`, `payment_terms`, `warranty_requirement`, `status`, `created_at`, `updated_at`

**rfp_items**: Line items for each RFP

- `id`, `rfp_id`, `item_type`, `quantity`, `specifications`, `created_at`

**vendors**: Vendor contact information

- `id`, `name`, `email`, `contact_person`, `phone`, `address`, `created_at`, `updated_at`

**rfp_vendors**: Junction table tracking RFP distribution

- `id`, `rfp_id`, `vendor_id`, `sent_at`, `email_subject`

**proposals**: Vendor responses to RFPs

- `id`, `rfp_id`, `vendor_id`, `raw_email_content`, `total_price`, `delivery_timeline`, `payment_terms_offered`, `warranty_offered`, `additional_terms`, `parsed_at`, `status`, `ai_score`, `ai_summary`, `created_at`, `updated_at`

**proposal_items**: Line item pricing in proposals

- `id`, `proposal_id`, `rfp_item_id`, `unit_price`, `total_price`, `notes`

### ER Diagram

```
rfps (1) ──< (N) rfp_items
  │
  │ (M) ──< rfp_vendors >── (M) vendors
  │
  └── (1) ──< (N) proposals ──< (N) proposal_items
```

## Performance & Scalability

### Caching Strategy (Redis)

- **Comparison Results**: Cached for 30 minutes to avoid redundant AI API calls
- **Cache Key Pattern**: `comparison:rfp:{rfp_id}`
- **Benefits**:
  - First load: 10-20 seconds (with OpenAI API call)
  - Subsequent loads: <100ms (from cache)
  - Cost savings: Avoid repeated API calls for same data

### Async Processing (RabbitMQ)

- **Email Queue**: Sends emails asynchronously to prevent blocking
- **AI Processing Queue**: Handles AI parsing jobs without blocking HTTP requests
- **Workers**:
  - Email worker processes `email_queue`
  - AI worker processes `ai_queue`
- **Benefits**:
  - Faster API response times
  - Scalable to handle bulk operations (e.g., send RFP to 100+ vendors)
  - Retry logic for failed jobs

### Database Optimizations

- **Indexes**: Primary keys on all tables for fast lookups
- **Foreign Keys**: Enforced referential integrity prevents orphaned data
- **Connection Pooling**: Sequelize ORM manages connection pool efficiently
- **Transactions**: ACID compliance for critical operations (creating RFP with items)

### API Performance

- **Response Times** (typical):
  - GET endpoints: 50-200ms
  - POST (no AI): 100-300ms
  - POST (with AI parsing): 3-8 seconds
  - Comparison (first load): 10-20 seconds
  - Comparison (cached): <100ms

## Key Design Decisions

### 1. Why PostgreSQL

**Reasoning**: PostgreSQL was chosen over MongoDB or other NoSQL databases for several reasons:

- **Relational Data**: The RFP system has clear relational structures (RFPs → Items, Vendors → Proposals)
- **Data Integrity**: Foreign key constraints ensure referential integrity
- **Complex Queries**: Need for JOIN operations when comparing proposals
- **ACID Compliance**: Financial data (pricing, budgets) requires transaction safety
- **Mature Ecosystem**: Excellent tooling, well-documented, and reliable

### 2. AI Prompting Strategy

**Approach**: Structured prompts with explicit JSON output requirements

**Implementation**:

- Use GPT-4o-mini for cost-effectiveness while maintaining quality
- System messages define AI role as "procurement expert"
- User messages contain specific extraction instructions
- Request "JSON only" output to ensure parseability
- Handle markdown code blocks in responses
- Set temperature to 0.3 for consistent, deterministic outputs

**Example Prompt Structure**:

```javascript
{
  role: 'system',
  content: 'You are a procurement expert...'
},
{
  role: 'user',
  content: 'Parse this RFP: "..." Extract: title, items, budget...'
}
```

### 3. Email Handling Approach

**Decision**: Hybrid approach with manual form for receiving proposals

**Reasoning**:

- **Sending**: Fully automated with Nodemailer (supports both Gmail and Ethereal for testing)
- **Receiving**: Manual form to paste email content (simulates receiving)
  - More reliable than IMAP polling for demo purposes
  - Avoids email server authentication complexities
  - Allows testing without real email infrastructure
  - Can be easily upgraded to webhook-based or IMAP polling in production

**Benefits**:

- Quick to implement and test
- No dependency on external email services for receiving
- Works reliably in all environments
- Clear demonstration of AI parsing capabilities

### 4. Comparison Algorithm

**AI-Driven Scoring System**:

The comparison uses OpenAI to generate objective scores across multiple dimensions:

1. **Price Score (0-100)**: Competitiveness vs budget
2. **Terms Score (0-100)**: Favorability of payment and warranty terms
3. **Completeness Score (0-100)**: Coverage of all RFP requirements
4. **Delivery Score (0-100)**: Timeline alignment
5. **Overall Score**: Weighted average of above scores

**Output**:

- Per-vendor scores with breakdowns
- Comparison summary highlighting key differences
- Clear recommendation with reasoning
- Risk analysis identifying concerns

**Advantages**:

- Objective, data-driven recommendations
- Consistent evaluation criteria
- Explainable AI (provides reasoning)
- Reduces human bias in vendor selection

## Security Considerations

### Current Implementation (Demo/Development)

- **No Authentication**: Single-user system without login requirements
- **CORS Enabled**: Allows cross-origin requests for development
- **Environment Variables**: Sensitive data (API keys, SMTP credentials) in `.env` files
- **Input Validation**: Basic validation on API endpoints
- **SQL Injection Protection**: Sequelize ORM uses parameterized queries

### Production Recommendations

For deploying to production, implement:

1. **Authentication & Authorization**

   - JWT-based authentication
   - Role-based access control (RBAC): Admin, Procurement Manager, Viewer
   - Password hashing with bcrypt
   - Session management

2. **API Security**

   - Rate limiting (express-rate-limit)
   - Request validation (express-validator - already included)
   - Helmet.js for HTTP headers security
   - HTTPS/TLS encryption

3. **Data Protection**

   - Encrypt sensitive data at rest
   - Secure password storage
   - API key rotation policy
   - Database encryption

4. **Email Security**

   - SPF/DKIM records for email authentication
   - Email encryption (TLS)
   - Prevent email injection attacks
   - Validate recipient addresses

5. **Infrastructure Security**

   - Environment variable management (AWS Secrets Manager, HashiCorp Vault)
   - Container security scanning
   - Network isolation
   - Firewall rules (allow only necessary ports)

6. **Audit & Compliance**
   - Logging all API requests
   - User action audit trail
   - GDPR/data privacy compliance
   - Regular security audits

## Assumptions

1. **Single User System**: No authentication or multi-user support
2. **English Language**: All inputs and vendor responses are in English
3. **Email Format**: Vendor responses are plain text or simple HTML emails
4. **Currency**: All pricing is in USD
5. **Time Zone**: All timestamps use server's local time zone
6. **File Attachments**: Not parsed (only filenames stored if present)
7. **Network**: Backend and frontend run on localhost for development
8. **OpenAI API**: Assumes OpenAI API is available and functional
9. **Email Volume**: System designed for moderate email volume (not high-scale)
10. **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## AI Tools Used

This project was developed with assistance from AI tools:

### GitHub Copilot

- **Code Completion**: Accelerated writing of boilerplate code (routes, controllers, models)
- **Function Implementation**: Helped implement CRUD operations and database queries
- **Error Handling**: Suggested try-catch patterns and error responses
- **Consistency**: Maintained consistent coding patterns across files

### Claude Code (Development Assistant)

- **Architecture Planning**: Designed overall system structure and database schema
- **Problem Solving**: Debugged complex issues with AI prompt formatting and JSON parsing
- **Documentation**: Generated API documentation and code comments
- **Prompt Engineering**: Optimized OpenAI prompts for better AI responses

### Notable Prompts Used

**For RFP Parsing**:

```
"You are an expert at parsing procurement requirements into structured data.
Parse this RFP request into JSON with: title, items, budget, deadline,
payment_terms, warranty_requirement. Return ONLY valid JSON."
```

**For Proposal Comparison**:

```
"You are a procurement expert comparing vendor proposals. Provide scores
(0-100) for price, terms, completeness, and delivery. Include recommendation
with reasoning and risk analysis. Return as structured JSON."
```

### Learnings

1. **Prompt Specificity Matters**: Being explicit about JSON structure prevents parsing errors
2. **Temperature Settings**: Lower temperature (0.3) produces more consistent, reliable outputs
3. **Error Handling**: Always handle markdown code blocks in AI responses
4. **Token Limits**: GPT-4o-mini provides good balance of cost and capability for this use case
5. **Validation**: Never trust AI output without validation - always check JSON parseability

## Cost Analysis

### OpenAI API Costs (GPT-4o-mini)

**Pricing**: ~$0.015 per 1K tokens (as of Dec 2024)

**Estimated Usage per RFP Workflow:**

- **RFP Parsing**: ~500 tokens = $0.0075
- **Proposal Parsing** (per vendor): ~800 tokens = $0.012
- **Comparison** (3 vendors): ~2000 tokens = $0.030

**Total per Complete RFP** (with 3 vendors):

- 1 parsing + 3 proposals + 1 comparison = ~$0.086

**Monthly Cost Estimate:**

- 10 RFPs/month: ~$0.86
- 50 RFPs/month: ~$4.30
- 100 RFPs/month: ~$8.60

**Cost Optimization Strategies:**

1. **Caching**: Redis caches comparison results (30 min TTL)

   - Saves $0.030 per repeat view
   - Estimated savings: 40% reduction in comparison API calls

2. **GPT-4o-mini vs GPT-4**:

   - GPT-4o-mini: $0.015/1K tokens
   - GPT-4: $0.03/1K tokens
   - Savings: 60% cost reduction with 95% accuracy

3. **Batch Processing**: Process multiple proposals in single API call
   - Current: 3 API calls (one per proposal)
   - Optimized: 1 API call (all proposals together)
   - Savings: 66% reduction in API calls

### Infrastructure Costs

**Development (Local/Docker):**

- Docker Desktop: Free
- PostgreSQL: Free (open source)
- Redis: Free (open source)
- RabbitMQ: Free (open source)
- **Total**: $0/month

**Production (AWS Example):**

- EC2 t3.small (backend): ~$15/month
- RDS PostgreSQL (db.t3.micro): ~$15/month
- ElastiCache Redis (cache.t3.micro): ~$12/month
- Amazon MQ RabbitMQ (mq.t3.micro): ~$25/month
- S3 for backups: ~$1/month
- Route53 DNS: ~$1/month
- **Total**: ~$69/month + OpenAI API costs

**Production (Cheaper Alternative - Render/Railway):**

- Web service: ~$7/month
- PostgreSQL: ~$7/month
- Redis: Free tier available
- RabbitMQ: Free tier available
- **Total**: ~$14/month + OpenAI API costs

## Deployment Guide

### Local Development

Already covered in Setup Instructions above.

### Production Deployment Options

#### Option 1: Docker Compose (VPS/EC2)

```bash
# 1. Clone repository on server
git clone <repo-url>
cd rfp-management-system

# 2. Set environment variables
cp backend/.env.example backend/.env
nano backend/.env  # Add production values

# 3. Update docker-compose for production
# - Use named volumes for data persistence
# - Add restart policies
# - Configure network security

# 4. Start services
docker-compose up -d

# 5. Setup reverse proxy (Nginx)
# - Configure SSL/TLS certificates (Let's Encrypt)
# - Proxy port 80/443 to frontend:3000
# - Proxy /api to backend:5001
```

#### Option 2: Platform-as-a-Service (Render, Railway, Fly.io)

**Frontend (React):**

- Build command: `cd frontend && npm install && npm run build`
- Publish directory: `frontend/build`
- Static site hosting

**Backend (Express):**

- Build command: `cd backend && npm install`
- Start command: `cd backend && npm start`
- Environment variables: Set in platform dashboard

**Database:**

- Use managed PostgreSQL service
- Connection string in backend `.env`

**Caching/Queue:**

- Use managed Redis/RabbitMQ or disable for MVP

#### Option 3: Kubernetes (Enterprise)

```yaml
# Microservices architecture:
- Frontend: React SPA (Nginx container)
- Backend: Express API (Node container)
- PostgreSQL: StatefulSet with persistent volume
- Redis: StatefulSet or managed service
- RabbitMQ: StatefulSet or managed service
- Ingress: SSL termination, load balancing
```

### Environment Variables for Production

**Backend `.env`:**

```env
NODE_ENV=production
PORT=5001

# Database (use managed service URL)
DB_HOST=your-db-host.com
DB_PORT=5432
DB_NAME=rfp_management
DB_USER=rfp_production
DB_PASSWORD=<strong-password>

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Email (Gmail or SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=<app-specific-password>

# Redis (managed service)
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>

# RabbitMQ (managed service)
RABBITMQ_URL=amqp://user:pass@host:5672

# CORS (frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com
```

**Frontend `.env`:**

```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

### CI/CD Pipeline (GitHub Actions Example)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render/Railway
        run: |
          # Deploy backend
          # Railway CLI or Render API

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and deploy
        run: |
          cd frontend
          npm install
          npm run build
          # Deploy to Netlify/Vercel/Render
```

## Known Limitations

1. **Email Receiving**: Manual paste form instead of automated email fetching
2. **File Attachments**: PDF/DOCX proposals not automatically parsed
3. **No Authentication**: Single-user system with no login
4. **AI API Dependency**: Requires OpenAI API availability and valid API key
5. **No Real-time Updates**: UI doesn't auto-refresh when data changes
6. **Limited Error Recovery**: AI parsing failures require manual retry
7. **No Data Export**: Comparison results can't be exported to PDF/CSV yet
8. **Email Templates**: Fixed template format for RFP emails
9. **Timezone**: No timezone selection, uses server time
10. **Mobile Responsiveness**: UI optimized for desktop, limited mobile support

## Future Enhancements

### Short Term

- [ ] Add proposal status workflow (approve/reject)
- [ ] Email notification when proposals are received
- [ ] Export comparison to PDF/CSV
- [ ] Edit proposals after parsing
- [ ] RFP templates for common procurement scenarios

### Medium Term

- [ ] IMAP integration for automatic email receiving
- [ ] PDF/DOCX attachment parsing
- [ ] Multi-vendor negotiation tracking
- [ ] Historical RFP analytics dashboard
- [ ] User authentication and role-based access

### Long Term

- [ ] Multi-organization support
- [ ] Integration with ERP systems
- [ ] Mobile app for on-the-go RFP management
- [ ] AI-powered vendor recommendation based on history
- [ ] Automated contract generation from selected proposals
- [ ] Real-time collaboration features
- [ ] Advanced reporting and analytics
- [ ] Blockchain-based proposal verification

## Testing the Application

For complete step-by-step manual testing instructions, see **[MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md)**.

The guide includes:

- Detailed setup instructions
- 6 comprehensive test scenarios with expected results
- API endpoint testing
- Error handling tests
- Database verification
- Complete testing checklist
- Troubleshooting guide

### Quick Start Testing

1. **Start Services**

   ```bash
   # Terminal 1: Database
   docker-compose up -d

   # Terminal 2: Backend
   cd backend && npm run dev

   # Terminal 3: Frontend
   cd frontend && npm start
   ```

2. **Test Complete Workflow** (5 minutes)
   - Create RFP from natural language
   - Send to vendors via email
   - Parse vendor responses
   - Compare proposals with AI scoring
   - Review AI scores and recommendation

### Sample Vendor Email Response

Use this as a test email when receiving proposals:

```
Dear Procurement Team,

Thank you for the opportunity to submit a proposal.

Laptops (Dell XPS 15, 16GB RAM):
- Quantity: 20 units
- Unit Price: $1,200
- Total: $24,000

Monitors (Dell 27" 4K):
- Quantity: 10 units
- Unit Price: $400
- Total: $4,000

Total Proposal Amount: $28,000

Delivery Timeline: 20 business days
Payment Terms: Net 30 days
Warranty: 2-year comprehensive warranty

Best regards,
TechSupply Co.
```

## Troubleshooting

### Database Connection Errors

```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose restart

# View logs
docker-compose logs postgres
```

### Backend Errors

```bash
# Check environment variables
cat backend/.env

# Ensure OpenAI API key is set
echo $OPENAI_API_KEY

# Clear npm cache and reinstall
cd backend
rm -rf node_modules
npm install
```

### Frontend Errors

```bash
# Clear React cache
cd frontend
rm -rf node_modules
npm install

# Check API connection
curl http://localhost:5000/api/health
```

### AI Parsing Failures

- Verify OpenAI API key is valid and has credits
- Check backend console for detailed error messages
- Try simpler input text
- Ensure internet connection for API calls

## Project Structure

```
rfp-management-system/
├── docker-compose.yml          # PostgreSQL container config
├── .env.example               # Environment variable template
├── README.md                  # This file
│
├── backend/
│   ├── package.json
│   ├── server.js             # Express server entry point
│   ├── .env                  # Environment variables (not in git)
│   ├── database/
│   │   ├── init.sql         # Database schema and seeds
│   │   └── connection.js    # PostgreSQL connection pool
│   ├── routes/              # API routes
│   │   ├── rfps.js
│   │   ├── vendors.js
│   │   ├── proposals.js
│   │   └── comparison.js
│   ├── controllers/         # Request handlers
│   │   ├── rfpController.js
│   │   ├── vendorController.js
│   │   ├── proposalController.js
│   │   └── comparisonController.js
│   ├── models/              # Database models
│   │   ├── rfpModel.js
│   │   ├── vendorModel.js
│   │   └── proposalModel.js
│   ├── services/            # Business logic
│   │   ├── aiService.js     # OpenAI integration
│   │   └── emailService.js  # Nodemailer setup
│   └── middleware/
│       └── errorHandler.js  # Global error handler
│
└── frontend/
    ├── package.json
    ├── .env
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js         # React entry point
        ├── index.css        # Global styles
        ├── App.js           # Main app with routing
        ├── api/
        │   └── client.js    # Axios configuration
        ├── pages/           # Page components
        │   ├── Dashboard.js
        │   ├── CreateRFP.js
        │   ├── RFPDetail.js
        │   ├── VendorManagement.js
        │   ├── ReceiveProposal.js
        │   └── ComparisonDashboard.js
        └── components/
            └── Layout/
                └── Header.js
```

## Contributing

This is a demonstration project. For production use, consider:

- Adding comprehensive unit and integration tests
- Implementing proper authentication and authorization
- Adding request rate limiting
- Implementing data backup strategies
- Adding monitoring and logging
- Improving error messages and user feedback
- Enhancing mobile responsiveness

## License

MIT License - Feel free to use this project for learning or as a starting point for your own RFP management system.

## Quick Reference

### Common Commands

**Start Everything:**

```bash
# Terminal 1: Docker services
docker-compose up -d

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: Frontend
cd frontend && npm start
```

**Stop Everything:**

```bash
# Stop frontend and backend (Ctrl+C in terminals)

# Stop Docker services
docker-compose down

# Stop Docker and remove volumes (⚠️ deletes all data)
docker-compose down -v
```

**Check Service Status:**

```bash
# Docker services
docker ps

# Backend health
curl http://localhost:5001/api/health

# Frontend
curl http://localhost:3000
```

**Database Access:**

```bash
# Connect to PostgreSQL
docker exec -it rfp_postgres psql -U rfpuser -d rfp_management

# View all RFPs
SELECT id, title, budget, status FROM rfps;

# View proposals with vendors
SELECT p.id, r.title as rfp, v.name as vendor, p.total_price, p.status
FROM proposals p
JOIN rfps r ON p.rfp_id = r.id
JOIN vendors v ON p.vendor_id = v.id;

# Exit
\q
```

**View Logs:**

```bash
# Backend logs (in backend terminal)
# Frontend logs (in frontend terminal)

# Docker service logs
docker-compose logs postgres
docker-compose logs redis
docker-compose logs rabbitmq

# Follow logs
docker-compose logs -f postgres
```

### API Quick Reference

**Base URL:** `http://localhost:5001/api`

| Endpoint              | Method | Description                | Body Example                                            |
| --------------------- | ------ | -------------------------- | ------------------------------------------------------- |
| `/rfps/parse`         | POST   | Parse natural language RFP | `{"input": "I need 20 laptops..."}`                     |
| `/rfps`               | POST   | Create RFP                 | `{"title": "...", "budget": 50000, "items": [...]}`     |
| `/rfps`               | GET    | List all RFPs              | -                                                       |
| `/rfps/:id`           | GET    | Get RFP details            | -                                                       |
| `/rfps/:id/send`      | POST   | Send RFP to vendors        | `{"vendorIds": [1, 2, 3]}`                              |
| `/vendors`            | POST   | Create vendor              | `{"name": "...", "email": "..."}`                       |
| `/vendors`            | GET    | List all vendors           | -                                                       |
| `/proposals/receive`  | POST   | Parse vendor proposal      | `{"rfp_id": 1, "vendor_id": 1, "email_content": "..."}` |
| `/proposals/rfp/:id`  | GET    | Get proposals for RFP      | -                                                       |
| `/comparison/rfp/:id` | GET    | Compare proposals          | -                                                       |

### Troubleshooting Quick Guide

| Issue                     | Solution                                           |
| ------------------------- | -------------------------------------------------- |
| Port 5001 already in use  | `lsof -i :5001` then `kill -9 <PID>`               |
| Port 3000 already in use  | `lsof -i :3000` then `kill -9 <PID>`               |
| Database connection error | `docker-compose restart postgres`                  |
| Email not sending         | Check backend shows "Using configured SMTP server" |
| AI parsing fails          | Verify OpenAI API key in `backend/.env`            |
| Frontend can't reach API  | Check backend is running on port 5001              |
| Redis connection error    | `docker-compose restart redis`                     |
| RabbitMQ not working      | `docker-compose restart rabbitmq`                  |

### Key Files Reference

```
rfp-management-system/
├── README.md                          # This file
├── MANUAL_TESTING_GUIDE.md           # Complete testing walkthrough
├── VIDEO_WALKTHROUGH_SCRIPT.md       # Demo video script
├── docker-compose.yml                 # Infrastructure orchestration
├── backend/
│   ├── .env                          # Environment variables (create from .env.example)
│   ├── server.js                     # Entry point
│   ├── database/init.sql             # Database schema
│   ├── services/aiService.js         # OpenAI integration
│   ├── services/emailService.js      # Nodemailer setup
│   └── routes/                       # API endpoints
└── frontend/
    ├── .env                          # Frontend config
    └── src/
        ├── pages/                    # React page components
        └── api/client.js             # Axios configuration
```

## Support

For issues or questions:

- Check the troubleshooting section above
- Review backend console logs for detailed error messages
- Ensure all prerequisites are installed and configured correctly
- Consult **[MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md)** for detailed testing steps

## Acknowledgments

- OpenAI for GPT-4o-mini API
- PostgreSQL community
- React and Express.js communities
- All open-source contributors whose packages made this project possible

---
