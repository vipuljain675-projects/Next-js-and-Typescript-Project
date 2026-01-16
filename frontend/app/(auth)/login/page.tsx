'use client';
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { AuthContext } from '@/context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const auth = useContext(AuthContext);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', formData);
      if (auth) {
        auth.login(res.data.user, res.data.token);
        router.push('/');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <main className="container-fluid p-0">
      <div className="row g-0" style={{ height: '100vh' }}>
        {/* Left Side: Sexy Image */}
        <div className="col-lg-6 d-none d-lg-block">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop" 
            className="w-100 h-100" 
            style={{ objectFit: 'cover' }} 
            alt="Login Background" 
          />
        </div>
        
        {/* Right Side: Login Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white">
          <div className="w-100 p-5" style={{ maxWidth: '450px' }}>
            <div className="mb-4">
              <Link href="/">
                <svg width="32" height="32" fill="#FF385C" viewBox="0 0 32 32" className="mb-4">
                  <path d="M16 1c2 0 3.46 1.67 3.46 3.33 0 2-1.46 3.67-3.46 3.67s-3.46-1.67-3.46-3.67C12.54 2.67 14 1 16 1zm0 24.5c-1.86 0-3.54.5-5.17 1.42L8.7 19.1a7.34 7.34 0 0 1-.45-2.6c0-3.91 3.18-7.08 7.08-7.08h1.34c3.91 0 7.08 3.18 7.08 7.08 0 .9-.17 1.78-.45 2.6l-2.13 7.82c-1.63-.92-3.31-1.42-5.17-1.42z"/>
                </svg>
              </Link>
              <h1 className="fw-bold h2 mb-2">Welcome back</h1>
              <p className="text-secondary">Please enter your details.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Email Address</label>
                <input 
                  type="email" 
                  className="form-control form-control-lg fs-6 rounded-3" 
                  placeholder="Enter your email" 
                  required
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Password</label>
                <input 
                  type="password" 
                  className="form-control form-control-lg fs-6 rounded-3" 
                  placeholder="••••••••" 
                  required
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-3" 
                style={{ backgroundColor: '#ff385c', border: 'none' }}
              >
                Log in
              </button>
            </form>
            
            <div className="text-center mt-4">
              <p className="text-muted small">
                Don't have an account? 
                <Link href="/signup" className="fw-bold text-dark ms-1 text-decoration-none">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}