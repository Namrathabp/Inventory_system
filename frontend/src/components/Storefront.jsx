import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Storefront() {
  const { user, logout } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });

  // 🛒 Cart States
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 4000);
  };

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to load inventory');
      setProducts(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Smart Add to Cart: tracks quantities instead of duplicating items
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.cartQuantity >= product.quantity) {
        showAlert(`Cannot add more. Only ${product.quantity} items available in stock.`, 'error');
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, cartQuantity: 1 }]);
    }
    showAlert(`${product.name} added to cart!`);
  };

  const updateCartQuantity = (id, amount) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.cartQuantity + amount;
        if (newQty <= 0) return null; // Removes item if reduced below 1
        if (newQty > item.quantity) {
          showAlert(`Only ${item.quantity} units available.`, 'error');
          return item;
        }
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  // 🚀 Step 4: Checkout Execution
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      // Loop through cart and send dispatch orders to the backend pipeline
      // Assumes your backend order route accepts: { product_id: int, quantity: int }
      // If your current backend requires customer_id, it typically infers it from the current JWT user token!
      for (const item of cart) {
        const res = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            product_id: item.id,
            quantity: item.cartQuantity
          })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Order placement failed');
        }
      }

      showAlert('Order placed successfully! Checkouts routed safely.');
      setCart([]); // Clear Cart
      setIsCartOpen(false);
      fetchProducts(); // Refresh inventory stock counters!

    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  if (loading) return <div className="p-10 text-center text-xl text-gray-600">Loading storefront...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col relative overflow-x-hidden">
      
      {/* Top Header */}
      <header className="bg-slate-800 text-white p-6 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-2xl font-bold tracking-wider">Customer Storefront</h1>
          <p className="text-sm text-gray-300 mt-1">Welcome back, {user?.username || 'Valued Customer'}!</p>
        </div>
        <div className="flex gap-6 items-center">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-semibold shadow transition-all transform hover:scale-105 flex items-center gap-2"
          >
            🛒 Cart ({cart.reduce((total, item) => total + item.cartQuantity, 0)})
          </button>
          <button onClick={logout} className="text-red-400 hover:text-red-300 font-medium transition-colors">
            Secure Logout
          </button>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
        {alert.message && (
          <div className={`mb-6 p-4 rounded shadow font-medium max-w-md mx-auto ${alert.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {alert.message}
          </div>
        )}

        <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-2">Available Products</h2>

        {products.length === 0 ? (
          <p className="text-gray-500 text-lg">No products available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{p.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mb-4">SKU: {p.sku}</p>
                  <p className="text-3xl font-semibold text-emerald-600 mb-4">${p.price.toFixed(2)}</p>
                  <p className={`text-sm font-medium mb-6 ${p.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {p.quantity > 0 ? `${p.quantity} units available` : 'Out of Stock'}
                  </p>
                </div>

                <button
                  onClick={() => addToCart(p)}
                  disabled={p.quantity === 0}
                  className={`w-full py-3 rounded-lg text-white font-bold transition-colors ${
                    p.quantity > 0 ? 'bg-indigo-600 hover:bg-indigo-700 shadow-sm' : 'bg-gray-300 cursor-not-allowed text-gray-500'
                  }`}
                >
                  {p.quantity > 0 ? 'Add to Cart' : 'Unavailable'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🛒 SIDEBAR DRAWER OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end animate-fadeIn">
          {/* Backdrop Click Closes Cart */}
          <div className="flex-1" onClick={() => setIsCartOpen(false)}></div>
          
          {/* Drawer Body */}
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 animate-slideIn">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-xl font-bold text-gray-800">Your Basket</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                    <div>
                      <h4 className="font-bold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-emerald-600 font-semibold">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateCartQuantity(item.id, -1)} className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full font-bold flex items-center justify-center">-</button>
                      <span className="font-semibold text-gray-700">{item.cartQuantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, 1)} className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Pricing Section */}
            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total Amount:</span>
                  <span className="text-emerald-600">${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow transition-colors text-center"
                >
                  Confirm & Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}