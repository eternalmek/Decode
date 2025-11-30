// pages/account.jsx - Account management page
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import {
  MessageSquare,
  User,
  Crown,
  CreditCard,
  Trash2,
  AlertTriangle,
  Check,
  X,
  ArrowLeft,
  Sparkles,
  Gift,
  Shield,
  Zap,
} from 'lucide-react';

const Navbar = ({ session }) => (
  <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => window.location.href = '/'}
      >
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900">
          Decodr.
        </span>
      </div>
      <div className="flex items-center gap-6">
        <a
          href="/app"
          className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
        >
          App
        </a>
        {session && (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
          >
            Log out
          </button>
        )}
      </div>
    </div>
  </nav>
);

const DeleteConfirmModal = ({ onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-100 rounded-full">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Are you sure you want to permanently delete your account? This action cannot be undone.
        All your data will be removed, and any active subscriptions will be cancelled.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-3 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Delete Forever
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAccessToken(data.session?.access_token);
      if (data.session) {
        fetchProfile(data.session.access_token);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAccessToken(session?.access_token);
      if (session) {
        fetchProfile(session.access_token);
      }
    });

    // Check for payment status in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        setMessage({ type: 'success', text: 'Payment successful! Your account has been upgraded to Premium.' });
        // Clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        window.history.replaceState({}, document.title, url.toString());
        // Refresh profile to get updated plan
        if (accessToken) {
          setTimeout(() => fetchProfile(accessToken), 1000);
        }
      } else if (params.get('payment') === 'cancel') {
        setMessage({ type: 'info', text: 'Payment was cancelled.' });
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        window.history.replaceState({}, document.title, url.toString());
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch('/api/get-profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setMessage({ type: 'error', text: err.message || 'Could not start checkout.' });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create portal session');
      }
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Portal error:', err);
      setMessage({ type: 'error', text: err.message || 'Could not open subscription management.' });
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account');
      }
      
      // Sign out and redirect
      await supabase.auth.signOut();
      localStorage.removeItem('decodr_premium');
      localStorage.removeItem('decodr_usage');
      
      // Redirect to home with message
      window.location.href = '/?deleted=true';
    } catch (err) {
      console.error('Delete account error:', err);
      setMessage({ type: 'error', text: err.message || 'Could not delete account.' });
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 w-full max-w-md text-center">
          <div className="p-3 bg-indigo-50 rounded-2xl inline-block mb-4">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access your account.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/login"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition-all"
            >
              Go to Login
            </a>
            <a
              href="/login?mode=signup"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Sign up
            </a>
          </div>
          <div className="mt-4">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isPremium = profile?.plan === 'premium';
  const freeUsesRemaining = profile?.free_uses_remaining ?? 10;
  const usedAnalyses = 10 - freeUsesRemaining;

  return (
    <>
      <Head>
        <title>Account - Decodr</title>
        <meta name="description" content="Manage your Decodr account, subscription, and settings." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans">
        <Navbar session={session} />

        {showDeleteModal && (
          <DeleteConfirmModal
            onConfirm={handleDeleteAccount}
            onCancel={() => setShowDeleteModal(false)}
            loading={deleteLoading}
          />
        )}

        <main className="max-w-2xl mx-auto px-4 pt-24 pb-20">
          <a
            href="/app"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </a>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Account</h1>

          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {message.type === 'success' ? <Check className="w-5 h-5" /> :
               message.type === 'error' ? <X className="w-5 h-5" /> :
               <AlertTriangle className="w-5 h-5" />}
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto hover:opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {session.user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{session.user.email}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {isPremium ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">
                        <Crown className="w-3 h-3" />
                        Premium
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        Free Plan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Usage Stats Card - Only for free users */}
          {!isPremium && (
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  Usage Statistics
                </h3>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-700 font-medium">Free Analyses Used</span>
                    <span className="text-blue-600 font-bold">{usedAnalyses} / 10</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(usedAnalyses / 10) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {freeUsesRemaining > 0 
                      ? `${freeUsesRemaining} free ${freeUsesRemaining === 1 ? 'analysis' : 'analyses'} remaining`
                      : 'Upgrade to Premium for unlimited access'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                Subscription
              </h3>
              
              {isPremium ? (
                <div>
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 mb-4 border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Crown className="w-6 h-6 text-amber-600" />
                      <div>
                        <span className="font-semibold text-gray-900">Premium Plan</span>
                        <p className="text-sm text-gray-600">Unlimited message analysis</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Unlimited analyses</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Priority processing</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Advanced insights</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Cancel anytime</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Manage Subscription
                  </button>
                </div>
              ) : (
                <div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">Premium Plan</div>
                        <div className="text-sm text-gray-500">Best for power users</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">$9.99</div>
                        <div className="text-sm text-gray-500">per month</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Unlimited analyses</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>Priority support</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span>Advanced insights</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Gift className="w-4 h-4 text-purple-500" />
                        <span>Cancel anytime</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSubscribe}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Premium
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-red-100 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-3 px-4 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete My Account
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
