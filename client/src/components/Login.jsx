import React from 'react'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form'; 

export default function Login() {
  const navigate = useNavigate();
  
  const { register, handleSubmit } = useForm();

  // DYNAMIC API BASE URL SETUP: Automatically toggles between local testing and production deployment
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://ems-backend-j5vg.onrender.com';

  const onSubmit = async (formData) => {
    // 1. Predefined Super Admin credentials check
    if (formData.email === "superadmin@gmail.com" && formData.password === "super123") {
      localStorage.setItem('token', 'super-admin-mock-token');
      localStorage.setItem('role', 'super_admin');
      localStorage.setItem('userEmail', 'superadmin@ems.com');
      localStorage.setItem('userName', 'Super Admin');
      localStorage.setItem('userPhone', '+91 99999 99999');
      toast.success('Logged in as Super Admin with Complete Access!');
      navigate('/dashboard');
      return;
    }

    // 2. Predefined Regular Admin credentials bypass matrix
    if (formData.email === "admin1@ems.com" && formData.password === "admin1234") {
      localStorage.setItem('token', 'regular-admin-mock-token');
      localStorage.setItem('role', 'admin');
      localStorage.setItem('userEmail', 'admin@ems.com');
      localStorage.setItem('userName', 'System Admin');
      localStorage.setItem('userPhone', '+91 88888 88888');
      toast.success('Logged in successfully as System Administrator!');
      navigate('/dashboard');
      return;
    }

    // 3. Normal Admin / Employee Database Fallback
    try {
      // FIXED: Swapped out hardcoded localhost string for dynamic API_BASE_URL layout mapping
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role || 'employee'); 
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        
        localStorage.setItem('userPhone', data.user.phoneNumber || data.user.phone || "");

        toast.success(`Welcome back, ${data.user.name}!`);
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login credentials invalid.');
      }
    } catch (error) {
      toast.error('Connection failed. Make sure your server terminal is turned on!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8 md:p-10 relative overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-full"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/20 mb-3">
            EMS
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Login with Your Credential</h2>
          <p className="text-slate-400 text-xs mt-1">Sign in to your authorized EMS Dashboard Account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Official Email</label>
            <div className="relative">
              <input 
                type="email" 
                {...register("email")} 
                required 
                placeholder="name@company.com" 
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm" 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Account Password</label>
            </div>
            <input 
              type="password" 
              {...register("password")} 
              required 
              placeholder="••••••••" 
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm" 
              />
          </div>

          <div className="pt-2 space-y-3">
            <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition transform duration-150 text-sm tracking-wide">
              Login
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}