import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Leave() {
  const userRole = (localStorage.getItem('role') || 'employee').toLowerCase();
  const loggedInUserName = localStorage.getItem('userName') || 'System User';

  // Core Layout State Hook
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Leave Data and Pagination States
  const [leaves, setLeaves] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const [formData, setFormData] = useState({
    type: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // DYNAMIC API BASE URL SETUP: Automatically toggles between local testing and cloud production hosts
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://ems-backend-j5vg.onrender.com'; // Replace this string parameter with your live Render backend Web Service URL

  const fetchLeaves = async () => {
    try {
      // FIXED: Injected dynamic API_BASE_URL to handle cloud routing configurations
      const response = await fetch(`${API_BASE_URL}/api/leaves/all`);
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      }
    } catch (error) {
      console.error("Error reading registry array lines:", error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [API_BASE_URL]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      // FIXED: Injected dynamic API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/leaves/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: loggedInUserName,
          email: localStorage.getItem('userEmail') || 'rudrabhatt45@gmail.com',
          type: formData.type,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason
        })
      });

      if (response.ok) {
        toast.success('Leave request securely logged to MongoDB!');
        setFormData({ type: 'Sick Leave', startDate: '', endDate: '', reason: '' });
        setCurrentPage(1); // Reset to first page on new submission
        fetchLeaves(); 
      } else {
        const errData = await response.json();
        toast.error('Submission rejected: ' + errData.message);
      }
    } catch (error) {
      toast.error('Network error connecting to backend express channels.');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // FIXED: Injected dynamic API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/leaves/update-status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Leave request state saved as [${newStatus}] in MongoDB!`);
        fetchLeaves(); 
      } else {
        const errData = await response.json();
        toast.error('Server failed to update status: ' + errData.message);
      }
    } catch (error) {
      toast.error('Network error updating state token elements.');
    }
  };

  const handleDeleteLeave = (leaveId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Are you sure you want to permanently clear this leave record from your history?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6', 
      cancelButtonColor: '#d33',     
      confirmButtonText: 'Yes, delete it!',
      background: '#1e293b',         
      color: '#fff'                  
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // FIXED: Injected dynamic API_BASE_URL
          const response = await fetch(`${API_BASE_URL}/api/leaves/delete/${leaveId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.ok) {
            setLeaves(prevLeaves => prevLeaves.filter(leave => leave._id !== leaveId));
            // Adjust pagination index edge case if last element on page is deleted
            if ((leaves.length - 1) <= (currentPage - 1) * recordsPerPage && currentPage > 1) {
              setCurrentPage(p => p - 1);
            }
            toast.success("Leave record cleared successfully.");
          } else {
            const errData = await response.json();
            toast.error("Failed to delete from database: " + errData.message);
          }
        } catch (error) {
          console.error("Deletion error:", error);
          toast.error("Network error connecting to backend express channels.");
        }
      }
    });
  };

  const isManagementRole = userRole === 'super_admin' || userRole === 'admin';
  const showLeaveForm = userRole === 'employee';

  // --- PAGINATION MATHEMATICS ---
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecordsList = leaves.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(leaves.length / recordsPerPage) || 1;

  return (
    /* FIXED: Changed min-h-screen to h-screen and forced overflow-hidden to fully lock the main layout view frame */
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col md:flex-row w-full overflow-hidden antialiased">
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* FIXED: Shifted classes to max-w-full and h-screen overflow-y-auto so ONLY this content container handles scrolling, pushing the bar to the bezel edge */}
      <div className="flex-1 h-screen overflow-y-auto p-6 md:p-8 max-w-full w-full transition-all duration-300 relative">
        
        {/* UNIFIED TOP HEADER BAR ROW WITH HAMBURGER CONTROLLER */}
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
              {isManagementRole ? 'Leave Applications Register' : 'Leave Request Center'}
            </h2>
            <p className="text-xs text-blue-400 font-medium">
              {isManagementRole ? 'Review, filter, and modify company out-of-office requests.' : 'Log time-off requests and track approval statuses.'}
            </p>
          </div>
        </div>

        {/* Content Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
          
          {/* LEFT PANEL: Leave Submission Form (Only shown to basic Employees) */}
          {showLeaveForm && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit backdrop-blur-md">
              <h3 className="text-lg font-bold text-white mb-1">Reason and Date of Leave</h3>
              <p className="text-xs text-slate-400 mb-6">Submit formal leave documentation profiles.</p>
              
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Leave Classification</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500">
                    <option>Sick Leave</option>
                    <option>Casual Leave</option>
                    <option>Maternity/Paternity Leave</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} required onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">End Date</label>
                    <input type="date" name="endDate" value={formData.endDate} required onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Justification/Reason Statement</label>
                  <textarea name="reason" rows="3" value={formData.reason} placeholder="Brief description..." onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-lg shadow-blue-500/10">
                  Confirm Leave Request
                </button>
              </form>
            </div>
          )}

          {/* RIGHT/MAIN PANEL: Global Ledger View */}
          <div className={showLeaveForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
              <div className="p-6 border-b border-slate-800 bg-slate-900/20">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isManagementRole ? 'Leave Records Database' : 'My Personal History'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">System log showing employee out-of-office registries.</p>
              </div>

              {leaves.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm tracking-wide italic">
                  No active or pending time-off profiles registered inside the core collection array.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900/40 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                          <th className="p-4 pl-6">Employee Name</th>
                          <th className="p-4">Leave Reason</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {currentRecordsList.map((leave) => (
                          <tr key={leave._id || Math.random()} className="hover:bg-slate-800/20 transition">
                            <td className="p-4 pl-6 font-semibold text-white">{leave.employeeName}</td>
                            <td className="p-4 text-slate-300 font-medium">{leave.type}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                leave.status === 'Approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                leave.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }`}>
                                {leave.status || 'Pending'}
                              </span>
                            </td>
                            
                            <td className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                              {isManagementRole ? (
                                <>
                                  {(leave.status === 'Pending' || !leave.status) ? (
                                    <>
                                      <button 
                                        onClick={() => handleStatusUpdate(leave._id, 'Approved')} 
                                        className="bg-green-600 hover:bg-green-700 text-white text-[11px] px-2.5 py-1.5 rounded-md font-bold transition shadow-md shadow-green-600/10"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => handleStatusUpdate(leave._id, 'Rejected')} 
                                        className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-[11px] px-2.5 py-1.5 rounded-md font-bold transition"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-slate-500 font-semibold italic border border-slate-800 bg-slate-950/20 px-2 py-1 rounded-md select-none">
                                      Decision Finalized
                                    </span>
                                  )}
                                </>
                              ) : (
                                leave.status === 'Rejected' && leave.employeeName === loggedInUserName && (
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteLeave(leave._id)} 
                                    className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-[11px] px-2.5 py-1 rounded-md font-medium transition shadow-sm"
                                  >
                                    Delete Request
                                  </button>
                                )
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION CONTROL FOOTER */}
                  {leaves.length > recordsPerPage && (
                    <div className="p-4 border-t border-slate-800/60 bg-slate-900/20 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        Showing entries {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, leaves.length)} of {leaves.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                          className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-slate-200 transition text-xs font-semibold"
                        >
                          Previous
                        </button>
                        <span className="text-xs text-slate-400 px-1 font-medium">Page {currentPage} of {totalPages}</span>
                        <button 
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                          className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-slate-200 transition text-xs font-semibold"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}