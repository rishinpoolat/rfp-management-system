import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
