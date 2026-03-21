import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Building2, Users, BookOpen, ArrowUpRight, Shield, Cpu, Zap, Activity, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const OrgAdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const res = await api.get('/organizations/me');
                setOrg(res.data.data);
            } catch (err) {
                toast.error('Failed to load organization data');
            } finally {
                setLoading(false);
            }
        };
        fetchOrg();
    }, []);

    const cards = [
        { name: 'Staff Members', value: org?.staffCount || 0, icon: Shield, gradient: 'from-brand-600 to-indigo-600' },
        { name: 'Students Enrolled', value: org?.studentCount || 0, icon: Users, gradient: 'from-emerald-600 to-teal-600' },
        { name: 'Org Status', value: org?.isApproved ? 'Active' : 'Pending', icon: Activity, gradient: org?.isApproved ? 'from-emerald-600 to-teal-600' : 'from-amber-600 to-orange-600' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">{org?.name || 'Organization Dashboard'}</h1>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Manage your organization and users</p>
                </div>
                <button
                    onClick={() => navigate('/org/members')}
                    className="px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl flex items-center gap-3 group active:scale-95"
                >
                    <Users size={18} /> Manage Members
                    <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="glass-premium p-8 rounded-[36px] group hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-xl shadow-current/20 group-hover:rotate-6 transition-transform`}>
                                <card.icon size={30} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{card.name}</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">{card.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
                
                <div 
                    onClick={() => navigate('/org/schedules')}
                    className="glass-premium p-8 rounded-[36px] group hover:-translate-y-1 transition-all cursor-pointer border-brand-500/20 hover:border-brand-500/50"
                >
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-current/20 group-hover:rotate-6 transition-transform`}>
                            <BookOpen size={30} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Exam Schedules</p>
                            <p className="text-sm font-bold text-brand-600 tracking-tight mt-1 group-hover:underline">Manage Active Exams</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Org Details Card */}
            {org && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-brand-600/20 transition-all duration-700" />
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center mb-8 border border-white/10">
                                <Building2 size={40} className="text-brand-400" />
                            </div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">{org.name}</h2>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mb-8">{org.type?.replace('_', ' ')}</p>
                            <p className="text-slate-400 font-medium text-sm leading-relaxed">{org.description || 'No description provided.'}</p>
                        </div>
                    </div>

                    <div className="glass-premium p-12 rounded-[48px] border-white/40 shadow-xl space-y-6">
                        <h3 className="font-black text-xl text-slate-900 tracking-tighter uppercase italic mb-8">Contact Information</h3>
                        {[
                            { icon: Mail, label: 'Email', value: org.email },
                            { icon: Phone, label: 'Phone', value: org.phone },
                            { icon: MapPin, label: 'Address', value: org.address },
                            ...(org.website ? [{ icon: Globe, label: 'Website', value: org.website }] : []),
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-5 p-5 bg-white/50 rounded-[24px] border border-white/20">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                    <p className="font-bold text-slate-900 text-sm">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Action */}
            <div className="p-10 bg-slate-50 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-xl">
                        <Zap size={32} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 text-xl tracking-tighter uppercase italic">Ready to onboard your team?</h4>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Register your staff and students to get started.</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/org/members')}
                    className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-600 transition-all shadow-xl active:scale-95 whitespace-nowrap"
                >
                    Add Members →
                </button>
            </div>
        </div>
    );
};

export default OrgAdminDashboard;
