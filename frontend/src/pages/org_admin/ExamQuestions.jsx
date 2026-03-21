import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Plus, ArrowLeft, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ExamQuestions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    
    const [form, setForm] = useState({
        questionText: '',
        marks: 1,
        options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ]
    });

    useEffect(() => {
        fetchExamDetails();
    }, [id]);

    const fetchExamDetails = async () => {
        try {
            const res = await api.get(`/exams/${id}`);
            const examData = res.data.data;
            const startDate = new Date(examData.scheduledDate);
            const endDate = new Date(startDate.getTime() + examData.duration * 60000);

            if (user?.role === 'staff' && (new Date() > endDate || examData.status === 'completed')) {
                toast.error('This exam has expired and cannot be modified.');
                navigate('/staff/schedules');
                return;
            }

            setExam(examData);
            setQuestions(examData.questions || []);
        } catch (err) {
            toast.error('Failed to load exam details');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...form.options];
        if (field === 'isCorrect') {
            // Uncheck all other options
            newOptions.forEach((opt, i) => {
                opt.isCorrect = i === index;
            });
        } else {
            newOptions[index][field] = value;
        }
        setForm({ ...form, options: newOptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate options
        const hasCorrect = form.options.some(opt => opt.isCorrect);
        if (!hasCorrect) {
            toast.error('Please select one correct option');
            return;
        }

        const validOptions = form.options.filter(opt => opt.text.trim() !== '');
        if (validOptions.length < 2) {
            toast.error('Please provide at least two options');
            return;
        }

        try {
            if (editingQuestion) {
                // Update question
                await api.put(`/questions/${editingQuestion._id}`, {
                    questionText: form.questionText,
                    marks: form.marks,
                    options: validOptions
                });
                toast.success('Question updated');
            } else {
                // Add new question
                await api.post(`/exams/${id}/questions/bulk`, {
                    questions: [{
                        questionText: form.questionText,
                        marks: form.marks,
                        options: validOptions
                    }]
                });
                toast.success('Question added');
            }
            fetchExamDetails();
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save question');
        }
    };

    const handleDelete = async (questionId) => {
        if (!window.confirm('Are you sure you want to remove this question?')) return;
        try {
            await api.delete(`/exams/${id}/questions/${questionId}`);
            setQuestions(questions.filter(q => q._id !== questionId));
            toast.success('Question removed');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to remove question');
        }
    };

    const openEditModal = (question) => {
        setEditingQuestion(question);
        
        // Ensure we always have 4 options in the form even if the question has fewer
        const paddedOptions = [...question.options];
        while (paddedOptions.length < 4) {
            paddedOptions.push({ text: '', isCorrect: false });
        }
        
        setForm({
            questionText: question.questionText,
            marks: question.marks,
            options: paddedOptions
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingQuestion(null);
        setForm({
            questionText: '',
            marks: 1,
            options: [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]
        });
    };

    if (loading) {
        return <div className="p-20 text-center animate-pulse text-slate-400 font-bold uppercase">Loading...</div>;
    }

    if (!exam) {
        return <div className="p-20 text-center text-rose-500 font-bold uppercase">Exam not found</div>;
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Manage Questions</h1>
                    <p className="text-slate-500 font-bold text-sm uppercase mt-1">
                        {exam.name} • <span className="text-brand-600">{exam.subject}</span>
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="text-slate-500 font-bold uppercase text-sm">
                    Total Questions: <span className="text-slate-900">{questions.length}</span>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg hover:bg-brand-500 transition flex items-center gap-2"
                >
                    <Plus size={16} />
                    Add Question
                </button>
            </div>

            <div className="space-y-6">
                {questions.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-md">
                        <p className="text-slate-400 font-bold uppercase text-lg">No questions added yet</p>
                    </div>
                ) : (
                    questions.map((q, idx) => (
                        <div key={q._id} className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-lg relative group">
                            <div className="absolute top-6 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEditModal(q)}
                                    className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl hover:bg-brand-50 hover:text-brand-600 transition"
                                    title="Edit Question"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(q._id)}
                                    className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition"
                                    title="Remove from Exam"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-black text-sm shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 leading-relaxed pr-24">
                                            {q.questionText}
                                        </h3>
                                        <div className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase">
                                            {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                        {q.options.map((opt, optIdx) => (
                                            <div 
                                                key={optIdx} 
                                                className={`p-4 rounded-xl flex items-center gap-3 border-2 ${opt.isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-100 bg-slate-50 text-slate-600'}`}
                                            >
                                                {opt.isCorrect ? (
                                                    <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                                                ) : (
                                                    <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300 shrink-0" />
                                                )}
                                                <span className="font-medium text-sm">{opt.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-2xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900 uppercase italic">
                                {editingQuestion ? 'Edit Question' : 'Add Question'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-900">
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Question Text</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] p-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition-all placeholder:text-slate-300 resize-none"
                                    placeholder="Enter your question here..."
                                    value={form.questionText}
                                    onChange={e => setForm({ ...form, questionText: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Marks</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="w-full max-w-[150px] bg-slate-50 border-2 border-transparent rounded-[20px] p-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-600 outline-none transition-all"
                                    value={form.marks}
                                    onChange={e => setForm({ ...form, marks: parseInt(e.target.value) || 1 })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Options</label>
                                <div className="bg-amber-50 text-amber-800 text-xs font-bold p-3 rounded-xl border border-amber-200">
                                    Provide up to 4 options. Select the radio button for the correct answer. Empty options will be ignored.
                                </div>
                                {form.options.map((opt, idx) => (
                                    <div key={idx} className={`flex items-center gap-3 p-2 rounded-2xl border-2 transition-all ${opt.isCorrect ? 'border-brand-500 bg-brand-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}>
                                        <input
                                            type="radio"
                                            name="correctOption"
                                            checked={opt.isCorrect}
                                            onChange={() => handleOptionChange(idx, 'isCorrect', true)}
                                            className="w-5 h-5 ml-4 accent-brand-600"
                                        />
                                        <input
                                            type="text"
                                            className="flex-1 bg-transparent p-3 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-medium"
                                            placeholder={`Option ${idx + 1}`}
                                            value={opt.text}
                                            onChange={e => handleOptionChange(idx, 'text', e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200"
                                >
                                    {editingQuestion ? 'Save Changes' : 'Add Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamQuestions;
