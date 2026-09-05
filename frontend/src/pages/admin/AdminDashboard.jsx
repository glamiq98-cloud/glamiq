/**
 * Admin Dashboard — Product Catalog Moderation, User Accounts, and Platform Analytics.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState('');
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'users' | 'logs'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('');
  
  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [productImageFile, setProductImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [newProduct, setNewProduct] = useState({
    item_name: '',
    category: 'jewelry',
    color: 'Gold',
    price: 99.0,
    image_url: '',
    status: 'approved',
    description: '',
    style_type: '',
    occasion: '',
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Edit Product Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    const username = sessionStorage.getItem('admin_username');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    setAdminUser(username || 'Admin');
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, usersRes] = await Promise.all([
        client.get('/admin/logs'),
        client.get('/admin/products'),
        client.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_username');
    navigate('/admin/login');
  };

  const handleProductStatusChange = async (itemId, newStatus) => {
    try {
      await client.put(`/admin/products/${itemId}`, { status: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p.item_id === itemId ? { ...p, status: newStatus } : p))
      );
      setActionMessage(`Product status updated to ${newStatus}`);
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to update product status');
    }
  };

  const handleDeleteProduct = async (itemId) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await client.delete(`/admin/products/${itemId}`);
      setProducts((prev) => prev.filter((p) => p.item_id !== itemId));
      setActionMessage('Product deleted successfully');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProduct(true);
    try {
      let finalImageUrl = newProduct.image_url;

      // If an image file was selected, upload it first
      if (productImageFile) {
        const formData = new FormData();
        formData.append('file', productImageFile);
        const uploadRes = await client.post('/admin/products/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalImageUrl = uploadRes.data.image_url;
      }

      if (!finalImageUrl) {
        alert('Please select a product image file.');
        setSubmittingProduct(false);
        return;
      }

      const payload = {
        ...newProduct,
        image_url: finalImageUrl,
      };

      const res = await client.post('/admin/products', payload);
      setProducts((prev) => [res.data, ...prev]);
      setShowAddModal(false);
      setProductImageFile(null);
      setImagePreview('');
      setNewProduct({
        item_name: '',
        category: 'jewelry',
        color: 'Gold',
        price: 99.0,
        image_url: '',
        status: 'approved',
        description: '',
        style_type: '',
        occasion: '',
      });
      setActionMessage('New product added to catalog with uploaded image! ✨');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add product');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct({
      item_id: product.item_id,
      item_name: product.item_name || '',
      category: product.category || 'jewelry',
      color: product.color || '',
      price: product.price || 0,
      image_url: product.image_url || '',
      status: product.status || 'pending',
      description: product.description || '',
      style_type: product.style_type || '',
      occasion: product.occasion || '',
    });
    setImagePreview(product.image_url || '');
    setProductImageFile(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmittingEdit(true);
    try {
      let finalImageUrl = editingProduct.image_url;

      if (productImageFile) {
        const formData = new FormData();
        formData.append('file', productImageFile);
        const uploadRes = await client.post('/admin/products/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalImageUrl = uploadRes.data.image_url;
      }

      const payload = { ...editingProduct, image_url: finalImageUrl };
      delete payload.item_id;

      const res = await client.put(`/admin/products/${editingProduct.item_id}`, payload);
      setProducts((prev) => prev.map((p) => (p.item_id === editingProduct.item_id ? res.data : p)));
      
      setShowEditModal(false);
      setEditingProduct(null);
      setProductImageFile(null);
      setImagePreview('');
      setActionMessage('Product updated successfully! ✨');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update product');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter && p.category !== productCategoryFilter) return false;
    if (productStatusFilter && p.status !== productStatusFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🛡️</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>
              Admin <span className="gradient-text">Console</span>
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Signed in as <strong>{adminUser}</strong> • Platform Management & Catalog Moderation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            + Add Fashion Item
          </button>
          <button
            onClick={handleAdminLogout}
            className="btn btn-secondary"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            Exit Admin
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className="animate-slide-up"
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#4ade80',
            marginBottom: '1.5rem',
          }}
        >
          ✨ {actionMessage}
        </div>
      )}

      {/* KPI Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Users
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--color-primary-light)' }}>
              {stats.total_users}
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Outfits Uploaded
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: '#60a5fa' }}>
              {stats.total_outfits}
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Style Recommendations
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: '#c084fc' }}>
              {stats.total_recommendations}
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Catalog Products
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: '#facc15' }}>
              {stats.total_fashion_items}
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Stylist Chat Turns
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: '#4ade80' }}>
              {stats.total_chat_messages}
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'products' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'products' ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'products' ? 600 : 400,
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          💎 Products Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'users' ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'users' ? 600 : 400,
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          👤 User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'logs' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'logs' ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'logs' ? 600 : 400,
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          📊 Activity Logs
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading records…</p>
        </div>
      ) : activeTab === 'products' ? (
        /* Tab 1: Products */
        <div>
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="input"
              style={{ minWidth: '160px' }}
            >
              <option value="">All Categories</option>
              <option value="jewelry">Jewelry</option>
              <option value="makeup">Makeup</option>
              <option value="dress">Dress</option>
            </select>

            <select
              value={productStatusFilter}
              onChange={(e) => setProductStatusFilter(e.target.value)}
              className="input"
              style={{ minWidth: '160px' }}
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Products Table */}
          <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem' }}>Image</th>
                  <th style={{ padding: '1rem' }}>Item Name</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Tone / Color</th>
                  <th style={{ padding: '1rem' }}>Price</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((item) => (
                  <tr key={item.item_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100'}
                        alt=""
                        style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{item.item_name}</td>
                    <td style={{ padding: '0.75rem 1rem', textTransform: 'capitalize' }}>{item.category}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{item.color || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                      ${item.price ? Number(item.price).toFixed(2) : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background:
                            item.status === 'approved'
                              ? 'rgba(34, 197, 94, 0.2)'
                              : item.status === 'rejected'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'rgba(234, 179, 8, 0.2)',
                          color:
                            item.status === 'approved'
                              ? '#4ade80'
                              : item.status === 'rejected'
                              ? '#f87171'
                              : '#facc15',
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {item.status !== 'approved' && (
                          <button
                            onClick={() => handleProductStatusChange(item.item_id, 'approved')}
                            className="btn btn-ghost"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: '#4ade80' }}
                          >
                            Approve
                          </button>
                        )}
                        {item.status !== 'rejected' && (
                          <button
                            onClick={() => handleProductStatusChange(item.item_id, 'rejected')}
                            className="btn btn-ghost"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: '#f87171' }}
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleEditClick(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-primary-light)',
                            padding: '0.3rem',
                            fontSize: '0.9rem',
                          }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item.item_id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                            padding: '0.3rem',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        /* Tab 2: Users */
        <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem' }}>User ID</th>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Skin Tone</th>
                <th style={{ padding: '1rem' }}>Outfits</th>
                <th style={{ padding: '1rem' }}>Recommendations</th>
                <th style={{ padding: '1rem' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>#{u.user_id}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.full_name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background: 'rgba(255,255,255,0.06)',
                      }}
                    >
                      {u.skin_tone || 'Not detected'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.outfits_count}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.recommendations_count}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Tab 3: Activity Logs */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {stats?.recent_activity?.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No recent activity records.</p>
          ) : (
            stats?.recent_activity?.map((act) => (
              <div
                key={act.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>{act.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{act.detail}</div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {new Date(act.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="card animate-scale-in"
            style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Add Fashion Catalog Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Item Title / Name
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.item_name}
                  onChange={(e) => setNewProduct({ ...newProduct, item_name: e.target.value })}
                  placeholder="e.g. 18K Solid Gold Choker Necklace"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="jewelry">Jewelry</option>
                    <option value="makeup">Makeup</option>
                    <option value="dress">Dress</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Tone / Color
                  </label>
                  <input
                    type="text"
                    value={newProduct.color}
                    onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                    placeholder="e.g. Gold, Silver, Berry, Red"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Style Type
                  </label>
                  <input
                    type="text"
                    value={newProduct.style_type}
                    onChange={(e) => setNewProduct({ ...newProduct, style_type: e.target.value })}
                    placeholder="e.g. formal, casual"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Occasion
                  </label>
                  <input
                    type="text"
                    value={newProduct.occasion}
                    onChange={(e) => setNewProduct({ ...newProduct, occasion: e.target.value })}
                    placeholder="e.g. Wedding, Party"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Enter product description"
                  className="input"
                  rows="3"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Status
                  </label>
                  <select
                    value={newProduct.status}
                    onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  Upload Product Image File
                </label>
                
                <div
                  style={{
                    border: '2px dashed rgba(236, 72, 153, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: 'rgba(36, 20, 42, 0.5)',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={() => document.getElementById('admin-product-file-input')?.click()}
                >
                  <input
                    id="admin-product-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />

                  {imagePreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'cover',
                          border: '2px solid #ec4899',
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#f472b6', fontWeight: 600 }}>
                        ✓ Image Selected (Click to change)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📁</span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>
                        Click to Choose Image File
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Supports JPG, PNG, WEBP (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="btn btn-primary"
                  style={{ flex: 1.5, justifyContent: 'center' }}
                >
                  {submittingProduct ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="card animate-scale-in"
            style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Edit Fashion Catalog Item</h2>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Item Title / Name
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.item_name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, item_name: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Category
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="jewelry">Jewelry</option>
                    <option value="makeup">Makeup</option>
                    <option value="dress">Dress</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Tone / Color
                  </label>
                  <input
                    type="text"
                    value={editingProduct.color}
                    onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Style Type
                  </label>
                  <input
                    type="text"
                    value={editingProduct.style_type}
                    onChange={(e) => setEditingProduct({ ...editingProduct, style_type: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Occasion
                  </label>
                  <input
                    type="text"
                    value={editingProduct.occasion}
                    onChange={(e) => setEditingProduct({ ...editingProduct, occasion: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Description
                </label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="input"
                  rows="3"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Status
                  </label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  Update Product Image
                </label>
                
                <div
                  style={{
                    border: '2px dashed rgba(236, 72, 153, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: 'rgba(36, 20, 42, 0.5)',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={() => document.getElementById('admin-edit-product-file-input')?.click()}
                >
                  <input
                    id="admin-edit-product-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />

                  {imagePreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'cover',
                          border: '2px solid #ec4899',
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#f472b6', fontWeight: 600 }}>
                        ✓ Image Selected (Click to change)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📁</span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>
                        Click to Choose New Image
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="btn btn-primary"
                  style={{ flex: 1.5, justifyContent: 'center' }}
                >
                  {submittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
