import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Activity, ShieldAlert, User, Clock, AlertTriangle, Send, Cpu, Layout, Eye, ShieldCheck, Zap, Terminal, Wifi, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StaffMonitor = () => {
  const [alerts, setAlerts] = useState([]);
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, email: 'STUDENT-AX-204', exam: 'NEURAL DYNAMICS', time: '45:20', status: 'optimal' },
    { id: 2, email: 'STUDENT-RG-881', exam: 'APPLIED ROBOTICS', time: '12:05', status: 'warning' },
    { id: 3, email: 'STUDENT-QS-903', exam: 'QUANTUM SYSTEMS', time: '58:44', status: 'optimal' },
  ]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join-monitoring');
    });

    newSocket.on('student-alert', (data) => {
      setAlerts(prev => [data, ...prev].slice(0, 50));
      toast(`Integrity Breach: ${data.studentName}`, {
        icon: '⚠️',
        style: {
          borderRadius: '16px',
          background: '#0f172a',
          color: '#fff',
          fontWeight: 'bold'
        }
      });
    });

    return () => newSocket.close();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 Selection:bg-rose-600 selection:text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.8)]"></div>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em]">Live Security Uplink</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase underline underline-offset-8 decoration-rose-600/20">Command Center</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Server Time</span>
            <span className="text-xl font-black text-slate-900 tabular-nums">14:22:09 GMT</span>
          </div>
          <div className="h-12 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-3 glass-premium p-2 rounded-2xl border-white/40 shadow-xl">
            <div className="px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
              <Globe size={14} className="text-brand-400" /> Sector A-12
            </div>
            <div className="px-5 py-3 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Wifi size={14} /> Encrypted
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Telemetry Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-premium p-8 rounded-[48px] border-white/40 shadow-xl bg-slate-900 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <Cpu size={32} className="text-brand-400 mb-6" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Compute Load</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black italic tracking-tighter">12.4%</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Optimized</span>
            </div>
            <div className="mt-6 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600 w-[12.4%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            </div>
          </div>

          <div className="glass-premium p-8 rounded-[48px] border-white/40 shadow-xl relative overflow-hidden group">
            <ShieldAlert size={32} className="text-rose-600 mb-6" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Threat Assessment</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black italic tracking-tighter">Low</span>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">2 Blocked</span>
            </div>
            <div className="mt-8 flex gap-1">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`h-8 flex-1 rounded-sm ${i < 2 ? 'bg-rose-500' : 'bg-slate-100'}`}></div>
              ))}
            </div>
          </div>

          <div className="glass-premium p-10 rounded-[48px] border-white/40 shadow-2xl bg-brand-900 text-white group">
            <Terminal size={32} className="text-brand-400 mb-6" />
            <h4 className="font-black text-xl italic tracking-tighter uppercase mb-4 leading-none">Observer Access</h4>
            <p className="text-brand-200/60 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed mb-8">Override protocols enabled. Authorized for termination of rogue sessions.</p>
            <button className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-600 hover:text-white transition-all shadow-xl active:scale-95">
              Execute Audit
            </button>
          </div>
        </div>

        {/* Supervision HUD */}
        <div className="lg:col-span-3 space-y-10">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-black text-slate-900 flex items-center gap-4 text-2xl uppercase tracking-tighter italic">
              <Layout className="text-brand-600" /> ACTIVE NEURAL GRIDS
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-brand-600 text-white px-6 py-2.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-brand-900/10">
                {activeSessions.length} NODES ONLINE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {activeSessions.map((student) => (
              <div key={student.id} className={`glass-premium p-10 rounded-[56px] flex flex-col gap-8 border-l-[12px] group relative hover:-translate-y-2 transition-all shadow-xl overflow-hidden ${student.status === 'warning' ? 'border-amber-500 bg-amber-500/5' : 'border-emerald-500'
                }`}>
                <div className="absolute top-0 right-0 p-8">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-brand-600 transition-all cursor-pointer shadow-2xl rotate-12 group-hover:rotate-0">
                    <Eye size={28} />
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 rounded-[32px] bg-slate-900 flex items-center justify-center text-white font-black italic text-3xl shadow-2xl group-hover:scale-110 transition-transform">
                    {student.email[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-2xl tracking-tighter uppercase italic">{student.email}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`w-2 h-2 rounded-full ${student.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.exam}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Session Runtime</p>
                      <span className="text-xl font-black text-slate-900 tracking-tight tabular-nums">{student.time}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 transition-all active:scale-95 shadow-2xl shadow-slate-200">
                      Warn Node
                    </button>
                  </div>
                </div>

                {student.status === 'warning' && (
                  <div className="absolute bottom-10 right-10 flex items-center gap-2 text-amber-600 animate-pulse">
                    <AlertTriangle size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inconsistency Detected</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="glass-premium p-10 rounded-[56px] border-white/40 shadow-xl space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-4 text-xl uppercase tracking-tighter italic">
                <ShieldAlert className="text-rose-600" /> REAL-TIME INTEGRITY FEED
              </h3>
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            </div>

            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-600 gap-6 border-2 border-dashed border-slate-100 rounded-[40px] bg-slate-50/50">
                  <div className="w-24 h-24 rounded-full border-2 border-slate-200 flex items-center justify-center">
                    <ShieldCheck size={48} className="text-emerald-500 opacity-20" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Zero breaches detected in current sector</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className="bg-slate-900 p-8 rounded-[36px] border border-white/5 animate-in slide-in-from-bottom shadow-2xl group hover:bg-slate-800 transition-all">
                      <div className="flex items-center gap-3 text-rose-500 mb-6 bg-rose-500/10 w-fit px-4 py-1.5 rounded-full border border-rose-500/20">
                        <AlertTriangle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{alert.type}</span>
                      </div>
                      <p className="text-white font-black text-xl italic tracking-tighter leading-none mb-3">{alert.studentName}</p>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">Violation detected in Vector-7</p>
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                        <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline hover:text-white transition-colors">Terminate</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffMonitor;
