import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { UserCheck, UserX, UserMinus, Shield, Search, Mail, Calendar, Cpu, Zap, Fingerprint, ShieldAlert, GraduationCap, Briefcase, UserPlus, Trash2, X, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Identity Retrieval Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/users/${id}/approve`);
      toast.success('Access Protocol Granted', {
        style: { borderRadius: '16px', background: '#0f172a', color: '#fff' }
      });
      fetchUsers();
    } catch (err) {
      toast.error('Identity Approval Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Terminate this identity from the grid?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Identity Purged');
      fetchUsers();
    } catch (err) {
      toast.error('Identity Purge Failed');
    }
  };

  const filteredUsers = users.filter(u =>
    (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">IDENTITY ARCHIVE</h1>
            <p className="text-slate-500 font-medium">Verify credentials and manage neural network nodes</p>
          </div>
        </div>
        <div className="relative w-full md:w-96 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-focus-within:bg-brand-600 group-focus-within:text-white transition-all shadow-sm">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Query name, email or role..."
            className="w-full bg-white border-none rounded-[28px] py-5 pl-16 pr-6 shadow-xl shadow-slate-200/50 outline-none focus:ring-4 focus:ring-brand-50 transition-all font-black text-slate-900 placeholder:text-slate-300 selection:bg-brand-600 selection:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Database View */}
      <div className="grid grid-cols-1 gap-6">
        {filteredUsers.map(user => (
          <div key={user._id} className="glass-premium p-8 rounded-[48px] flex flex-col md:flex-row md:items-center justify-between gap-8 border-white/40 shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
            {!user.isApproved && (
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-500 animate-pulse"></div>
            )}
            <div className="flex items-center gap-8">
              <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-6 ${user.role === 'admin' ? 'bg-slate-900 text-white' :
                user.role === 'staff' ? 'bg-brand-600 text-white' :
                  'bg-slate-100 text-slate-400'
                }`}>
                {user.role === 'admin' ? <Shield size={32} /> :
                  user.role === 'staff' ? <Briefcase size={32} /> :
                    <GraduationCap size={32} />}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors uppercase italic leading-none">{user.name}</h3>
                    <span className="text-xs font-bold text-slate-400 lowercase mt-1">{user.email}</span>
                  </div>
                  {!user.isApproved && (
                    <span className="px-5 py-2 bg-amber-500 text-white rounded-[14px] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-900/10">
                      PROTOCOL PENDING
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
                    <Zap size={14} className="text-brand-600" /> {user.role}
                  </div>
                  {user.role === 'staff' && user.employeeId && (
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
                      <Fingerprint size={14} className="text-slate-300" /> EMP ID: {user.employeeId}
                    </div>
                  )}
                  {user.role === 'student' && user.registerNumber && (
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
                      <Fingerprint size={14} className="text-slate-300" /> REG NO: {user.registerNumber}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
                    <Calendar size={14} className="text-slate-300" /> GRID JOIN {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {!user.isApproved && (
                <button
                  onClick={() => handleApprove(user._id)}
                  className="px-8 py-5 bg-slate-900 text-white rounded-[24px] hover:bg-emerald-600 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-200 active:scale-95 group/btn"
                >
                  <UserCheck size={20} className="group-hover/btn:scale-110 transition-transform" />
                  Authorize Node
                </button>
              )}
              <button
                onClick={() => handleDelete(user._id)}
                className="w-16 h-16 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-[24px] transition-all border border-slate-100 group-hover:border-rose-100"
                title="Purge Node"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-40 glass-premium rounded-[64px] border-dashed border-2 border-slate-200">
            <ShieldAlert className="mx-auto text-slate-200 mb-8 animate-pulse" size={80} />
            <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Identity Trace Error</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 text-xs uppercase tracking-[0.2em] leading-relaxed">No neural fragments found matching your specific query parameters in the archive.</p>
            <button onClick={() => setSearch('')} className="font-black text-brand-600 hover:text-brand-700 underline underline-offset-[12px] uppercase tracking-widest text-[10px]">Reset Protocol Query</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
