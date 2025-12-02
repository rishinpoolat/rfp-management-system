import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';

const VendorModal = ({ isOpen, onClose, rfpId, onSent }) => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchVendors();
    }
  }, [isOpen]);

  const fetchVendors = async () => {
    try {
      const response = await apiClient.get('/vendors');
      setVendors(response.data.data);
    } catch (err) {
      setError('Failed to load vendors');
    }
  };

  const toggleVendor = (vendorId) => {
    if (selectedVendors.includes(vendorId)) {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    } else {
      setSelectedVendors([...selectedVendors, vendorId]);
    }
  };

  const handleSend = async () => {
    if (selectedVendors.length === 0) {
      setError('Please select at least one vendor');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await apiClient.post(`/rfps/${rfpId}/send`, { vendorIds: selectedVendors });
      onSent();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send RFP');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Select Vendors</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {vendors.map((vendor) => (
            <label key={vendor.id} className="checkbox">
              <input
                type="checkbox"
                checked={selectedVendors.includes(vendor.id)}
                onChange={() => toggleVendor(vendor.id)}
              />
              <div>
                <div style={{ fontWeight: '500' }}>{vendor.name}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{vendor.email}</div>
              </div>
            </label>
          ))}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button onClick={handleSend} className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : `Send to ${selectedVendors.length} vendor(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

const RFPDetail = () => {
  const { id } = useParams();
  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);

  useEffect(() => {
    fetchRFP();
    fetchProposals();
  }, [id]);

  const fetchRFP = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/rfps/${id}`);
      setRfp(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load RFP');
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const response = await apiClient.get(`/proposals/rfp/${id}`);
      setProposals(response.data.data);
    } catch (err) {
      console.error('Failed to load proposals');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !rfp) {
    return (
      <div className="container">
        <div className="alert alert-error">{error || 'RFP not found'}</div>
        <Link to="/" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card-title">{rfp.title}</h2>
            <span className={`badge badge-${rfp.status}`} style={{ marginTop: '8px' }}>{rfp.status}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowVendorModal(true)} className="btn btn-primary">
              Send to Vendors
            </button>
            {proposals.length > 0 && (
              <Link to={`/rfps/${id}/compare`} className="btn btn-success">
                Compare Proposals ({proposals.length})
              </Link>
            )}
          </div>
        </div>

        {rfp.description && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Description</h3>
            <p style={{ color: '#4b5563' }}>{rfp.description}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <strong>Budget:</strong> {rfp.budget ? `$${parseFloat(rfp.budget).toLocaleString()}` : 'N/A'}
          </div>
          <div>
            <strong>Deadline:</strong> {rfp.deadline ? new Date(rfp.deadline).toLocaleDateString() : 'N/A'}
          </div>
          <div>
            <strong>Payment Terms:</strong> {rfp.payment_terms || 'N/A'}
          </div>
          <div>
            <strong>Warranty:</strong> {rfp.warranty_requirement || 'N/A'}
          </div>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Items</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Item Type</th>
              <th>Quantity</th>
              <th>Specifications</th>
            </tr>
          </thead>
          <tbody>
            {rfp.items && rfp.items.map((item) => (
              <tr key={item.id}>
                <td>{item.item_type}</td>
                <td>{item.quantity}</td>
                <td>{item.specifications || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {proposals.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Received Proposals ({proposals.length})</h3>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Total Price</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>AI Score</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.id}>
                  <td>{proposal.vendor_name}</td>
                  <td>${parseFloat(proposal.total_price).toLocaleString()}</td>
                  <td>{proposal.delivery_timeline}</td>
                  <td><span className={`badge badge-${proposal.status}`}>{proposal.status}</span></td>
                  <td>{proposal.ai_score ? `${proposal.ai_score}/100` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VendorModal
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        rfpId={id}
        onSent={() => {
          alert('RFP sent successfully!');
        }}
      />
    </div>
  );
};

export default RFPDetail;
