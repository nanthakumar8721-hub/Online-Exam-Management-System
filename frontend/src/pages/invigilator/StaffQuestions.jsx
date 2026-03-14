import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, BookOpen, Clock, Calendar, Cpu, Layers, Check, X, Zap, ChevronRight, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StaffQuestions = () => {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        questionText: '',
        options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ],
        marks: 1
    });

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await api.get('/exams');
            // Show only upcoming or ongoing exams for staff to add questions
            setExams(res.data.data.filter(e => e.status !== 'completed'));
        } catch (err) {
            toast.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!selectedExam) return toast.error('Please select a schedule first');
        if (newQuestion.options.some(opt => !opt.text.trim())) {
            return toast.error('Incomplete data detected');
        }

        try {
            await api.post(`/exams/${selectedExam._id}/questions`, newQuestion);
            toast.success('Logic Unit Injected', {
                style: { borderRadius: '16px', background: '#0f172a', color: '#fff' }
            });
            setShowModal(false);
            setNewQuestion({
                questionText: '',
                options: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false }
                ],
                marks: 1
            });
            // Refresh exam data to show updated question count
            fetchExams();
        } catch (err) {
            toast.error('Injection Error');
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">LOGIC INJECTION</h1>
                    <p className="text-slate-500 font-medium italic uppercase tracking-widest text-[10px]">Populate active exam protocols with assessment logic</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Schedule HUD */}
                <div className="w-full lg:w-80 space-y-4 shrink-0">
                    <div className="glass-premium p-6 rounded-3xl border-white/40 shadow-xl">
                        <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-6 px-2 flex items-center gap-2">
                            <Layers size={14} className="text-brand-600" /> Active Schedules
                        </h3>
                        <div className="space-y-2">
                            {exams.map(exam => (
                                <button
                                    key={exam._id}
                                    onClick={() => setSelectedExam(exam)}
                                    className={`w-full text-left p-4 rounded-xl transition-all group relative overflow-hidden ${selectedExam?._id === exam._id ? 'bg-slate-900 text-white shadow-xl' : 'hover:bg-brand-50 text-slate-600'}`}
                                >
                                    <div className="relative z-10">
                                        <p className="font-black text-xs tracking-tighter uppercase truncate mb-1">{exam.name}</p>
                                        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">{exam.subject}</p>
                                        <div className="flex items-center gap-2 mt-3 text-[10px] font-medium opacity-60">
                                            <BookOpen size={10} /> {exam.questions?.length || 0} Questions
                                        </div>
                                    </div>
                                    {selectedExam?._id === exam._id && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Check size={16} className="text-brand-400" />
                                        </div>
                                    )}
                                </button>
                            ))}
                            {exams.length === 0 && !loading && (
                                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">No protocols available for injection</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question Hub */}
                <div className="flex-1">
                    {selectedExam ? (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="glass-premium p-8 rounded-3xl border-white/40 shadow-xl bg-slate-900 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-brand-600/20 transition-all duration-700"></div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-4 py-1.5 bg-brand-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">TARGET: {selectedExam.subject}</span>
                                            <span className="px-4 py-1.5 bg-white/10 text-slate-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">{selectedExam.status}</span>
                                        </div>
                                        <h2 className="text-5xl font-black tracking-tighter italic uppercase leading-none mb-2">{selectedExam.name}</h2>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                            <Calendar size={14} /> {new Date(selectedExam.scheduledDate).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-400 hover:text-white transition-all active:scale-95 shadow-2xl flex items-center gap-3 shrink-0"
                                    >
                                        <Zap size={20} className="text-brand-600" />
                                        Inject Question
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {selectedExam.questions && selectedExam.questions.length > 0 ? (
                                    selectedExam.questions.map((q, idx) => (
                                        <div key={q._id} className="glass-premium p-8 rounded-3xl space-y-6 hover:-translate-y-1 transition-all group border-white/40 shadow-xl relative overflow-hidden bg-white/50">
                                            <div className={`absolute top-0 left-0 w-2 h-full ${idx % 2 === 0 ? 'bg-brand-600' : 'bg-slate-900'}`}></div>
                                            <div className="flex justify-between items-start">
                                                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black italic text-xl shadow-2xl group-hover:rotate-6 transition-transform shrink-0">
                                                    #{idx + 1}
                                                </div>
                                                <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                                                    {q.marks || 1} Logic Units
                                                </span>
                                            </div>
                                            <p className="text-slate-900 font-black text-3xl leading-[1.2] tracking-tighter">
                                                {q.questionText}
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {q.options.map((opt, i) => (
                                                    <div key={i} className={`p-4 rounded-xl border-2 flex justify-between items-center ${opt.isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-50 text-slate-400'}`}>
                                                        <span className="font-bold text-sm"> {String.fromCharCode(65 + i)}: {opt.text}</span>
                                                        {opt.isCorrect && <Check size={16} />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 glass-premium rounded-[40px] border-dashed border-2 border-slate-200">
                                        <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner group">
                                            <Cpu className="text-slate-200 group-hover:text-brand-600 transition-colors animate-pulse" size={40} />
                                        </div>
                                        <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">No Logic Injected</h3>
                                        <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 text-xs uppercase tracking-[0.2em] leading-relaxed">This protocol is a hollow shell. Initiate injection to make it functional.</p>
                                        <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-600 transition-all shadow-2xl shadow-slate-200">Start Injection</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 glass-premium rounded-[40px] border-dashed border-2 border-slate-200">
                            <ShieldAlert className="text-slate-200 mb-8" size={64} strokeWidth={1} />
                            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">Select Target Schedule</h3>
                            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Awaiting selection from Matrix Categories</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Injection Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-2xl animate-in fade-in duration-500">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl p-10 shadow-3xl animate-in zoom-in-95 duration-500 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/20 relative Selection:bg-brand-600 selection:text-white">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-600 via-emerald-500 to-indigo-600"></div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-8 right-8 w-12 h-12 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all z-20"
                        >
                            <X size={24} strokeWidth={3} />
                        </button>

                        <div className="mb-16">
                            <h4 className="text-[10px] font-black text-brand-600 uppercase tracking-[0.4em] mb-4">Injection Protocol</h4>
                            <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic leading-none truncate pr-16">{selectedExam?.name}</h2>
                        </div>

                        <form onSubmit={handleAddQuestion} className="space-y-12">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Logic Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-3xl py-6 px-8 focus:bg-white focus:border-brand-600 outline-none transition-all font-black text-3xl text-slate-900 leading-tight tracking-tighter placeholder:text-slate-200"
                                    placeholder="Enter your question here..."
                                    value={newQuestion.questionText}
                                    onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Point weight</label>
                                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border-2 border-transparent focus-within:bg-white focus-within:border-brand-600 transition-all">
                                        <button type="button" onClick={() => setNewQuestion(p => ({ ...p, marks: Math.max(1, p.marks - 1) }))} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all shadow-sm">-</button>
                                        <input
                                            type="number"
                                            className="flex-1 bg-transparent border-none outline-none font-black text-slate-900 text-2xl text-center"
                                            value={newQuestion.marks}
                                            readOnly
                                        />
                                        <button type="button" onClick={() => setNewQuestion(p => ({ ...p, marks: p.marks + 1 }))} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all shadow-sm">+</button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 underline underline-offset-8">Option Branches (Toggle Correct Node)</label>
                                <div className="grid grid-cols-1 gap-6">
                                    {newQuestion.options.map((opt, i) => (
                                        <div key={i} className={`flex gap-6 items-center p-4 rounded-2xl border-2 transition-all relative overflow-hidden group/opt ${opt.isCorrect ? 'border-emerald-500 bg-emerald-500/5 shadow-xl shadow-emerald-900/10' : 'border-slate-50 bg-slate-50 focus-within:border-brand-600 focus-within:bg-white'}`}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const opts = newQuestion.options.map((o, idx) => ({ ...o, isCorrect: i === idx }));
                                                    setNewQuestion({ ...newQuestion, options: opts });
                                                }}
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${opt.isCorrect ? 'bg-emerald-500 text-white shadow-lg rotate-12 scale-110' : 'bg-white text-slate-200 hover:text-brand-600'}`}
                                            >
                                                {opt.isCorrect ? <Check size={24} strokeWidth={4} /> : <span className="font-black text-xl">{String.fromCharCode(65 + i)}</span>}
                                            </button>
                                            <input
                                                type="text"
                                                required
                                                placeholder={`Option ${String.fromCharCode(65 + i)}...`}
                                                className="flex-1 bg-transparent border-none focus:ring-0 font-black text-2xl text-slate-900 placeholder:text-slate-100 italic"
                                                value={opt.text}
                                                onChange={e => {
                                                    const opts = [...newQuestion.options];
                                                    opts[i].text = e.target.value;
                                                    setNewQuestion({ ...newQuestion, options: opts });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-3xl text-2xl font-black italic tracking-tighter hover:bg-brand-600 transition-all shadow-3xl shadow-slate-200 flex items-center justify-center gap-6 active:scale-95 group">
                                <Zap size={32} className="group-hover:animate-bounce text-brand-400" />
                                LEGITIMIZE LOGIC UNIT
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffQuestions;
