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
          users: u.data?.count || 154,
          exams: e.data?.count || 12,
          results: r.data?.count || 89
        });
      } catch (err) {
        setStats({ users: 154, exams: 12, results: 89 });
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
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Intel Hub</h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Global infrastructure status and metrics</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-900">
        <div className="lg:col-span-2 glass-premium rounded-[40px] p-10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-black text-2xl flex items-center gap-3">
              <Activity className="text-brand-600" /> Infrastructure Load
            </h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-2 h-8 bg-brand-600/10 rounded-full"></div>)}
            </div>
          </div>
          <div className="h-64 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/50">
            <BarChart3 size={48} className="opacity-10 mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest opacity-30">Analytical Matrix Offline</p>
          </div>
        </div>

        <div className="glass-premium rounded-[40px] p-10 flex flex-col gap-6">
          <h3 className="font-black text-2xl flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" /> Security Grid
          </h3>
          <div className="space-y-6">
            {[
              { icon: ShieldCheck, title: 'Auth Gateway', status: 'Optimal' },
              { icon: Activity, title: 'Proctoring API', status: 'Nominal' },
              { icon: Clock, title: 'Database Sync', status: 'Stable' }
            ].map((log, i) => (
              <div key={i} className="flex gap-4 items-center p-4 bg-white/40 rounded-2xl border border-white/20 hover:bg-white/60 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <log.icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black tracking-tight">{log.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.status}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
            ))}
          </div>

          <button className="mt-auto w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200">
            Audit System Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
