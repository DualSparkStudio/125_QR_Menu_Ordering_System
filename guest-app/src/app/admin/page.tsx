'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  useEffect(() => {
    // Check for saved credentials
    const savedEmail = localStorage.getItem('adminEmail');
    const savedRemember = localStorage.getItem('adminRemember');
    if (savedEmail && savedRemember === 'true') {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Demo credentials check
    if (email === 'admin@resort.com' && password === 'admin123') {
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('adminRemember', 'true');
      } else {
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminRemember');
      }
      // Set session for auth
      sessionStorage.setItem('adminLoggedIn', 'true');
      // Redirect to dashboard
      router.push('/admin/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Simulate password reset
    setResetSuccess(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setResetSuccess(false);
      setResetEmail('');
      setError('');
    }, 3000);
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen pista-gradient flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pista-200/30 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pista-500 rounded-2xl mb-6 shadow-xl shadow-pista-500/30">
              <span className="text-3xl">👨‍💼</span>
            </div>

            <h1 className="text-5xl font-bold text-pista-900 mb-3 tracking-tight">
              Admin Portal
            </h1>
            <p className="text-lg text-pista-700 mb-2">Resort Management System</p>
            <p className="text-sm text-gray-600">Manage your resort operations efficiently</p>
          </div>

          <div className="glass-effect rounded-2xl p-8 border-2 border-pista-200 shadow-2xl">
            {showForgotPassword ? (
              // Forgot Password Form
              <div>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError('');
                    setResetEmail('');
                  }}
                  className="text-pista-600 hover:text-pista-700 text-sm mb-4 flex items-center gap-1"
                >
                  ← Back to Login
                </button>
                
                <h2 className="text-2xl font-bold text-pista-900 mb-2">Forgot Password?</h2>
                <p className="text-gray-600 text-sm mb-6">Enter your email address and we'll send you a reset link.</p>

                {resetSuccess ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">✓</div>
                    <p className="text-pista-700 font-semibold mb-2">Reset Link Sent!</p>
                    <p className="text-gray-600 text-sm">Check your email for password reset instructions.</p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-pista-900 mb-2 uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          setError('');
                        }}
                        placeholder="admin@resort.com"
                        className="w-full px-4 py-3 bg-white border-2 border-pista-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none transition"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-pista-500 hover:bg-pista-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg uppercase tracking-wider text-sm"
                    >
                      Send Reset Link
                    </button>
                  </form>
                )}
              </div>
            ) : (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-pista-900 mb-2 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="admin@resort.com"
                    className="w-full px-4 py-3 bg-white border-2 border-pista-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-pista-900 mb-2 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 bg-white border-2 border-pista-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pista-600 transition"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-pista-500 bg-white border-2 border-pista-300 rounded focus:ring-2 focus:ring-pista-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">Remember me</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-pista-600 hover:text-pista-700 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-pista-500 hover:bg-pista-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg uppercase tracking-wider text-sm"
                >
                  Sign In
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-pista-200">
              <p className="text-xs text-pista-700 font-medium mb-3 uppercase tracking-wider text-center">Demo Credentials</p>
              <div className="bg-pista-50 rounded-lg p-3 border border-pista-200">
                <p className="text-xs text-pista-700 font-mono">admin@resort.com</p>
                <p className="text-xs text-pista-700 font-mono">admin123</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-pista-200">
              <a
                href="/"
                className="block w-full bg-white hover:bg-gray-50 text-pista-700 font-bold py-3 px-6 rounded-lg transition border-2 border-pista-300 text-center uppercase tracking-wider text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <span>🏨</span>
                  Go to Guest App
                </span>
              </a>
            </div>
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            © 2024 Grand Valley Resort
          </p>
        </div>
      </main>
    );
  }
}
