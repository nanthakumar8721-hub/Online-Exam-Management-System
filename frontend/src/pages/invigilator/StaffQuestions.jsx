import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, BookOpen, Clock, Calendar, Cpu, Layers, Check, X, Zap, ChevronRight, ShieldAlert, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StaffQuestions = () => {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
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
            setExams(res.data.data.filter(e => {
                const endDate = new Date(new Date(e.scheduledDate).getTime() + e.duration * 60000);
                return e.status !== 'completed' && new Date() <= endDate;
            }));
        } catch (err) {
            toast.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrEditQuestion = async (e) => {
        e.preventDefault();
        if (!selectedExam) return toast.error('Please select an exam first');
        if (newQuestion.options.some(opt => !opt.text.trim())) {
            return toast.error('Please fill in all options');
        }

        try {
            if (editingQuestionId) {
                // Edit existing question
                await api.put(`/questions/${editingQuestionId}`, newQuestion);
                toast.success('Question updated successfully');
            } else {
                // Add new question
                await api.post(`/exams/${selectedExam._id}/questions`, newQuestion);
                toast.success('Question added successfully');
            }
            setShowModal(false);
            setEditingQuestionId(null);
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
            // Refresh exam data to show updated questions
            fetchExams();
            // Re-select exam to refresh question list properly
            const updatedExamRes = await api.get(`/exams/${selectedExam._id}`);
            setSelectedExam(updatedExamRes.data.data);
        } catch (err) {
            toast.error(editingQuestionId ? 'Failed to update question' : 'Failed to add question');
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Are you sure you want to remove this question?')) return;
        try {
            await api.delete(`/exams/${selectedExam._id}/questions/${questionId}`);
            toast.success('Question removed successfully');
            fetchExams();
            const updatedExamRes = await api.get(`/exams/${selectedExam._id}`);
            setSelectedExam(updatedExamRes.data.data);
        } catch (err) {
            toast.error('Failed to remove question');
        }
    };

    const openEditModal = (q) => {
        setEditingQuestionId(q._id);
        setNewQuestion({
            questionText: q.questionText,
            options: q.options.length ? q.options : [
                { text: '', isCorrect: true }, { text: '', isCorrect: false },
                { text: '', isCorrect: false }, { text: '', isCorrect: false }
            ],
            marks: q.marks || 1
        });
        setShowModal(true);
    };

    const openAddModal = () => {
        setEditingQuestionId(null);
        setNewQuestion({
            questionText: '',
            options: [
                { text: '', isCorrect: true }, { text: '', isCorrect: false },
                { text: '', isCorrect: false }, { text: '', isCorrect: false }
            ],
            marks: 1
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Manage Questions</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Add, edit, or remove questions for your assigned exams</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Schedule HUD */}
                <div className="w-full lg:w-80 space-y-4 shrink-0">
                    <div className="glass-premium p-6 rounded-[32px] border border-white/40 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                        <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-6 px-2 flex items-center gap-2 relative z-10">
                            <Layers size={14} className="text-blue-600" /> Active Exams
                        </h3>
                        <div className="space-y-3 relative z-10">
                            {exams.map(exam => (
                                <button
                                    key={exam._id}
                                    onClick={() => setSelectedExam(exam)}
                                    className={`w-full text-left p-5 rounded-2xl transition-all group/btn relative overflow-hidden ${selectedExam?._id === exam._id ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105' : 'hover:bg-blue-50 text-slate-700 bg-white/50'}`}
                                >
                                    <div className="relative z-10">
                                        <p className="font-black text-lg truncate mb-1 leading-tight">{exam.name}</p>
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedExam?._id === exam._id ? 'text-blue-400' : 'text-blue-600'}`}>{exam.subject}</p>
                                        <div className={`flex items-center gap-2 mt-4 text-xs font-bold ${selectedExam?._id === exam._id ? 'text-slate-300' : 'text-slate-400'}`}>
                                            <BookOpen size={14} /> {exam.questions?.length || 0} Questions
                                        </div>
                                    </div>
                                    {selectedExam?._id === exam._id && (
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                            <ChevronRight size={20} className="text-blue-400 group-hover/btn:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </button>
                            ))}
                            {exams.length === 0 && !loading && (
                                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Active Exams</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question Hub */}
                <div className="flex-1">
                    {selectedExam ? (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="glass-premium p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm bg-white relative">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">Subject: {selectedExam.subject}</span>
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold capitalize">{selectedExam.status}</span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{selectedExam.name}</h2>
                                        <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                                            <Calendar size={16} /> {new Date(selectedExam.scheduledDate).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={openAddModal}
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 shrink-0"
                                    >
                                        <Plus size={18} />
                                        Add Question
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {selectedExam.questions && selectedExam.questions.length > 0 ? (
                                    selectedExam.questions.map((q, idx) => (
                                        <div key={q._id} className="glass-premium p-8 rounded-[32px] space-y-6 hover:-translate-y-1 transition-all border border-slate-200 shadow-lg relative overflow-hidden group bg-white">
                                            <div className={`absolute top-0 left-0 w-2 h-full ${idx % 2 === 0 ? 'bg-blue-600' : 'bg-indigo-500'}`}></div>
                                            
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-5 items-center">
                                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black italic text-xl shadow-xl group-hover:rotate-6 transition-transform shrink-0">
                                                        #{idx + 1}
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                                                            {q.marks || 1} Marks
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEditModal(q)} className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                                                        <Edit size={18} strokeWidth={2.5} />
                                                    </button>
                                                    <button onClick={() => handleDeleteQuestion(q._id)} className="w-10 h-10 bg-rose-50 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                                                        <Trash2 size={18} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-slate-900 font-black text-2xl md:text-3xl leading-[1.3] tracking-tight">
                                                {q.questionText}
                                            </p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                                                {q.options.map((opt, i) => (
                                                    <div key={i} className={`p-4 rounded-2xl border-2 flex justify-between items-center transition-all group/opt relative overflow-hidden ${opt.isCorrect ? 'border-green-500 bg-green-50 text-green-700 shadow-md' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-white hover:border-slate-200'}`}>
                                                        {opt.isCorrect && (
                                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                                                        )}
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${opt.isCorrect ? 'bg-green-500 text-white shadow-sm' : 'bg-white text-slate-400 shadow-sm'}`}>
                                                                {String.fromCharCode(65 + i)}
                                                            </div>
                                                            <span className="font-bold text-lg">{opt.text}</span>
                                                        </div>
                                                        {opt.isCorrect && <Check size={20} strokeWidth={4} className="text-green-500" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 glass-premium rounded-[40px] border border-dashed border-slate-300 bg-slate-50 shadow-inner">
                                        <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-md group">
                                            <Cpu className="text-slate-300 group-hover:text-blue-600 transition-colors animate-pulse" size={40} />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter uppercase italic">No Questions Found</h3>
                                        <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8 text-[11px] uppercase tracking-[0.2em] leading-relaxed">This exam doesn't have any questions yet. Add questions to prepare the exam for students.</p>
                                        <button onClick={openAddModal} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 inline-flex items-center gap-3">
                                            <Plus size={20} className="text-blue-400" />
                                            Add First Question
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 glass-premium rounded-3xl border border-dashed border-slate-300 bg-slate-50">
                            <BookOpen className="text-slate-300 mb-6" size={48} />
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Select an Exam</h3>
                            <p className="text-slate-500 font-medium text-sm">Please select an exam from the list to view or manage questions.</p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-white rounded-[32px] w-full max-w-4xl p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-500 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar relative border border-white/20">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
                        
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">{editingQuestionId ? 'Update Entry' : 'New Entry'}</h4>
                                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight italic leading-none">{editingQuestionId ? 'Edit Question' : 'Add Question'}</h2>
                                <p className="text-slate-500 text-sm mt-3 font-medium flex items-center gap-2">
                                    <Layers size={14} className="text-blue-500" />
                                    Exam: <span className="font-bold text-slate-700">{selectedExam?.name}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            >
                                <X size={24} strokeWidth={2.5} />
                            </button>
                        </div>

                        <form onSubmit={handleAddOrEditQuestion} className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Question Text</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-3xl py-5 px-6 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-2xl sm:text-3xl text-slate-900 leading-tight tracking-tight placeholder:text-slate-300 shadow-inner"
                                    placeholder="Enter the question here..."
                                    value={newQuestion.questionText}
                                    onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Marks</label>
                                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border-2 border-transparent focus-within:bg-white focus-within:border-blue-500 transition-all w-max shadow-inner">
                                    <button type="button" onClick={() => setNewQuestion(p => ({ ...p, marks: Math.max(1, p.marks - 1) }))} className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">-</button>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-20 bg-transparent border-none outline-none font-black text-slate-900 text-2xl text-center"
                                        value={newQuestion.marks}
                                        onChange={e => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) || 1 })}
                                    />
                                    <button type="button" onClick={() => setNewQuestion(p => ({ ...p, marks: p.marks + 1 }))} className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">+</button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Options (Select Correct Answer)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {newQuestion.options.map((opt, i) => (
                                        <div key={i} className={`flex gap-5 items-center p-4 rounded-2xl border-2 transition-all relative overflow-hidden group/opt ${opt.isCorrect ? 'border-green-500 bg-green-50 shadow-xl shadow-green-900/10' : 'border-slate-100 bg-slate-50 hover:border-slate-200 focus-within:border-blue-500 focus-within:bg-white'}`}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const opts = newQuestion.options.map((o, idx) => ({ ...o, isCorrect: i === idx }));
                                                    setNewQuestion({ ...newQuestion, options: opts });
                                                }}
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${opt.isCorrect ? 'bg-green-500 text-white shadow-lg rotate-6 scale-110' : 'bg-white text-slate-300 hover:text-blue-600 hover:bg-blue-50'}`}
                                            >
                                                {opt.isCorrect ? <Check size={24} strokeWidth={3} /> : <span className="font-black text-lg">{String.fromCharCode(65 + i)}</span>}
                                            </button>
                                            <input
                                                type="text"
                                                required
                                                placeholder={`Option ${String.fromCharCode(65 + i)}...`}
                                                className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-xl text-slate-800 placeholder:text-slate-300 outline-none"
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

                            <div className="pt-6 flex flex-col sm:flex-row justify-end gap-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-wide hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
                                    <Zap size={20} className="text-blue-400" />
                                    {editingQuestionId ? 'SAVE CHANGES' : 'ADD QUESTION'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffQuestions;
