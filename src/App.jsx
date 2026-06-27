import React, { useState, useEffect } from 'react';
import { Search, LogOut, User, Menu, X } from 'lucide-react';
import { BrowserRouter, Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import BuyerPanelLandingPage from './components/BuyerPanelLandingPage';
import BuyerPanel from './components/BuyerPanel';
import AdminPanel from './components/AdminPanel';
import Logo from './assets/Logo.png';
import AppFooter from './components/AppFooter';

const API_BASE_URL = 'https://food-inventory-backend-code.onrender.com/api';

function AuthenticatedApp() {
  const { user, logout, authFetch } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePanel, setActivePanel] = useState(() => {
    const saved = sessionStorage.getItem('activePanel');
    if (saved) return saved;
    return user?.role === 'admin' ? 'admin' : 'buyer-landing';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigateTo = (panel) => {
    sessionStorage.setItem('activePanel', panel);
    setActivePanel(panel);
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/items`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/logs`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchItems(),
      fetchCategories(),
      user?.role === 'admin' ? fetchLogs() : Promise.resolve(),
    ]);
    setLoading(false);
  };

  useEffect(() => { loadAllData(); }, []);

  const showTopSearch = activePanel === 'buyer' || activePanel === 'admin';

  const handleLogout = () => {
    sessionStorage.removeItem('activePanel');
    setMenuOpen(false);
    logout();
  };

  return (
    <div className="app-container">
      <style>{`
        .nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1.5rem;
          height: 3.5625rem;
          position: relative;
          z-index: 100;
        }

        .nav-logo img {
          height: 1.25rem;
          transition: height 0.2s;
        }

        .nav-search {
          flex: 1;
          margin: 0 1.5rem;
          position: relative;
          max-width: 30rem;
        }

        .nav-search input {
          width: 100%;
          padding: 0.5rem 1rem 0.5rem 2.25rem;
          border-radius: 9999px;
          border: 1px solid #e7e5e4;
          outline: none;
          font-size: 0.875rem;
          background: white;
        }

        .nav-search .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #a8a29e;
          pointer-events: none;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .nav-avatar {
          width: 1.875rem;
          height: 1.875rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-username {
          color: #0A1853;
          font-weight: 600;
          line-height: 1.2;
        }

        .nav-logout-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: #7d0610;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8rem;
          font-weight: 700;
          transition: background 0.2s;
        }

        .nav-logout-btn:hover { background: rgba(239,68,68,0.15); }

        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          color: #0A1853;
        }

        /* Mobile drawer */
        .mobile-drawer-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 200;
        }

        .mobile-drawer {
          position: absolute;
          top: 0;
          right: 0;
          width: 16rem;
          height: 100vh;
          background: white;
          padding: 1.5rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: -4px 0 20px rgba(0,0,0,0.1);
        }

        .mobile-drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mobile-drawer-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
        }

        .mobile-drawer-logout {
          width: 100%;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          margin-top: auto;
        }

        @media (max-width: 768px) {
          .nav-bar { padding: 0 1rem; }
          .nav-logo img { height: 1rem; }
          .nav-right { display: none; }
          .hamburger-btn { display: flex; }
          .nav-search { margin: 0 0.75rem; }
          .mobile-drawer-overlay { display: flex; justify-content: flex-end; }
        }

        @media (max-width: 480px) {
          .nav-logo img { height: 0.875rem; }
          .nav-search { margin: 0 0.5rem; }
        }
      `}</style>

      {/* Nav Bar */}
      <div className="nav-bar">
        <div className="nav-logo">
          <img src={Logo} alt="IPSUM" />
        </div>

        {showTopSearch && (
          <div className="nav-search">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search in Snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Desktop right side */}
        <div className="nav-right">
          <div className="nav-user">
            <div
              className="nav-avatar"
              style={{ background: user?.role === 'admin' ? '#0A1853' : 'linear-gradient(135deg, #2E3A6E)' }}
            >
              <User size={14} color="white" />
            </div>
            <span className="nav-username">{user?.name}</span>
          </div>
          <button className="nav-logout-btn" onClick={handleLogout}>
            <LogOut size={14} style={{ color: '#0A1853' }} /> Sign out
          </button>
        </div>

        {/* Hamburger — mobile only */}
        <button className="hamburger-btn" onClick={() => setMenuOpen(true)}>
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0A1853' }}>Menu</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-user">
              <div
                style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                  background: user?.role === 'admin' ? 'linear-gradient(135deg, #ff5c35, #e54d27)' : 'linear-gradient(135deg, #2E3A6E)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <User size={16} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0A1853' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
            </div>

            <button className="mobile-drawer-logout" onClick={handleLogout}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: 'calc(100vh - 57px)', color: '#666' }}>
          <h3>Loading IPSUM Inventory...</h3>
        </div>
      ) : activePanel === 'buyer-landing' ? (
        <BuyerPanelLandingPage
          items={items}
          categories={categories}
          fetchItems={fetchItems}
          fetchLogs={user?.role === 'admin' ? fetchLogs : undefined}
          authFetch={authFetch}
          currentUser={user}
          onNavigateToBuyer={() => navigateTo('buyer')}
        />
      ) : activePanel === 'buyer' ? (
        <BuyerPanel
          items={items}
          categories={categories}
          fetchItems={fetchItems}
          fetchLogs={user?.role === 'admin' ? fetchLogs : undefined}
          authFetch={authFetch}
          currentUser={user}
          onNavigateBack={() => navigateTo('buyer-landing')}
          searchQuery={searchQuery}
        />
      ) : (
        <AdminPanel
          items={items}
          categories={categories}
          logs={logs}
          fetchItems={fetchItems}
          fetchCategories={fetchCategories}
          fetchLogs={fetchLogs}
          authFetch={authFetch}
        />
      )}
      <AppFooter style={{ marginTop: '10rem' }} />
    </div>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <div style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading...</div>
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <AuthPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}