import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  AlertTriangle,
  Maximize2,
  ShieldCheck,
  BookOpen,
  Camera,
  Cpu,
  Layers,
  Zap,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import CameraProctor from '../../components/CameraProctor';

const ExamWindow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [exam, setExam] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [socket, setSocket] = useState(null);
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Session Required. Please re-authenticate.', {
        style: { background: '#0f172a', color: '#fff', borderRadius: '16px' }
      });
      navigate(`/login?redirect=/exam/${id}`);
    }
  }, [user, authLoading, navigate, id]);

  const requestFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(() => {
        toast.error('Fullscreen Protocol Denied. Manual override required.');
      });
    }
  };

  const handleViolation = useCallback((type, options = {}) => {
    if (!exam || !exam.settings.preventTabSwitch) return;

    setViolations(prev => {
      const max = exam.settings.maxViolations || 3;
      const newCount = options.immediateKick ? max : prev + 1;

      if (options.immediateKick) {
        toast.error(`CRITICAL BREACH: ${type}. Exam Terminated.`, {
          icon: '🚨',
          style: { background: '#991b1b', color: '#fff', borderRadius: '12px', fontWeight: 'bold' },
          duration: 8000
        });
      } else {
        toast.error(`Security Incident: ${type} (${newCount}/${max})`, {
          icon: '⚠️',
          style: { background: '#991b1b', color: '#fff', borderRadius: '12px', fontWeight: 'bold' }
        });
      }

      if (socket) {
        socket.emit('exam-alert', {
          examId: id,
          studentName: user.email,
          type: type,
          timestamp: new Date(),
          violationCount: newCount
        });
      }

      api.post('/logs', {
        examId: id,
        activity: type,
        details: options.immediateKick ? `Immediate termination: ${type}` : `Integrity breach ${newCount} of ${max}`
      });

      if (newCount >= max) {
        if (!options.immediateKick) {
            toast.error('Multiple Security Breaches. Terminating Session...');
        }
        handleSubmit();
      }
      return newCount;
    });
  }, [exam, socket, id, user, handleSubmit]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      handleViolation('Environment Switch (Tab)');
    }
  }, [handleViolation]);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement) {
      setIsFullscreen(false);
      handleViolation('Lockdown Escape');
    } else {
      setIsFullscreen(true);
    }
  }, [handleViolation]);

  useEffect(() => {
    const loadExam = async () => {
      try {
        const res = await api.get(`/exams/${id}`);
        const examData = res.data.data;
        const startDate = new Date(examData.scheduledDate);
        const endDate = new Date(startDate.getTime() + examData.duration * 60000);
        const now = new Date();

        // Calculate the actual remaining time in seconds
        const diffInSeconds = Math.floor((endDate.getTime() - now.getTime()) / 1000);
        
        // Ensure they never get more than the total duration, even if they join early
        const actualTimeLeft = Math.min(examData.duration * 60, diffInSeconds);

        if (actualTimeLeft <= 0 || examData.status === 'completed') {
          toast.error('This exam has expired and is no longer accessible.');
          navigate('/student/exams');
          return;
        }

        setExam(examData);
        setTimeLeft(actualTimeLeft);
      } catch (err) {
        toast.error('Initialization Failed');
        navigate('/student');
      }
    };
    if (id) {
      loadExam();
    }
  }, [id, navigate]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && exam) {
      socket.emit('join-exam', id);
    }
  }, [socket, exam, id]);

  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        toast.error('Control Restricted: DevTools Locked', { icon: '🛡️' });
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        toast.error('Action Restricted: You cannot exit the exam until the duration finishes.', { icon: '⚠️' });
      }
    };

    const disableContextMenu = (e) => e.preventDefault();

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You cannot exit the exam until the duration time finishes.';
      return e.returnValue;
    };

    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      toast.error('Navigation Restricted: You cannot leave this page.', { icon: '⚠️' });
    };

    // Block back button explicitly
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    document.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('keydown', handleGlobalKeys);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', handleGlobalKeys);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleFullscreenChange, handleVisibilityChange]);

  const handleSubmit = useCallback(async () => {
    try {
      await api.post('/results/submit', { examId: id, userAnswers: answers });
      toast.success('Grid Transmission Successful');
      navigate('/student/results');
    } catch (err) {
      toast.error('Transmission Failed. Retry Protocol Handled.');
    }
  }, [id, answers, navigate]);

  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [exam]);

  useEffect(() => {
    if (exam && timeLeft === 0) {
      handleSubmit();
    }
  }, [exam, timeLeft, handleSubmit]);

  const handleAnswer = (optionText) => {
    const newAnswers = [...answers];
    const existingIdx = newAnswers.findIndex(a => a.questionId === exam.questions[currentIdx]._id);
    if (existingIdx > -1) {
      newAnswers[existingIdx].selectedOption = optionText;
    } else {
      newAnswers.push({ questionId: exam.questions[currentIdx]._id, selectedOption: optionText });
    }
    setAnswers(newAnswers);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Cpu size={48} className="text-brand-600 mb-4" />
          <h2 className="text-sm font-black tracking-[0.3em] uppercase text-slate-500">Initializing Secure Session</h2>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-600/10 flex items-center justify-center mb-6 border border-brand-500/20">
            <BookOpen size={32} className="text-brand-500 animate-bounce" />
          </div>
          <h2 className="text-xs font-black tracking-[0.3em] uppercase text-slate-500">Decrypting Exam Matrix</h2>
        </div>
      </div>
    );
  }

  if (!exam.questions || exam.questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={40} className="text-rose-500" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">No Questions Found</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed">This exam schedule has been created, but no assessment nodes have been attached to it yet. Please contact your administrator.</p>
          <button onClick={() => navigate('/student/exams')} className="mt-8 px-10 py-4 bg-white text-slate-900 hover:bg-slate-200 transition-colors rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = exam.questions[currentIdx];
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-brand-600">
      {/* HUD Header */}
      <header className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-3xl sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-2xl rotate-3 border border-white/10 group">
            <Cpu size={24} className="group-hover:animate-spin" />
          </div>
          <div>
            <h2 className="font-black text-xl tracking-tighter uppercase">{exam.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Live Connection • {currentIdx + 1}/{exam.questions.length}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-4 px-8 py-3 rounded-2xl border transition-all ${timeLeft < 300 ? 'bg-rose-900/20 border-rose-500/30 text-rose-500' : 'bg-white/5 border-white/10 text-brand-400'}`}>
            <Clock size={20} className={timeLeft < 300 ? 'animate-pulse' : ''} />
            <span className="font-black text-2xl tracking-tighter">{formatTime(timeLeft)}</span>
          </div>

          <div className="hidden lg:flex items-center gap-4 px-8 py-3 rounded-2xl border border-white/5 bg-white/5">
            <ShieldCheck size={20} className="text-brand-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Secure Protocol Active</span>
          </div>

          <button
            onClick={() => { if (window.confirm('Grid Transmission Finalize?')) handleSubmit(); }}
            className="px-10 py-3.5 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-700 transition-all active:scale-95 shadow-2xl shadow-brand-900/20 flex items-center gap-3"
          >
            <Send size={18} />
            Finalize Exam
          </button>
        </div>
      </header>

      {/* Interface */}
      <main className="flex-1 flex flex-col lg:flex-row p-8 gap-10 max-w-[1700px] mx-auto w-full">
        {/* Core Viewport */}
        <div className="flex-1 space-y-10">
          <div className="glass-dark rounded-[48px] p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-600/50 to-transparent"></div>

            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <span className="text-brand-500 font-black text-xl tracking-tighter">NODE #{currentIdx + 1}</span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Weight: {currentQ.marks} Units</span>
              </div>
              <div className="px-5 py-2.5 rounded-full bg-slate-900/50 border border-white/5 flex items-center gap-2">
                <Layers size={14} className="text-brand-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject: Core Matrix</span>
              </div>
            </div>

            <h3 className="text-3xl font-black leading-[1.3] mb-12 text-white/90 tracking-tight">
              {currentQ.questionText}
            </h3>

            <div className="grid grid-cols-1 gap-5">
              {currentQ.options.map((option, idx) => {
                const isSelected = answers.find(a => a.questionId === currentQ._id)?.selectedOption === option.text;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option.text)}
                    className={`flex items-center gap-6 p-7 rounded-3xl border-2 transition-all text-left relative group overflow-hidden ${isSelected
                      ? 'bg-brand-600/10 border-brand-500 shadow-2xl shadow-brand-900/10'
                      : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 animate-pulse"></div>
                    )}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${isSelected ? 'bg-brand-500 text-white rotate-6' : 'bg-white/5 text-slate-500 group-hover:scale-110'
                      }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-xl font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-400'}`}>{option.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center px-4">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="flex items-center gap-4 px-10 py-5 rounded-[24px] bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black text-xs uppercase tracking-[0.2em]"
            >
              <ChevronLeft size={20} /> Previous
            </button>
            <button
              disabled={currentIdx === exam.questions.length - 1}
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className="flex items-center gap-4 px-10 py-5 rounded-[24px] bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black text-xs uppercase tracking-[0.2em]"
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* HUD Sidebar */}
        <aside className="w-full lg:w-[400px] space-y-8">
          <div className="glass-dark rounded-[40px] p-8 border border-white/10 overflow-hidden relative group">
            {exam?.settings?.requireCamera && <CameraProctor 
                onViolation={handleViolation} 
                socket={socket} 
                userEmail={user.email} 
                examName={exam.name}
                examId={id} 
              />}
            {!exam?.settings?.requireCamera && (
              <div className="aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-700 gap-4 border border-white/5">
                <Camera size={48} className="opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Tactical Oversight<br />System Disengaged</p>
              </div>
            )}
          </div>

          <div className="glass-dark rounded-[40px] p-10 border border-white/10 shadow-2xl">
            <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-slate-500 flex items-center gap-3">
              <Layers size={16} className="text-brand-500" /> Matrix Navigation
            </h4>
            <div className="grid grid-cols-5 gap-4">
              {exam.questions.map((_, i) => {
                const isAnswered = answers.some(a => a.questionId === exam.questions[i]._id);
                const isCurrent = currentIdx === i;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm transition-all border-2 ${isCurrent ? 'border-brand-500 bg-brand-600 text-white shadow-lg shadow-brand-900/50 scale-110' :
                      isAnswered ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        'bg-white/5 text-slate-600 border-transparent hover:border-white/20'
                      }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`rounded-[40px] p-10 border transition-all duration-500 ${violations > 0 ? 'bg-rose-900/20 border-rose-500/30 text-rose-500 animate-pulse' : 'bg-brand-900/10 border-brand-500/20 text-brand-500'}`}>
            <div className="flex items-center gap-4 mb-6">
              <ShieldCheck size={28} />
              <h4 className="font-black text-lg tracking-tighter uppercase">Integrity Monitor</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span>Breach Counter</span>
                <span className={violations > 0 ? 'text-rose-500' : ''}>{violations} / {exam?.settings?.maxViolations || 3}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${violations > 0 ? 'bg-rose-500' : 'bg-brand-500'}`}
                  style={{ width: `${(violations / (exam?.settings?.maxViolations || 3)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Lockdown Overlay */}
      {!isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 text-center animate-in fade-in duration-700">
          <div className="max-w-xl space-y-12">
            <div className="w-32 h-32 bg-brand-600/10 border border-brand-600/30 rounded-full flex items-center justify-center mx-auto text-brand-500 shadow-3xl shadow-brand-900/20 group">
              <Lock size={56} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-6">
              <h1 className="text-6xl font-black tracking-tighter uppercase italic">Secure Hub<br /><span className="text-brand-500 px-4">Locked</span></h1>
              <p className="text-slate-400 font-medium text-lg leading-relaxed uppercase tracking-tight">This environment requires exclusive focus. Fullscreen protocol iteration 2.6 initialization required.</p>
            </div>
            <button
              onClick={requestFullscreen}
              className="w-full py-6 bg-brand-600 hover:bg-brand-700 text-white rounded-[32px] font-black text-xl uppercase tracking-[0.3em] transition-all shadow-2xl shadow-brand-900/20 active:scale-95 group flex items-center justify-center gap-4"
            >
              <Zap size={24} className="animate-pulse" />
              Initialize Grid Access
            </button>
            <div className="flex items-center justify-center gap-8 pt-8 opacity-40">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={14} /> AI Proctoring
              </div>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Cpu size={14} /> Neural Tracking
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamWindow;
