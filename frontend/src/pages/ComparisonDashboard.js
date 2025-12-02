import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';

const ComparisonDashboard = () => {
  const { id } = useParams();
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComparison();
  }, [id]);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/comparison/rfp/${id}`);
      setComparison(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  const getScoreForVendor = (vendorId) => {
    return comparison.comparison.scores.find(s => s.vendor_id === vendorId);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#f59e0b';
    return '#dc2626';
  };

  const ScoreBar = ({ score, label }) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
        <span>{label}</span>
        <span style={{ fontWeight: '600', color: getScoreColor(score) }}>{score}/100</span>
      </div>
      <div className="score-bar">
        <div className="score-fill" style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="container">
        <div className="alert alert-error">{error || 'Comparison not available'}</div>
        <Link to={`/rfps/${id}`} className="btn btn-secondary">Back to RFP</Link>
      </div>
    );
  }

  const recommendedVendor = comparison.proposals.find(
    p => p.vendor_id === comparison.comparison.recommendation.vendor_id
  );

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <Link to={`/rfps/${id}`} className="btn btn-secondary">
          ← Back to RFP
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Proposal Comparison: {comparison.rfp.title}</h2>
          <div style={{ marginTop: '8px', color: '#6b7280', fontSize: '14px' }}>
            Budget: ${parseFloat(comparison.rfp.budget).toLocaleString()} |
            Deadline: {new Date(comparison.rfp.deadline).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="ai-insight">
        <h3>AI Recommendation</h3>
        <p style={{ marginBottom: '12px', fontSize: '16px' }}>
          <strong>Recommended Vendor:</strong> {recommendedVendor?.vendor_name || 'N/A'}
        </p>
        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
          {comparison.comparison.recommendation.reasoning}
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Comparison Summary</h3>
        </div>
        <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
          {comparison.comparison.comparison_summary}
        </p>
      </div>

      <div className="comparison-grid">
        {comparison.proposals.map((proposal) => {
          const scores = getScoreForVendor(proposal.vendor_id);
          const risks = comparison.comparison.risks.find(r => r.vendor_id === proposal.vendor_id);
          const isRecommended = proposal.vendor_id === comparison.comparison.recommendation.vendor_id;

          return (
            <div key={proposal.id} className="card" style={{
              border: isRecommended ? '2px solid #059669' : '1px solid #e5e7eb',
              position: 'relative'
            }}>
              {isRecommended && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '20px',
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  RECOMMENDED
                </div>
              )}

              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                {proposal.vendor_name}
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                  ${parseFloat(proposal.total_price).toLocaleString()}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Price</div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Delivery:</strong> {proposal.delivery_timeline}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Payment:</strong> {proposal.payment_terms_offered}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Warranty:</strong> {proposal.warranty_offered}
                </div>
              </div>

              {scores && (
                <>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', marginTop: '20px' }}>
                    AI Scoring
                  </h4>
                  <ScoreBar score={scores.overall_score} label="Overall Score" />
                  <ScoreBar score={scores.price_score} label="Price" />
                  <ScoreBar score={scores.terms_score} label="Terms" />
                  <ScoreBar score={scores.completeness_score} label="Completeness" />
                  <ScoreBar score={scores.delivery_score} label="Delivery" />
                </>
              )}

              {risks && risks.concerns && risks.concerns.length > 0 && (
                <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>
                    Considerations
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e', fontSize: '13px' }}>
                    {risks.concerns.map((concern, index) => (
                      <li key={index}>{concern}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginTop: '20px' }}>
                <span className={`badge badge-${proposal.status}`}>{proposal.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonDashboard;
