import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { UserPlus, Users, Mail, GraduationCap, Briefcase, Fingerprint, X, Zap, Trash2, Search, ShieldAlert, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const OrgMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'student', employeeId: '', registerNumber: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchMembers(); }, []);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/organizations/me/users');
            setMembers(res.data.data);
        } catch (err) {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/organizations/me/users', formData);
            if (res.data.data.emailSent) {
                toast.success('Member registered — credentials dispatched', {
                    style: { borderRadius: '16px', background: '#0f172a', color: '#fff' }
                });
            } else {
                toast.success('Member registered — email delivery failed, share credentials manually');
            }
            setShowModal(false);
            setFormData({ name: '', email: '', role: 'student', employeeId: '', registerNumber: '' });
            fetchMembers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/organizations/me/users/${id}`);
            toast.success('Member removed');
            setConfirmDelete(null);
            fetchMembers();
        } catch (err) {
            toast.error('Remove failed');
        }
    };

    const filtered = members.filter(m => {
        const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
        if (roleFilter === 'staff') return matchSearch && m.role === 'staff';
        if (roleFilter === 'student') return matchSearch && m.role === 'student';
        return matchSearch;
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Member Registry</h1>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Manage your organization's staff and students</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-10 py-5 bg-slate-900 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-600 transition-all shadow-xl flex items-center gap-3 active:scale-95 group"
                >
                    <UserPlus size={20} className="group-hover:rotate-12 transition-transform" /> Register Member
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18} /></div>
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white shadow-xl shadow-slate-200/50 border-none rounded-[24px] py-4 pl-12 pr-6 font-black text-slate-900 outline-none focus:ring-4 focus:ring-brand-50 placeholder:text-slate-300"
                    />
                </div>
                <div className="flex gap-3">
                    {[['all', 'All Members'], ['staff', 'Staff'], ['student', 'Students']].map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setRoleFilter(val)}
                            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${roleFilter === val ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6">
                {[
                    { label: 'Total Members', value: members.length, color: 'text-slate-900' },
                    { label: 'Staff', value: members.filter(m => m.role === 'staff').length, color: 'text-brand-600' },
                    { label: 'Students', value: members.filter(m => m.role === 'student').length, color: 'text-emerald-600' },
                ].map((stat) => (
                    <div key={stat.label} className="glass-premium p-6 rounded-[32px] text-center border-white/40 shadow-xl">
                        <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Members List */}
            <div className="space-y-4">
                {filtered.map(member => (
                    <div key={member._id} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                        <div className="flex items-center gap-8">
                            <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform ${member.role === 'staff' ? 'bg-brand-600' : 'bg-slate-900'}`}>
                                {member.role === 'staff' ? <Briefcase size={32} /> : <GraduationCap size={32} />}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{member.name}</h3>
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${member.role === 'staff' ? 'bg-brand-50 text-brand-600 border border-brand-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                                        {member.role}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-bold">
                                    <span className="flex items-center gap-2"><Mail size={12} /> {member.email}</span>
                                    {member.employeeId && <span className="flex items-center gap-2"><Fingerprint size={12} /> EMP: {member.employeeId}</span>}
                                    {member.registerNumber && <span className="flex items-center gap-2"><Fingerprint size={12} /> REG: {member.registerNumber}</span>}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setConfirmDelete(member._id)}
                            className="w-14 h-14 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-[20px] border border-slate-100 transition-all shrink-0"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}

                {filtered.length === 0 && !loading && (
                    <div className="text-center py-32 bg-white rounded-[64px] border-2 border-dashed border-slate-200">
                        <ShieldAlert className="mx-auto text-slate-200 mb-6" size={56} />
                        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">No Members Found</h3>
                        <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mb-8">Start by registering your first member.</p>
                        <button onClick={() => setShowModal(true)} className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl">Register Member</button>
                    </div>
                )}
            </div>

            {/* Add Member Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[64px] w-full max-w-2xl p-16 shadow-3xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-600 to-emerald-500" />
                        <button onClick={() => setShowModal(false)} className="absolute top-12 right-12 w-14 h-14 bg-slate-50 flex items-center justify-center rounded-[24px] text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                            <X size={24} />
                        </button>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase mb-2">Register Member</h2>
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mb-12">Credentials will be auto-generated and emailed</p>

                        <form onSubmit={handleAddMember} className="space-y-8">
                            {/* Role toggle */}
                            <div className="grid grid-cols-2 gap-4">
                                {['student', 'staff'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, role: r }))}
                                        className={`p-6 rounded-[32px] border-2 flex flex-col items-center gap-3 transition-all ${formData.role === r ? 'border-slate-900 bg-slate-900 text-white shadow-2xl' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'}`}
                                    >
                                        {r === 'student' ? <GraduationCap size={32} /> : <Briefcase size={32} />}
                                        <span className="font-black text-sm uppercase tracking-widest">{r}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { label: 'Full Name', field: 'name', placeholder: 'John Doe', required: true },
                                    { label: 'Email Address', field: 'email', type: 'email', placeholder: 'john@example.com', required: true },
                                ].map(({ label, field, type = 'text', placeholder, required }) => (
                                    <div key={field} className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
                                        <input
                                            type={type}
                                            required={required}
                                            placeholder={placeholder}
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 focus:bg-white focus:border-brand-600 outline-none transition-all font-bold text-slate-900"
                                            value={formData[field]}
                                            onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                                        />
                                    </div>
                                ))}
                            </div>

                            {formData.role === 'staff' && (
                                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Employee ID</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="EMP-001"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 focus:bg-white focus:border-brand-600 outline-none transition-all font-bold text-slate-900"
                                        value={formData.employeeId}
                                        onChange={e => setFormData(p => ({ ...p, employeeId: e.target.value }))}
                                    />
                                </div>
                            )}
                            {formData.role === 'student' && (
                                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Register Number</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="REG-2301"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 focus:bg-white focus:border-brand-600 outline-none transition-all font-bold text-slate-900"
                                        value={formData.registerNumber}
                                        onChange={e => setFormData(p => ({ ...p, registerNumber: e.target.value }))}
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-8 bg-slate-900 text-white rounded-[40px] font-black text-lg italic tracking-tighter hover:bg-brand-600 transition-all shadow-3xl shadow-slate-200 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap size={28} className="text-brand-400" /> Dispatch Credentials</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] w-full max-w-sm p-12 text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-500"><Trash2 size={40} /></div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">Remove Member?</h3>
                        <p className="text-slate-400 text-sm mb-8">This will revoke their access permanently.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 border-2 border-slate-100 rounded-[24px] font-black text-sm uppercase tracking-widest">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-4 bg-rose-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-rose-700 shadow-xl active:scale-95">Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrgMembers;
