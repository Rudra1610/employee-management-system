import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import MyProfile from './components/MyProfile.jsx';
import Leave from './components/Leave.jsx';
import Employees from './components/Employees.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Fallback landing route redirects automatically to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Core Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<MyProfile />} />

        {/* Leave Page Module Route */}
        <Route path="/leave" element={<Leave />} />

        {/* Employee Page Module Route */}
        <Route path="/employees" element={<Employees />} />
      </Routes>

      {/* Global ToastContainer */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;