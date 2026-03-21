import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Activity, ShieldAlert, User, Clock, AlertTriangle, Send, Cpu, Layout, Eye, ShieldCheck, Zap, Terminal, Wifi, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StaffMonitor = () => {
  const [alerts, setAlerts] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join-monitoring');
    });

    newSocket.on('student-alert', (data) => {
      setAlerts(prev => [data, ...prev].slice(0, 50));
      setActiveSessions(prev => prev.map(s => s.id === data.studentName ? { ...s, status: 'warning' } : s));
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

    newSocket.on('video-frame', (data) => {
      setActiveSessions(prev => {
        const exists = prev.find(s => s.id === data.studentId);
        if (exists) {
          return prev.map(s => s.id === data.studentId ? { ...s, frame: data.frame, time: new Date(data.timestamp).toLocaleTimeString() } : s);
        } else {
          return [...prev, { id: data.studentId, email: data.studentEmail, exam: data.examName, time: new Date(data.timestamp).toLocaleTimeString(), frame: data.frame, status: 'normal' }];
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
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em]">Live Monitoring</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase underline underline-offset-8 decoration-rose-600/20">Monitor Exams</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Server Time</span>
            <span className="text-xl font-black text-slate-900 tabular-nums">14:22:09 GMT</span>
          </div>
          <div className="h-12 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-3 glass-premium p-2 rounded-2xl border-white/40 shadow-xl">
            <div className="px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
              <Globe size={14} className="text-brand-400" /> System Live
            </div>
            <div className="px-5 py-3 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Wifi size={14} /> Encrypted
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Supervision HUD */}
        <div className="lg:col-span-4 space-y-10">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-black text-slate-900 flex items-center gap-4 text-2xl uppercase tracking-tighter italic">
              <Layout className="text-brand-600" /> LIVE EXAMS
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-brand-600 text-white px-6 py-2.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-brand-900/10">
                {activeSessions.length} STUDENTS ONLINE
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
                  <div className="w-24 h-24 min-w-[6rem] rounded-[32px] bg-slate-900 flex items-center justify-center text-white font-black italic text-3xl shadow-2xl group-hover:scale-110 transition-transform overflow-hidden relative border-4 border-slate-800">
                    {student.frame ? (
                      <img src={student.frame} alt="Student Feed" className="w-full h-full object-cover" />
                    ) : (
                      student.email[0]
                    )}
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
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Last Active</p>
                      <span className="text-xl font-black text-slate-900 tracking-tight tabular-nums">{student.time || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 transition-all active:scale-95 shadow-2xl shadow-slate-200">
                      Send Warning
                    </button>
                  </div>
                </div>

                {student.status === 'warning' && (
                  <div className="absolute bottom-10 right-10 flex items-center gap-2 text-amber-600 animate-pulse">
                    <AlertTriangle size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Suspicious Activity</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="glass-premium p-10 rounded-[56px] border-white/40 shadow-xl space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-4 text-xl uppercase tracking-tighter italic">
                <ShieldAlert className="text-rose-600" /> LIVE ALERTS
              </h3>
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            </div>

            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-600 gap-6 border-2 border-dashed border-slate-100 rounded-[40px] bg-slate-50/50">
                  <div className="w-24 h-24 rounded-full border-2 border-slate-200 flex items-center justify-center">
                    <ShieldCheck size={48} className="text-emerald-500 opacity-20" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">No issues detected right now</p>
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
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">Student left the exam window</p>
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <span className="text-brand-400 text-[10px] font-black uppercase tracking-widest">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                        <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline hover:text-white transition-colors">End Exam</button>
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
