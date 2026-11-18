'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Zap, Lock, Mail, User, ArrowRight, CheckCircle2, Briefcase, Award } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [role, setRole] = useState<'freelancer' | 'client'>('freelancer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Escrow Protocols');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await signup({ name, email, password, role });
      if (res.success) {
        if (role === 'freelancer') {
          router.push('/dashboard/freelancer');
        } else {
          router.push('/dashboard/client');
        }
      } else {
        setError(res.error || 'Failed to create account');
      }
    } catch (err: any) {
      setError(err.message || 'Signup error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full max-w-lg space-y-6">
        
        <div className="p-8 rounded-3xl bg-[#0B0B0F]/90 border border-white/[0.1] shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 mb-2 shadow-neon-cyan">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Join GRAVITASS
            </h2>
            <p className="text-xs text-gray-400">
              The premier platform for high-velocity talent and hirers
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-3 mb-6 p-1 rounded-2xl bg-[#121218] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setRole('freelancer')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                role === 'freelancer'
                  ? 'bg-violet-600 text-white shadow-neon-violet'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>I'm a Freelancer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('client')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                role === 'client'
                  ? 'bg-cyan-600 text-white shadow-neon-cyan'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>I'm a Hirer / Client</span>
            </button>
          </div>

          {error && (
            <div className="p-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                {role === 'client' ? 'Company or Full Name' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={role === 'client' ? 'e.g. Aetheria Labs' : 'e.g. Elena Vance'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@organization.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-white/[0.2] bg-[#121218] text-violet-600 focus:ring-0"
              />
              <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer">
                I agree to the <span className="text-violet-400">Terms of Service</span> and <span className="text-violet-400">Escrow Security Protocols</span>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-neon-violet transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : `Register as ${role === 'client' ? 'Client' : 'Freelancer'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              Sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
