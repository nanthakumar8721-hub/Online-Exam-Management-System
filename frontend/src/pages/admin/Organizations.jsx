import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Building2, Check, X, Clock, Globe, Mail, Phone, MapPin, Trash2, Search, Shield, AlertCircle, Cpu } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ORG_TYPE_LABELS = {
    school: 'School', college: 'College', university: 'University',
    corporate: 'Corporate', training_center: 'Training Center', other: 'Other'
};

const AdminOrganizations = () => {
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => { fetchOrgs(); }, []);

    const fetchOrgs = async () => {
        try {
            const res = await api.get('/organizations');
            setOrgs(res.data.data);
        } catch (err) {
            toast.error('Failed to load organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/organizations/${id}/approve`);
            toast.success('Organization Approved — Credentials Dispatched', {
                style: { borderRadius: '16px', background: '#0f172a', color: '#fff' }
            });
            fetchOrgs();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Approval Failed');
        }
    };

    const handleReject = async () => {
        try {
            await api.put(`/organizations/${rejectModal}/reject`, { reason: rejectReason });
            toast.success('Organization Rejected');
            setRejectModal(null);
            setRejectReason('');
            fetchOrgs();
        } catch (err) {
            toast.error('Rejection Failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/organizations/${id}`);
            toast.success('Organization Purged');
            setConfirmDelete(null);
            fetchOrgs();
        } catch (err) {
            toast.error('Delete Failed');
        }
    };

    const filtered = orgs.filter(o => {
        const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase());
        if (filter === 'pending') return matchSearch && !o.isApproved && !o.isRejected;
        if (filter === 'approved') return matchSearch && o.isApproved;
        if (filter === 'rejected') return matchSearch && o.isRejected;
        return matchSearch;
    });

    const counts = {
        all: orgs.length,
        pending: orgs.filter(o => !o.isApproved && !o.isRejected).length,
        approved: orgs.filter(o => o.isApproved).length,
        rejected: orgs.filter(o => o.isRejected).length,
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Organization Hub</h1>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Review and verify institution enrollment requests</p>
                </div>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18} /></div>
                    <input
                        type="text"
                        placeholder="Search organizations..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full md:w-72 bg-white shadow-xl shadow-slate-200/50 border-none rounded-[24px] py-4 pl-12 pr-6 font-black text-slate-900 outline-none focus:ring-4 focus:ring-brand-50 placeholder:text-slate-300"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {Object.entries({ all: 'All', pending: 'Pending Review', approved: 'Approved', rejected: 'Rejected' }).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${filter === key ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300'}`}
                    >
                        {label}
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${filter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {counts[key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Organization Cards */}
            <div className="space-y-6">
                {filtered.map(org => (
                    <div key={org._id} className="bg-white rounded-[48px] p-10 shadow-lg border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden">
                        {/* Status Strip */}
                        <div className={`absolute top-0 left-0 h-full w-1.5 ${org.isApproved ? 'bg-emerald-500' : org.isRejected ? 'bg-rose-500' : 'bg-amber-400'}`} />

                        <div className="flex flex-col lg:flex-row lg:items-center gap-10 pl-4">
                            {/* Org Info */}
                            <div className="flex items-center gap-8 flex-1">
                                <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shrink-0 ${org.isApproved ? 'bg-emerald-600' : org.isRejected ? 'bg-rose-500' : 'bg-slate-900'} group-hover:rotate-3 transition-transform`}>
                                    <Building2 size={40} />
                                </div>
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{org.name}</h3>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${org.isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : org.isRejected ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                            {org.isApproved ? '✓ Approved' : org.isRejected ? '✗ Rejected' : '⏳ Pending'}
                                        </span>
                                        <span className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                            {ORG_TYPE_LABELS[org.type] || org.type}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-6 text-[11px] text-slate-400 font-bold">
                                        <span className="flex items-center gap-2"><Mail size={12} /> {org.email}</span>
                                        <span className="flex items-center gap-2"><Phone size={12} /> {org.phone}</span>
                                        <span className="flex items-center gap-2"><MapPin size={12} /> {org.address}</span>
                                        {org.website && <span className="flex items-center gap-2"><Globe size={12} /> {org.website}</span>}
                                    </div>
                                    {org.isApproved && (
                                        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl">{org.staffCount} Staff</span>
                                            <span className="px-3 py-1 bg-violet-50 text-violet-600 rounded-xl">{org.studentCount} Students</span>
                                        </div>
                                    )}
                                    {org.isRejected && org.rejectionReason && (
                                        <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-2"><AlertCircle size={12} /> Reason: {org.rejectionReason}</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 shrink-0">
                                {!org.isApproved && !org.isRejected && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(org._id)}
                                            className="px-8 py-4 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10 flex items-center gap-2 active:scale-95"
                                        >
                                            <Check size={18} /> Approve
                                        </button>
                                        <button
                                            onClick={() => setRejectModal(org._id)}
                                            className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-[24px] font-black text-xs uppercase tracking-widest hover:border-rose-300 hover:text-rose-600 transition-all flex items-center gap-2"
                                        >
                                            <X size={18} /> Reject
                                        </button>
                                    </>
                                )}
                                {org.isApproved && !org.isRejected && (
                                    <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-700 rounded-[24px] text-xs font-black uppercase tracking-widest">
                                        <Shield size={18} /> Active
                                    </div>
                                )}
                                <button
                                    onClick={() => setConfirmDelete(org._id)}
                                    className="w-14 h-14 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-[20px] border border-slate-100 transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && !loading && (
                    <div className="text-center py-32 bg-white rounded-[64px] border-2 border-dashed border-slate-200">
                        <Cpu className="mx-auto text-slate-200 mb-6 animate-pulse" size={56} />
                        <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">No Organizations Found</h3>
                        <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">Adjust your filter or wait for new applications.</p>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] w-full max-w-md p-12 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-2">Reject Organization</h3>
                        <p className="text-slate-500 text-sm font-medium mb-8">Provide a reason so the organization knows next steps.</p>
                        <textarea
                            rows="4"
                            placeholder="e.g. Incomplete documentation, invalid contact..."
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] p-6 outline-none focus:border-rose-500 font-bold text-slate-900 resize-none"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setRejectModal(null)} className="flex-1 py-4 border-2 border-slate-100 rounded-[24px] font-black text-sm uppercase tracking-widest text-slate-600 hover:border-slate-300 transition-all">Cancel</button>
                            <button onClick={handleReject} className="flex-1 py-4 bg-rose-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-900/10 active:scale-95">Confirm Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] w-full max-w-sm p-12 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-600">
                            <Trash2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">Delete Organization?</h3>
                        <p className="text-slate-500 text-sm mb-8">This will remove the org and its admin account. This cannot be undone.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 border-2 border-slate-100 rounded-[24px] font-black text-sm uppercase tracking-widest">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-4 bg-rose-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-rose-700 shadow-xl active:scale-95">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrganizations;
