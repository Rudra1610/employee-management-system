import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import { toast } from 'react-toastify';

export default function MyProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  // 1. Core State Hook to track if the Sidebar panel is expanded or hidden
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
  const [previewUrl, setPreviewUrl] = useState(defaultAvatar);

  const userRole = localStorage.getItem('role') || 'employee';

  // DYNAMIC API BASE URL SETUP: Automatically toggles between local testing and cloud production hosts
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://ems-backend-j5vg.onrender.com'; // Replace this string parameter with your live Render backend Web Service URL

  useEffect(() => {
    if (userRole === 'super_admin') {
      setName('Super Admin');
      setEmail('superadmin@ems.com');
      return;
    }

    const userEmail = localStorage.getItem('userEmail') || 'rudrabhatt45@gmail.com';
    setEmail(userEmail);

    fetch(`${API_BASE_URL}/api/auth/employees/profile/${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setName(data.name || localStorage.getItem('userName') || 'Employee User');
          if (data.profileImage) {
            setPreviewUrl(data.profileImage);
          }
        }
      })
      .catch(err => console.error("Error loading user profile state payload:", err));
  }, [userRole, API_BASE_URL]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); 
      const targetUrl = URL.createObjectURL(file);
      setPreviewUrl(targetUrl);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (userRole === 'super_admin') {
      toast.error("Predefined Super Admin account fields are locked and cannot be altered.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', name);
      formData.append('password', password);
      
      if (imageFile) { 
        formData.append('profileImage', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/users/update-profile`, {
        method: 'PUT',
        body: formData 
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Profile updated successfully!");
        if (data.updatedUser && data.updatedUser.profileImage) {
          setPreviewUrl(data.updatedUser.profileImage);
        }
        localStorage.setItem('userName', name); 
        setPassword(''); 
      } else {
        toast.error(data.message || 'Failed to update credentials.');
      }
    } catch (error) {
      toast.error('Cannot establish backend pipeline link. Verify your server deployment status.');
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col md:flex-row overflow-hidden">
      
      {/* Pass State variables explicitly down to match dashboard toggle logic */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* FIXED: Changed max-w-4xl to max-w-full to throw the container edge and its scrollbar all the way to the outside window borders */}
      <div className="flex-1 h-screen overflow-y-auto p-6 md:p-8 max-w-full w-full flex flex-col justify-start transition-all duration-300 relative">
        
        {/* Unified Action Header Row with Hamburger controller button */}
        <div className="flex items-center gap-4 mb-6 pb-2 border-b border-slate-800/40">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center h-10 w-10 min-w-[40px]"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            ☰
          </button>
          
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">My Profile</h2>
            <p className="text-xs text-blue-400 font-medium">Personal profile metrics and credentials configuration</p>
          </div>
        </div>

        {/* FIXED CONTAINER OPTIMIZATION: Wrapped the card layout container to keep form fields neatly organized while the main scroll strip hugs the monitor bezel */}
        <div className="max-w-4xl w-full mx-auto">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                <div className="relative group">
                  <img src={previewUrl} alt="User Profile" className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition duration-200" />
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Profile Identity Picture</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={userRole === 'super_admin'} className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20 file:cursor-pointer transition disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Username / Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={userRole === 'super_admin'} required className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm disabled:cursor-not-allowed disabled:opacity-50" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Registered Email (Read Only)</label>
                  <input type="email" value={email} disabled className="w-full bg-slate-950/40 border border-slate-900 rounded-lg p-3 text-slate-500 cursor-not-allowed text-sm focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">New Account Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={userRole === 'super_admin'} placeholder={userRole === 'super_admin' ? "Master profile passwords are immutable" : "Leave entirely blank if you do not want to alter password"} className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={userRole === 'super_admin'} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-indigo-500/10 active:scale-[0.99] transition transform duration-150 text-sm tracking-wide disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none">
                  {userRole === 'super_admin' ? 'Account Profile Locked' : 'Confirm Upload'}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}