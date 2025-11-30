// components/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Gift, Check, Star, Shield, Zap, Users } from 'lucide-react';

const LoginForm = () => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Check for mode query parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'signup') {
        setMode('signup');
      }
    }
  }, []);

  // Create profile after successful authentication
  const ensureProfile = async (accessToken) => {
    try {
      await fetch('/api/get-profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      console.error('Error ensuring profile:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Check if user already exists (Supabase returns empty identities array for existing users)
        if (data.user?.identities?.length === 0) {
          throw new Error('An account with this email already exists. Please log in instead.');
        }
        
        // If email confirmation is disabled, user will be logged in immediately
        if (data.session) {
          await ensureProfile(data.session.access_token);
          setMessage('Account created successfully!');
          window.location.href = '/app';
        } else {
          setMessage('Check your email to confirm your account.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Ensure profile exists
        if (data.session) {
          await ensureProfile(data.session.access_token);
        }
        
        setMessage('Logged in successfully!');
        // Redirect to app page after successful login
        window.location.href = '/app';
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessage('Logged out.');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
        {/* Benefits Panel - only show on signup */}
        {mode === 'signup' && (
          <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl hidden md:flex flex-col justify-center">
            <div className="inline-flex p-3 bg-white/20 rounded-xl mb-6 w-fit">
              <Gift className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Get 10 Free Analyses</h2>
            <p className="text-blue-100 mb-8">
              Sign up today and unlock 10 free message analyses. No credit card required.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>Deep emotion analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>Smart reply suggestions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>Red flag detection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>Hidden meaning insights</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-blue-100 text-sm">
                Trusted by 10,000+ users
              </p>
            </div>
          </div>
        )}

        {/* Form Panel */}
        <div className={`bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 ${mode === 'signup' ? 'flex-1' : 'w-full max-w-md mx-auto'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </h2>
          
          {mode === 'signup' && (
            <p className="text-gray-500 text-center mb-6">
              Get <span className="font-semibold text-blue-600">10 free analyses</span> instantly
            </p>
          )}

          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="w-full text-blue-600 hover:text-blue-700 font-medium text-sm mb-6 transition-colors"
          >
            {mode === 'login' ? 'Need an account? Sign up free' : 'Already have an account? Log in'}
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2
                ${loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : mode === 'signup' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-900 hover:bg-black shadow-lg shadow-gray-900/20 hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
              {loading ? (
                'Please wait…'
              ) : mode === 'login' ? (
                'Log in'
              ) : (
                <>
                  <Gift className="w-5 h-5" />
                  Sign up &amp; Get 10 Free
                </>
              )}
            </button>
          </form>

          {mode === 'signup' && (
            <div className="mt-6 flex items-center justify-center gap-4 text-gray-400 text-xs">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Instant access</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>No card needed</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-4 py-3 rounded-xl font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
          >
            Log out
          </button>

          {message && <p className="mt-4 text-center text-green-600 font-medium">{message}</p>}
          {error && <p className="mt-4 text-center text-red-600 font-medium">{error}</p>}

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
