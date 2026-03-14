import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Trophy, FileText, ChevronRight, CheckCircle2, XCircle, Award, Target, TrendingUp, Cpu } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get('/results/myresults');
      setResults(res.data.data);
    } catch (err) {
      toast.error('Performance Data Retrieval Failed');
    } finally {
      setLoading(false);
    }
  };

  const avgScore = results.length > 0 ? (results.reduce((a, b) => a + b.percentage, 0) / results.length) : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
          <p className="text-slate-500 font-medium tracking-tight">Comprehensive review of your academic grid</p>
        </div>
        <div className="glass-premium p-6 rounded-[36px] flex items-center gap-8 border-white/40 shadow-xl group">
          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-transform">
            <Trophy size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Global Proficiency</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
              {avgScore.toFixed(1)}%
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Achievements', value: results.filter(r => r.status === 'pass').length, icon: Award, gradient: 'from-emerald-600 to-teal-600' },
          { label: 'Accuracy', value: `${avgScore.toFixed(0)}%`, icon: Target, gradient: 'from-brand-600 to-blue-600' },
          { label: 'Velocity', value: 'High', icon: TrendingUp, gradient: 'from-orange-600 to-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="glass-premium p-8 rounded-[36px] flex items-center gap-6 group">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="font-black text-xl px-4 uppercase tracking-tighter text-slate-900">Transcript Repository</h3>
        {results.map(result => (
          <div key={result._id} className="glass-premium group p-8 rounded-[40px] flex flex-col md:flex-row md:items-center justify-between gap-8 hover:-translate-y-1 transition-all cursor-pointer border-white/40">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 ${result.status === 'pass' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                }`}>
                {result.status === 'pass' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-ブランド-600 mb-1">Authenticated Transcript</h4>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors capitalize">
                  {result.exam.name}
                </h3>
                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">
                  Processed on {new Date(result.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-12">
              <div className="flex flex-col items-end gap-1">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Aggregate Units</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">{result.obtainedMarks}</span>
                  <span className="text-slate-300 font-bold text-sm">/ {result.totalMarks}</span>
                </div>
              </div>

              <div className="h-20 w-20 relative flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="38%" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="38%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className={result.status === 'pass' ? 'text-emerald-500' : 'text-rose-500'}
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 - (238.7 * result.percentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-black text-slate-900">{Math.round(result.percentage)}%</span>
              </div>

              <button className="w-14 h-14 bg-slate-900 text-white rounded-[20px] flex items-center justify-center hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 group-hover:rotate-12">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        ))}

        {results.length === 0 && !loading && (
          <div className="text-center py-32 glass-premium rounded-[48px] border-2 border-dashed border-slate-200">
            <Cpu className="mx-auto text-slate-200 mb-6 animate-pulse" size={64} />
            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Neural Repository Empty</p>
            <p className="text-slate-300 text-sm mt-2 font-medium">Initialize your first assessment to begin tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResults;
