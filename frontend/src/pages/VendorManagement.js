import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

const VendorForm = ({ vendor, onSave, onCancel }) => {
  const [formData, setFormData] = useState(vendor || {
    name: '',
    email: '',
    contact_person: '',
    phone: '',
    address: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <div className="form-group">
        <label className="form-label">Company Name *</label>
        <input
          type="text"
          className="form-input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email *</label>
        <input
          type="email"
          className="form-input"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Contact Person</label>
        <input
          type="text"
          className="form-input"
          value={formData.contact_person}
          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Phone</label>
        <input
          type="tel"
          className="form-input"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Address</label>
        <textarea
          className="form-input"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="submit" className="btn btn-primary">
          {vendor ? 'Update Vendor' : 'Add Vendor'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/vendors');
      setVendors(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (vendorData) => {
    try {
      if (editingVendor) {
        await apiClient.put(`/vendors/${editingVendor.id}`, vendorData);
        setSuccess('Vendor updated successfully');
      } else {
        await apiClient.post('/vendors', vendorData);
        setSuccess('Vendor added successfully');
      }
      setShowForm(false);
      setEditingVendor(null);
      fetchVendors();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save vendor');
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      await apiClient.delete(`/vendors/${id}`);
      setSuccess('Vendor deleted successfully');
      fetchVendors();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete vendor');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVendor(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">Vendor Management</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              + Add Vendor
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {showForm && (
          <VendorForm
            vendor={editingVendor}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {!showForm && (
          <>
            {vendors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <p>No vendors found. Add your first vendor to get started!</p>
              </div>
            ) : (
              <div className="grid">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="card" style={{ marginBottom: 0 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                      {vendor.name}
                    </h3>
                    <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Email:</strong> {vendor.email}
                      </div>
                      {vendor.contact_person && (
                        <div style={{ marginBottom: '4px' }}>
                          <strong>Contact:</strong> {vendor.contact_person}
                        </div>
                      )}
                      {vendor.phone && (
                        <div style={{ marginBottom: '4px' }}>
                          <strong>Phone:</strong> {vendor.phone}
                        </div>
                      )}
                      {vendor.address && (
                        <div style={{ marginBottom: '4px' }}>
                          <strong>Address:</strong> {vendor.address}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VendorManagement;
