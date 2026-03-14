import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { UserPlus, Mail, Lock, Cpu, ShieldCheck, ArrowRight, UserCircle, ShieldAlert } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(true); // Default to true for safety
  const [checkingStatus, setCheckingStatus] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/auth/status');
        setHasAdmin(res.data.hasAdmin);
      } catch (err) {
        console.error('Status check failed');
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If no admin exists, we force the role to admin regardless of selection
      const registrationRole = hasAdmin ? role : 'admin';
      await api.post('/auth/register', { email, password, name, role: registrationRole });

      toast.success(hasAdmin ? 'Grid Access Initialized.' : 'Administrator Protocol Established.', {
        style: {
          borderRadius: '16px',
          background: '#0f172a',
          color: '#fff',
          fontWeight: 'black',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }
      });
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration Protocol Failed');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-brand-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-2xl -rotate-3">
              <UserPlus size={26} />
            </div>
            <span className="text-3xl font-black tracking-tighter text-slate-900">
              Exam<span className="text-brand-600">Core</span>
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            {hasAdmin ? 'Identity Restricted' : 'Initialize Root Admin'}
          </h1>
          <p className="text-slate-500 font-medium">
            {hasAdmin
              ? 'Self-registration is disabled. Contact your administrator for access.'
              : 'Create the primary system administrator account to begin setup.'}
          </p>
        </div>

        <div className="glass-premium p-8 rounded-3xl shadow-2xl border-white/40">
          {!hasAdmin ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Admin Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                    <UserPlus size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/50 border-2 border-slate-100 rounded-2xl py-3 pl-14 pr-5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                    placeholder="Full Identity Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Admin Identity Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full bg-white/50 border-2 border-slate-100 rounded-2xl py-3 pl-14 pr-5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                    placeholder="admin@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Secure Keyphrase</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full bg-white/50 border-2 border-slate-100 rounded-2xl py-3 pl-14 pr-5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-600 transition-all active:scale-95 shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Initialize Admin Profile
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-10 space-y-8">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-rose-100 animate-bounce">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Onboarding Suspended</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  User registration is now restricted to internal administrator invitations only.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-600 transition-all active:scale-95 shadow-2xl"
              >
                Sign In to Platform
              </button>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <p className="text-center text-sm font-bold text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 hover:underline">
                Sign In to Grid
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-12 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
          Secured by ExamCore Protocol v2.6
        </p>
      </div>
    </div>
  );
};

export default Register;
