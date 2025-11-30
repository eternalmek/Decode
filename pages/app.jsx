// pages/app.jsx (protected page)
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  MessageSquare,
  Brain,
  Sparkles,
  Lock,
  Check,
  ArrowRight,
  ShieldAlert,
  Heart,
  Zap,
  Copy,
  User,
  Crown,
  Gift,
  Shield,
  X,
} from 'lucide-react';

const Navbar = ({ session, setShowPricing, isPremium, freeUsesRemaining }) => (
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
        {!isPremium && (
          <button
            onClick={() => setShowPricing(true)}
            className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
          >
            Pricing
          </button>
        )}
        {isPremium && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">
            <Crown className="w-3 h-3" />
            Premium
          </span>
        )}
        {!isPremium && freeUsesRemaining !== null && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
            <Gift className="w-3 h-3" />
            {freeUsesRemaining} free left
          </span>
        )}
        <a
          href="/account"
          className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors flex items-center gap-1"
        >
          <User className="w-4 h-4" />
          Account
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

const EmotionCard = ({ label, value }) => {
  const getColor = (val) => {
    const v = String(val).toLowerCase();
    if (v.includes("high") || v.includes("severe")) return "bg-red-100 text-red-700 border-red-200";
    if (v.includes("moderate")) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
      <span className="text-sm font-medium text-gray-600 capitalize">{label.replace(/_/g, " ")}</span>
      <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getColor(value)}`}>{value}</span>
    </div>
  );
};

const ReplyCard = ({ type, text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    switch (type) {
      case "calm_reply":
        return <Brain className="w-4 h-4 text-blue-500" />;
      case "confident_reply":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "flirty_reply":
        return <Heart className="w-4 h-4 text-pink-500" />;
      case "boundaries_reply":
        return <ShieldAlert className="w-4 h-4 text-gray-800" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="group relative bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="flex items-center gap-2 mb-3">
        {getIcon()}
        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
          {type.replace("_reply", "")}
        </span>
      </div>
      <p className="text-gray-800 leading-relaxed mb-4">{text}</p>
      <button
        onClick={handleCopy}
        className="absolute bottom-4 right-4 p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

const PaywallModal = ({ onClose, onSubscribe }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl">
            <Crown className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Go Premium</h2>
            <p className="text-gray-600 mb-6">
              You&apos;ve used all your free analyses. Upgrade to Premium for unlimited access!
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">Unlimited message analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">Advanced emotion detection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">Priority AI processing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">Cancel anytime</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div>
                <div className="text-sm text-gray-500">Monthly subscription</div>
                <div className="text-2xl font-bold">$9.99 <span className="text-sm text-gray-500 font-normal">/ month</span></div>
              </div>
              <div>
                <button
                  onClick={onSubscribe}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95"
                >
                  Subscribe Now
                </button>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Secure payment via Stripe. Cancel anytime.
            </div>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

export default function AppPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [freeUsesRemaining, setFreeUsesRemaining] = useState(null);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch('/api/get-profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const profile = await res.json();
        setIsPremium(profile.plan === 'premium');
        if (profile.free_uses_remaining !== undefined) {
          setFreeUsesRemaining(profile.free_uses_remaining);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAccessToken(data.session?.access_token);
      if (data.session) {
        fetchProfile(data.session.access_token);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAccessToken(session?.access_token);
      if (session) {
        fetchProfile(session.access_token);
      }
    });

    // If Stripe redirected back with ?payment=success
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        setIsPremium(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("payment");
        window.history.replaceState({}, document.title, url.toString());
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    // Check usage limits for non-premium users
    if (!isPremium && freeUsesRemaining !== null && freeUsesRemaining <= 0) {
      setShowPaywall(true);
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const headers = { "Content-Type": "application/json" };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({ input }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.code === "TRIAL_LIMIT_REACHED") {
          setShowPaywall(true);
          setAnalyzing(false);
          return;
        }
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);

      // Decrement local state for usage tracking
      if (!isPremium && freeUsesRemaining !== null) {
        setFreeUsesRemaining(freeUsesRemaining - 1);
      }
    } catch (err) {
      console.error("Analyze error:", err);
      alert("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setResult(null);
    setInput("");
  };

  const handleSubscribe = async () => {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to create checkout session");
      }
      const { url } = await res.json();
      if (!url) throw new Error("No checkout url returned");
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Could not start checkout. Check server logs and environment variables.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 w-full max-w-md text-center">
          <div className="p-3 bg-indigo-50 rounded-2xl inline-block mb-4">
            <Lock className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to use this page.
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-blue-100">
      <Navbar session={session} setShowPricing={setShowPaywall} isPremium={isPremium} freeUsesRemaining={freeUsesRemaining} />

      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onSubscribe={handleSubscribe}
        />
      )}

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Decodr</h1>
          <p className="text-gray-500">You are logged in as {session.user.email}</p>
          {!isPremium && freeUsesRemaining !== null && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
              <Gift className="w-4 h-4" />
              {freeUsesRemaining > 0 
                ? `${freeUsesRemaining} free ${freeUsesRemaining === 1 ? 'analysis' : 'analyses'} remaining`
                : 'No free analyses left'}
            </div>
          )}
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 transform rotate-1 rounded-3xl opacity-50 blur-xl transition-all duration-500"></div>
          <div className="relative bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste the conversation here... (e.g. WhatsApp, iMessage, Instagram DM)"
              className="w-full h-48 p-6 text-lg text-gray-700 placeholder:text-gray-300 focus:outline-none resize-none"
              disabled={analyzing}
            />
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
              <span className="text-xs text-gray-400 font-medium">
                {input.length} characters
              </span>
              <div className="flex gap-3">
                {result && (
                  <button
                    onClick={clearAnalysis}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !input.trim()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 
                    ${analyzing || !input.trim()
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gray-900 hover:bg-black shadow-lg shadow-gray-900/20 hover:scale-105 active:scale-95"
                    }`}
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Message
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white/60 backdrop-blur-xl border border-blue-100 p-8 rounded-3xl shadow-lg shadow-blue-900/5 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                  <Brain className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">The Hidden Meaning</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">{result.hidden_meaning}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Emotional Analysis</h3>
                <div className="grid grid-cols-1 gap-3">
                  {result.emotion_breakdown &&
                    Object.entries(result.emotion_breakdown).map(([key, value]) => (
                      <EmotionCard key={key} label={key} value={value} />
                    ))}
                </div>
              </div>

              <div className="md:col-span-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Recommended Replies</h3>
                <div className="grid grid-cols-1 gap-4">
                  {result.recommended_replies &&
                    Object.entries(result.recommended_replies).map(([key, value]) => (
                      <ReplyCard key={key} type={key} text={value} />
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
