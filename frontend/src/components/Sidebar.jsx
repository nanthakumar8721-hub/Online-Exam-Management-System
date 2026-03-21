import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Settings,
  Activity,
  Cpu,
  Calendar,
  Building2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = {
    admin: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      { name: 'Organizations', icon: Building2, path: '/admin/organizations' },
      { name: 'Users', icon: Users, path: '/admin/users' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
    student: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/student' },
      { name: 'My Exams', icon: FileText, path: '/student/exams' },
      { name: 'Results', icon: Activity, path: '/student/results' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
    staff: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/staff' },
      { name: 'Manage Logic', icon: BookOpen, path: '/staff/questions' },
      { name: 'Live Monitor', icon: ShieldAlert, path: '/staff/monitor' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
    org_admin: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/org' },
      { name: 'Schedules', icon: Calendar, path: '/org/schedules' },
      { name: 'Members', icon: Users, path: '/org/members' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ]
  };

  const currentMenu = menuItems[user?.role] || [];

  return (
    <aside className={cn(
      "transition-all duration-500 flex flex-col fixed h-[calc(100vh-2rem)] z-40 m-4 rounded-[32px] glass-premium border-white/40 shadow-2xl overflow-hidden",
      collapsed ? "w-24" : "w-72"
    )}>
      {/* Brand */}
      <div className="p-8 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xl rotate-3">
              <Cpu size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">
              Exam<span className="text-brand-600">Core</span>
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white mx-auto shadow-xl">
            <Cpu size={20} />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {currentMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group",
                isActive
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
              )}
            >
              <item.icon size={22} className={cn(isActive && "text-brand-400")} />
              {!collapsed && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
              {isActive && !collapsed && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-brand-400"></div>
              )}
              {collapsed && !isActive && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20 mt-auto">
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-4 p-4 text-rose-500 hover:bg-rose-50/50 rounded-2xl transition-all group relative",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={22} />
          {!collapsed && <span className="font-bold text-sm">Sign Out</span>}
          {collapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Sign Out
            </div>
          )}
        </button>

        {!collapsed && (
          <div className="mt-6 p-4 bg-slate-900/5 rounded-2xl border border-slate-900/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-slate-900 text-xs text-center leading-none uppercase">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate uppercase tracking-widest">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 rounded-full bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-white hover:bg-brand-600 transition-all hover:scale-110 z-50 group/toggle"
      >
        {collapsed ? <ChevronRight size={14} className="group-hover/toggle:translate-x-0.5 transition-transform" /> : <ChevronLeft size={14} className="group-hover/toggle:-translate-x-0.5 transition-transform" />}
      </button>
    </aside>
  );
};

export default Sidebar;
