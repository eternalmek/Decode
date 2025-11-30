import React, { useState, useEffect } from "react";
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
  X,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import ChatWidget from "../components/ChatWidget";

/*
  Frontend page. Calls:
  - POST /api/analyze  { input }
  - POST /api/create-checkout-session  {}
  Expects environment variables on server: OPENAI_API_KEY, STRIPE_SECRET_KEY, STRIPE_PRICE_ID
  Client also needs NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for possible client-side usage (not required here).
*/

const Navbar = ({ setShowPricing, session, onLogout, isPremium }) => (
  <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => window.location.reload()}
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
        {session ? (
          <>
            <a
              href="/account"
              className="hidden sm:flex text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors items-center gap-1"
            >
              <User className="w-4 h-4" />
              Account
            </a>
            <button
              onClick={onLogout}
              className="hidden sm:block text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <a
              href="/login"
              className="hidden sm:block text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Login
            </a>
            <a
              href="/login?mode=signup"
              className="hidden sm:block text-white bg-blue-600 hover:bg-blue-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Sign up
            </a>
          </>
        )}
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <div className="text-center pt-24 pb-12 px-4">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-6">
      <Sparkles className="w-3 h-3" />
      AI-Powered Analysis
    </div>
    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
      Decode what they <br className="hidden md:block" />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
        actually mean.
      </span>
    </h1>
    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8">
      Paste any conversation. We analyze the emotions, detect red flags, and
      generate the perfect response instantly.
    </p>
  </div>
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
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <Lock className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium</h2>
            <p className="text-gray-600 mb-6">
              Unlock unlimited analysis, advanced detection, and priority processing.
              One plan only — $9.99 / month. Cancel anytime.
            </p>

            <div className="rounded-xl border p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Monthly subscription</div>
                <div className="text-2xl font-bold">$9.99 <span className="text-sm text-gray-500">/ month</span></div>
              </div>
              <div>
                <button
                  onClick={onSubscribe}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Subscribe $9.99 / mo
                </button>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              Secure payment via Stripe. You will be redirected to Stripe Checkout to complete the subscription.
            </div>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          Close
        </button>
      </div>
    </div>
  </div>
);

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [session, setSession] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [deletedMessage, setDeletedMessage] = useState(false);

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
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Check Supabase session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAccessToken(data.session?.access_token);
      if (data.session) {
        fetchProfile(data.session.access_token);
      }
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

    const stored = localStorage.getItem("decodr_usage");
    if (stored) setUsageCount(parseInt(stored, 10) || 0);

    // If Stripe redirected back with ?payment=success
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        setIsPremium(true);
        // remove query param from URL
        const url = new URL(window.location.href);
        url.searchParams.delete("payment");
        window.history.replaceState({}, document.title, url.toString());
      }
      // Check for deleted account message
      if (params.get("deleted") === "true") {
        setDeletedMessage(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("deleted");
        window.history.replaceState({}, document.title, url.toString());
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    if (!isPremium && usageCount >= 3) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);

      if (!isPremium) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem("decodr_usage", String(newCount));
      }
    } catch (err) {
      console.error("Analyze error:", err);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setResult(null);
    setInput("");
  };

  const handleSubscribe = async () => {
    // Redirect to login if not authenticated
    if (!session) {
      window.location.href = '/login';
      return;
    }
    
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
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Could not start checkout. Check server logs and environment variables.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-blue-100">
      <Navbar setShowPricing={setShowPaywall} session={session} onLogout={handleLogout} isPremium={isPremium} />

      {deletedMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-50 text-green-700 px-6 py-3 rounded-xl border border-green-200 shadow-lg flex items-center gap-3">
          <Check className="w-5 h-5" />
          <span>Your account has been deleted successfully.</span>
          <button onClick={() => setDeletedMessage(false)} className="hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onSubscribe={handleSubscribe}
        />
      )}

      <main className="max-w-5xl mx-auto px-4 pt-6 pb-20">
        {!result && <Hero />}

        <div className={`transition-all duration-500 ${result ? "pt-24" : ""}`}>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 transform rotate-1 rounded-3xl opacity-50 blur-xl transition-all duration-500 group-hover:opacity-75"></div>
            <div className="relative bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste the conversation here... (e.g. WhatsApp, iMessage, Instagram DM)"
                className="w-full h-48 p-6 text-lg text-gray-700 placeholder:text-gray-300 focus:outline-none resize-none"
                disabled={loading}
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
                    disabled={loading || !input.trim()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 
                      ${loading || !input.trim()
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gray-900 hover:bg-black shadow-lg shadow-gray-900/20 hover:scale-105 active:scale-95"
                      }`}
                  >
                    {loading ? (
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

            <div className="mt-12 text-center">
              <p className="text-gray-400 text-sm mb-2">Want to analyze another conversation?</p>
              <button
                onClick={() => setShowPaywall(true)}
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
              >
                Unlock Unlimited Access &rarr;
              </button>
            </div>
          </div>
        )}
      </main>
      <ChatWidget />
    </div>
  );
}