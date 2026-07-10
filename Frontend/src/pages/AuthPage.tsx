import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Mail, User, Lock, CheckCircle, AlertCircle } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';
type Page = 'landing' | 'login' | 'register' | 'forgot' | 'dashboard';

interface Props {
  mode: AuthMode;
  onNavigate: (page: Page) => void;
  onAuthSuccess: () => void;
}

export default function AuthPage({ mode, onNavigate, onAuthSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    onAuthSuccess();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (username.length < 3) { setError('Username must be at least 3 characters.'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setLoading(false); setError(error.message); return; }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: username.toLowerCase().trim(),
        full_name: null,
        sport_focus: null,
        role: 'athlete',
      });
      if (profileError) { setLoading(false); setError(profileError.message); return; }
    }
    setLoading(false);
    onAuthSuccess();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess('Password reset link sent! Check your email inbox.');
  };

  const titles: Record<AuthMode, string> = {
    login: 'Welcome Back',
    register: 'Join DSTA Platform',
    forgot: 'Reset Password',
  };

  const subtitles: Record<AuthMode, string> = {
    login: 'Sign in to your athlete profile',
    register: 'Create your athlete profile today',
    forgot: 'Enter your email to receive a reset link',
  };

  return (
    <div className="min-h-screen bg-[#080d14] flex">
      {/* Left panel - background image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/back_ground_image.jpg"
          alt="Athlete background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080d14]/70 via-[#080d14]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080d14]/80 via-transparent to-[#080d14]/30" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to home</span>
          </button>
          <div>
            <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
              Smart India Hackathon
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-3 leading-tight">
              Village Grounds to<br />
              <span className="text-cyan-400">National Glory</span>
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              AI-powered sports talent assessment bringing professional analytics to every athlete, everywhere.
            </p>
            <div className="mt-6 flex gap-4">
              {['Created by Ravin', 'AI-Powered', 'Bias-Free'].map((tag) => (
                <span key={tag} className="text-xs bg-white/10 text-white/70 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Mobile back button */}
        <div className="lg:hidden absolute top-6 left-6">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Home</span>
          </button>
        </div>

        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/WhatsApp_Image_2026-06-14_at_6.48.44_PM.jpeg" alt="Ravin Sports" className="w-11 h-11 rounded-xl object-cover" />
            <div>
              <span className="text-base font-bold text-white block leading-tight">DSTA</span>
              <span className="text-xs text-gray-500">Democratizing Sports Talent Assessment</span>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-2">{titles[mode]}</h1>
          <p className="text-gray-400 mb-8">{subtitles[mode]}</p>

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 mb-6">
              <CheckCircle size={16} className="flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-[#0d1520] border border-white/10 focus:border-cyan-500/50 outline-none text-white placeholder-gray-600 rounded-xl pl-11 pr-4 py-3.5 text-sm transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#0d1520] border border-white/10 focus:border-cyan-500/50 outline-none text-white placeholder-gray-600 rounded-xl pl-11 pr-12 py-3.5 text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <img
                      src={showPassword ? '/eye_open.png' : '/eye_closed.png'}
                      alt={showPassword ? 'Hide password' : 'Show password'}
                      className="w-6 h-6 object-contain"
                    />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                  <input type="checkbox" className="accent-cyan-500" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot')}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-500/20 text-sm"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => onNavigate('register')} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Create account
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="athletehandle"
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="[a-zA-Z0-9_]+"
                    title="Only letters, numbers, and underscores"
                    className="w-full bg-[#0d1520] border border-white/10 focus:border-cyan-500/50 outline-none text-white placeholder-gray-600 rounded-xl pl-11 pr-4 py-3.5 text-sm transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-[#0d1520] border border-white/10 focus:border-cyan-500/50 outline-none text-white placeholder-gray-600 rounded-xl pl-11 pr-4 py-3.5 text-sm transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="w-full bg-[#0d1520] border border-white/10 focus:border-cyan-500/50 outline-none text-white placeholder-gray-600 rounded-xl pl-11 pr-12 py-3.5 text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <img
                      src={showPassword ? '/eye_open.png' : '/eye_closed.png'}
                      alt={showPassword ? 'Hide password' : 'Show password'}
                      className="w-6 h-6 object-contain"
                    />
                  </button>
                </div>
                {password && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          password.length >= level * 3
                            ? password.length >= 12
                              ? 'bg-green-500'
                              : password.length >= 8
                              ? 'bg-cyan-500'
                              : 'bg-yellow-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full bg-[#0d1520] border border-white/10 focus:border-cyan-500/50 outline-none text-white placeholder-gray-600 rounded-xl pl-11 pr-12 py-3.5 text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <img
                      src={showConfirm ? '/eye_open.png' : '/eye_closed.png'}
                      alt={showConfirm ? 'Hide password' : 'Show password'}
                      className="w-6 h-6 object-contain"
                    />
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-500/20 text-sm"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button type="button" onClick={() => onNavigate('login')} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              {!success && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full bg-[#0d1520] border border-white/10 focus:border-cyan-500/50 outline-none text-white placeholder-gray-600 rounded-xl pl-11 pr-4 py-3.5 text-sm transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-500/20 text-sm"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </>
              )}
              <p className="text-center text-sm text-gray-500">
                Remember your password?{' '}
                <button type="button" onClick={() => onNavigate('login')} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Back to sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
