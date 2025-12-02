import React from 'react';
import { Link, useLocation } from 'react-router-dom';

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
          <Link to="/" style={{...styles.navLink, ...(isActive('/') && styles.navLinkActive)}}>
            Dashboard
          </Link>
          <Link to="/rfps/create" style={{...styles.navLink, ...(isActive('/rfps/create') && styles.navLinkActive)}}>
            Create RFP
          </Link>
          <Link to="/vendors" style={{...styles.navLink, ...(isActive('/vendors') && styles.navLinkActive)}}>
            Vendors
          </Link>
          <Link to="/proposals/receive" style={{...styles.navLink, ...(isActive('/proposals/receive') && styles.navLinkActive)}}>
            Receive Proposal
          </Link>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
  },
  logo: {
    textDecoration: 'none',
    color: 'white',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
  },
  nav: {
    display: 'flex',
    gap: '24px',
  },
  navLink: {
    color: '#d1d5db',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    color: 'white',
    backgroundColor: '#374151',
  },
};

export default Header;
