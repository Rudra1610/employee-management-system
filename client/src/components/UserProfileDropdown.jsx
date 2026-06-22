import React, { useState, useEffect, useRef } from 'react';

export default function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Hardcoded or dynamically fetched user details matching your UI image
  const user = {
    name: "satnaing",
    email: "satnaingdev@gmail.com",
    initials: "SN"
  };

  // Close the dropdown automatically if you click anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      
      {/* 1. THE DROPUP MENU PANEL */}
      {isOpen && (
        <div className="absolute bottom-full left-0 z-50 w-64 mb-2 bg-slate-900 border border-slate-850 rounded-xl shadow-2xl p-1.5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          {/* User Profile Header Segment */}
          <div className="flex items-center gap-3 p-2.5 border-b border-slate-800/60 mb-1">
            <div className="h-9 w-9 min-w-[36px] bg-slate-800 border border-slate-700 flex items-center justify-center rounded-lg text-sm font-semibold text-slate-200">
              {user.initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-slate-200 truncate">{user.name}</span>
              <span className="text-xs text-slate-400 truncate">{user.email}</span>
            </div>
          </div>

          {/* Action Items */}
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-amber-400 hover:bg-slate-800/70 rounded-lg transition-colors text-left font-medium">
              ✨ Upgrade to Pro
            </button>
            
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-300 hover:bg-slate-800/70 rounded-lg transition-colors text-left">
              ⚙️ Account
            </button>
            
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-300 hover:bg-slate-800/70 rounded-lg transition-colors text-left">
              💳 Billing
            </button>
            
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-300 hover:bg-slate-800/70 rounded-lg transition-colors text-left">
              🔔 Notifications
            </button>
            
            <div className="h-px bg-slate-800/60 my-1" />
            
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left font-medium">
              🚪 Sign out
            </button>
          </div>
        </div>
      )}

      {/* 2. THE MAIN SIDEBAR FOOTER BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-200 text-left cursor-pointer
          ${isOpen 
            ? 'bg-slate-800/80 border-slate-700 shadow-lg' 
            : 'bg-transparent border-transparent hover:bg-slate-800/40 hover:border-slate-800'
          }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Icon box */}
          <div className="h-9 w-9 min-w-[36px] bg-slate-800/80 border border-slate-700/60 flex items-center justify-center rounded-lg text-sm font-bold text-slate-300">
            {user.initials}
          </div>
          
          {/* Name and Email text strings */}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-200 truncate tracking-wide">{user.name}</span>
            <span className="text-xs text-slate-400 truncate font-medium">{user.email}</span>
          </div>
        </div>

        
        <div className="text-slate-400 text-xs pr-1 flex flex-col justify-center gap-0.5 select-none">
          <span>▲</span>
          <span className="-mt-1.5">▼</span>
        </div>
      </button>

    </div>
  );
}