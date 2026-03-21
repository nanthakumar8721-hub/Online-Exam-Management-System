import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Calendar, Plus, Clock, Users, BookOpen, AlertCircle, Trash2, ArrowRight, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

const OrgAdminSchedules = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const [form, setForm] = useState({
        name: '',
        subject: '',
        duration: '',
        scheduledDate: '',
        postponedDescription: '',
        _id: null
    });

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await api.get('/exams');
            setExams(res.data.data);
        } catch (err) {
            toast.error('Failed to load exam schedules');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const res = await api.put(`/exams/${form._id}`, {
                    ...form,
                    duration: parseInt(form.duration)
                });
                setExams(exams.map(ex => ex._id === form._id ? res.data.data : ex));
                toast.success('Exam Schedule Updated');
            } else {
                const res = await api.post('/exams', {
                    ...form,
                    duration: parseInt(form.duration)
                });
                setExams([...exams, res.data.data]);
                toast.success('Exam Schedule Created');
            }
            setShowModal(false);
            setForm({ name: '', subject: '', duration: '', scheduledDate: '', postponedDescription: '', _id: null });
            setIsEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save schedule');
        }
    };

    const handleEditClick = (exam) => {
        setIsEditing(true);
        setForm({
            name: exam.name,
            subject: exam.subject,
            duration: exam.duration,
            scheduledDate: exam.scheduledDate ? new Date(exam.scheduledDate).toISOString().slice(0, 16) : '',
            postponedDescription: exam.postponedDescription || '',
            _id: exam._id
        });
        setShowModal(true);
    };

    const handleAddNewClick = () => {
        setIsEditing(false);
        setForm({ name: '', subject: '', duration: '', scheduledDate: '', postponedDescription: '', _id: null });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) return;
        try {
            await api.delete(`/exams/${id}`);
            setExams(exams.filter(e => e._id !== id));
            toast.success('Schedule deleted successfully');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error deleting schedule');
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Exam Schedules</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Manage organization-wide assessments</p>
                </div>
                <button
                    onClick={handleAddNewClick}
                    className="px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-3 active:scale-95 group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    New Schedule
                </button>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden glass-premium">
                {loading ? (
                    <div className="p-20 text-center animate-pulse">
                        <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest">Loading Schedules...</p>
                    </div>
                ) : exams.length === 0 ? (
                    <div className="p-32 text-center flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                            <BookOpen size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">No Active Schedules</h3>
                        <p className="text-slate-500 font-medium">Create a new schedule to begin evaluating students.</p>
                        <button
                            onClick={handleAddNewClick}
                            className="mt-8 px-8 py-4 bg-slate-100 text-slate-600 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Create First Exam
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Exam Title / Subject</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Time</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {exams.map(exam => {
                                    const date = new Date(exam.scheduledDate);
                                    const isPast = date < new Date();
                                    return (
                                        <tr key={exam._id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="p-6">
                                                <div className="font-bold text-slate-900 text-sm">{exam.name}</div>
                                                <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{exam.subject}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="font-medium text-slate-900 text-sm">{date.toLocaleDateString()}</div>
                                                <div className="text-xs text-slate-500 font-bold">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                {exam.postponedDescription && (
                                                    <div className="mt-2 text-[10px] font-black text-rose-500 uppercase flex items-center gap-1">
                                                        <AlertCircle size={10} /> {exam.postponedDescription}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100">
                                                    <Clock size={14} /> {exam.duration} Min
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                    {isPast ? 'Expired' : 'Upcoming'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(exam)}
                                                    className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                                    title="Edit Schedule"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => window.location.href = `/org/exams/${exam._id}/questions`}
                                                    className="px-4 py-2 inline-flex items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-colors"
                                                    title="Manage Questions"
                                                >
                                                    Manage Questions
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exam._id)}
                                                    className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                    title="Delete Schedule"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
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
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-8">{isEditing ? 'Edit Schedule' : 'Schedule New Exam'}</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Exam Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Midterm Evaluation"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition-all placeholder:text-slate-300"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Subject Topic</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Computer Science 101"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition-all placeholder:text-slate-300"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Duration (Min)</label>
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Start Timing</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition-all text-slate-600"
                                        value={form.scheduledDate}
                                        onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Postponed Description (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Reason for change..."
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 text-sm font-bold text-rose-600 focus:bg-white focus:border-rose-500 outline-none transition-all placeholder:text-slate-300"
                                        value={form.postponedDescription}
                                        onChange={e => setForm({ ...form, postponedDescription: e.target.value })}
                                    />
                                </div>
                            )}

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
                                    {isEditing ? 'Save Changes' : 'Create Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrgAdminSchedules;
