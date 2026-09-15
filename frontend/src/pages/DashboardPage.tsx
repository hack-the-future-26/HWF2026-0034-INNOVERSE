import React from 'react';
import { HealthCard } from '../components/HealthCard';
import { CheckCircle2, Server, Database, Brain, Network, ShieldCheck, Terminal } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
          Smart Queue Management Architecture
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Full-Stack decoupled setup verified with React TypeScript Frontend, FastAPI Backend, SQLAlchemy PostgreSQL, and ML Service architecture.
        </p>
      </div>

      {/* Live API Health Check & Connection verification */}
      <HealthCard />

      {/* Architecture verification Checklist */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="glass-panel rounded-xl p-5 space-y-3 border border-slate-800">
          <div className="flex items-center space-x-2 text-blue-400 font-semibold text-sm">
            <Server className="w-4 h-4" />
            <span>Frontend Architecture</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>React 19 + TypeScript + Vite Configured</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Tailwind CSS & Glassmorphism UI tokens</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Axios REST client & Interceptors ready</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Modular layout (components, pages, services, hooks)</span>
            </li>
          </ul>
        </div>

        <div className="glass-panel rounded-xl p-5 space-y-3 border border-slate-800">
          <div className="flex items-center space-x-2 text-purple-400 font-semibold text-sm">
            <Database className="w-4 h-4" />
            <span>Backend & DB Architecture</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>FastAPI Modular app (`app/main.py`)</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>SQLAlchemy Base & PostgreSQL session management</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Pydantic schemas & Routers structure</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>CORS Middleware allowing cross-origin requests</span>
            </li>
          </ul>
        </div>

        <div className="glass-panel rounded-xl p-5 space-y-3 border border-slate-800">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
            <Brain className="w-4 h-4" />
            <span>AI / ML Service</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Dedicated ML Service microservice (`ml-service/`)</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Pandas, NumPy, Scikit-Learn integration ready</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Prediction & Training engine scaffold</span>
            </li>
          </ul>
        </div>

        <div className="glass-panel rounded-xl p-5 space-y-3 border border-slate-800">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
            <Network className="w-4 h-4" />
            <span>WebSockets & JWT Authentication</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>WebSocket ConnectionManager implementation</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>AuthContext & JWT auth handler setup</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Environment configuration (`.env.example`)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
