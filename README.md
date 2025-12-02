# AI-Powered RFP Management System

A full-stack web application that streamlines the Request for Proposal (RFP) process using artificial intelligence. This system helps procurement managers create RFPs from natural language, manage vendors, send RFPs via email, receive and parse vendor responses automatically, and compare proposals with AI-powered recommendations.

## Project Overview

This single-user system provides:
- **Natural Language RFP Creation**: Describe your procurement needs in plain English, and AI structures them into formal RFPs
- **Vendor Management**: Maintain a database of vendors with complete contact information
- **Email Integration**: Send RFPs to selected vendors automatically via email
- **AI-Powered Proposal Parsing**: Automatically extract pricing, terms, and conditions from vendor email responses
- **Smart Comparison**: Compare multiple proposals with AI-generated scores and recommendations

## Demo Video

[Link to demo video will be added here]

## Prerequisites

Before running this application, ensure you have:

- **Node.js** v18 or higher
- **Docker** and **Docker Compose**
- **OpenAI API Key** (for AI features)
- **Gmail Account** (optional, for email testing - Ethereal Email used by default)

## Tech Stack

### Backend
- **Express.js**: Web framework
- **PostgreSQL**: Database (running in Docker)
- **pg (node-postgres)**: PostgreSQL client
- **OpenAI API**: AI-powered parsing and comparison (using GPT-4o-mini)
- **Nodemailer**: Email sending
- **dotenv**: Environment variable management
- **CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: UI framework
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client
- **React Hook Form**: Form management
- **CSS3**: Styling (no external CSS framework)

### Infrastructure
- **Docker Compose**: PostgreSQL containerization
- **RESTful API**: Backend architecture

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd rfp-management-system
```

### 2. Set Up Database

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL on port 5432
- Create the `rfp_management` database
- Run initialization scripts to create tables
- Seed 5 sample vendors

Verify the database is running:

```bash
docker ps
```

### 3. Backend Setup

Navigate to backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```bash
cp ../.env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rfp_management
DB_USER=rfpuser
DB_PASSWORD=rfppassword

# OpenAI - REQUIRED
OPENAI_API_KEY=your_openai_api_key_here

# Email (Ethereal will be used by default if not configured)
# For Gmail, uncomment and configure:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_specific_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Important**: You must provide a valid OpenAI API key for the AI features to work.

Start the backend server:

```bash
npm run dev
```

The backend API will be available at `http://localhost:5000/api`

### 4. Frontend Setup

Open a new terminal, navigate to frontend directory and install dependencies:

```bash
cd frontend
npm install
```

The frontend `.env` file is already configured. If needed, you can modify it:

```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm start
```

The application will open at `http://localhost:3000`

### 5. Configure Email (Optional)

**Option A: Use Ethereal Email (Default - Recommended for Testing)**

The system automatically uses Ethereal Email (fake SMTP) for testing. Check the backend console for preview URLs when emails are sent.

**Option B: Use Gmail**

1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password: https://myaccount.google.com/apppasswords
3. Update your backend `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

## API Documentation

### RFPs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rfps/parse` | Parse natural language into structured RFP |
| POST | `/api/rfps` | Create a new RFP |
| GET | `/api/rfps` | List all RFPs |
| GET | `/api/rfps/:id` | Get specific RFP with items |
| PUT | `/api/rfps/:id` | Update RFP |
| DELETE | `/api/rfps/:id` | Delete RFP |
| POST | `/api/rfps/:id/send` | Send RFP to selected vendors |

### Vendors

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vendors` | Create vendor |
| GET | `/api/vendors` | List all vendors |
| GET | `/api/vendors/:id` | Get specific vendor |
| PUT | `/api/vendors/:id` | Update vendor |
| DELETE | `/api/vendors/:id` | Delete vendor |

### Proposals

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/proposals/receive` | Receive and parse vendor response |
| GET | `/api/proposals/:id` | Get specific proposal |
| GET | `/api/proposals/rfp/:rfp_id` | Get all proposals for an RFP |
| PUT | `/api/proposals/:id` | Update proposal |
| POST | `/api/proposals/:id/status` | Update proposal status |

### Comparison

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comparison/rfp/:rfp_id` | Get AI comparison and recommendation |

### Example API Requests

**Parse RFP (Natural Language):**

```bash
curl -X POST http://localhost:5000/api/rfps/parse \
  -H "Content-Type: application/json" \
  -d '{
    "input": "I need 20 laptops with 16GB RAM and 15 monitors. Budget is $50,000. Delivery in 30 days."
  }'
```

**Create RFP:**

```bash
curl -X POST http://localhost:5000/api/rfps \
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

**Send RFP to Vendors:**

```bash
curl -X POST http://localhost:5000/api/rfps/1/send \
  -H "Content-Type: application/json" \
  -d '{
    "vendorIds": [1, 2, 3]
  }'
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

### Manual Testing Workflow

1. **Start Services**
   ```bash
   # Terminal 1: Database
   docker-compose up -d

   # Terminal 2: Backend
   cd backend && npm run dev

   # Terminal 3: Frontend
   cd frontend && npm start
   ```

2. **Create an RFP**
   - Go to http://localhost:3000
   - Click "Create RFP"
   - Enter: "I need 20 laptops with 16GB RAM and 10 monitors. Budget is $30,000. Delivery in 30 days. Net 30 payment terms and 2 year warranty."
   - Click "Parse with AI"
   - Review and save

3. **Manage Vendors**
   - Go to "Vendors" page
   - Note: 5 sample vendors are pre-loaded
   - Add a new vendor or use existing ones

4. **Send RFP**
   - Go to RFP detail page
   - Click "Send to Vendors"
   - Select 2-3 vendors
   - Click "Send"
   - Check backend console for email preview URLs (Ethereal)

5. **Receive Proposals**
   - Go to "Receive Proposal"
   - Select the RFP
   - Select a vendor
   - Click "Load Sample Email" or paste vendor response
   - Click "Parse Proposal"
   - Review parsed data

6. **Compare Proposals**
   - Create 2-3 proposals for the same RFP
   - Go to RFP detail page
   - Click "Compare Proposals"
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

## Support

For issues or questions:
- Check the troubleshooting section above
- Review backend console logs for detailed error messages
- Ensure all prerequisites are installed and configured correctly

## Acknowledgments

- OpenAI for GPT-4o-mini API
- PostgreSQL community
- React and Express.js communities
- All open-source contributors whose packages made this project possible

---

**Built with AI assistance using Claude Code and GitHub Copilot**

Last Updated: December 2025
