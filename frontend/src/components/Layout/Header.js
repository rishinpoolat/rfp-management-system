import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header style={styles.header}>
      <div className="container" style={styles.container}>
        <Link to="/" style={styles.logo}>
          <h1 style={styles.logoText}>RFP Management System</h1>
        </Link>
        <nav style={styles.nav}>
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            Dashboard
          </Link>
          <Link to="/rfps/create" className={`nav-link ${isActive('/rfps/create')}`}>
            Create RFP
          </Link>
          <Link to="/vendors" className={`nav-link ${isActive('/vendors')}`}>
            Vendors
          </Link>
          <Link to="/proposals/receive" className={`nav-link ${isActive('/proposals/receive')}`}>
            Receive Proposal
          </Link>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '32px',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
  },
  logo: {
    textDecoration: 'none',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  nav: {
    display: 'flex',
    gap: '8px',
  },
};

export default Header;
