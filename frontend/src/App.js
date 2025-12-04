import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import CreateRFP from './pages/CreateRFP';
import RFPDetail from './pages/RFPDetail';
import VendorManagement from './pages/VendorManagement';
import ReceiveProposal from './pages/ReceiveProposal';
import ComparisonDashboard from './pages/ComparisonDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'white',
              color: '#1e293b',
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#059669',
                secondary: 'white',
              },
              style: {
                border: '2px solid #6ee7b7',
              },
            },
            error: {
              iconTheme: {
                primary: '#dc2626',
                secondary: 'white',
              },
              style: {
                border: '2px solid #fca5a5',
              },
            },
          }}
        />
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rfps/create" element={<CreateRFP />} />
          <Route path="/rfps/:id" element={<RFPDetail />} />
          <Route path="/rfps/:id/compare" element={<ComparisonDashboard />} />
          <Route path="/vendors" element={<VendorManagement />} />
          <Route path="/proposals/receive" element={<ReceiveProposal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
