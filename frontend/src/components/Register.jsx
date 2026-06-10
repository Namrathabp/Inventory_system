import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // We force the role to 'customer' so no one can secretly sign up as an admin!
        body: JSON.stringify({ ...formData, role: 'customer' }) 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      setSuccess(true);
      // Wait 2 seconds, then send them to the login page
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Create Customer Account</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Account created! Redirecting to login...</p>}
      
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input 
          type="text" 
          placeholder="Username" 
          value={formData.username} 
          onChange={(e) => setFormData({...formData, username: e.target.value})} 
          required 
          style={{ padding: '10px' }}
        />
        <input 
          type="email" 
          placeholder="Email Address" 
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
          style={{ padding: '10px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          required 
          style={{ padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}>
          Sign Up
        </button>
      </form>
      
      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        Already have an account? <Link to="/login" style={{ color: '#007bff' }}>Log in here</Link>
      </p>
    </div>
  );
}