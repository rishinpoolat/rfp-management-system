import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../api/client';

const ReceiveProposal = () => {
  const navigate = useNavigate();
  const [rfps, setRfps] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    rfp_id: '',
    vendor_id: '',
    email_content: ''
  });
  const [parsedProposal, setParsedProposal] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rfpsRes, vendorsRes] = await Promise.all([
        apiClient.get('/rfps'),
        apiClient.get('/vendors')
      ]);
      setRfps(rfpsRes.data.data);
      setVendors(vendorsRes.data.data);
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rfp_id || !formData.vendor_id || !formData.email_content) {
      toast.error('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/proposals/receive', formData);
      setParsedProposal(response.data.data);
      toast.success('Proposal parsed and saved successfully!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to parse proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      rfp_id: '',
      vendor_id: '',
      email_content: ''
    });
    setParsedProposal(null);
    setStep(1);
  };

  const sampleEmail = `Dear Procurement Team,

Thank you for the opportunity to submit a proposal for your laptop and monitor requirements.

Here is our proposal:

Laptops (Dell XPS 15, 16GB RAM):
- Quantity: 20 units
- Unit Price: $1,200
- Total: $24,000

Monitors (Dell 27" 4K):
- Quantity: 15 units
- Unit Price: $400
- Total: $6,000

Total Proposal Amount: $30,000

Delivery Timeline: We can deliver all items within 20 business days from order confirmation.

Payment Terms: Net 30 days from delivery

Warranty: We provide a comprehensive 2-year warranty on all hardware, including on-site service.

All items are brand new with manufacturer's warranty. We also provide free shipping and installation support.

Looking forward to working with you.

Best regards,
Sales Team
TechSupply Co.`;

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Receive Vendor Proposal</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
            Paste vendor's email response and AI will extract pricing and terms
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select RFP *</label>
              <select
                className="form-select"
                value={formData.rfp_id}
                onChange={(e) => setFormData({ ...formData, rfp_id: e.target.value })}
                required
              >
                <option value="">Choose an RFP...</option>
                {rfps.map((rfp) => (
                  <option key={rfp.id} value={rfp.id}>
                    {rfp.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Vendor *</label>
              <select
                className="form-select"
                value={formData.vendor_id}
                onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                required
              >
                <option value="">Choose a vendor...</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Vendor Email Response *</label>
              <textarea
                className="form-textarea"
                value={formData.email_content}
                onChange={(e) => setFormData({ ...formData, email_content: e.target.value })}
                placeholder="Paste the vendor's email response here..."
                rows={15}
                required
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, email_content: sampleEmail })}
                className="btn btn-secondary"
                style={{ marginTop: '8px', padding: '6px 12px', fontSize: '12px' }}
              >
                Load Sample Email
              </button>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Parsing with AI...' : 'Parse Proposal'}
            </button>
          </form>
        )}

        {step === 2 && parsedProposal && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Parsed Proposal Details
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Vendor:</strong> {parsedProposal.vendor_name}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Total Price:</strong> ${parseFloat(parsedProposal.total_price).toLocaleString()}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Delivery Timeline:</strong> {parsedProposal.delivery_timeline || 'N/A'}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Payment Terms:</strong> {parsedProposal.payment_terms_offered || 'N/A'}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Warranty:</strong> {parsedProposal.warranty_offered || 'N/A'}
              </div>
            </div>

            {parsedProposal.line_items && parsedProposal.line_items.length > 0 && (
              <>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Line Items
                </h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Unit Price</th>
                      <th>Total Price</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedProposal.line_items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.item_type || 'N/A'}</td>
                        <td>${item.unit_price ? parseFloat(item.unit_price).toLocaleString() : 'N/A'}</td>
                        <td>${item.total_price ? parseFloat(item.total_price).toLocaleString() : 'N/A'}</td>
                        <td>{item.notes || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={handleReset} className="btn btn-primary">
                Receive Another Proposal
              </button>
              <button
                onClick={() => navigate(`/rfps/${formData.rfp_id}`)}
                className="btn btn-secondary"
              >
                View RFP Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiveProposal;
