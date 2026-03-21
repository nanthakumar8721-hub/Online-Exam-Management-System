import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Search, Database, Trash2, ChevronRight, X, Check, Cpu, Layers, Zap, Filter, Layout } from 'lucide-react';
import { toast } from 'react-hot-toast';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    subject: '',
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
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const qRes = await api.get('/questions');
      setQuestions(qRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.subject.trim()) return toast.error('Subject is Required');
    if (newQuestion.options.some(opt => !opt.text.trim())) {
      return toast.error('Please fill in all options');
    }

    try {
      await api.post('/questions', newQuestion);
      toast.success('Question Added', {
        style: { borderRadius: '16px', background: '#0f172a', color: '#fff' }
      });
      setShowQuestionModal(false);
      setNewQuestion({
        subject: '',
        questionText: '',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        marks: 1
      });
      fetchInitialData();
    } catch (err) {
      toast.error('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question Deleted');
      fetchInitialData();
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject))).filter(Boolean).sort();

  const filteredQuestions = questions.filter(q => {
    const matchesSubject = selectedSubject ? q.subject === selectedSubject : true;
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">QUESTION BANK</h1>
          <p className="text-slate-500 font-medium">Manage questions for exams</p>
        </div>
        <button
          onClick={() => setShowQuestionModal(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-600 transition-all active:scale-95 shadow-2xl shadow-slate-200 flex items-center gap-3 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Add Question
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation HUD */}
        <div className="w-full lg:w-72 space-y-4 shrink-0">
          <div className="glass-premium p-6 rounded-3xl border-white/40 shadow-xl">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-6 px-2 flex items-center gap-2">
              <Layers size={14} className="text-brand-600" /> Subjects
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedSubject(null)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${!selectedSubject ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105' : 'hover:bg-brand-50 text-slate-600'}`}
              >
                <span className="font-black text-[10px] uppercase tracking-widest">All Subjects</span>
                {!selectedSubject && <Check size={14} className="text-brand-400" />}
              </button>

              {uniqueSubjects.map(subj => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${selectedSubject === subj ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105' : 'hover:bg-brand-50 text-slate-600'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest truncate pr-2">{subj}</span>
                  {selectedSubject === subj ? <Check size={14} className="text-brand-400" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-brand-400 transition-colors" />}
                </button>
              ))}
            </div>

            {uniqueSubjects.length === 0 && (
              <div className="mt-6 p-6 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Subjects Found</p>
              </div>
            )}
          </div>

          <div className="glass-premium p-6 rounded-3xl border-white/40 bg-brand-900 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <ShieldCheck size={32} className="text-brand-400 mb-4" />
            <h4 className="font-black text-lg tracking-tighter uppercase italic leading-none mb-2">Question Security</h4>
            <p className="text-brand-200/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">All questions are securely stored.</p>
          </div>
        </div>

        {/* Console Hub */}
        <div className="flex-1 space-y-8">
          <div className="glass-premium p-3 rounded-2xl border-white/40 shadow-xl flex items-center gap-4 group">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg group-focus-within:bg-brand-600 transition-colors">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Search questions or subjects..."
              className="flex-1 bg-transparent border-none py-4 px-2 outline-none font-black text-lg tracking-tight text-slate-900 placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-8">
            {filteredQuestions.map((q, idx) => (
              <div key={q._id} className="glass-premium p-8 rounded-3xl space-y-6 hover:-translate-y-1 transition-all group border-white/40 shadow-xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${idx % 2 === 0 ? 'bg-brand-600' : 'bg-slate-900'}`}></div>

                <div className="flex justify-between items-start">
                  <div className="flex gap-6 items-center">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black italic text-xl shadow-2xl group-hover:rotate-6 transition-transform">
                      #{idx + 1}
                    </div>
                    <div className="flex gap-3">
                      <span className="px-4 py-2 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-900/10">
                        {q.subject}
                      </span>
                      <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                        {q.marks} Marks
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(q._id)}
                    className="w-10 h-10 bg-rose-50 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <p className="text-slate-900 font-black text-3xl leading-[1.2] tracking-tighter">
                  {q.questionText}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`p-4 rounded-2xl border-2 flex justify-between items-center transition-all group/opt relative overflow-hidden ${opt.isCorrect ? 'border-emerald-500 bg-emerald-500/5 text-emerald-700 shadow-xl shadow-emerald-900/5' : 'border-slate-50 bg-slate-50 text-slate-500 hover:bg-white hover:border-slate-100'}`}>
                      {opt.isCorrect && (
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                      )}
                      <div className="flex items-center gap-5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="font-bold text-lg">{opt.text}</span>
                      </div>
                      {opt.isCorrect && <Check size={20} strokeWidth={4} className="text-emerald-500" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredQuestions.length === 0 && !loading && (
            <div className="text-center py-20 glass-premium rounded-[40px] border-dashed border-2 border-slate-200">
              <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner group">
                <Cpu className="text-slate-200 group-hover:text-brand-600 transition-colors animate-pulse" size={40} />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">No Questions Found</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 text-xs uppercase tracking-[0.2em] leading-relaxed">No questions match your search.</p>
              <button onClick={() => { setSearchQuery(''); setSelectedSubject(null) }} className="font-black text-brand-600 hover:text-brand-700 underline underline-offset-[12px] uppercase tracking-widest text-[10px]">Reset Search</button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Interface */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[40px] w-full max-w-4xl p-10 shadow-3xl animate-in zoom-in-95 duration-500 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/20 relative Selection:bg-brand-600 selection:text-white">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-600 via-emerald-500 to-indigo-600"></div>

            <button
              onClick={() => setShowQuestionModal(false)}
              className="absolute top-8 right-8 w-12 h-12 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all z-20"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="mb-16">
              <h4 className="text-[10px] font-black text-brand-600 uppercase tracking-[0.4em] mb-4">New Entry</h4>
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic leading-none">Create Question</h2>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Subject</label>
                  <div className="relative group/input">
                    <input
                      list="subjects-list"
                      required
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 focus:bg-white focus:border-brand-600 outline-none transition-all font-black text-slate-900 text-xl tracking-tight"
                      placeholder="e.g. Mathematics"
                      value={newQuestion.subject}
                      onChange={e => setNewQuestion({ ...newQuestion, subject: e.target.value.toUpperCase() })}
                    />
                    <datalist id="subjects-list">
                      {uniqueSubjects.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Marks</label>
                  <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border-2 border-transparent focus-within:bg-white focus-within:border-brand-600 transition-all">
                    <button type="button" onClick={() => setNewQuestion(p => ({ ...p, marks: Math.max(1, p.marks - 1) }))} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all shadow-sm">-</button>
                    <input
                      type="number"
                      required
                      min="1"
                      className="flex-1 bg-transparent border-none outline-none font-black text-slate-900 text-2xl text-center"
                      value={newQuestion.marks}
                      onChange={e => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) || 1 })}
                    />
                    <button type="button" onClick={() => setNewQuestion(p => ({ ...p, marks: p.marks + 1 }))} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all shadow-sm">+</button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Question Text</label>
                <textarea
                  required
                  rows="4"
                  className="w-full bg-slate-50 border-2 border-transparent rounded-3xl py-6 px-8 focus:bg-white focus:border-brand-600 outline-none transition-all font-black text-3xl text-slate-900 leading-tight tracking-tighter placeholder:text-slate-200"
                  placeholder="Enter your question here..."
                  value={newQuestion.questionText}
                  onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                ></textarea>
              </div>

              <div className="space-y-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 underline underline-offset-8">Options (Select the correct answer)</label>
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
                SAVE QUESTION
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
