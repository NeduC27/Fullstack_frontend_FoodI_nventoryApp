import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, ShieldCheck, ShoppingBag, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        await register(name, email, password, role);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .auth-title { font-size: 1.75rem; }
        .auth-subtitle { font-size: 0.9rem; }
        .auth-card { padding: 2rem; }
        .auth-icon {
          width: 60px; height: 60px; border-radius: 16px;
          background: #0A1853;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 0 8px 24px rgba(255, 92, 53, 0.35);
        }

        @media (max-width: 480px) {
          .auth-title { font-size: 1.2rem; }
          .auth-subtitle { font-size: 0.75rem; }
          .auth-card { padding: 1.25rem; }
          .auth-icon { width: 44px; height: 44px; border-radius: 12px; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #431407 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="auth-icon">
              <Sparkles color="white" size={28} />
            </div>
            <h1 className="auth-title" style={{ color: 'white', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Cafeteria Inventory
            </h1>
            <p className="auth-subtitle" style={{ color: '#94a3b8', marginTop: '0.375rem' }}>
              Sign in to manage your cafeteria
            </p>
          </div>

          {/* Card */}
          <div className="auth-card" style={{
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
          }}>

            {/* Tab Switcher */}
            <div style={{
              display: 'flex', gap: '0.25rem',
              background: '#f1f5f9', borderRadius: '10px',
              padding: '0.25rem', marginBottom: '1.75rem',
            }}>
              {['login', 'register'].map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  style={{
                    flex: 1, padding: '0.625rem', border: 'none', borderRadius: '8px',
                    fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: tab === t ? 'white' : 'transparent',
                    color: tab === t ? '#0f172a' : '#64748b',
                    boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>

              {/* Role Selector (Register only) */}
              {tab === 'register' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Account Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { value: 'buyer', label: 'Buyer', icon: ShoppingBag, desc: 'Browse & purchase items' },
                      { value: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Manage inventory & logs' },
                    ].map(({ value, label, icon: Icon, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value)}
                        style={{
                          padding: '0.875rem', border: `2px solid ${role === value ? 'var(--primary-color)' : '#e2e8f0'}`,
                          borderRadius: '10px', background: role === value ? 'var(--primary-light)' : 'white',
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                        }}
                      >
                        <Icon size={18} color={role === value ? 'var(--primary-color)' : '#94a3b8'} />
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', marginTop: '0.375rem', color: role === value ? 'var(--primary-color)' : '#0f172a' }}>
                          {label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name Field (Register only) */}
              {tab === 'register' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Jane Kennedy"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                        border: '1px solid #e2e8f0', borderRadius: '10px',
                        outline: 'none', fontSize: '0.875rem',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                      border: '1px solid #e2e8f0', borderRadius: '10px',
                      outline: 'none', fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.5rem',
                      border: '1px solid #e2e8f0', borderRadius: '10px',
                      outline: 'none', fontSize: '0.875rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
                  padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem',
                }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '0.875rem',
                  background: loading ? '#fed7aa' : '#0A1853',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 92, 53, 0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Quick hint for demo */}
            {tab === 'login' && (
              <div style={{
                marginTop: '1.25rem', padding: '0.875rem',
                background: '#f8fafc', borderRadius: '10px',
                border: '1px dashed #e2e8f0',
              }}>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>
                  🔑 Default Admin Account
                </p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Email: <strong style={{ color: '#475569' }}>admin@cafeteria.com</strong>
                </p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Password: <strong style={{ color: '#475569' }}>admin123</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}