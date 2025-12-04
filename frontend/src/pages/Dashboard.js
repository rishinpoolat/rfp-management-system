import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../api/client';

const Dashboard = () => {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRFPs();
  }, []);

  const fetchRFPs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/rfps');
      setRfps(response.data.data);
    } catch (err) {
      toast.error('Failed to load RFPs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const className = `badge badge-${status}`;
    return <span className={className}>{status}</span>;
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
          <h2 className="card-title">All RFPs</h2>
          <Link to="/rfps/create" className="btn btn-primary">
            + Create New RFP
          </Link>
        </div>

        {rfps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p>No RFPs found. Create your first RFP to get started!</p>
            <Link to="/rfps/create" className="btn btn-primary" style={{ marginTop: '20px' }}>
              Create RFP
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Budget</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rfps.map((rfp) => (
                <tr key={rfp.id}>
                  <td>
                    <Link to={`/rfps/${rfp.id}`} style={{ color: '#4f46e5', fontWeight: '500', textDecoration: 'none' }}>
                      {rfp.title}
                    </Link>
                  </td>
                  <td>{rfp.budget ? `$${parseFloat(rfp.budget).toLocaleString()}` : 'N/A'}</td>
                  <td>{rfp.deadline ? new Date(rfp.deadline).toLocaleDateString() : 'N/A'}</td>
                  <td>{getStatusBadge(rfp.status)}</td>
                  <td>{new Date(rfp.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/rfps/${rfp.id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
