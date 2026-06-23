import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Search, UserPlus, X, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';

export default function Employees() {
  const userRole = (localStorage.getItem('role') || 'employee').toLowerCase();
  const loggedInEmail = localStorage.getItem('userEmail') || "rudrabhatt45@gmail.com";

  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Sidebar Open/Close Toggle State Hook
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modal, search, dropdown tracking, and pagination parameters
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeActionMenu, setActiveActionMenu] = useState(null); 
  const recordsPerPage = 5;

  // DYNAMIC API BASE URL SETUP: Automatically toggles between local testing and cloud production hosts
  // FIXED: Successfully mapped to your current active live Render backend service layout configuration
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://ems-backend-j5vg.onrender.com';

  const [onboardData, setOnboardData] = useState({ 
    name: '',
    email: '',
    password: '', 
    position: '',
    department: '',
    dateOfJoining: '',
    phoneNumber: '', 
    aadharNumber: '',
    panNumber: '',
    role: 'employee' 
  });

  const [editData, setEditData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    dateOfJoining: '',
    phoneNumber: '', 
    aadharNumber: '',
    panNumber: '',
    role: 'employee'
  });

  const isManagementRole = userRole === 'super_admin' || userRole === 'admin';

  const fetchEmployees = async () => {
    if (!isManagementRole) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/employees`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error reading directory ledger:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/employees/profile/${loggedInEmail}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedEmp(data);
      } else {
        setSelectedEmp({
          _id: "none",
          name: localStorage.getItem('userName') || "New Staff Member",
          email: loggedInEmail,
          position: "Awaiting Assignment",
          department: "General Staff",
          dateOfJoining: new Date().toISOString().split('T')[0],
          phoneNumber: "",
          aadharNumber: "",
          panNumber: "",
          role: 'employee'
        });
      }
    } catch (error) {
      console.error("Error pulling single profile element:", error);
      setSelectedEmp({
        _id: "none",
        name: localStorage.getItem('userName') || "New Staff Member",
        email: loggedInEmail,
        position: "Awaiting Assignment",
        department: "General Staff",
        dateOfJoining: new Date().toISOString().split('T')[0],
        phoneNumber: "",
        aadharNumber: "",
        panNumber: "",
        role: 'employee'
      });
    }
  };

  useEffect(() => {
    if (isManagementRole) {
      fetchEmployees();
    } else {
      fetchUserProfile();
    }
    setIsEditing(false);
  }, [userRole]);

  const handleOnboardChange = (e) => {
    setOnboardData({ ...onboardData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (emp) => {
    setSelectedEmp(emp);
    setEditData({
      name: emp.name || '',
      email: emp.email || '',
      position: emp.position || '',
      department: emp.department || 'Development',
      dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.split('T')[0] : '',
      phoneNumber: emp.phoneNumber || emp.phone || '', 
      aadharNumber: emp.aadharNumber || '',
      panNumber: emp.panNumber || '',
      role: emp.role || 'employee'
    });
    setIsEditing(true);
    setActiveActionMenu(null); 
  };

  const handleDeleteEmployee = (employeeId) => {
    setActiveActionMenu(null);
    Swal.fire({
      title: 'Are you absolutely sure?',
      text: "Are you sure you want to delete this account profile permanently from MongoDB?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6', 
      cancelButtonColor: '#d33',     
      confirmButtonText: 'Yes, delete record!',
      background: '#1e293b',         
      color: '#fff'                  
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/employees/delete/${employeeId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.ok) {
            setEmployees(prevEmployees => prevEmployees.filter(emp => emp._id !== employeeId));
            toast.success("Profile permanently removed from database.");
          } else {
            const errData = await response.json();
            toast.error("Database deletion failed: " + errData.message);
          }
        } catch (error) {
          console.error("Profile deletion error:", error);
          toast.error("Network error connecting to backend express channels.");
        }
      }
    });
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/employees/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardData)
      });

      const resData = await response.json();
      if (response.ok) {
        toast.success(`${onboardData.role === 'admin' ? 'Admin' : 'Employee'} account profile record logged to MongoDB`);
        setOnboardData({
          name: '',
          email: '',
          password: '', 
          position: '',
          department: '',
          dateOfJoining: '',
          phoneNumber: '',
          aadharNumber: '',
          panNumber: '',
          role: 'employee'
        });
        setIsModalOpen(false); 
        fetchEmployees(); 
      } else {
        toast.error('Failed to save record: ' + resData.message);
      }
    } catch (error) {
      toast.error('Network error writing data entry to server channel.');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const targetId = selectedEmp._id;
      if (targetId === "none") {
        toast.error("This record has not been written to the database collection yet.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/employees/update/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        toast.success('Data changes saved permanently to MongoDB');
        setIsEditing(false);
        if (isManagementRole) {
          fetchEmployees();
        } else {
          fetchUserProfile();
        }
      } else {
        const resData = await response.json();
        toast.error('Failed to update record: ' + (resData.message || 'Server error'));
      }
    } catch (error) {
      toast.error('Network error communicating profile updates.');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecordsList = filteredEmployees.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage) || 1;

  const mockUsername = (email) => email ? email.split('@')[0].toLowerCase() : 'user_node';

  const toggleActionMenu = (id) => {
    setActiveActionMenu(activeActionMenu === id ? null : id);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col md:flex-row antialiased overflow-hidden">
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 h-screen overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full transition-all duration-300 relative">

        {/* UNIFIED HEADER ACTION ROW TOGGLE */}
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
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              {isManagementRole ? "Employees Data List" : "My Profile Settings"}
            </h2>
            <p className="text-xs text-blue-400 font-medium">
              {isManagementRole ? "Access central tracking, search profiles, and configure access levels." : "Manage and review corporate identity metrics."}
            </p>
          </div>
        </div>

        {/* Privileged Management Dashboard Section */}
        {isManagementRole && !isEditing && (
          <div className="space-y-6 pt-2">
            
            {/* SUB CONTAINER HEADER BUTTON ONLY */}
            <div className="flex justify-end mb-2">
              <button 
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition"
              >
                <UserPlus className="h-4 w-4" /> Add New User
              </button>
            </div>

            {/* LIVE FILTERS SEARCH BOX */}
            <div className="flex items-center gap-3">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Filter users by name query..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); setActiveActionMenu(null); }}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
                />
              </div>
              <span className="text-xs px-3 py-2 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-400 font-medium">
                Total Matches: {filteredEmployees.length}
              </span>
            </div>

            {/* MASTER SYSTEM USERS DATA TABLE */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20 backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/40 text-slate-400 font-bold border-b border-slate-800/80 tracking-wider uppercase">
                      <th className="p-4 pl-6">Username</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Phone Number</th>
                      <th className="p-4">Aadhar Card</th>
                      <th className="p-4">PAN Card</th>
                      <th className="p-4">Role</th>
                      <th className="p-4 pr-6 text-center w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {currentRecordsList.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-12 text-center text-slate-500 italic bg-slate-950/10">
                          No matching database profile elements discovered matching your input filter description.
                        </td>
                      </tr>
                    ) : (
                      currentRecordsList.map((emp) => (
                        <tr key={emp._id || Math.random()} className="hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 pl-6 font-mono text-slate-400">
                            {mockUsername(emp.email)}
                          </td>
                          <td className="p-4 font-semibold text-slate-100">
                            {emp.name}
                          </td>
                          <td className="p-4 text-slate-400">
                            {emp.email}
                          </td>
                          <td className="p-4 font-medium text-slate-200">
                            {emp.phoneNumber || emp.phone || "Not Entered"}
                          </td>
                          <td className="p-4 font-mono text-slate-400">
                            {emp.aadharNumber || '[Aadhaar Redacted]'}
                          </td>
                          <td className="p-4 font-mono text-slate-400 uppercase">
                            {emp.panNumber || 'Not Entered'}
                          </td>
                          <td className="p-4 font-semibold text-indigo-400 tracking-wide">
                            {(emp.role || '').toLowerCase() === 'admin' ? 'Admin' : (emp.position || 'Employee')}
                          </td>
                          
                          <td className="p-4 pr-6 text-center relative w-16 whitespace-nowrap">
                            <button 
                              type="button"
                              onClick={() => toggleActionMenu(emp._id)}
                              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition focus:outline-none"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            
                            {activeActionMenu === emp._id && (
                              <div className="absolute right-12 top-2 z-50 w-28 bg-slate-950 border border-slate-800 rounded-lg shadow-xl py-1 flex flex-col text-left text-xs">
                                <button 
                                  type="button" 
                                  onClick={() => handleEditClick(emp)} 
                                  className="w-full px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition"
                                >
                                  <Edit2 className="h-3 w-3 text-indigo-400" /> Edit
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleDeleteEmployee(emp._id)} 
                                  className="w-full px-3 py-1.5 hover:bg-red-950/40 text-red-400 hover:text-red-300 flex items-center gap-2 transition border-t border-slate-900"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION PANEL FOOTER */}
              {filteredEmployees.length > recordsPerPage && (
                <div className="p-4 border-t border-slate-800/60 bg-slate-900/20 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Showing entries {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredEmployees.length)} of {filteredEmployees.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => { setCurrentPage(p => Math.max(p - 1, 1)); setActiveActionMenu(null); }}
                      className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-slate-200 transition"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-slate-400 px-1 font-medium">Page {currentPage} of {totalPages}</span>
                    <button 
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => { setCurrentPage(p => Math.min(p + 1, totalPages)); setActiveActionMenu(null); }}
                      className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-slate-200 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FLOATING OVERLAY MODAL FORM DIALOG VIEW */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">Register New Account (Employee/Admin)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Create new user here. Click save when you're done.</p>
              </div>
              
              <form onSubmit={handleOnboardSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">Full Name</label>
                  <input type="text" name="name" value={onboardData.name} required onChange={handleOnboardChange} placeholder="e.g. Rudra Bhatt" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">Email Address</label>
                  <input type="email" name="email" value={onboardData.email} required onChange={handleOnboardChange} placeholder="name@company.com" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">Account Login Password</label>
                  <input type="password" name="password" value={onboardData.password} required onChange={handleOnboardChange} placeholder="••••••••" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500" />
                </div>
                
                {userRole === 'super_admin' ? (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">Select Which Account</label>
                    <select name="role" value={onboardData.role} onChange={handleOnboardChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500">
                      <option value="employee">Employee Account</option>
                      <option value="admin">Admin Account</option>
                    </select>
                  </div>
                ) : (
                  <input type="hidden" name="role" value="employee" />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">Position Title</label>
                    <input type="text" name="position" value={onboardData.position} required onChange={handleOnboardChange} placeholder="Designation" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">Department</label>
                    <input type="text" name="department" value={onboardData.department} required onChange={handleOnboardChange} placeholder="Location" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">Contact Phone Number</label>
                  <input type="text" name="phoneNumber" value={onboardData.phoneNumber} required onChange={handleOnboardChange} placeholder="e.g. +91 98765 43210" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">Aadhar Card</label>
                    <input type="text" name="aadharNumber" value={onboardData.aadharNumber} required onChange={handleOnboardChange} placeholder="12-digit number" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">PAN Card</label>
                    <input type="text" name="panNumber" value={onboardData.panNumber} required onChange={handleOnboardChange} placeholder="10-digit Alphanumeric" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400">Date of Joining</label>
                  <input type="date" name="dateOfJoining" value={onboardData.dateOfJoining} required onChange={handleOnboardChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-zinc-300 text-xs focus:outline-none focus:border-blue-500" />
                </div>

                <div className="pt-3 flex gap-2 text-xs">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg transition border border-slate-700/60 font-bold">Back</button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg transition shadow-md font-bold">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Standard Non-Privileged Employee Profile Card Layout Panel */}
        {userRole === 'employee' && !isEditing && selectedEmp && (
          <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md mt-2">
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                <div><span className="text-slate-500 uppercase block tracking-wider font-semibold">Full Name</span> <p className="text-white font-medium mt-0.5">{selectedEmp.name}</p></div>
                <div><span className="text-slate-500 uppercase block tracking-wider font-semibold">Official Email</span> <p className="text-white font-medium mt-0.5">{selectedEmp.email}</p></div>
                <div className="mt-1"><span className="text-slate-500 uppercase block tracking-wider font-semibold">Contact Phone</span> <p className="text-emerald-400 font-medium mt-0.5">{selectedEmp.phoneNumber || selectedEmp.phone || "Not Entered"}</p></div>
                <div className="mt-1"><span className="text-slate-500 uppercase block tracking-wider font-semibold">Position Status</span> <p className="text-blue-400 font-bold mt-0.5">{selectedEmp.position || 'Employee'}</p></div>
                <div><span className="text-slate-500 uppercase block tracking-wider font-semibold">Department</span> <p className="text-white font-medium mt-0.5">{selectedEmp.department}</p></div>
                <div><span className="text-slate-500 uppercase block tracking-wider font-semibold">Joining Date</span> <p className="text-slate-300 mt-0.5">{selectedEmp.dateOfJoining ? selectedEmp.dateOfJoining.split('T')[0] : 'N/A'}</p></div>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Identity Details Ledger</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500 font-medium">PAN Card:</span> <p className="text-slate-300 mt-0.5">{selectedEmp.panNumber || 'Not Entered'}</p></div>
                </div>
              </div>
              <button type="button" onClick={() => handleEditClick(selectedEmp)} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-lg">
                Edit Profile Information
              </button>
            </div>
          </div>
        )}

        {/* DIRECT PROFILE EDIT LAYOUT PANEL MODULE */}
        {isEditing && selectedEmp && (
          <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md mt-2">
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1.5">Full Name</label>
                  <input type="text" name="name" value={editData.name} required onChange={handleEditInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1.5">Email Address</label>
                  <input type="email" name="email" value={editData.email} required disabled className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-slate-500 cursor-not-allowed" />
                </div>

                {userRole === 'super_admin' && (
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1.5">Account System Role</label>
                    <select name="role" value={editData.role} onChange={editData.role ? handleEditInputChange : undefined} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500">
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-400 mb-1.5">Designation Info</label>
                  <input type="text" name="position" value={editData.position} required onChange={handleEditInputChange} disabled={!isManagementRole} className={`w-full border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 ${!isManagementRole ? 'bg-slate-800/50 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white'}`} />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1.5">Department</label>
                  <input type="text" name="department" value={editData.department} required onChange={handleEditInputChange} disabled={!isManagementRole} className={`w-full border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 ${!isManagementRole ? 'bg-slate-800/50 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white'}`} />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1.5">Contact Phone Number</label>
                  <input type="text" name="phoneNumber" value={editData.phoneNumber} onChange={handleEditInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1.5">Aadhar Card Number</label>
                  <input type="text" name="aadharNumber" value={editData.aadharNumber} onChange={handleEditInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1.5">PAN Card Number</label>
                  <input type="text" name="panNumber" value={editData.panNumber} onChange={handleEditInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="pt-4 flex gap-3 text-xs">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-lg transition border border-slate-700/60">Cancel Action</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-2.5 rounded-lg transition shadow-lg">Save Changes</button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}