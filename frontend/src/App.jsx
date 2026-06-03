import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState({ total_products: 0, total_customers: 0, total_orders: 0, low_stock_count: 0 });
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [alert, setAlert] = useState({ message: '', type: '' });

  // Forms States
  const [productForm, setProductForm] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [editingProductId, setEditingProductId] = useState(null);
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '' });
  const [orderForm, setOrderForm] = useState({ customer_id: '', product_id: '', quantity: '' });

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 4000);
  };

  const fetchData = async () => {
    try {
      const sRes = await fetch(`${API_BASE_URL}/dashboard`);
      const sData = await sRes.json();
      setStats(sData);

      const pRes = await fetch(`${API_BASE_URL}/products`);
      const pData = await pRes.json();
      setProducts(pData);

      const cRes = await fetch(`${API_BASE_URL}/customers`);
      const cData = await cRes.json();
      setCustomers(cData);

      const oRes = await fetch(`${API_BASE_URL}/orders`);
      const oData = await oRes.json();
      setOrders(oData);
    } catch (err) {
      showAlert('Failed to fetch data from backend service API', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [view]);

  // Product Actions
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.sku || productForm.price <= 0 || productForm.quantity < 0) {
      showAlert('Please insert correct structural form values.', 'error');
      return;
    }
    const url = editingProductId ? `${API_BASE_URL}/products/${editingProductId}` : `${API_BASE_URL}/products`;
    const method = editingProductId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productForm)
    });
    const data = await res.json();
    if (res.ok) {
      showAlert(editingProductId ? 'Product Updated!' : 'Product Created!');
      setProductForm({ name: '', sku: '', price: '', quantity: '' });
      setEditingProductId(null);
      fetchData();
    } else {
      showAlert(data.detail || 'Error saving resource', 'error');
    }
  };

  const deleteProduct = async (id) => {
    await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
    showAlert('Product dropped.');
    fetchData();
  };

  // Customer Actions
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerForm)
    });
    const data = await res.json();
    if (res.ok) {
      showAlert('Customer added successfully');
      setCustomerForm({ name: '', email: '', phone: '' });
      fetchData();
    } else {
      showAlert(data.detail || 'Error saving structural parameters', 'error');
    }
  };

  const deleteCustomer = async (id) => {
    await fetch(`${API_BASE_URL}/customers/${id}`, { method: 'DELETE' });
    showAlert('Customer mapping deleted.');
    fetchData();
  };

  // Order Actions
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderForm)
    });
    const data = await res.json();
    if (res.ok) {
      showAlert('Order created safely.');
      setOrderForm({ customer_id: '', product_id: '', quantity: '' });
      fetchData();
    } else {
      showAlert(data.detail || 'Order execution error validation rules applied', 'error');
    }
  };

  const cancelOrder = async (id) => {
    await fetch(`${API_BASE_URL}/orders/${id}`, { method: 'DELETE' });
    showAlert('Order status cancelled, logic restocked.');
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar navigation controls */}
      <nav className="w-full md:w-64 bg-slate-800 text-white p-6 space-y-4">
        <h1 className="text-xl font-bold tracking-wider mb-6">IMS Dashboard</h1>
        {['dashboard', 'products', 'customers', 'orders'].map((t) => (
          <button 
            key={t} 
            onClick={() => setView(t)}
            className={`w-full text-left capitalize p-2 rounded transition-colors ${view === t ? 'bg-indigo-600 font-semibold' : 'hover:bg-slate-700'}`}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* Main Content Area Container */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {alert.message && (
          <div className={`mb-4 p-4 rounded shadow font-medium ${alert.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {alert.message}
          </div>
        )}

        {/* --- VIEW: DASHBOARD --- */}
        {view === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Operational Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                <p className="text-sm text-gray-500 font-medium uppercase">Total Products</p>
                <p className="text-3xl font-bold mt-2 text-gray-800">{stats.total_products}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <p className="text-sm text-gray-500 font-medium uppercase">Total Customers</p>
                <p className="text-3xl font-bold mt-2 text-gray-800">{stats.total_customers}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
                <p className="text-sm text-gray-500 font-medium uppercase">Total Orders</p>
                <p className="text-3xl font-bold mt-2 text-gray-800">{stats.total_orders}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
                <p className="text-sm text-gray-500 font-medium uppercase">Low Stock Alerts</p>
                <p className="text-3xl font-bold mt-2 text-red-600">{stats.low_stock_count}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: PRODUCTS --- */}
        {view === 'products' && (
          <div className="space-y-8">
            <form onSubmit={handleProductSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">{editingProductId ? 'Update Product Details' : 'Create New Inventory Product'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Product Name" required className="border p-2 rounded" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                <input type="text" placeholder="SKU Code" required className="border p-2 rounded" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} />
                <input type="number" placeholder="Price" required min="0.01" step="0.01" className="border p-2 rounded" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                <input type="number" placeholder="Stock Level Qty" required min="0" className="border p-2 rounded" value={productForm.quantity} onChange={e => setProductForm({...productForm, quantity: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">{editingProductId ? 'Apply Alterations' : 'Add Product record'}</button>
                {editingProductId && <button type="button" onClick={() => { setEditingProductId(null); setProductForm({name:'', sku:'', price:'', quantity:''}); }} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>}
              </div>
            </form>

            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 font-semibold text-gray-600">Name</th>
                    <th className="p-4 font-semibold text-gray-600">SKU</th>
                    <th className="p-4 font-semibold text-gray-600">Price</th>
                    <th className="p-4 font-semibold text-gray-600">Stock Status</th>
                    <th className="p-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{p.name}</td>
                      <td className="p-4 font-mono text-sm">{p.sku}</td>
                      <td className="p-4">${p.price.toFixed(2)}</td>
                      <td className={`p-4 font-semibold ${p.quantity < 5 ? 'text-red-500' : 'text-gray-700'}`}>{p.quantity} units</td>
                      <td className="p-4 space-x-2">
                        <button onClick={() => { setEditingProductId(p.id); setProductForm({name:p.name, sku:p.sku, price:p.price, quantity:p.quantity}); }} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- VIEW: CUSTOMERS --- */}
        {view === 'customers' && (
          <div className="space-y-8">
            <form onSubmit={handleCustomerSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Add New CRM Entity Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" placeholder="Full Name" required className="border p-2 rounded" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} />
                <input type="email" placeholder="Email Address" required className="border p-2 rounded" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} />
                <input type="tel" placeholder="Phone String" required className="border p-2 rounded" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} />
              </div>
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">Persist Account Record</button>
            </form>

            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 font-semibold text-gray-600">Full Name</th>
                    <th className="p-4 font-semibold text-gray-600">Email Workspace</th>
                    <th className="p-4 font-semibold text-gray-600">Phone Network</th>
                    <th className="p-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{c.name}</td>
                      <td className="p-4">{c.email}</td>
                      <td className="p-4">{c.phone}</td>
                      <td className="p-4">
                        <button onClick={() => deleteCustomer(c.id)} className="text-red-600 hover:underline">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- VIEW: ORDERS --- */}
        {view === 'orders' && (
          <div className="space-y-8">
            <form onSubmit={handleOrderSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Checkout Dispatch Generation Pipeline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select required className="border p-2 rounded bg-white" value={orderForm.customer_id} onChange={e => setOrderForm({...orderForm, customer_id: e.target.value})}>
                  <option value="">Select Target Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
                <select required className="border p-2 rounded bg-white" value={orderForm.product_id} onChange={e => setOrderForm({...orderForm, product_id: e.target.value})}>
                  <option value="">Select Resource Allocation</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price} ({p.quantity} available)</option>)}
                </select>
                <input type="number" placeholder="Requested Units Qty" required min="1" className="border p-2 rounded" value={orderForm.quantity} onChange={e => setOrderForm({...orderForm, quantity: e.target.value})} />
              </div>
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">Finalize & Route Order</button>
            </form>

            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 font-semibold text-gray-600">ID</th>
                    <th className="p-4 font-semibold text-gray-600">Purchaser Entity ID</th>
                    <th className="p-4 font-semibold text-gray-600">SKU Item Variant</th>
                    <th className="p-4 font-semibold text-gray-600">Units Demanded</th>
                    <th className="p-4 font-semibold text-gray-600">Total Invoice Valuation</th>
                    <th className="p-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-xs text-gray-400 font-mono">#{o.id}</td>
                      <td className="p-4">Customer reference: ID {o.customer_id}</td>
                      <td className="p-4">Product reference: ID {o.product_id}</td>
                      <td className="p-4">{o.quantity}</td>
                      <td className="p-4 font-semibold text-emerald-600">${o.total_amount.toFixed(2)}</td>
                      <td className="p-4">
                        <button onClick={() => cancelOrder(o.id)} className="text-red-500 hover:underline">Cancel Order</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}