import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Play, Clock, BookOpen, Search, Zap, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const StaffSchedules = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        name: '',
        subject: '',
        duration: '',
        scheduledDate: ''
    });
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

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/exams', {
                ...form,
                duration: parseInt(form.duration)
            });
            setExams([...exams, res.data.data]);
            setShowModal(false);
            setForm({ name: '', subject: '', duration: '', scheduledDate: '' });
            toast.success('Exam created successfully');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create exam');
        }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm('Are you sure you want to delete this exam?')) return;
        try {
            await api.delete(`/exams/${id}`);
            setExams(exams.filter(e => e._id !== id));
            toast.success('Exam deleted');
        } catch (err) {
            toast.error('Failed to delete exam');
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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Exams</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">View Schedule and Manage Questions</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search assessments..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full sm:w-auto px-6 py-4 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={18} />
                        Create Exam
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden glass-premium min-h-[500px]">
                {loading ? (
                    <div className="p-32 text-center animate-pulse flex flex-col items-center">
                        <BookOpen size={48} className="text-slate-200 mb-6" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em]">Loading Exams...</p>
                    </div>
                ) : filteredExams.length === 0 ? (
                    <div className="p-32 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">No Active Exams</h3>
                        <p className="text-slate-500 font-medium">There are no exams scheduled at the moment.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/3">Exam Name</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Time</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
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
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 line-through"></span> Ongoing
                                                    </span>
                                                ) : isUpcoming ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                        <Zap size={12} /> Upcoming
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                        Completed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                    <div className="flex justify-end gap-3">
                                                    {!isExpired && (
                                                        <button
                                                            onClick={() => navigate(`/staff/exams/${exam._id}/questions`)}
                                                            className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-brand-600 hover:text-brand-600 transition-all flex items-center gap-2 shadow-sm"
                                                        >
                                                            Manage Questions
                                                        </button>
                                                    )}
                                                    
                                                    {isOngoing && (
                                                        <button
                                                            onClick={() => navigate('/staff/monitor')}
                                                            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                                                        >
                                                            <Play size={12} fill="currentColor" /> Monitor
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteExam(exam._id)}
                                                        className="w-10 h-10 border-2 border-slate-100 flex items-center justify-center rounded-2xl text-slate-400 hover:border-rose-500 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm shrink-0"
                                                        title="Delete Exam"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
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

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-lg relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-8">Create New Exam</h2>
                        
                        <form onSubmit={handleCreateExam} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Exam Title <span className="text-rose-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., Mathematics Class Test"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition-all placeholder:text-slate-300"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Subject <span className="text-rose-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., Mathematics"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition-all placeholder:text-slate-300"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Duration (Minutes) <span className="text-rose-500">*</span></label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        placeholder="60"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition-all placeholder:text-slate-300"
                                        value={form.duration}
                                        onChange={e => setForm({ ...form, duration: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Scheduled Date & Time <span className="text-rose-500">*</span></label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition-all text-slate-600"
                                        value={form.scheduledDate}
                                        onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200"
                                >
                                    Create Exam
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffSchedules;
