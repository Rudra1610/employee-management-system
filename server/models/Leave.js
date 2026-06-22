const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: String, required: true }, // e.g., "Sick Leave", "Casual Leave"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, default: 'Pending' } // Pending, Approved, Rejected
});

module.exports = mongoose.model('Leave', LeaveSchema); 
