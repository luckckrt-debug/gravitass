'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/dashboard/freelancer');
      } else {
        setError(res.error || 'Failed to authenticate');
      }
    } catch (err: any) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, targetPath: string) => {
    setError('');
    setLoading(true);
    const res = await login(demoEmail, 'password123');
    if (res.success) {
      router.push(targetPath);
    } else {
      setError(res.error || 'Quick login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full max-w-md space-y-6">
        
        {/* Card */}
        <div className="p-8 rounded-3xl bg-[#0B0B0F]/90 border border-white/[0.1] shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 mb-2 shadow-neon-violet">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Access GRAVITASS
            </h2>
            <p className="text-xs text-gray-400">
              Enter your credentials to enter the talent network
            </p>
          </div>

          {error && (
            <div className="p-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-[11px] text-violet-400 hover:text-violet-300">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-neon-violet transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Testing */}
          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider text-center mb-3">
              One-Click Demo Roles
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('freelancer@gravitass.com', '/dashboard/freelancer')}
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-violet-600/20 border border-white/[0.08] text-center transition-colors group"
              >
                <UserCheck className="w-4 h-4 text-violet-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-gray-200 block">Freelancer</span>
                <span className="text-[9px] text-gray-500">Elena Vance</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('client@gravitass.com', '/dashboard/client')}
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-cyan-600/20 border border-white/[0.08] text-center transition-colors group"
              >
                <Briefcase className="w-4 h-4 text-cyan-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-gray-200 block">Client</span>
                <span className="text-[9px] text-gray-500">Aetheria</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@gravitass.com', '/admin')}
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-amber-600/20 border border-white/[0.08] text-center transition-colors group"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-gray-200 block">Admin</span>
                <span className="text-[9px] text-gray-500">Gravitass Ops</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-violet-400 hover:text-violet-300 font-semibold">
              Create account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
