import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, ShieldCheck, Mail, Fingerprint, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/auth/updatedetails', profileData);
            updateUser(res.data.data);
            toast.success('Profile Matrix Updated', {
                style: { borderRadius: '16px', background: '#0f172a', color: '#fff' }
            });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Update Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            const payload = {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            };

            await api.put('/auth/updatepassword', payload);
            toast.success('Identity Secured - Password Changed');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Password Security Breach - Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[32px] bg-slate-900 flex items-center justify-center text-white shadow-2xl rotate-3">
                    <Fingerprint size={40} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Identity Hub</h1>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Manage your personal access parameters</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Profile Section */}
                <div className="glass-premium p-10 rounded-[48px] border-white/40 shadow-xl space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                            <User size={24} />
                        </div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Personal Data</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 focus:bg-white focus:border-brand-600 outline-none transition-all font-bold text-slate-900"
                                value={profileData.name}
                                onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Node (Email)</label>
                            <input
                                type="email"
                                className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 focus:bg-white focus:border-brand-600 outline-none transition-all font-bold text-slate-900"
                                value={profileData.email}
                                onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-brand-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={18} /> Sync Changes
                        </button>
                    </form>
                </div>

                {/* Password Section */}
                <div className="glass-premium p-10 rounded-[48px] border-white/40 shadow-xl space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Access Key</h2>
                    </div>

                        <form onSubmit={handleChangePassword} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valid Protocol (Current)</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-slate-900"
                                    value={passwordData.currentPassword}
                                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Protocol Identifier</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-slate-900"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Protocol</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 px-6 focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-slate-900"
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCcw size={18} /> Update Key
                            </button>
                        </form>
                </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-[40px] flex items-center justify-between group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 via-transparent to-brand-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-brand-400 shadow-inner">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h4 className="font-black text-white text-lg tracking-tighter uppercase mb-1">Grid Security Protocol Active</h4>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Encryption status: AES-256 Verified</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
