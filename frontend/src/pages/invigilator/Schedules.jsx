import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Play, Clock, BookOpen, Search, Zap, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const StaffSchedules = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchExams();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchExams = async () => {
        try {
            const res = await api.get('/exams');
            setExams(res.data.data);
        } catch (err) {
            toast.error('Failed to load active schedules');
        } finally {
            setLoading(false);
        }
    };

    const filteredExams = exams.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Exam Operations</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Manage Assessments & Monitor Compliance</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search assessments..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden glass-premium min-h-[500px]">
                {loading ? (
                    <div className="p-32 text-center animate-pulse flex flex-col items-center">
                        <BookOpen size={48} className="text-slate-200 mb-6" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em]">Synchronizing Schedules...</p>
                    </div>
                ) : filteredExams.length === 0 ? (
                    <div className="p-32 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">No Active Assessments</h3>
                        <p className="text-slate-500 font-medium">All clear. Awaiting new schedule deployments from Administration.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/3">Assessment Node</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Window Runtime</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Code</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations Command</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredExams.map(exam => {
                                    const startDate = new Date(exam.scheduledDate);
                                    const endDate = new Date(startDate.getTime() + exam.duration * 60000);
                                    const isUpcoming = currentTime < startDate;
                                    const isOngoing = currentTime >= startDate && currentTime <= endDate;
                                    const isExpired = currentTime > endDate;

                                    return (
                                        <tr key={exam._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="font-black text-slate-900 text-sm uppercase italic tracking-tight">{exam.name}</div>
                                                <div className="text-xs text-brand-600 font-bold uppercase tracking-widest mt-1.5">{exam.subject}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                                                        <Clock size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">{startDate.toLocaleDateString()}</div>
                                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
                                                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {exam.duration}m
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                {isOngoing ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 line-through"></span> Live Node
                                                    </span>
                                                ) : isUpcoming ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                        <Zap size={12} /> Pending Init
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                        Terminated
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    {!isExpired && (
                                                        <button
                                                            onClick={() => navigate('/staff/questions', { state: { examId: exam._id, examSubject: exam.subject } })}
                                                            className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-brand-600 hover:text-brand-600 transition-all flex items-center gap-2 shadow-sm"
                                                        >
                                                            Add Questions
                                                        </button>
                                                    )}
                                                    
                                                    {isOngoing && (
                                                        <button
                                                            onClick={() => navigate('/staff/monitor')}
                                                            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                                                        >
                                                            <Play size={12} fill="currentColor" /> Monitor Session
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffSchedules;
