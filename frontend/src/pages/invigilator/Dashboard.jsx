import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Shield, Activity, Users, FileText, ArrowUpRight, CheckCircle, Clock, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const [stats, setStats] = useState({ sessions: 45, alerts: 12, activeExams: 3 });
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, fetch from API
    setStats({ sessions: 45, alerts: 12, activeExams: 3 });
  }, []);

  const cards = [
    { name: 'Supervised', value: stats.sessions, icon: Users, gradient: 'from-blue-600 to-indigo-600', trend: '+5' },
    { name: 'Security Alerts', value: stats.alerts, icon: Shield, gradient: 'from-rose-600 to-red-600', trend: 'Handled' },
    { name: 'Active Sessions', value: stats.activeExams, icon: Activity, gradient: 'from-emerald-600 to-teal-600', trend: 'Live Now' },
    { name: 'Assessments', value: 8, icon: FileText, gradient: 'from-brand-600 to-indigo-600', trend: 'Queue', link: '/staff/schedules' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Staff Terminal</h1>
          <p className="text-slate-500 font-medium">Session supervision and integrity control</p>
        </div>
        <button
          onClick={() => navigate('/staff/monitor')}
          className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95 group"
        >
          <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
          Initialize Live Monitor
          <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} onClick={() => card.link ? navigate(card.link) : null} className={`glass-premium p-8 rounded-[36px] overflow-hidden group hover:-translate-y-1 transition-all ${card.link ? 'cursor-pointer border-brand-500/20 hover:border-brand-500/50' : ''}`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-xl shadow-current/20 group-hover:rotate-6 transition-transform`}>
                <card.icon size={28} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/50 border border-white/40 px-3 py-1.5 rounded-full text-slate-600">
                {card.trend}
              </span>
            </div>
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">{card.name}</h3>
            <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-premium rounded-[40px] p-10">
          <h3 className="font-black text-2xl mb-8 flex items-center gap-3 text-slate-900">
            <Zap className="text-brand-600" /> Operational Log
          </h3>
          <div className="space-y-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-5 p-5 bg-white/40 rounded-[28px] border border-white/20 hover:bg-white/60 transition-all group">
                <div className="w-12 h-12 rounded-[18px] bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <CheckCircle size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 text-sm tracking-tight uppercase">Session Verified: Grid-742</h4>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest leading-none">Quantum Physics Final • 24 Users • No Breaches</p>
                </div>
                <div className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">{i * 2}h ago</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-premium rounded-[40px] p-10 flex flex-col gap-8">
          <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tighter italic">Quick Command</h3>
          <div className="space-y-4">
            <button onClick={() => navigate('/staff/questions')} className="w-full flex items-center justify-between p-6 bg-slate-900 text-white rounded-[32px] hover:bg-brand-600 transition-all group shadow-xl shadow-slate-200">
              <span className="font-black text-xs uppercase tracking-widest">Inject Logic</span>
              <Zap size={20} className="text-brand-400 group-hover:scale-125 transition-transform" />
            </button>
            <button onClick={() => navigate('/staff/monitor')} className="w-full flex items-center justify-between p-6 bg-white border-2 border-slate-100 text-slate-900 rounded-[32px] hover:border-rose-200 hover:bg-rose-50 transition-all group shadow-sm">
              <span className="font-black text-xs uppercase tracking-widest">Live Monitor</span>
              <Shield size={20} className="text-rose-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
          <div className="bg-slate-900/5 rounded-3xl p-6 flex gap-4 text-slate-600 border border-slate-900/5 mt-auto">
            <Clock size={24} className="shrink-0 text-slate-400" />
            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-tight">Sync Status: **Grid Stable**. Protocols await injection for upcoming windows.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
