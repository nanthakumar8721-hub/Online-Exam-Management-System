import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, FileText, CheckCircle, BarChart3, Clock, ArrowUpRight, TrendingUp, Activity, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, exams: 0, results: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [u, e, r] = await Promise.all([
          api.get('/auth/users'),
          api.get('/exams'),
          api.get('/results')
        ]);
        setStats({
          users: u.data?.count || 0,
          exams: e.data?.count || 0,
          results: r.data?.count || 0
        });
      } catch (err) {
        setStats({ users: 0, exams: 0, results: 0 });
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { name: 'Total Students', value: stats.users, icon: Users, gradient: 'from-indigo-600 to-blue-600', trend: '+12.5%' },
    { name: 'Active Exams', value: stats.exams, icon: FileText, gradient: 'from-brand-600 to-indigo-600', trend: '+2' },
    { name: 'Tests Completed', value: stats.results, icon: CheckCircle, gradient: 'from-emerald-600 to-teal-600', trend: '+24%' },
    { name: 'Avg. Success', value: '78.4%', icon: TrendingUp, gradient: 'from-orange-600 to-amber-600', trend: '+3.2%' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Admin Dashboard</h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Platform statistics and overview</p>
        </div>
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-sm">
          <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg">Real-time</div>
          <div className="px-4 py-2 text-slate-500 text-sm font-bold">Historical</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="glass-premium p-8 rounded-[36px] overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-xl shadow-current/20 group-hover:scale-110 transition-transform`}>
                <card.icon size={28} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{card.trend}</span>
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest">{card.name}</h3>
            <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{card.value}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;
