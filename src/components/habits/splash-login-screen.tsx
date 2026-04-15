'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Eye, EyeOff, ArrowRight, Sparkles, BookOpen, Flame, Trophy, Mail, Lock, AtSign, Check, X as XIcon } from 'lucide-react';

interface SplashLoginScreenProps {
  onStartJourney: (data: { name: string; email: string; password: string; userId: string; gender: string; username: string }) => void;
  onLogin: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
}

type Tab = 'welcome' | 'signup' | 'signin' | 'reset';
type ResetStep = 'send-email' | 'enter-password';

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-medium text-foreground/80">{text}</span>
    </div>
  );
}

const inputCls =
  'w-full h-12 px-4 rounded-xl bg-muted/60 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all';

const labelCls = 'text-xs font-semibold text-foreground/70 uppercase tracking-wider';

function PrimaryBtn({
  children,
  loading,
  disabled,
  type = 'submit',
  form,
  onClick,
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: 'submit' | 'button';
  form?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      form={form}
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-60"
      style={{ background: '#C08552', color: '#fff' }}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
}

export function SplashLoginScreen({ onStartJourney, onLogin }: SplashLoginScreenProps) {
  const [tab, setTab] = useState<Tab>('welcome');

  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpGender, setSignUpGender] = useState('');
  const [showSignUpPass, setShowSignUpPass] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpAlreadyExists, setSignUpAlreadyExists] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPass, setShowSignInPass] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>('send-email');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('resetEmail');
    if (emailParam) {
      setResetEmail(decodeURIComponent(emailParam));
      setResetStep('enter-password');
      setTab('reset');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkUsername = async (username: string) => {
    const clean = username.trim().toLowerCase();
    if (clean.length < 3) { setUsernameAvailable(null); return; }
    setUsernameChecking(true);
    try {
      const res = await fetch(`/api/username-check?username=${encodeURIComponent(clean)}`);
      const json = await res.json().catch(() => ({}));
      setUsernameAvailable(json.available ?? null);
    } catch {
      setUsernameAvailable(null);
    }
    setUsernameChecking(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpAlreadyExists(false);
    if (!signUpName.trim()) return setSignUpError('Please enter your name.');
    const cleanUsername = signUpUsername.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) return setSignUpError('Please enter a username (at least 3 characters).');
    if (usernameAvailable === false) return setSignUpError('This username is already taken. Please choose another.');
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) return setSignUpError('Please enter a valid email.');
    if (signUpPassword.length < 6) return setSignUpError('Password must be at least 6 characters.');
    setSignUpLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', name: signUpName.trim(), email: signUpEmail.trim().toLowerCase(), password: signUpPassword, username: cleanUsername }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        if (data.field === 'username') {
          setSignUpError('This username is already taken. Please choose another.');
        } else {
          setSignUpAlreadyExists(true);
          setSignUpError('An account with this email already exists.');
        }
        setSignUpLoading(false);
        return;
      }
      if (!res.ok) { setSignUpError(data.error || 'Could not create your account.'); setSignUpLoading(false); return; }
      onStartJourney({ name: signUpName.trim(), email: signUpEmail.trim().toLowerCase(), password: signUpPassword, userId: data.userId, gender: signUpGender, username: cleanUsername });
    } catch {
      setSignUpError('Something went wrong. Please try again.');
    }
    setSignUpLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    if (!signInEmail.trim()) return setSignInError('Please enter your email.');
    if (!signInPassword) return setSignInError('Please enter your password.');
    setSignInLoading(true);
    const result = await onLogin({ email: signInEmail.trim().toLowerCase(), password: signInPassword });
    if (!result.success) setSignInError(result.error || 'Invalid email or password.');
    setSignInLoading(false);
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!resetEmail.trim() || !resetEmail.includes('@')) return setResetError('Please enter a valid email.');
    setResetLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResetError(data.error || 'No account found with this email.');
      } else {
        setResetStep('enter-password');
      }
    } catch {
      setResetError('Something went wrong. Please try again.');
    }
    setResetLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    if (resetPassword.length < 6) return setResetError('New password must be at least 6 characters.');
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', email: resetEmail.trim().toLowerCase(), password: resetPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResetError(data.error || 'Could not reset password.');
      } else {
        setResetSuccess('Password updated! Signing you in...');
        setTimeout(() => {
          setTab('signin');
          setSignInEmail(resetEmail.trim().toLowerCase());
          setSignInPassword('');
        }, 1800);
      }
    } catch {
      setResetError('Something went wrong. Please try again.');
    }
    setResetLoading(false);
  };

  const goToSignInWithEmail = () => {
    setSignInEmail(signUpEmail.trim().toLowerCase());
    setSignInError('');
    setTab('signin');
  };

  const goToForgotPassword = () => {
    setResetEmail(signInEmail);
    setResetStep('send-email');
    setResetError('');
    setResetSuccess('');
    setTab('reset');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex flex-col overflow-hidden bg-background"
    >
      <AnimatePresence mode="wait">

        {/* ─── Welcome ─────────────────────────── */}
        {tab === 'welcome' && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }} className="flex flex-col h-full">

            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-2 overflow-y-auto">
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
                className="relative w-52 h-52 mb-6"
              >
                <div className="absolute inset-0 rounded-3xl bg-primary/8" style={{ transform: 'rotate(-6deg) scale(1.08)' }} />
                <div className="absolute inset-0 rounded-3xl bg-primary/5" style={{ transform: 'rotate(3deg) scale(1.04)' }} />
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl bg-primary/10 flex items-center justify-center">
                  <Image src="/logo.png" alt="Nuviora" width={176} height={176} className="object-contain p-4" priority />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                className="text-center mb-5">
                <h1 className="text-3xl font-black gradient-text tracking-tight mb-1">Nuviora</h1>
                <p className="text-base text-muted-foreground font-medium">Track habits. Build streaks. Level up.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
                className="flex flex-wrap gap-2 justify-center">
                <FeaturePill icon={<Flame className="h-3 w-3" />} text="Streak tracking" />
                <FeaturePill icon={<BookOpen className="h-3 w-3" />} text="AI study plans" />
                <FeaturePill icon={<Trophy className="h-3 w-3" />} text="XP & rewards" />
                <FeaturePill icon={<Sparkles className="h-3 w-3" />} text="Aria AI coach" />
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
              className="px-6 pb-10 pt-4 flex flex-col gap-3 bg-background">
              <PrimaryBtn type="button" onClick={() => setTab('signup')}>
                Get Started <ArrowRight className="h-4 w-4" />
              </PrimaryBtn>
              <button onClick={() => setTab('signin')}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold border border-border bg-muted/40 text-foreground transition-all active:scale-[0.97]">
                Sign In
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ─── Sign Up ─────────────────────────── */}
        {tab === 'signup' && (
          <motion.div key="signup" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28 }} className="flex flex-col h-full">

            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--chart-2)))' }} />

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
              <button onClick={() => setTab('welcome')} className="text-xs text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors">
                ← Back
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground">Create Account</h2>
                  <p className="text-xs text-muted-foreground">Start your learning journey</p>
                </div>
              </div>

              <form id="signup-form" onSubmit={handleSignUp} className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Your Name</label>
                  <input type="text" placeholder="Arjun Sharma" value={signUpName}
                    onChange={e => setSignUpName(e.target.value)} className={inputCls} autoComplete="name" />
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="arjun_sharma"
                      value={signUpUsername}
                      onChange={e => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9_\.]/g, '');
                        setSignUpUsername(val);
                        setSignUpError('');
                        setUsernameAvailable(null);
                      }}
                      onBlur={() => checkUsername(signUpUsername)}
                      className={`${inputCls} pl-9 pr-9`}
                      autoComplete="username"
                      maxLength={20}
                    />
                    {usernameChecking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    )}
                    {!usernameChecking && usernameAvailable === true && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {!usernameChecking && usernameAvailable === false && (
                      <XIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                    )}
                  </div>
<<<<<<< HEAD
                  <p className="text-[11px] text-muted-foreground">Letters, numbers, _ and . only. Used for adding friends.</p>
=======
                  <p className="text-xs text-muted-foreground">Letters, numbers, _ and . only. Used for adding friends.</p>
>>>>>>> 925ef42 (Initial commit)
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>Email Address</label>
                  <input type="email" placeholder="arjun@example.com" value={signUpEmail}
                    onChange={e => { setSignUpEmail(e.target.value); setSignUpError(''); setSignUpAlreadyExists(false); }}
                    className={inputCls} autoComplete="email" />
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input type={showSignUpPass ? 'text' : 'password'} placeholder="At least 6 characters"
                      value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)}
                      className={`${inputCls} pr-11`} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowSignUpPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showSignUpPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ id: 'female', label: 'Female' }, { id: 'male', label: 'Male' }, { id: 'other', label: 'Rather not say' }].map(opt => (
                      <button key={opt.id} type="button" onClick={() => setSignUpGender(opt.id)}
                        className={`rounded-xl border py-2.5 text-xs font-semibold flex items-center justify-center transition-all ${signUpGender === opt.id ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-muted/30 text-muted-foreground'}`}>
                        <span className="leading-none">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {signUpError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-destructive/8 px-3 py-2.5">
                    <p className="text-xs text-destructive">{signUpError}</p>
                    {signUpAlreadyExists && (
                      <button type="button" onClick={goToSignInWithEmail}
                        className="mt-1.5 text-xs font-semibold text-primary underline underline-offset-2">
                        Sign in with this email instead →
                      </button>
                    )}
                  </motion.div>
                )}
              </form>

              <p className="text-center text-xs text-muted-foreground mt-4 pb-2">
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('signin')} className="text-primary font-semibold hover:underline">Sign In</button>
              </p>
            </div>

            {/* Sticky bottom button */}
            <div className="px-6 pt-3 pb-8 bg-background border-t border-border/30">
              <PrimaryBtn form="signup-form" type="submit" loading={signUpLoading}>
                Continue <ArrowRight className="h-4 w-4" />
              </PrimaryBtn>
            </div>
          </motion.div>
        )}

        {/* ─── Sign In ─────────────────────────── */}
        {tab === 'signin' && (
          <motion.div key="signin" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28 }} className="flex flex-col h-full">

            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--chart-2)), hsl(var(--primary)))' }} />

            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
              <button onClick={() => setTab('welcome')} className="text-xs text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors">
                ← Back
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground">Welcome Back</h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">Continue your streak <Flame className="h-3 w-3 text-amber-500 inline" /></p>
                </div>
              </div>

              <form id="signin-form" onSubmit={handleSignIn} className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Email Address</label>
                  <input type="email" placeholder="arjun@example.com" value={signInEmail}
                    onChange={e => { setSignInEmail(e.target.value); setSignInError(''); }}
                    className={inputCls} autoComplete="email" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelCls}>Password</label>
                    <button type="button" onClick={goToForgotPassword}
<<<<<<< HEAD
                      className="text-[11px] text-primary font-semibold hover:underline">
=======
                      className="text-xs text-primary font-semibold hover:underline">
>>>>>>> 925ef42 (Initial commit)
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showSignInPass ? 'text' : 'password'} placeholder="Your password"
                      value={signInPassword} onChange={e => setSignInPassword(e.target.value)}
                      className={`${inputCls} pr-11`} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowSignInPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showSignInPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {signInError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs text-destructive bg-destructive/8 px-3 py-2 rounded-lg">
                    {signInError}
                  </motion.p>
                )}
              </form>

              <p className="text-center text-xs text-muted-foreground mt-4 pb-2">
                No account?{' '}
                <button type="button" onClick={() => setTab('signup')} className="text-primary font-semibold hover:underline">Create one</button>
              </p>
            </div>

            {/* Sticky bottom button */}
            <div className="px-6 pt-3 pb-8 bg-background border-t border-border/30">
              <PrimaryBtn form="signin-form" type="submit" loading={signInLoading}>
                Continue <ArrowRight className="h-4 w-4" />
              </PrimaryBtn>
            </div>
          </motion.div>
        )}

        {/* ─── Forgot / Reset ──────────────────── */}
        {tab === 'reset' && (
          <motion.div key="reset" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28 }} className="flex flex-col h-full">

            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--chart-3)))' }} />

            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
              <button onClick={() => { setTab('signin'); setResetStep('send-email'); setResetError(''); setResetSuccess(''); }}
                className="text-xs text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors">
                ← Back to sign in
              </button>

              {resetStep === 'send-email' && (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-foreground">Forgot Password?</h2>
                      <p className="text-xs text-muted-foreground">Enter your email to continue</p>
                    </div>
                  </div>

                  <form id="reset-email-form" onSubmit={handleVerifyEmail} className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                      <label className={labelCls}>Email Address</label>
                      <input type="email" placeholder="arjun@example.com" value={resetEmail}
                        onChange={e => { setResetEmail(e.target.value); setResetError(''); }}
                        className={inputCls} autoComplete="email" autoFocus />
                    </div>

                    {resetError && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-xs text-destructive bg-destructive/8 px-3 py-2 rounded-lg">
                        {resetError}
                      </motion.p>
                    )}
                  </form>
                </>
              )}

              {resetStep === 'enter-password' && (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-foreground">New Password</h2>
                      <p className="text-xs text-muted-foreground">Set a new password for <strong>{resetEmail}</strong></p>
                    </div>
                  </div>

                  <form id="reset-pass-form" onSubmit={handlePasswordReset} className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                      <label className={labelCls}>Email Address</label>
                      <input type="email" value={resetEmail} readOnly
                        className={`${inputCls} opacity-50 cursor-not-allowed`} />
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelCls}>New Password</label>
                      <input type="password" placeholder="At least 6 characters" value={resetPassword}
                        onChange={e => setResetPassword(e.target.value)}
                        className={inputCls} autoComplete="new-password" autoFocus />
                    </div>

                    {resetError && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-xs text-destructive bg-destructive/8 px-3 py-2 rounded-lg">
                        {resetError}
                      </motion.p>
                    )}
                    {resetSuccess && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-xs text-emerald-600 bg-emerald-500/10 px-3 py-2 rounded-lg">
                        {resetSuccess}
                      </motion.p>
                    )}
                  </form>
                </>
              )}
            </div>

            {/* Sticky bottom button */}
            <div className="px-6 pt-3 pb-8 bg-background border-t border-border/30">
              {resetStep === 'send-email' ? (
                <PrimaryBtn form="reset-email-form" type="submit" loading={resetLoading}>
                  Continue <ArrowRight className="h-4 w-4" />
                </PrimaryBtn>
              ) : (
                <PrimaryBtn form="reset-pass-form" type="submit" loading={resetLoading}>
                  Continue <ArrowRight className="h-4 w-4" />
                </PrimaryBtn>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
