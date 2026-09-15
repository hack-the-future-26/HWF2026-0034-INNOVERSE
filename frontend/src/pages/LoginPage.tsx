import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, Layers } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const loggedUser = await login({ email, password });
      // Redirect based on role
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedUser.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/customer');
      }
    } catch {
      // Error handled in AuthContext
    }
  };

  return (
    <div className="max-w-md w-full mx-auto pt-8 pb-16">
      <div className="glass-panel-glow rounded-2xl p-8 shadow-2xl border border-slate-700/60">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 mb-2">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your Smart Queue account</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo login shortcuts */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-2">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Demo Credentials</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => { setEmail('john.doe@example.com'); setPassword('customer123'); }}
              className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 text-blue-300 rounded-lg border border-slate-700/50 transition text-[11px]"
            >
              Customer
            </button>
            <button
              onClick={() => { setEmail('sarah.jenkins@cityhospital.org'); setPassword('staff123'); }}
              className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 text-purple-300 rounded-lg border border-slate-700/50 transition text-[11px]"
            >
              Staff
            </button>
            <button
              onClick={() => { setEmail('admin@smartqueue.com'); setPassword('admin123'); }}
              className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 text-emerald-300 rounded-lg border border-slate-700/50 transition text-[11px]"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 font-semibold hover:underline">
            Register Customer Account
          </Link>
        </div>
      </div>
    </div>
  );
};
