// pages/app.jsx (protected page)
import { useEffect, useState } from 'react';
import Head from 'next/head';
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
  Share2,
  Menu,
} from 'lucide-react';
import ChatWidget from '../components/ChatWidget';

const Navbar = ({ session, isPremium }) => (
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
        {isPremium && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">
            <Crown className="w-3 h-3" />
            Premium
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

const SamplePromptCard = ({ title, icon, prompt, onUse }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div 
      className="group relative bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer"
      onClick={onUse}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">{title}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-line overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>{prompt}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-blue-600 font-medium group-hover:text-blue-700">
          Click to use →
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all text-xs font-medium"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
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
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = async (token) => {
    setProfileLoading(true);
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
    } finally {
      setProfileLoading(false);
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

    // Wait for profile to load before checking limits
    if (profileLoading) {
      return;
    }

    // Check usage limits for non-premium users
    // Block if not premium and either no data or no uses left
    if (!isPremium && (freeUsesRemaining === null || freeUsesRemaining <= 0)) {
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

  // Sample prompts for empty state - with titles and icons
  const samplePrompts = [
    {
      title: "Relationship",
      icon: <Heart className="w-4 h-4 text-pink-500" />,
      prompt: "Him: 'I need some space right now'\nMe: 'Okay, take your time'\nHim: 'Thanks for understanding'"
    },
    {
      title: "Dating",
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      prompt: "Her: 'We should hang out sometime'\nMe: 'Yeah for sure! When are you free?'\nHer: 'I'll let you know'"
    },
    {
      title: "Work",
      icon: <Brain className="w-4 h-4 text-blue-500" />,
      prompt: "Boss: 'Can we chat later?'\nMe: 'Sure, is everything okay?'\nBoss: 'Yes, just want to discuss something'"
    }
  ];

  return (
    <>
      <Head>
        <title>Analyze Messages - Decodr</title>
        <meta name="description" content="Paste your conversation and get instant AI-powered analysis of emotions, hidden meanings, and smart reply suggestions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-blue-100">
        <Navbar session={session} isPremium={isPremium} />

        {showPaywall && (
          <PaywallModal
            onClose={() => setShowPaywall(false)}
            onSubscribe={handleSubscribe}
          />
        )}

        <main className="max-w-5xl mx-auto px-4 pt-24 pb-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analyze Your Conversation</h1>
            <p className="text-gray-500">Logged in as {session.user.email}</p>
            {!isPremium && freeUsesRemaining !== null && (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 shadow-sm">
                <Sparkles className="w-4 h-4" />
                {freeUsesRemaining > 0 
                  ? <span><span className="font-bold">{freeUsesRemaining}</span> free analyses remaining</span>
                  : <span>Upgrade to Premium for unlimited access</span>}
              </div>
            )}
            {isPremium && (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200 shadow-sm">
                <Crown className="w-4 h-4" />
                <span>Unlimited Premium Access</span>
              </div>
            )}
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 transform rotate-1 rounded-3xl opacity-50 blur-xl transition-all duration-500"></div>
            <div className="relative bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your conversation here..."
                className="w-full h-48 p-6 text-lg text-gray-700 placeholder:text-gray-400 focus:outline-none resize-none"
                disabled={analyzing}
              />
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium">
                    {input.length} characters
                  </span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
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
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 
                      ${analyzing || !input.trim()
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 shadow-lg shadow-gray-900/20 hover:scale-105 active:scale-95"
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
            
            {/* Sample prompts when empty */}
            {!input.trim() && !result && (
              <div className="mt-8">
                <div className="text-center mb-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Don&apos;t have a conversation handy?</h3>
                  <p className="text-sm text-gray-500">Try one of these examples — click to use or copy to clipboard</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {samplePrompts.map((item, idx) => (
                    <SamplePromptCard
                      key={idx}
                      title={item.title}
                      icon={item.icon}
                      prompt={item.prompt}
                      onUse={() => setInput(item.prompt)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-white/60 backdrop-blur-xl border border-blue-100 p-8 rounded-3xl shadow-lg shadow-blue-900/5 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl">
                    <Brain className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
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
              
              {/* Upgrade prompt for free users */}
              {!isPremium && freeUsesRemaining !== null && freeUsesRemaining <= 3 && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white text-center">
                  <Crown className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Loving the insights?</h3>
                  <p className="text-blue-100 mb-4">
                    {freeUsesRemaining > 0 
                      ? `You have ${freeUsesRemaining} free ${freeUsesRemaining === 1 ? 'analysis' : 'analyses'} left.`
                      : "You've used all your free analyses."}
                    {' '}Upgrade to Premium for unlimited access!
                  </p>
                  <button
                    onClick={handleSubscribe}
                    className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:scale-105 active:scale-95"
                  >
                    Go Premium — $9.99/month
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
        
        <ChatWidget />
      </div>
    </>
  );
}
