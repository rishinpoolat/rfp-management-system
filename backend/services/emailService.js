import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter = null;

const initializeTransporter = async () => {
  try {
    if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      // Use Ethereal for testing if credentials not provided
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Using Ethereal Email for testing');
      console.log('Ethereal credentials:', testAccount.user, testAccount.pass);
    } else {
      // Use provided SMTP credentials
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('Using configured SMTP server');
    }

    // Verify connection
    await transporter.verify();
    console.log('Email transporter is ready');
  } catch (error) {
    console.error('Error initializing email transporter:', error);
  }
};

// Initialize transporter on module load
initializeTransporter();

export const sendRFPEmail = async (vendor, rfpData) => {
  try {
    // Format RFP items for email
    const itemsList = rfpData.items.map((item, index) =>
      `${index + 1}. ${item.item_type} - Quantity: ${item.quantity}
   Specifications: ${item.specifications || 'N/A'}`
    ).join('\n\n');

    const emailBody = `
Dear ${vendor.contact_person || vendor.name},

We are pleased to invite you to submit a proposal for the following Request for Proposal (RFP):

RFP TITLE: ${rfpData.title}

DESCRIPTION:
${rfpData.description || 'N/A'}

ITEMS REQUESTED:
${itemsList}

BUDGET: ${rfpData.budget ? `$${parseFloat(rfpData.budget).toLocaleString()}` : 'N/A'}
DEADLINE: ${rfpData.deadline || 'N/A'}
PAYMENT TERMS: ${rfpData.payment_terms || 'N/A'}
WARRANTY REQUIREMENT: ${rfpData.warranty_requirement || 'N/A'}

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
    `.trim();

    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@rfpmanagement.com',
      to: vendor.email,
      subject: `RFP: ${rfpData.title} - Response Requested by ${rfpData.deadline || 'TBD'}`,
      text: emailBody,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);

    // For Ethereal, log the preview URL
    if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.SMTP_USER) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const sendBulkRFPEmails = async (vendors, rfpData) => {
  const results = [];

  for (const vendor of vendors) {
    try {
      const result = await sendRFPEmail(vendor, rfpData);
      results.push({
        vendor_id: vendor.id,
        vendor_email: vendor.email,
        success: true,
        messageId: result.messageId,
        previewUrl: result.previewUrl,
      });
    } catch (error) {
      results.push({
        vendor_id: vendor.id,
        vendor_email: vendor.email,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};
