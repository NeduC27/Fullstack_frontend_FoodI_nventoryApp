import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingBag, Plus, Minus, X } from 'lucide-react';

const API_BASE_URL = 'https://food-inventory-backend-code.onrender.com/api';

export default function BuyerPanel({ items, categories, fetchItems, fetchLogs, authFetch, currentUser, onNavigateBack, searchQuery = '' }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [purchaserName, setPurchaserName] = useState(currentUser?.name || '');
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [checkoutStatus, setCheckoutStatus] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/cart`);
        const data = await res.json();
        const mapped = data.items
          .filter(i => i.itemId)
          .map(i => ({ ...i.itemId, cartQty: i.quantity }));
        setCart(mapped);
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    };
    loadCart();
  }, []);

  const syncCart = async (updatedCart) => {
    try {
      await authFetch(`${API_BASE_URL}/cart`, {
        method: 'PUT',
        body: JSON.stringify({
          items: updatedCart.map(i => ({ itemId: i._id, quantity: i.cartQty }))
        }),
      });
    } catch (err) {
      console.error('Failed to sync cart:', err);
    }
  };

  useEffect(() => {
    if (checkoutStatus === 'success') {
      const timer = setTimeout(() => setCheckoutStatus(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [checkoutStatus]);

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory ? item.categoryId?._id === selectedCategory : true;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item) => {
    if (item.quantity <= 0) return;
    setCart(prevCart => {
      const existing = prevCart.find(i => i._id === item._id);
      const currentQty = existing ? existing.cartQty : 0;
      if (currentQty >= item.quantity) {
        alert(`Cannot add more. Only ${item.quantity} units are in stock.`);
        return prevCart;
      }
      let updatedCart;
      if (existing) {
        updatedCart = prevCart.map(i => i._id === item._id ? { ...i, cartQty: i.cartQty + 1 } : i);
      } else {
        updatedCart = [...prevCart, { ...item, cartQty: 1 }];
      }
      syncCart(updatedCart);
      return updatedCart;
    });
  };

  const updateCartQty = (itemId, delta, stockLimit) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(i => {
        if (i._id === itemId) {
          const nextQty = i.cartQty + delta;
          if (nextQty <= 0) return null;
          if (nextQty > stockLimit) {
            alert(`Cannot add more. Only ${stockLimit} units are in stock.`);
            return i;
          }
          return { ...i, cartQty: nextQty };
        }
        return i;
      }).filter(Boolean);
      syncCart(updatedCart);
      return updatedCart;
    });
  };

  const getCartTotal = () =>
    cart.reduce((sum, item) => sum + (item.salesPrice * item.cartQty), 0).toFixed(2);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!purchaserName.trim()) { alert("Please enter the purchaser's name."); return; }
    if (cart.length === 0) return;
    setCheckoutStatus('loading');
    setCheckoutError('');
    try {
      for (const item of cart) {
        const response = await authFetch(`${API_BASE_URL}/items/${item._id}/sell`, {
          method: 'POST',
          body: JSON.stringify({ purchaserName: purchaserName.trim(), quantity: item.cartQty })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Failed to purchase ${item.name}`);
        }
      }
      setCheckoutStatus('success');
      setCart([]);
      await authFetch(`${API_BASE_URL}/cart`, { method: 'DELETE' });
      setPurchaserName('');
      fetchItems();
      if (fetchLogs) fetchLogs();
    } catch (err) {
      setCheckoutStatus('error');
      setCheckoutError(err.message);
    }
  };

  return (
    <>
      <style>{`
        .bp-layout {
          display: flex;
          min-height: calc(100vh - 3.5625rem);
          background: none;
        }

        .bp-sidebar {
          width: 14rem;
          min-width: 14rem;
          padding: 1.5rem 1rem;
          border-right: 1px solid #e7e5e4;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .bp-back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #1e293b;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0.5rem 0;
          margin-bottom: 1rem;
        }

        .bp-back-btn:hover { opacity: 0.8; }

        .bp-cat-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0 0.5rem;
          margin-bottom: 0.25rem;
        }

        .bp-cat-item {
          padding: 0.625rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          color: #44403c;
          border: none;
          background: none;
          text-align: left;
          width: 100%;
          transition: all 0.15s;
        }

        .bp-cat-item:hover { background: #f5f5f4; }
        .bp-cat-item.active { background: var(--primary-color); color: white; }

        .bp-main {
          flex: 1;
          padding: 1.5rem 2rem;
          overflow-y: auto;
        }

        .bp-products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .bp-product-card {
          background: white;
          width: 100%;
          height: 17rem;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          transition: transform 0.2s;
          display: flex;
          flex-direction: column;
        }

        .bp-product-card:hover { transform: translateY(-2px); }

        .bp-cart-drawer {
          width: 22rem;
          min-width: 22rem;
          background: none;
          border-left: 1px solid #e7e5e4;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 3.5625rem);
          position: sticky;
          top: 3.5625rem;
        }

        @media (max-width: 1200px) {
          .bp-products-grid { grid-template-columns: repeat(2, 1fr); }
          .bp-cart-drawer { width: 18rem; min-width: 18rem; }
        }

        @media (max-width: 900px) {
          .bp-sidebar { width: 10rem; min-width: 10rem; }
          .bp-main { padding: 1rem; }
        }

        @media (max-width: 768px) {
          .bp-layout { flex-direction: column; }
          .bp-sidebar {
            width: 100%;
            flex-direction: row;
            flex-wrap: wrap;
            padding: 0.75rem 1rem;
            border-right: none;
            border-bottom: 1px solid #e7e5e4;
            gap: 0.5rem;
          }
          .bp-back-btn { margin-bottom: 0; }
          .bp-cat-label { display: none; }
          .bp-cat-item { width: auto; padding: 0.375rem 0.875rem; border-radius: 9999px; }
          .bp-cart-drawer {
            width: 100%;
            min-width: unset;
            height: auto;
            position: static;
            border-left: none;
            border-top: 1px solid #e7e5e4;
          }
          .bp-products-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 480px) {
          .bp-products-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="bp-layout">

        {/* Sidebar: Back button + Categories */}
        <div className="bp-sidebar">
          <button className="bp-back-btn" onClick={onNavigateBack}>
            <ChevronLeft size={16} /> Back
          </button>
          <div className="bp-cat-label">Categories</div>
          <button
            className={`bp-cat-item ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              className={`bp-cat-item ${selectedCategory === cat._id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="bp-main">
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', color: '#1c1917' }}>
            {selectedCategory ? categories.find(c => c._id === selectedCategory)?.name : 'All Items'}
          </h2>

          <div className="bp-products-grid">
            {filteredItems.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#a8a29e' }}>
                No items available in this category.
              </div>
            ) : (
              filteredItems.map(item => {
                const cartItem = cart.find(c => c._id === item._id);
                const availableStock = item.quantity - (cartItem ? cartItem.cartQty : 0);

                return (
                  <div
                    key={item._id}
                    className="bp-product-card"
                    onClick={() => setSelectedItemDetails(item)}
                  >
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'}
                      alt={item.name}
                      style={{ width: '100%', height: '10rem', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '0.55rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#78716c', marginBottom: '0.2rem' }}>
                        {item.categoryId?.name}
                      </span>
                      <h3 style={{ fontWeight: 700, fontSize: '0.80rem', color: '#1c1917', marginBottom: '0.2rem' }}>
                        {item.name}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '' }}
                        onClick={(e) => e.stopPropagation()}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-color)' }}>
                          ₦{item.salesPrice.toFixed(2)}
                        </span>
                        {item.quantity === 0 ? (
                          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Out of stock</span>
                        ) : availableStock <= 0 ? (
                          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Max in cart</span>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.4rem 0.875rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Plus size={12} /> Add
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#e54d27', fontWeight: 600, marginTop: '0.375rem' }}>
                        Stock: {item.quantity} units
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* Cart Drawer */}
        <aside className="bp-cart-drawer">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} /> Your Order
            </h2>
            {cart.length > 0 && (
              <button onClick={() => { setCart([]); syncCart([]); }}
                style={{ background: 'none', border: 'none', color: '#e54d27', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                Clear
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cart.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a8a29e', gap: '0.5rem' }}>
                <ShoppingBag size={40} strokeWidth={1} />
                <p style={{ fontSize: '0.875rem' }}>Your order is empty</p>
                <p style={{ fontSize: '0.75rem', textAlign: 'center' }}>Click "+" on items to add them</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderBottom: '1px solid #f5f5f4', paddingBottom: '0.75rem' }}>
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=80'}
                    alt={item.name}
                    style={{ width: '3rem', height: '3rem', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{item.name}</div>
                    <div style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.8rem' }}>
                      ₦{(item.salesPrice * item.cartQty).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button onClick={() => updateCartQty(item._id, -1, item.quantity)}
                      style={{ width: '1.5rem', height: '1.5rem', borderRadius: '4px', border: '1px solid #e7e5e4', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Minus size={10} />
                    </button>
                    <span style={{ fontWeight: 600, minWidth: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{item.cartQty}</span>
                    <button onClick={() => updateCartQty(item._id, 1, item.quantity)}
                      style={{ width: '1.5rem', height: '1.5rem', borderRadius: '4px', border: '1px solid #e7e5e4', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: '#57534e' }}>Total:</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>₦{getCartTotal()}</span>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716c', display: 'block', marginBottom: '0.375rem' }}>
                  PURCHASER NAME
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={purchaserName}
                  onChange={(e) => setPurchaserName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #e7e5e4', outline: 'none', fontSize: '0.875rem' }}
                />
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutStatus === 'loading'}
                style={{ width: '100%', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.875rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                {checkoutStatus === 'loading' ? 'Processing...' : 'Place Order'}
              </button>
              {checkoutStatus === 'error' && (
                <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>{checkoutError}</p>
              )}
              {checkoutStatus === 'success' && (
                <p style={{ color: 'green', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center', fontWeight: 600 }}>✓ Order placed successfully!</p>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Product Detail Modal */}
      {selectedItemDetails && (
        <div className="modal-overlay" onClick={() => setSelectedItemDetails(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Product Details</h3>
              <button className="modal-close-btn" onClick={() => setSelectedItemDetails(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <img
                src={selectedItemDetails.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500'}
                alt={selectedItemDetails.name}
                style={{ width: '50%', height: '7.5rem', objectFit: 'cover', borderRadius: '12px' }}
              />
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedItemDetails.name}</h2>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>SKU: {selectedItemDetails.sku}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>Sales Price</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                    ₦{selectedItemDetails.salesPrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>Stock</span>
                  <p style={{ fontSize: '1.15rem', fontWeight: 700 }}>{selectedItemDetails.quantity} units</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedItemDetails(null)}>Close</button>
              {selectedItemDetails.quantity > 0 && (
                <button className="admin-action-btn" onClick={() => { addToCart(selectedItemDetails); setSelectedItemDetails(null); }}>
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}