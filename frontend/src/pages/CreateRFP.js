import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const CreateRFP = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = input, 2 = review/edit, 3 = saved
  const [naturalInput, setNaturalInput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleParse = async (e) => {
    e.preventDefault();
    if (!naturalInput.trim()) {
      setError('Please enter RFP details');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/rfps/parse', { input: naturalInput });
      setParsedData(response.data.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse RFP');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/rfps', parsedData);
      setSuccess('RFP created successfully!');
      setTimeout(() => {
        navigate(`/rfps/${response.data.data.id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create RFP');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateParsedData = (field, value) => {
    setParsedData({ ...parsedData, [field]: value });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...parsedData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setParsedData({ ...parsedData, items: newItems });
  };

  const addItem = () => {
    setParsedData({
      ...parsedData,
      items: [...parsedData.items, { item_type: '', quantity: 1, specifications: '' }]
    });
  };

  const removeItem = (index) => {
    const newItems = parsedData.items.filter((_, i) => i !== index);
    setParsedData({ ...parsedData, items: newItems });
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Create New RFP</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
            Describe your procurement needs in natural language, and our AI will structure it for you
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleParse}>
            <div className="form-group">
              <label className="form-label">Describe Your RFP Requirements</label>
              <textarea
                className="form-textarea"
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                placeholder="Example: I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
                rows={10}
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Parsing with AI...' : 'Parse with AI'}
            </button>
          </form>
        )}

        {step === 2 && parsedData && (
          <form onSubmit={handleSave}>
            <div className="alert alert-info">
              AI has parsed your input. Please review and edit if needed before saving.
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                value={parsedData.title || ''}
                onChange={(e) => updateParsedData('title', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={parsedData.description || ''}
                onChange={(e) => updateParsedData('description', e.target.value)}
                rows={4}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Budget</label>
                <input
                  type="number"
                  className="form-input"
                  value={parsedData.budget || ''}
                  onChange={(e) => updateParsedData('budget', e.target.value)}
                  placeholder="50000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={parsedData.deadline || ''}
                  onChange={(e) => updateParsedData('deadline', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Payment Terms</label>
                <input
                  type="text"
                  className="form-input"
                  value={parsedData.payment_terms || ''}
                  onChange={(e) => updateParsedData('payment_terms', e.target.value)}
                  placeholder="Net 30"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warranty Requirement</label>
                <input
                  type="text"
                  className="form-input"
                  value={parsedData.warranty_requirement || ''}
                  onChange={(e) => updateParsedData('warranty_requirement', e.target.value)}
                  placeholder="1 year"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Items *</label>
              {parsedData.items && parsedData.items.map((item, index) => (
                <div key={index} style={{ border: '1px solid #e5e7eb', padding: '16px', borderRadius: '6px', marginBottom: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={item.item_type || ''}
                      onChange={(e) => updateItem(index, 'item_type', e.target.value)}
                      placeholder="Item type (e.g., Laptop)"
                      required
                    />
                    <input
                      type="number"
                      className="form-input"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      placeholder="Quantity"
                      required
                    />
                  </div>
                  <textarea
                    className="form-input"
                    value={item.specifications || ''}
                    onChange={(e) => updateItem(index, 'specifications', e.target.value)}
                    placeholder="Specifications"
                    rows={2}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="btn btn-danger"
                    style={{ marginTop: '8px', padding: '6px 12px', fontSize: '12px' }}
                  >
                    Remove Item
                  </button>
                </div>
              ))}
              <button type="button" onClick={addItem} className="btn btn-secondary">
                + Add Item
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" disabled={loading}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save RFP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateRFP;
