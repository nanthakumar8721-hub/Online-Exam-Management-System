import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Shield, Activity, Users, FileText, ArrowUpRight, CheckCircle, Clock, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const [stats, setStats] = useState({ sessions: 0, alerts: 0, activeExams: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, fetch from API
  }, []);

  const cards = [
    { name: 'Exams Monitored', value: stats.sessions, icon: Users, gradient: 'from-blue-600 to-indigo-600', trend: '+5' },
    { name: 'Security Alerts', value: stats.alerts, icon: Shield, gradient: 'from-rose-600 to-red-600', trend: 'Handled' },
    { name: 'Live Exams', value: stats.activeExams, icon: Activity, gradient: 'from-emerald-600 to-teal-600', trend: 'Live Now' },
    { name: 'Scheduled Exams', value: 8, icon: FileText, gradient: 'from-brand-600 to-indigo-600', trend: 'Upcoming', link: '/staff/schedules' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Staff Dashboard</h1>
          <p className="text-slate-500 font-medium">Monitor exams and manage questions</p>
        </div>
        <button
          onClick={() => navigate('/staff/monitor')}
          className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95 group"
        >
          <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
          Open Live Monitor
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

    </div>
  );
};

export default StaffDashboard;
