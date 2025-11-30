// components/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Gift, Check, Star, Shield, Zap, Users, Sparkles, Crown, ArrowRight, MessageSquare, Eye, EyeOff, AlertCircle } from 'lucide-react';

// Constants
const FREE_PLAN_LIMIT = 10;
const REDIRECT_DELAY_MS = 1500;

const LoginForm = () => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = mode === 'signup' ? getPasswordStrength(password) : null;

  // Fetch user profile data from the server
  const fetchProfile = async (accessToken) => {
    try {
      const res = await fetch('/api/get-profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        return data;
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    return null;
  };

  // Check for existing session and mode query parameter on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'signup') {
          setMode('signup');
        }
      }

      // Check if user is already logged in
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSession(data.session);
        await fetchProfile(data.session.access_token);
      }
      setCheckingSession(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await fetchProfile(session.access_token);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
          setSession(data.session);
          await fetchProfile(data.session.access_token);
          setMessage('Account created successfully! Redirecting...');
          setRedirecting(true);
          setTimeout(() => {
            window.location.href = '/app';
          }, REDIRECT_DELAY_MS);
        } else {
          setMessage('Check your email to confirm your account.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Ensure profile exists and get data
        if (data.session) {
          setSession(data.session);
          await fetchProfile(data.session.access_token);
          setMessage('Welcome back! Redirecting...');
          setRedirecting(true);
          setTimeout(() => {
            window.location.href = '/app';
          }, REDIRECT_DELAY_MS);
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setMessage('Logged out successfully.');
    setRedirecting(false);
  };

  const handleGoToApp = () => {
    window.location.href = '/app';
  };

  // Show loading spinner while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show logged-in state with usage counter
  if (session && profile && !redirecting) {
    const isPremium = profile.plan === 'premium';
    const freeUsesRemaining = profile.free_uses_remaining ?? FREE_PLAN_LIMIT;
    const usedAnalyses = FREE_PLAN_LIMIT - freeUsesRemaining;

    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back!</h2>
              <p className="text-blue-100 text-sm">{session.user.email}</p>
            </div>

            {/* Usage Counter */}
            <div className="p-6">
              {isPremium ? (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200 mb-6">
                  <div className="flex items-center justify-center gap-2 text-amber-700">
                    <Crown className="w-5 h-5" />
                    <span className="font-semibold">Premium Member</span>
                  </div>
                  <p className="text-center text-amber-600 text-sm mt-2">
                    Unlimited analyses available
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-semibold">Free Plan</span>
                    </div>
                    <span className="text-blue-600 font-bold">{usedAnalyses}/{FREE_PLAN_LIMIT}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(usedAnalyses / FREE_PLAN_LIMIT) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-blue-600 text-sm">
                    {freeUsesRemaining > 0 
                      ? `${freeUsesRemaining} free ${freeUsesRemaining === 1 ? 'analysis' : 'analyses'} remaining`
                      : 'Upgrade to Premium for unlimited access'}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <button
                onClick={handleGoToApp}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mb-3"
              >
                Go to App
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
              >
                Log out
              </button>

              {message && (
                <p className="mt-4 text-center text-green-600 font-medium">{message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Login mode side panel */}
        {mode === 'login' && (
          <div className="flex-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-xl hidden md:flex flex-col justify-center">
            <div className="inline-flex p-3 bg-white/10 rounded-xl mb-6 w-fit">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-gray-300 mb-8">
              Log in to continue decoding your conversations and unlock insights.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Resume your analysis journey</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>Access your usage dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span>Secure & private access</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-gray-400 text-sm">
                Free users: <span className="text-white font-semibold">10 analyses</span> included
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Premium: <span className="text-white font-semibold">Unlimited</span> analyses
              </p>
            </div>
          </div>
        )}

        {/* Form Panel */}
        <div className={`bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden ${mode === 'signup' ? 'flex-1' : 'flex-1 max-w-md'}`}>
          {/* Success message when redirecting */}
          {redirecting && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
              <div className="flex items-center justify-center gap-2 text-white">
                <Check className="w-5 h-5" />
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              {mode === 'login' ? 'Welcome back!' : 'Create your account'}
            </h2>
            
            {mode === 'signup' && (
              <p className="text-gray-500 text-center mb-4">
                Get <span className="font-semibold text-blue-600">10 free analyses</span> instantly
              </p>
            )}

            {mode === 'login' && (
              <p className="text-gray-500 text-center mb-4">
                Sign in to access your dashboard
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
                setMessage(null);
              }}
              className="w-full text-blue-600 hover:text-blue-700 font-medium text-sm mb-6 transition-colors py-2 rounded-lg hover:bg-blue-50"
            >
              {mode === 'login' ? 'Need an account? Sign up free →' : '← Already have an account? Log in'}
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
                  disabled={loading || redirecting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    required
                    minLength={mode === 'signup' ? 6 : undefined}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={mode === 'signup' ? 'Create a password (min 6 chars)' : 'Your password'}
                    disabled={loading || redirecting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password strength indicator for signup */}
                {mode === 'signup' && password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.score <= 1 ? 'text-red-500' :
                        passwordStrength.score <= 2 ? 'text-yellow-600' :
                        passwordStrength.score <= 3 ? 'text-blue-500' : 'text-green-500'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    {passwordStrength.score < 3 && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Add uppercase, numbers, or symbols
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success message (when not redirecting) */}
              {message && !redirecting && (
                <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-green-100">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || redirecting}
                className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2
                  ${loading || redirecting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : mode === 'signup' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-gray-900 hover:bg-black shadow-lg shadow-gray-900/20 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Please wait...</span>
                  </>
                ) : redirecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Redirecting...</span>
                  </>
                ) : mode === 'login' ? (
                  <>
                    <span>Log in</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    <span>Sign up &amp; Get 10 Free</span>
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

            <div className="mt-6 text-center">
              <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
                ← Back to home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
