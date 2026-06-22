import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userRole = (localStorage.getItem('role') || 'employee').toLowerCase();
  const loggedInUserName = localStorage.getItem('userName') || 'System User';
  const loggedInUserEmail = localStorage.getItem('userEmail') || `${loggedInUserName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', allowedRoles: ['super_admin', 'admin', 'employee'] },
    { name: 'Employee Profiles', path: '/employees', icon: '👥', allowedRoles: ['super_admin', 'admin'] }, 
    { name: 'Leave Registry', path: '/leave', icon: '📅', allowedRoles: ['super_admin', 'admin', 'employee'] },
  ];

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBadgeConfig = () => {
    switch (userRole) {
      case 'super_admin':
        return { label: 'Super Admin', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'admin':
        return { label: 'Admin', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      default:
        return { label: 'Employee', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
  };

  const badge = getBadgeConfig();
  const userInitials = loggedInUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SU';

  return (
    <>
      {/* MOBILE DARK BACKDROP OVERLAY */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      {/* UPDATED CONTAINER: Fixed layout to stick perfectly to full viewport height without shifting or stretching */}
      <div 
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-slate-950 border-r border-slate-900 flex flex-col justify-between transition-all duration-300 ease-in-out
          ${isOpen 
            ? 'w-64 p-6 opacity-100 translate-x-0' 
            : '-translate-x-full md:translate-x-0 md:w-0 md:p-0 md:opacity-0 md:overflow-hidden md:border-r-0'
          }`}
      >
        <div className={isOpen ? 'opacity-100 transition-opacity duration-200' : 'opacity-0'}>
          
          {/* Brand Row - Forced inline with tracking limits */}
          <div className="flex items-center justify-between gap-2 mb-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 min-w-[36px] rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm">
                EMS
              </div>
              <div className="min-w-0">
                <h1 className="text-xs font-bold tracking-wider text-white uppercase whitespace-nowrap truncate">
                  Employee Portal
                </h1>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="md:hidden text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg hover:bg-slate-800/50"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 mb-8">
            {menuItems
              .filter((item) => item.allowedRoles.includes(userRole))
              .map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      if (window.innerWidth < 768) setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15 scale-[1.02]'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="whitespace-nowrap">{item.name}</span>
                  </button>
                );
              })}
          </nav>
        </div>

        {/* User Profile Footer Dropup */}
        <div 
          className={`mt-auto border-t border-slate-800/60 pt-4 relative ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
          ref={dropdownRef}
        >
          {isProfileOpen && (
            <div className="absolute bottom-full left-0 z-50 w-full min-w-[210px] mb-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 backdrop-blur-md">
              <div className="flex items-center gap-3 p-2.5 border-b border-slate-800/60 mb-1">
                <div className="h-9 w-9 min-w-[36px] bg-slate-800 border border-slate-700 flex items-center justify-center rounded-xl text-xs font-bold text-slate-200">
                  {userInitials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-slate-200 truncate tracking-wide">{loggedInUserName}</span>
                  <span className="text-[11px] text-slate-400 truncate">{loggedInUserEmail}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <button 
                  type="button"
                  onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-xl transition-colors text-left font-medium"
                >
                  ⚙️ Account Settings
                </button>
                <div className="h-px bg-slate-800/60 my-1" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left font-bold"
                >
                  🚪 Sign out Account
                </button>
              </div>
            </div>
          )}

          <button 
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all duration-200 text-left cursor-pointer
              ${isProfileOpen ? 'bg-slate-900 border-slate-800' : 'bg-transparent border-transparent hover:bg-slate-800/20'}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 min-w-[36px] bg-slate-800 border border-slate-700/60 flex items-center justify-center rounded-xl text-xs font-black text-slate-300">
                {userInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-200 truncate tracking-wide leading-tight">{loggedInUserName}</span>
                <span className="text-[11px] text-slate-400 truncate font-medium">{loggedInUserEmail}</span>
              </div>
            </div>
            <div className="text-slate-500 text-[9px] pr-0.5 flex flex-col justify-center gap-0.5 select-none opacity-80">
              <span>▲</span><span className="-mt-1">▼</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}