import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BookOpen, Trophy, Clock, AlertCircle, ChevronRight, BarChart, Rocket, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [stats, setStats] = useState({ attempted: 0, avgScore: 0, upcoming: 0 });
  const [recentResults, setRecentResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStats, resResults] = await Promise.all([
          api.get('/results/stats'),
          api.get('/results/recent')
        ]);
        if (resStats.data.success) setStats(resStats.data.data);
        if (resResults.data.success) setRecentResults(resResults.data.data);
      } catch (err) {
        // Mock data remains as fallback
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { name: 'Total Exams', value: stats.attempted, icon: BookOpen, gradient: 'from-blue-600 to-indigo-600' },
    { name: 'Average Score', value: `${stats.avgScore}%`, icon: Target, gradient: 'from-emerald-600 to-teal-600' },
    { name: 'Upcoming Exams', value: stats.upcoming, icon: Zap, gradient: 'from-orange-600 to-amber-600' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium">View your progress and upcoming exams</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/student/exams')} className="btn-premium">
            <Rocket size={18} /> Take Exam
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="glass-premium p-8 rounded-[36px] group hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-xl shadow-current/20 group-hover:rotate-6 transition-transform`}>
                <card.icon size={30} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{card.name}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-premium rounded-[40px] p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-2xl">Performance History</h3>
            <button onClick={() => navigate('/student/results')} className="text-brand-600 text-sm font-black flex items-center gap-1 hover:underline tracking-tight">
              Detailed Analytics <ChevronRight size={18} />
            </button>
          </div>
          <div className="space-y-5">
            {recentResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-5 bg-white/40 rounded-[28px] border border-white/20 hover:bg-white/60 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-[18px] bg-slate-100 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                    <BarChart size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm tracking-tight">{result.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(result.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-brand-600 tracking-tighter">{result.score}%</p>
                  <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-brand-600" style={{ width: `${result.score}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-dark rounded-[40px] p-10 text-white relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <h3 className="text-2xl font-black mb-3 tracking-tight">Ready for your next exam?</h3>
            <p className="text-slate-400 font-medium text-sm mb-8 leading-relaxed max-w-[240px]">Test your knowledge and view your upcoming schedule.</p>
            <button
              onClick={() => navigate('/student/exams')}
              className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95 shadow-2xl shadow-black/20"
            >
              View Exams
            </button>
          </div>

          <div className="glass-premium rounded-[40px] p-8 border-l-[6px] border-orange-500">
            <div className="flex gap-5">
              <div className="text-orange-500 bg-orange-50 p-3 rounded-2xl h-fit">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-lg tracking-tight">Exam Guidelines</h4>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mt-1">Make sure you have a stable network and your camera is on. AI proctoring is enabled to ensure fair testing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
