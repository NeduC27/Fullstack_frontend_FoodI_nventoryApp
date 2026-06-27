import React, { useState } from 'react';
import { LayoutGrid, ListCollapse, ClipboardList, Plus, Edit, Trash2, ArrowUpCircle, X, Search } from 'lucide-react';

const API_BASE_URL = 'https://food-inventory-backend-code.onrender.com/api';

export default function AdminPanel({ items, categories, logs, fetchItems, fetchCategories, fetchLogs, authFetch }) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'categories', 'logs'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtering states
  const [selectedLogAction, setSelectedLogAction] = useState('');

  // Modals visibility and states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReplenishModal, setShowReplenishModal] = useState(false);
  
  // Selected item to edit or replenish
  const [selectedItem, setSelectedItem] = useState(null);

  // Form fields for Create/Edit Item
  const [itemName, setItemName] = useState('');
  const [itemCostPrice, setItemCostPrice] = useState('');
  const [itemSalesPrice, setItemSalesPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemImageFile, setItemImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Form field for Replenish Stock
  const [replenishQty, setReplenishQty] = useState('');

  // Form field for Category creation
  const [newCategoryName, setNewCategoryName] = useState('');

  // Error/Success state
  const [errorMsg, setErrorMsg] = useState('');

  // File picker handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Open modals
  const openAddModal = () => {
    setItemName('');
    setItemCostPrice('');
    setItemSalesPrice('');
    setItemQuantity('0');
    setItemCategoryId(categories[0]?._id || '');
    setItemImageFile(null);
    setImagePreview('');
    setErrorMsg('');
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setItemName(item.name);
    setItemCostPrice(item.costPrice.toString());
    setItemSalesPrice(item.salesPrice.toString());
    setItemCategoryId(item.categoryId?._id || item.categoryId);
    setItemImageFile(null);
    setImagePreview(item.imageUrl || '');
    setErrorMsg('');
    setShowEditModal(true);
  };

  const openReplenishModal = (item) => {
    setSelectedItem(item);
    setReplenishQty(item.quantity.toString());
    setErrorMsg('');
    setShowReplenishModal(true);
  };

  // CRUD API Calls
  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !itemCostPrice || !itemSalesPrice || !itemCategoryId) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    const formData = new FormData();
    formData.append('name', itemName.trim());
    formData.append('costPrice', itemCostPrice);
    formData.append('salesPrice', itemSalesPrice);
    formData.append('quantity', itemQuantity || '0');
    formData.append('categoryId', itemCategoryId);
    if (itemImageFile) {
      formData.append('image', itemImageFile);
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create item');
      }

      setShowAddModal(false);
      fetchItems();
      fetchLogs();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleEditItemSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !itemCostPrice || !itemSalesPrice || !itemCategoryId) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    const formData = new FormData();
    formData.append('name', itemName.trim());
    formData.append('costPrice', itemCostPrice);
    formData.append('salesPrice', itemSalesPrice);
    formData.append('categoryId', itemCategoryId);
    if (itemImageFile) {
      formData.append('image', itemImageFile);
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/items/${selectedItem._id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update item');
      }

      setShowEditModal(false);
      fetchItems();
      fetchLogs();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleReplenishSubmit = async (e) => {
    e.preventDefault();
    if (replenishQty === '' || isNaN(replenishQty) || parseInt(replenishQty) < 0) {
      setErrorMsg('Please enter a valid stock level.');
      return;
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/items/${selectedItem._id}/quantity`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: parseInt(replenishQty) }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update stock');
      }

      setShowReplenishModal(false);
      fetchItems();
      fetchLogs();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete item');
      }

      fetchItems();
      fetchLogs();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add category');
      }

      setNewCategoryName('');
      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete category');
      }

      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter items based on search input
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-layout">
      {/* This responsive style tag patches the layout behavior across viewports 
        while preserving your existing className style rules and CSS color variables.
      */}
      <style>{`
        .admin-layout {
          display: flex;
          flex-direction: row;
          min-height: 100vh;
          width: 100%;
        }
        .admin-sidebar {
          flex-shrink: 0;
        }
        .admin-content {
          flex: 1;
          min-width: 0;
          padding: 2rem;
          box-sizing: border-box;
        }
        .admin-content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .header-actions-responsive {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .category-manage-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 9999;
          box-sizing: border-box;
        }
        .modal-content {
          width: 100%;
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          box-sizing: border-box;
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .category-manage-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .admin-layout {
            flex-direction: column;
          }
          .admin-sidebar {
            width: 100%;
          }
          .admin-sidebar-menu {
            display: flex;
            flex-direction: row;
            overflow-x: auto;
            white-space: nowrap;
            padding: 0.5rem;
            margin: 0;
            list-style: none;
          }
          .admin-content {
            padding: 1rem;
          }
          .admin-content-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .header-actions-responsive {
            width: 100%;
            justify-content: space-between;
          }
          .search-wrapper {
            flex: 1;
          }
          .search-wrapper input {
            width: 100% !important;
            box-sizing: border-box;
          }
        }
        @media (max-width: 480px) {
          .header-actions-responsive {
            flex-direction: column;
            align-items: stretch;
          }
          .form-row-2 {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>

      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <ul className="admin-sidebar-menu">
          <li className={`admin-sidebar-item ${activeTab === 'inventory' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('inventory')}>
              <LayoutGrid size={18} />
              Inventory
            </button>
          </li>
          <li className={`admin-sidebar-item ${activeTab === 'categories' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('categories')}>
              <ListCollapse size={18} />
              Categories
            </button>
          </li>
          <li className={`admin-sidebar-item ${activeTab === 'logs' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('logs')}>
              <ClipboardList size={18} />
              Logs
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        
        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div>
            <div className="admin-content-header">
              <h1>Inventory List</h1>
              <div className="header-actions-responsive">
                <div className="search-wrapper" style={{ width: '240px' }}>
                  <Search className="search-icon" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search SKU or name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '0.5rem 1rem 0.5rem 2.2rem', borderRadius: '8px' }}
                  />
                </div>
                <button className="admin-action-btn" onClick={openAddModal}>
                  <Plus size={16} /> Add Item
                </button>
              </div>
            </div>

            <div className="admin-card">
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>S/N</th>
                      <th>SKU</th>
                      <th>Name</th>
                      <th>Cost Price</th>
                      <th>Sales Price</th>
                      <th>Qty</th>
                      <th>Category</th>
                      <th>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                          No inventory items found.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item, idx) => (
                        <tr key={item._id}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>{item.sku}</td>
                          <td>
                            <div className="item-thumb-container">
                              <img 
                                src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=80'} 
                                alt={item.name} 
                                className="item-thumb"
                              />
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td>₦{item.costPrice.toFixed(2)}</td>
                          <td style={{ fontWeight: '600' }}>₦{item.salesPrice.toFixed(2)}</td>
                          <td>
                            <span style={{ 
                              fontWeight: '700', 
                              color: item.quantity === 0 ? 'var(--danger)' : item.quantity < 5 ? 'var(--warning)' : 'var(--text-primary)' 
                            }}>
                              {item.quantity}
                            </span>
                          </td>
                          <td>
                            <span className="badge created" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                              {item.CategoryId?.name}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button className="btn-icon" onClick={() => openEditModal(item)} title="Edit details">
                                <Edit size={14} />
                              </button>
                              <button className="btn-icon" onClick={() => openReplenishModal(item)} title="Update stock">
                                <ArrowUpCircle size={14} />
                              </button>
                              <button className="btn-icon delete" onClick={() => handleDeleteItem(item._id, item.name)} title="Delete item">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div>
            <div className="admin-content-header">
              <h1>Category Management</h1>
            </div>

            <div className="category-manage-layout">
              <div className="admin-card">
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Category Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                            No categories created.
                          </td>
                        </tr>
                      ) : (
                        categories.map(cat => (
                          <tr key={cat._id}>
                            <td>{cat._id}</td>
                            <td style={{ fontWeight: '600' }}>{cat.name}</td>
                            <td>
                              <button className="btn-icon delete" onClick={() => handleDeleteCategory(cat._id)}>
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add category sidebar form */}
              <div className="admin-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Create Category</h3>
                <form onSubmit={handleAddCategory}>
                  <div className="form-group">
                    <label>Category Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Drinks"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="admin-action-btn" style={{ width: '100%', justifyContent: 'center' }}>
                    <Plus size={16} /> Save Category
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div>
            <div className="admin-content-header">
              <h1>System Audit Logs</h1>
            </div>

            <div className="logs-filters-row">
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter by Action:</span>
              <select 
                value={selectedLogAction} 
                onChange={(e) => setSelectedLogAction(e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="Purchase">Purchase (Sales)</option>
                <option value="Update">Update (Stock & Info)</option>
                <option value="Created">Created (New Items)</option>
                <option value="Deleted">Deleted (Removals)</option>
              </select>
            </div>

            <div className="admin-card">
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>Details</th>
                      <th>Performed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs
                      .filter(log => selectedLogAction ? log.action === selectedLogAction : true)
                      .length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                            No matching log traces found.
                          </td>
                        </tr>
                    ) : (
                      logs
                        .filter(log => selectedLogAction ? log.action === selectedLogAction : true)
                        .map(log => (
                          <tr key={log._id}>
                            <td style={{ color: 'var(--text-secondary)' }}>
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td>
                              <span className={`badge ${log.action.toLowerCase()}`}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ fontWeight: '500' }}>{log.details}</td>
                            <td style={{ fontWeight: '600' }}>{log.performedBy}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <form className="modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleAddItemSubmit}>
            <div className="modal-header">
              <h3>Create New Inventory Item</h3>
              <button className="modal-close-btn" type="button" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body">
              {errorMsg && <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem' }}>{errorMsg}</p>}
              
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Hamburger"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Cost Price (₦)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    placeholder="0.00"
                    value={itemCostPrice}
                    onChange={(e) => setItemCostPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Sales Price (₦)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    placeholder="0.00"
                    value={itemSalesPrice}
                    onChange={(e) => setItemSalesPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Initial Qty</label>
                  <input 
                    type="number" 
                    min="0"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={itemCategoryId} 
                    onChange={(e) => setItemCategoryId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="file-upload-preview">
                    <img src={imagePreview} alt="Preview" />
                    <span style={{ fontSize: '0.8rem', color: 'green' }}>Image loaded!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="admin-action-btn" type="submit">Create Item</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT ITEM MODAL */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <form className="modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleEditItemSubmit}>
            <div className="modal-header">
              <h3>Edit Item Details</h3>
              <button className="modal-close-btn" type="button" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body">
              {errorMsg && <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem' }}>{errorMsg}</p>}
              
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Cost Price (₦)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={itemCostPrice}
                    onChange={(e) => setItemCostPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Sales Price (₦)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={itemSalesPrice}
                    onChange={(e) => setItemSalesPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  value={itemCategoryId} 
                  onChange={(e) => setItemCategoryId(e.target.value)}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Change Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="file-upload-preview">
                    <img src={imagePreview} alt="Preview" />
                    <span style={{ fontSize: '0.8rem', color: 'orange' }}>New preview set</span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="admin-action-btn" type="submit">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* REPLENISH STOCK LEVEL MODAL */}
      {showReplenishModal && (
        <div className="modal-overlay" onClick={() => setShowReplenishModal(false)}>
          <form className="modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleReplenishSubmit}>
            <div className="modal-header">
              <h3>Replenish Inventory Level</h3>
              <button className="modal-close-btn" type="button" onClick={() => setShowReplenishModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body">
              {errorMsg && <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem' }}>{errorMsg}</p>}
              
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: '8px', border: '1px solid #ffd8cc' }}>
                <p style={{ fontWeight: '700' }}>Item: {selectedItem?.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SKU: {selectedItem?.sku}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Stock Level: {selectedItem?.quantity} units</p>
              </div>

              <div className="form-group">
                <label>Update Total Stock Quantity</label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="e.g. 50"
                  value={replenishQty}
                  onChange={(e) => setReplenishQty(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" type="button" onClick={() => setShowReplenishModal(false)}>Cancel</button>
              <button className="admin-action-btn" type="submit">Apply Stock Update</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}