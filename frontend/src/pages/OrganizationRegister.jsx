import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Globe, FileText, ChevronRight, Cpu, Check, ArrowLeft, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ORG_TYPES = [
    { value: 'school', label: 'School', desc: 'K-12 educational institution' },
    { value: 'college', label: 'College', desc: 'Undergraduate institution' },
    { value: 'university', label: 'University', desc: 'Research & postgrad programs' },
    { value: 'corporate', label: 'Corporate', desc: 'Enterprise / HR training' },
    { value: 'training_center', label: 'Training Center', desc: 'Certification & skill programs' },
    { value: 'other', label: 'Other', desc: 'Any other organization' },
];

const OrganizationRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', phone: '', address: '', website: '', description: '', type: 'college'
    });

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/organizations', form);
            setSubmitted(true);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50/30 p-8">
                <div className="max-w-lg w-full text-center space-y-10 animate-in zoom-in-95 duration-700">
                    <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-900/20 animate-bounce">
                        <Check size={64} className="text-white" strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase mb-4">Application Received!</h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed mb-2">Your organization <span className="font-black text-slate-900">"{form.name}"</span> has been submitted for review.</p>
                        <p className="text-slate-400 font-medium">Our admin team will verify your details and send your access credentials to <span className="font-black text-brand-600">{form.email}</span> within 24–48 hours.</p>
                    </div>
                    <button onClick={() => navigate('/')} className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-brand-600 transition-all shadow-2xl">
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/20 flex flex-col">
            {/* Nav */}
            <nav className="px-8 h-20 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xl rotate-3">
                        <Cpu size={22} className="animate-pulse" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-slate-900">Exam<span className="text-brand-600">Core</span></span>
                </div>
                <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-slate-600 font-bold text-sm hover:text-brand-600 transition-colors">
                    <ArrowLeft size={16} /> Sign In
                </button>
            </nav>

            <div className="flex-1 flex items-center justify-center p-8 py-20">
                <div className="max-w-5xl w-full">
                    {/* Header */}
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-brand-600/10 text-brand-600 rounded-full font-black text-[10px] uppercase tracking-[0.3em] mb-6 border border-brand-600/20">
                            <Building2 size={14} /> Organization Enrollment
                        </div>
                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase mb-4">Join the Grid</h1>
                        <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">Enroll your institution and gain access to a professional, AI-powered examination infrastructure.</p>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-6 mb-16">
                        {[1, 2].map(s => (
                            <div key={s} className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${step >= s ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-100 text-slate-400'}`}>
                                    {step > s ? <Check size={24} strokeWidth={3} /> : s}
                                </div>
                                <span className={`font-black text-xs uppercase tracking-widest ${step >= s ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {s === 1 ? 'Institution Type' : 'Contact Details'}
                                </span>
                                {s < 2 && <ChevronRight size={20} className="text-slate-300 ml-3" />}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="animate-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                                    {ORG_TYPES.map(t => (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => update('type', t.value)}
                                            className={`p-8 rounded-[40px] border-2 text-left transition-all group ${form.type === t.value ? 'border-slate-900 bg-slate-900 text-white shadow-2xl shadow-slate-200 -translate-y-1' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:shadow-lg'}`}
                                        >
                                            <Briefcase size={32} className={`mb-6 ${form.type === t.value ? 'text-brand-400' : 'text-slate-300 group-hover:text-slate-500'} transition-colors`} />
                                            <h3 className="font-black text-lg tracking-tight mb-1">{t.label}</h3>
                                            <p className={`text-xs font-medium ${form.type === t.value ? 'text-slate-400' : 'text-slate-400'}`}>{t.desc}</p>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => setStep(2)} className="px-12 py-6 bg-slate-900 text-white rounded-[28px] font-black text-sm uppercase tracking-widest hover:bg-brand-600 transition-all shadow-2xl shadow-slate-200 flex items-center gap-3">
                                        Continue <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="bg-white rounded-[48px] p-12 shadow-xl border border-slate-100 space-y-8">
                                        <h3 className="font-black text-2xl text-slate-900 tracking-tighter uppercase italic">Institution Details</h3>

                                        {[
                                            { icon: Building2, label: 'Organization Name', field: 'name', placeholder: 'ABC College of Engineering', required: true },
                                            { icon: Mail, label: 'Official Email', field: 'email', type: 'email', placeholder: 'admin@abccollege.edu', required: true },
                                            { icon: Phone, label: 'Phone Number', field: 'phone', placeholder: '+91 98765 43210', required: true },
                                        ].map(({ icon: Icon, label, field, type = 'text', placeholder, required }) => (
                                            <div key={field} className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
                                                <div className="relative">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                                        <Icon size={20} />
                                                    </div>
                                                    <input
                                                        type={type}
                                                        required={required}
                                                        placeholder={placeholder}
                                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 pl-14 pr-6 focus:bg-white focus:border-brand-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-200"
                                                        value={form[field]}
                                                        onChange={e => update(field, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-white rounded-[48px] p-12 shadow-xl border border-slate-100 space-y-8">
                                        <h3 className="font-black text-2xl text-slate-900 tracking-tighter uppercase italic">Additional Info</h3>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Address</label>
                                            <div className="relative">
                                                <div className="absolute left-5 top-5 text-slate-300"><MapPin size={20} /></div>
                                                <textarea
                                                    required
                                                    rows="3"
                                                    placeholder="123 College Road, City, State"
                                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 pl-14 pr-6 focus:bg-white focus:border-brand-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-200 resize-none"
                                                    value={form.address}
                                                    onChange={e => update('address', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Website (Optional)</label>
                                            <div className="relative">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><Globe size={20} /></div>
                                                <input
                                                    type="url"
                                                    placeholder="https://abccollege.edu"
                                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 pl-14 pr-6 focus:bg-white focus:border-brand-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-200"
                                                    value={form.website}
                                                    onChange={e => update('website', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Brief Description</label>
                                            <div className="relative">
                                                <div className="absolute left-5 top-5 text-slate-300"><FileText size={20} /></div>
                                                <textarea
                                                    rows="3"
                                                    placeholder="Tell us about your organization..."
                                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 pl-14 pr-6 focus:bg-white focus:border-brand-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-200 resize-none"
                                                    value={form.description}
                                                    onChange={e => update('description', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-10">
                                    <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-[24px] font-black text-sm uppercase tracking-widest hover:border-slate-300 transition-all">
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-16 py-6 bg-slate-900 text-white rounded-[28px] font-black text-sm uppercase tracking-widest hover:bg-brand-600 transition-all shadow-2xl shadow-slate-200 flex items-center gap-3 disabled:opacity-50 active:scale-95"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Building2 size={20} /> Submit Application</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrganizationRegister;
