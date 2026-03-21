import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Play, Clock, BookOpen, AlertCircle, CheckCircle2, Calendar, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
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
      toast.error('Neural Base Retrieval Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Exams</h1>
          <p className="text-slate-500 font-medium italic uppercase tracking-widest text-[10px]">Access your scheduled exams here</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {exams.map((exam) => {
          const startDate = new Date(exam.scheduledDate);
          const endDate = new Date(startDate.getTime() + exam.duration * 60000);
          const isUpcoming = currentTime < startDate;
          const isOngoing = currentTime >= startDate && currentTime <= endDate;
          const isExpired = currentTime > endDate;
          const isCompleted = exam.status === 'completed';

          return (
            <div key={exam._id} className="glass-premium p-8 rounded-[48px] flex flex-col group hover:-translate-y-2 transition-all border-white/40 shadow-xl overflow-hidden relative">
              <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest ${isOngoing ? 'bg-emerald-500 text-white animate-pulse' :
                isUpcoming ? 'bg-brand-600 text-white' :
                  'bg-slate-200 text-slate-600'
                }`}>
                {isOngoing ? 'Start Exam' : isUpcoming ? 'Upcoming' : 'Expired'}
              </div>

              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                  <BookOpen size={28} />
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight group-hover:text-brand-600 transition-colors uppercase italic">{exam.name}</h3>
              <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-6">{exam.subject}</p>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center text-slate-500 text-xs font-bold gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <Clock size={16} />
                  </div>
                  <span>{exam.duration} Min Runtime</span>
                </div>
                <div className="flex items-center text-slate-500 text-xs font-bold gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <Calendar size={16} />
                  </div>
                  <span className="truncate">{startDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                {exam.postponedDescription && (
                    <div className="flex items-center text-rose-500 text-xs font-bold gap-4 pt-2">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-100 transition-colors">
                            <AlertCircle size={16} />
                        </div>
                        <div className="flex-1 leading-tight">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-rose-400 mb-0.5">Postponed Reason</p>
                            <span className="truncate block">{exam.postponedDescription}</span>
                        </div>
                    </div>
                )}
              </div>

              {isOngoing ? (
                <button
                  onClick={() => navigate(`/exam/${exam._id}`)}
                  className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl"
                >
                  <Play size={16} fill="currentColor" /> Start Now
                </button>
              ) : isUpcoming ? (
                <button disabled className="w-full py-5 bg-slate-50 text-slate-400 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] border border-slate-100 cursor-not-allowed">
                  Locked Until {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </button>
              ) : (
                <button
                  onClick={() => isCompleted && navigate(`/student/results/${exam._id}`)}
                  disabled={!isCompleted}
                  className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${isCompleted ? 'bg-slate-50 text-slate-900 hover:bg-slate-100' : 'bg-slate-50 text-slate-300 opacity-50 cursor-not-allowed'}`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {isCompleted ? 'View Archive' : 'Session Expired'}
                </button>
              )}
            </div>
          );
        })}

        {exams.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center glass-premium rounded-[64px] border-dashed border-2 border-slate-200">
            <Cpu className="text-slate-200 mx-auto mb-8 animate-pulse" size={48} />
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">No Exams Found</h3>
            <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">You don't have any exams scheduled right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExams;
