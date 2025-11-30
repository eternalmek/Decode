import React, { useState, useEffect } from "react";
import Head from "next/head";
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
  Gift,
  Star,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  Eye,
  Menu,
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

const Navbar = ({ session, onLogout, isPremium }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">
            Decodr.
          </span>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden sm:flex items-center gap-6">
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
                className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                Account
              </a>
              <button
                onClick={onLogout}
                className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                Login
              </a>
              <a
                href="/login?mode=signup"
                className="flex items-center gap-1.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-medium text-sm px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
              >
                <Gift className="w-4 h-4" />
                Get 10 Free
              </a>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-100 px-4 py-3 space-y-3">
          {session ? (
            <>
              <a href="/account" className="flex items-center gap-2 text-gray-600 py-2">
                <User className="w-4 h-4" />
                Account
              </a>
              <button onClick={onLogout} className="flex items-center gap-2 text-gray-600 py-2 w-full text-left">
                Log out
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="block text-gray-600 py-2">Login</a>
              <a 
                href="/login?mode=signup" 
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-medium"
              >
                <Gift className="w-4 h-4" />
                Get 10 Free Analyses
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const Hero = ({ session }) => (
  <div className="text-center pt-24 pb-12 px-4">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-6 border border-blue-100">
      <Sparkles className="w-3 h-3" />
      AI-Powered Analysis • Trusted by 10,000+ Users
    </div>
    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
      Stop Overthinking. <br className="hidden md:block" />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
        Start Understanding.
      </span>
    </h1>
    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8">
      Paste any text conversation and get instant AI analysis of emotions, red flags, 
      and <span className="font-semibold text-gray-700">perfect replies</span> in seconds.
    </p>
    {!session && (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <a
          href="/login?mode=signup"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 text-lg"
        >
          <Gift className="w-5 h-5" />
          Start Free — 10 Analyses Included
        </a>
      </div>
    )}
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
      <span className="flex items-center gap-1.5">
        <Check className="w-4 h-4 text-green-500" />
        No credit card required
      </span>
      <span className="flex items-center gap-1.5">
        <Check className="w-4 h-4 text-green-500" />
        Results in seconds
      </span>
      <span className="flex items-center gap-1.5">
        <Check className="w-4 h-4 text-green-500" />
        100% private
      </span>
    </div>
  </div>
);

const SignupBanner = ({ usageCount }) => (
  <div className="max-w-3xl mx-auto mb-8 px-4">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">You&apos;ve used {usageCount} of 3 free analyses</span>
            </div>
            <p className="text-blue-100 text-sm">
              Create a free account to unlock <span className="font-bold text-white">10 more analyses</span> instantly!
            </p>
          </div>
          <a
            href="/login?mode=signup"
            className="flex-shrink-0 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            Get 10 Free Now →
          </a>
        </div>
      </div>
    </div>
  </div>
);

const Testimonials = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
      What Our Users Say
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        {
          text: "This literally saved my relationship. I finally understood what my partner was actually trying to tell me.",
          name: "Sarah M.",
          role: "Used for texting"
        },
        {
          text: "I use this before responding to important work emails. The suggested replies are always professional and on point.",
          name: "James K.",
          role: "Professional user"
        },
        {
          text: "The emotion breakdown is scary accurate. It helped me realize I was misreading signals completely.",
          name: "Alex T.",
          role: "Dating app user"
        }
      ].map((testimonial, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50">
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">&quot;{testimonial.text}&quot;</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {testimonial.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
              <div className="text-gray-500 text-xs">{testimonial.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HowItWorks = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
      How It Works
    </h2>
    <p className="text-gray-500 text-center mb-8">Get insights in 3 simple steps</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        {
          step: "1",
          icon: <Copy className="w-6 h-6 text-blue-600" />,
          title: "Paste Your Conversation",
          description: "Copy any text from WhatsApp, iMessage, Instagram, or any chat app"
        },
        {
          step: "2",
          icon: <Brain className="w-6 h-6 text-indigo-600" />,
          title: "AI Analyzes It",
          description: "Our AI detects emotions, hidden meanings, and communication patterns"
        },
        {
          step: "3",
          icon: <Zap className="w-6 h-6 text-amber-600" />,
          title: "Get Smart Replies",
          description: "Receive 4 tailored response suggestions for any situation"
        }
      ].map((item, idx) => (
        <div key={idx} className="text-center relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {item.step}
          </div>
          <div className="bg-white p-6 pt-8 rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              {item.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  
  const faqs = [
    {
      question: "Is my conversation data private and secure?",
      answer: "Absolutely. We don't store your conversations. They're processed in real-time and immediately discarded. Your data never touches our servers permanently."
    },
    {
      question: "How accurate is the AI analysis?",
      answer: "Our AI is trained on millions of conversation patterns and achieves high accuracy in detecting emotions and communication styles. The more context you provide, the better the analysis."
    },
    {
      question: "Can I cancel my premium subscription anytime?",
      answer: "Yes! You can cancel your Premium subscription at any time from your account page. No questions asked, no hidden fees."
    },
    {
      question: "What types of conversations can I analyze?",
      answer: "You can analyze any text-based conversation — texts, WhatsApp messages, Instagram DMs, emails, Slack messages, dating app chats, and more."
    }
  ];
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">{faq.question}</span>
              {openIndex === idx ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-white py-12 mt-16">
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">Decodr.</span>
        </div>
        <div className="flex items-center gap-6 text-gray-400 text-sm">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            Private & Secure
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            SSL Encrypted
          </span>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Decodr. All rights reserved.
      </div>
    </div>
  </footer>
);

const SocialProof = () => (
  <div className="max-w-3xl mx-auto px-4 py-8">
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        ))}
        <span className="ml-2 font-semibold text-gray-900">4.9/5</span>
      </div>
      <p className="text-gray-600 text-center text-sm mb-4">
        Trusted by <span className="font-semibold text-gray-900">10,000+</span> users for understanding their messages better
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-gray-500 text-xs">
        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Private &amp; Secure</span>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Instant Analysis</span>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
          <Brain className="w-4 h-4 text-blue-500" />
          <span>AI-Powered</span>
        </div>
      </div>
    </div>
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

const PaywallModal = ({ onClose, onSubscribe, session }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="p-8">
        {!session ? (
          /* Not logged in - prompt to sign up for free trials */
          <div className="text-center">
            <div className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mb-6">
              <Gift className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Want More Free Analyses?</h2>
            <p className="text-gray-600 mb-6">
              Create a free account and get <span className="font-bold text-blue-600">10 analyses</span> on us!
              No credit card required.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>10 free analyses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Full AI insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Smart replies</span>
                </div>
              </div>
            </div>

            <a
              href="/login?mode=signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 mb-4"
            >
              <Gift className="w-5 h-5" />
              Sign Up Free
            </a>
            
            <div className="border-t border-gray-100 pt-6 mt-6">
              <p className="text-gray-500 text-sm mb-4">Already have an account?</p>
              <a
                href="/login"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Log in here →
              </a>
            </div>
          </div>
        ) : (
          /* Logged in but out of trials - prompt to subscribe */
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
        )}

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2">
          <X className="w-5 h-5" />
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

    // For authenticated users, use server-side usage tracking
    // For unauthenticated users, use localStorage tracking
    if (session) {
      // Wait for profile to load before checking limits
      if (profileLoading) {
        return;
      }
      // Server will enforce usage limits for authenticated users
      // Check if user has exhausted free uses (not premium and either no data or no uses left)
      if (!isPremium && (freeUsesRemaining === null || freeUsesRemaining <= 0)) {
        setShowPaywall(true);
        return;
      }
    } else {
      // Use localStorage for unauthenticated users
      if (!isPremium && usageCount >= 3) {
        setShowPaywall(true);
        return;
      }
    }

    setLoading(true);
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
          setLoading(false);
          return;
        }
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);

      // Update usage count
      if (!isPremium) {
        if (session && freeUsesRemaining !== null) {
          // Decrement local state for authenticated users
          setFreeUsesRemaining(freeUsesRemaining - 1);
        } else {
          // Use localStorage for unauthenticated users
          const newCount = usageCount + 1;
          setUsageCount(newCount);
          localStorage.setItem("decodr_usage", String(newCount));
        }
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
    <>
      <Head>
        <title>Decodr - AI-Powered Message Analyzer | Decode What They Really Mean</title>
        <meta name="description" content="Paste any conversation and get instant AI analysis of emotions, hidden meanings, and perfect reply suggestions. Free to try, no credit card required." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Decodr - AI-Powered Message Analyzer" />
        <meta property="og:description" content="Stop overthinking your messages. Get instant AI analysis and smart reply suggestions." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-blue-100">
        <Navbar session={session} onLogout={handleLogout} isPremium={isPremium} />

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
            session={session}
          />
        )}

        <main className="max-w-5xl mx-auto px-4 pt-6 pb-20">
          {!result && <Hero session={session} />}
          {!result && !session && <SocialProof />}
          {!result && !session && usageCount > 0 && usageCount < 3 && <SignupBanner usageCount={usageCount} />}

        <div className={`transition-all duration-500 ${result ? "pt-24" : ""}`}>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 transform rotate-1 rounded-3xl opacity-50 blur-xl transition-all duration-500 group-hover:opacity-75"></div>
            <div className="relative bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your conversation here..."
                className="w-full h-48 p-6 text-lg text-gray-700 placeholder:text-gray-400 focus:outline-none resize-none"
                disabled={loading}
              />
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium">
                    {input.length} characters
                  </span>
                  {!input.trim() && !result && (
                    <span className="text-xs text-blue-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Try pasting a text conversation
                    </span>
                  )}
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
                    disabled={loading || !input.trim()}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 
                      ${loading || !input.trim()
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 shadow-lg shadow-gray-900/20 hover:scale-105 active:scale-95"
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
              {!session ? (
                <>
                  <p className="text-gray-500 text-sm mb-3">Love the analysis?</p>
                  <a
                    href="/login?mode=signup"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95"
                  >
                    <Gift className="w-5 h-5" />
                    Sign Up &amp; Get 10 Free Analyses
                  </a>
                </>
              ) : !isPremium ? (
                <>
                  <p className="text-gray-400 text-sm mb-2">
                    {freeUsesRemaining !== null && freeUsesRemaining > 0 
                      ? <span>Used <span className="font-bold text-gray-600">{10 - freeUsesRemaining}/10</span> free analyses</span>
                      : 'Want unlimited access?'}
                  </p>
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                  >
                    Go Premium for Unlimited Access →
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}
        
        {/* Additional sections for non-logged users */}
        {!result && !session && (
          <>
            <HowItWorks />
            <Testimonials />
            <FAQSection />
          </>
        )}
      </main>
      
      <Footer />
      <ChatWidget />
    </div>
    </>
  );
}