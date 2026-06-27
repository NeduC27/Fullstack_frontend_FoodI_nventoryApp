import React, { useState, useEffect } from 'react';

import { ShoppingBag, Plus, Minus, Search, X } from 'lucide-react';
const API_BASE_URL = 'https://food-inventory-backend-code.onrender.com/api';

export default function BuyerPanelLandingPage({ items, categories, fetchItems, fetchLogs, authFetch, currentUser, onNavigateToBuyer }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [purchaserName, setPurchaserName] = useState(currentUser?.name || '');
    const [selectedItemDetails, setSelectedItemDetails] = useState(null);
    const [checkoutStatus, setCheckoutStatus] = useState(null);
    const [checkoutError, setCheckoutError] = useState('');
    const [showCart, setShowCart] = useState(false);

    useEffect(() => {
        if (checkoutStatus === 'success') {
            const timer = setTimeout(() => setCheckoutStatus(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [checkoutStatus]);

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

    const cartItemCount = cart.reduce((sum, i) => sum + i.cartQty, 0);

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
            setShowCart(false);
            fetchItems();
            if (fetchLogs) fetchLogs();
        } catch (err) {
            setCheckoutStatus('error');
            setCheckoutError(err.message);
        }
    };

    const CartContent = () => (
        <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-color)', textAlign: 'center', marginBottom: '1.25rem' }}>
                Your Order
            </h2>

            {cart.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#a8a29e', gap: '0.5rem', padding: '2rem 0' }}>
                    <ShoppingBag size={40} strokeWidth={1} />
                    <p style={{ fontSize: '0.875rem' }}>Your order is empty</p>
                    <p style={{ fontSize: '0.75rem', textAlign: 'center' }}>Click on items to add them</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {cart.map(item => (
                        <div key={item._id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                <span style={{ fontSize: '0.875rem', color: '#444' }}>
                                    <span style={{ fontWeight: 700 }}>{item.cartQty}x</span> {item.name}
                                </span>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                    ₦{(item.salesPrice * item.cartQty).toFixed(0)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button onClick={() => updateCartQty(item._id, -1, item.quantity)}
                                        style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #e0e0e0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Minus size={10} />
                                    </button>
                                    <span style={{ fontWeight: 600, minWidth: '16px', textAlign: 'center', fontSize: '0.875rem' }}>
                                        {item.cartQty}
                                    </span>
                                    <button onClick={() => updateCartQty(item._id, 1, item.quantity)}
                                        style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #e0e0e0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Plus size={10} />
                                    </button>
                                </div>
                                <button onClick={() => setSelectedItemDetails(item)}
                                    style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {cart.length > 0 && (
                <div>
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
                        style={{
                            width: '100%', background: 'var(--primary-color)', color: 'white',
                            border: 'none', borderRadius: '12px', padding: '1rem',
                            fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
                        }}
                    >
                        {checkoutStatus === 'loading' ? 'Processing...' : `Add ${cartItemCount} for ₦${getCartTotal()}`}
                    </button>
                    {checkoutStatus === 'error' && (
                        <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>{checkoutError}</p>
                    )}
                    {checkoutStatus === 'success' && (
                        <p style={{ color: 'green', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center', fontWeight: 600 }}>✓ Order placed successfully!</p>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <>
            <style>{`
                .buyer-page { min-height: calc(100vh - 57px); background-color: #f5f5f5; }

                .buyer-hero {
                    background: var(--primary-color);
                    border-radius: 20px;
                    padding: 2.5rem 2rem;
                    margin: 1.5rem 3rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.25rem;
                    position: relative;
                    overflow: hidden;
                    text-align: center;
                }

                .buyer-grid {
                    display: grid;
                    grid-template-columns: 1fr 360px;
                    gap: 2.5rem;
                    padding: 0 3rem 3rem 3rem;
                    align-items: start;
                }

                .products-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2.5rem;
                }

                .cart-float-btn {
                    display: none;
                    position: fixed;
                    bottom: 1.5rem;
                    right: 1.5rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 9999px;
                    padding: 0.875rem 1.5rem;
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    z-index: 200;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    align-items: center;
                    gap: 0.5rem;
                }

                .cart-mobile-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 300;
                    align-items: flex-end;
                }

                .cart-mobile-sheet {
                    background: white;
                    border-radius: 20px 20px 0 0;
                    padding: 1.5rem;
                    width: 100%;
                    max-height: 85vh;
                    overflow-y: auto;
                }

                @media (max-width: 1024px) {
                    .buyer-hero { margin: 1.5rem 2rem; }
                    .buyer-grid { padding: 0 2rem 3rem 2rem; gap: 2rem; }
                }

                @media (max-width: 768px) {
                    .buyer-hero { margin: 1rem; padding: 2rem 1.25rem; }
                    .buyer-grid {
                        grid-template-columns: 1fr;
                        padding: 0 1rem 5rem 1rem;
                    }
                    .cart-desktop { display: none !important; }
                    .cart-float-btn { display: flex; }
                    .cart-mobile-overlay { display: flex; }
                    .products-grid {
                        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    }
                }

                @media (max-width: 480px) {
                    .buyer-hero h1 { font-size: 1.4rem; }
                    .products-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>

            <div className="buyer-page">

                {/* Hero */}
                <div className="buyer-hero">
                    <div style={{ position: 'absolute', top: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', transform: 'rotate(20deg)' }} />
                    <div style={{ position: 'absolute', bottom: '-30px', right: '-20px', width: '100px', height: '100px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', transform: 'rotate(15deg)' }} />
                    <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, position: 'relative', zIndex: 1 }}>
                        Explore all the Food from our Cafeteria
                    </h1>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', zIndex: 1 }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="text"
                            placeholder="Search anything here..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '9999px', border: 'none', outline: 'none', fontSize: '0.875rem', background: 'white' }}
                        />
                    </div>
                </div>

                {/* Main grid */}
                <div className="buyer-grid">

                    {/* LEFT: Products + Categories */}
                    <div>
                        <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', color: '#1c1917' }}>
                            Order Again
                        </h2>

                        <div className="products-grid">
                            {filteredItems.length === 0 ? (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#a8a29e' }}>
                                    No items available at the moment.
                                </div>
                            ) : (
                                filteredItems.map(item => (
                                    <div
                                        key={item._id}
                                        onClick={() => setSelectedItemDetails(item)}
                                        style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', transition: 'transform 0.2s' }}
                                    >
                                        <img
                                            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'}
                                            alt={item.name}
                                            style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                        />
                                        <div style={{ padding: '0.75rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1c1917', marginBottom: '0.25rem' }}>{item.name}</div>
                                            <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.9rem' }}>₦{item.salesPrice.toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Categories */}
                        <h2 className='category-title'
                            onClick={onNavigateToBuyer}
                        // style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary-color)', textAlign: 'center', cursor: 'pointer' }}
                        >
                            Categories →
                        </h2>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button onClick={() => setSelectedCategory(null)} style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', border: '1px solid', borderColor: selectedCategory === null ? 'var(--primary-color)' : '#e7e5e4', background: selectedCategory === null ? 'var(--primary-color)' : 'white', color: selectedCategory === null ? 'white' : '#44403c', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                                All
                            </button>
                            {categories.map(cat => (
                                <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', border: '1px solid', borderColor: selectedCategory === cat._id ? 'var(--primary-color)' : '#e7e5e4', background: selectedCategory === cat._id ? 'var(--primary-color)' : 'white', color: selectedCategory === cat._id ? 'white' : '#44403c', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Cart — desktop only */}
                    <div className="cart-desktop" style={{ paddingTop: '0.25rem' }}>
                        <CartContent />
                    </div>
                </div>

                {/* Mobile: floating cart button */}
                {cart.length > 0 && (
                    <button className="cart-float-btn" onClick={() => setShowCart(true)}>
                        <ShoppingBag size={18} />
                        View Order ({cartItemCount}) · ₦{getCartTotal()}
                    </button>
                )}

                {/* Mobile: cart bottom sheet */}
                {showCart && (
                    <div className="cart-mobile-overlay" onClick={() => setShowCart(false)}>
                        <div className="cart-mobile-sheet" onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Your Order</span>
                                <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <CartContent />
                        </div>
                    </div>
                )}

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
                                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }}
                                />
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedItemDetails.name}</h2>
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>SKU: {selectedItemDetails.sku}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>Sales Price</span>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>₦{selectedItemDetails.salesPrice.toFixed(2)}</p>
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
            </div>
        </>
    );
}