import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';

export default function Dashboard() {
  const userRole = localStorage.getItem('role') || 'employee';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [stats, setStats] = useState({
    totalStaff: 0,
    totalDesignations: 0,
    onLeaveToday: [],
    allEmployeesList: []
  });
  const [loading, setLoading] = useState(true);

  // 1. Pagination Hook States
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // DYNAMIC API BASE URL SETUP: Automatically toggles between local testing and cloud production hosts
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://ems-backend-44yg.onrender.com'; // Replace this string parameter with your live Render backend Web Service URL

  const fetchDashboardStats = async () => {
    if (userRole === 'employee') {
      setLoading(false);
      return;
    }

    try {
      // FIXED: Refactored endpoint mapping string to inherit the dynamic production domain URL
      const response = await fetch(`${API_BASE_URL}/api/auth/dashboard-stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error linking to aggregation pipeline:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [userRole]);

  // 2. Calculate indices for Master Employee List pagination split
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  
  const currentEmployeesList = (stats.allEmployeesList || []).slice(
    indexOfFirstRecord, 
    indexOfLastRecord
  );
  
  const totalPages = Math.ceil((stats.allEmployeesList || []).length / recordsPerPage) || 1;

  return (
    /* FIXED: Changed min-h-screen to h-screen and added overflow-hidden to lock the layout viewport */
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col md:flex-row overflow-hidden">
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* FIXED: Added h-screen and overflow-y-auto here so ONLY this dashboard area scrolls while the sidebar stays locked */}
      <div className="flex-1 h-screen overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full transition-all duration-300 relative">
        
        {/* Header Controller */}
        <div className="flex items-center gap-4 mb-6 pb-2 border-b border-slate-800/40 max-w-full lg:max-w-[65%]">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center h-10 w-10 min-w-[40px]"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            ☰
          </button>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Welcome to the Live Dashboard</h2>
            <p className="text-xs text-blue-400 font-medium">Your Workspace</p>
          </div>
        </div>

      
        {(userRole === 'super_admin' || userRole === 'admin') && (
          <>
            
            <div className="w-full lg:max-w-[65%] space-y-6">
              
              <div className="flex flex-wrap gap-4">
                <div className="bg-slate-900/60 border border-slate-800 px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Employees/Admins:</span>
                  <span className="text-lg font-black text-white">{stats.totalStaff}</span>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Designations:</span>
                  <span className="text-lg font-black text-white">{stats.totalDesignations}</span>
                </div>
              </div>

              
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden w-full">
                <div className="p-5 border-b border-slate-800 bg-slate-950/20">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Master Employee Register</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Authorized system database records matching Total Employees.</p>
                </div>

                {stats.allEmployeesList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 italic">
                    No employees saved to local MongoDB yet.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-slate-950/40 text-xs font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                            <th className="p-3.5 pl-6">Name</th>
                            <th className="p-3.5">Designation</th>
                            <th className="p-3.5">Department</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
                          {currentEmployeesList.map(emp => (
                            <tr key={emp._id} className="hover:bg-slate-800/10 transition">
                              <td className="p-3.5 pl-6 font-semibold text-slate-200">{emp.name}</td>
                              <td className="p-3.5 text-blue-400 font-medium">{emp.position}</td>
                              <td className="p-3.5 text-slate-400">{emp.department || 'Development'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* PAGINATION INTERACTIVE CONTROL LAYER FOOTER */}
                    {stats.allEmployeesList.length > recordsPerPage && (
                      <div className="p-3 border-t border-slate-800/60 bg-slate-950/20 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          Showing entries {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, stats.allEmployeesList.length)} of {stats.allEmployeesList.length}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            className="inline-flex items-center justify-center h-7 px-3 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-slate-200 transition text-[11px]"
                          >
                            Previous
                          </button>
                          <span className="text-slate-400 px-1 font-medium">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-slate-200 transition text-[11px]"
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

            {/* CONTENT BLOCK RIGHT: OUT OF OFFICE REGISTRY */}
            <div className="w-full lg:w-[30%] p-5 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md mt-6 lg:mt-0 lg:absolute lg:top-8 lg:right-8">
              <h3 className="text-red-500 font-bold tracking-wider uppercase text-xs mb-1">
                OUT OF OFFICE REGISTRY (TODAY/TOMORROW)
              </h3>
              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                Live monitoring records showing team members currently on approved leave.
              </p>

              <div className="space-y-3">
                {stats.onLeaveToday.length === 0 ? (
                  <p className="text-gray-400 italic text-xs py-2">No employees scheduled on leave today or tomorrow.</p>
                ) : (
                  stats.onLeaveToday.map((leave, index) => (
                    <div key={index} className="flex flex-col p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1.5 backdrop-blur-sm">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-slate-200 text-xs truncate max-w-[120px]">
                          {leave.employeeName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full font-bold border border-red-500/20 whitespace-nowrap">
                          {leave.type ? leave.type.split(' ')[0] : 'Leave'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-2 gap-y-0.5 font-medium border-t border-slate-800/40 pt-1.5">
                        <span><strong>From:</strong> {leave.startDate}</span>
                        <span><strong>To:</strong> {leave.endDate}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Regular Employee View */}
        {userRole === 'employee' && (
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-xl max-w-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Employee Portal Active</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Welcome to your digital workspace environment. Use the navigation panel on the side to manage your profile and apply for active leave submission applications.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}