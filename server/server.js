const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('./models/User');
require('dotenv').config();

const dns = require('dns');

const app = express();

// Middleware — FIXED: Removed trailing slash from origin to strictly pass browser CORS validation checks
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://employee-management-system-olive-zeta.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  // Instant 200 OK bypass for browser preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EXPOSE STATIC UPLOADS FOLDER FOR THE FRONTEND TO ACCESS PICTURES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

dns.setServers([
  '8.8.8.8',
  '8.8.4.4'
]);

// Connect to MongoDB using the environment variable supplied by Render dashboard
const dbURI = process.env.MONGO_URI;
mongoose
  .connect(dbURI)
  .then(() => {
    console.log('MongoDB Connected Successfully to Cloud Atlas');
  })
  .catch((err) => {
    console.log('MongoDB Initial Connection Error:', err.message);
  });

// Multer Storage Engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Core Inline MongoDB Leave Schema Configuration Mapping
const Leave = mongoose.models.Leave || mongoose.model('Leave', new mongoose.Schema({
  employeeName: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: String, required: true },
  startDate: { type: String }, 
  endDate: { type: String },   
  reason: { type: String },
  status: { type: String, default: 'Pending' }
}));

// ROOT ROUTE
app.get('/', (req, res) => {
  res.send("EMS Server API is fully operational.");
});

// 1. SIGNUP API ENDPOINT
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, position, dateOfJoining } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      position, 
      dateOfJoining,
      role: req.body.role || 'admin'
    });
    
    await newUser.save();
    return res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Write Failure: ' + error.message });
  }
});

// 1b. LOGIN API ENDPOINT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Account Credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Account Credentials.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'ems_secret_passphrase', { expiresIn: '1d' });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        position: user.position,
        role: user.role || 'employee'
      }
    });
  } catch (error) {
    console.error("Login Server Crash:", error);
    return res.status(500).json({ message: 'Server error during authentication: ' + error.message });
  }
});

// 2. SUBMIT LEAVE REQUEST API
app.post('/api/leaves/apply', async (req, res) => {
  try {
    const { employeeName, email, type, startDate, endDate, reason } = req.body;
    const newLeave = new Leave({ 
      employeeName, 
      email, 
      type, 
      startDate, 
      endDate, 
      reason, 
      status: 'Pending' 
    });
    await newLeave.save();
    return res.status(201).json({ message: 'Leave request logged successfully!' });
  } catch (error) {
    console.error("Apply Leave Server Error:", error);
    return res.status(500).json({ message: 'Server error saving leave: ' + error.message });
  }
});

// 3. GET ALL REGISTERED LEAVES API
app.get('/api/leaves/all', async (req, res) => {
  try {
    const allLeaves = await Leave.find({}).sort({ _id: -1 });
    return res.status(200).json(allLeaves);
  } catch (error) {
    return res.status(500).json({ message: 'Error pulling records: ' + error.message });
  }
});

// 3.5 GET DASHBOARD LEAVES
app.get('/api/leaves/dashboard', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

    const records = await Leave.find({
      status: 'Approved',
      $or: [
        { startDate: { $lte: tomorrowStr }, endDate: { $gte: todayStr } }
      ]
    });
    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: 'Dashboard logic processing error: ' + error.message });
  }
});

// 4. UPDATE LEAVE STATUS API
app.put('/api/leaves/update-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      id, 
      { status: status }, 
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave profile record not found.' });
    }

    return res.status(200).json({ message: 'Status updated permanently!', updatedLeave });
  } catch (error) {
    console.error("Update Status Crash:", error);
    return res.status(500).json({ message: 'Server error updating status: ' + error.message });
  }
});

// 5. GET ALL EMPLOYEES DIRECTORY ROUTE
app.get('/api/auth/employees', async (req, res) => {
  try {
    const activeStaff = await User.find({}).sort({ _id: -1 }); 
    return res.status(200).json(activeStaff);
  } catch (error) {
    return res.status(500).json({ message: 'Error gathering directory list: ' + error.message });
  }
});

// 6. ADMINISTRATIVE MANUAL ONBOARDING ROUTE
app.post('/api/auth/employees/add', async (req, res) => {
  try {
    const { name, email, password, position, department, dateOfJoining, phoneNumber, aadharNumber, panNumber, role } = req.body;

    const duplicateCheck = await User.findOne({ email });
    if (duplicateCheck) {
      return res.status(400).json({ message: 'Email address already occupies a profile token.' });
    }

    const passedPassword = password && password.trim() !== "" ? password : 'ScrambledDefaultPass123!';
    const hashedOnboardPassword = await bcrypt.hash(passedPassword, 10);

    const newStaffMember = new User({
      name,
      email,
      password: hashedOnboardPassword,
      position,
      department: department || 'Development',
      dateOfJoining,
      phoneNumber: phoneNumber || '', 
      aadharNumber: aadharNumber || '',
      panNumber: panNumber || '',
      role: role || 'employee'
    });

    await newStaffMember.save();
    return res.status(201).json({ message: 'New employee logged successfully!' });
  } catch (error) {
    console.error("Onboarding backend error:", error);
    return res.status(500).json({ message: 'Database Data Channel Error: ' + error.message });
  }
});

// 7. ADMINISTRATIVE UPDATE EMPLOYEE PROFILE ROUTE
app.put('/api/auth/employees/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, position, department, dateOfJoining, phoneNumber, aadharNumber, panNumber, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, position, department, dateOfJoining, phoneNumber, aadharNumber, panNumber, role },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Employee profile not found.' });
    }

    return res.status(200).json({ message: 'Profile updated successfully!', updatedUser });
  } catch (error) {
    return res.status(500).json({ message: 'Server database update error: ' + error.message });
  }
});

// 8. GET INDIVIDUAL USER BY EMAIL ROUTE
app.get('/api/auth/employees/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const userProfile = await User.findOne({ email });
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    return res.status(200).json(userProfile);
  } catch (error) {
    return res.status(500).json({ message: 'Server database read error: ' + error.message });
  }
});

// 9. UNIFIED REMOVE/DELETE EMPLOYEE ROUTE
app.delete('/api/employees/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Employee record not found in database.' });
    }

    return res.status(200).json({ message: 'Employee profile deleted permanently from MongoDB!' });
  } catch (error) {
    console.error("[DATABASE ERROR] Deletion failed:", error);
    return res.status(500).json({ message: 'Server database deletion error: ' + error.message });
  }
});

// 10. PROFILE UPDATE ENDPOINT
app.put('/api/users/update-profile', upload.single('profileImage'), async (req, res) => {
  try {
    const { email, name, password = "" } = req.body;
    let updateFields = { name };

    if (password && password.trim() !== "") {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      const currentHost = req.get('host');
      const protocol = req.protocol;
      updateFields.profileImage = `${protocol}://${currentHost}/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    return res.status(200).json({ message: 'Profile updated with avatar photo!', updatedUser });
  } catch (error) {
    console.error("Profile update server error:", error);
    return res.status(500).json({ message: 'Server database write error: ' + error.message });
  }
});

// 11. DASHBOARD AGGREGATION STATS API
app.get('/api/auth/dashboard-stats', async (req, res) => {
  try {
    const totalStaff = await User.countDocuments({});
    const uniqueDesignations = await User.distinct('position');
    const totalDesignations = uniqueDesignations.length;

    const now = new Date();
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);

    const formats = [
      now.toISOString().split('T')[0], 
      tom.toISOString().split('T')[0],
      `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`, 
      `${String(tom.getDate()).padStart(2, '0')}-${String(tom.getMonth() + 1).padStart(2, '0')}-${tom.getFullYear()}`,
      now.toLocaleDateString('en-US'), 
      tom.toLocaleDateString('en-US')
    ];

    const allApproved = await Leave.find({ status: 'Approved' });
    
    const onLeaveToday = allApproved.filter(leave => {
      return formats.includes(leave.startDate) || formats.includes(leave.endDate);
    });

    const allEmployeesList = await User.find({}, '-password').sort({ _id: -1 });

    return res.status(200).json({
      totalStaff,
      totalDesignations,
      onLeaveToday,
      allEmployeesList
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ message: 'Error processing dashboard statistics: ' + error.message });
  }
});

// 12. UNIFIED DELETE LEAVE ROUTE
app.delete('/api/leaves/delete/:id', async (req, res) => {
  try {
    const leaveId = req.params.id;
    const deletedLeave = await Leave.findByIdAndDelete(leaveId);
    if (!deletedLeave) {
      return res.status(404).json({ message: "Leave record not found in MongoDB." });
    }
    return res.status(200).json({ message: "Leave record permanently cleared from database!" });
  } catch (error) {
    console.error("Delete Leave Server Error:", error);
    return res.status(500).json({ message: "Server error saving delete command: " + error.message });
  }
});

// MASTER PORT INITIALIZATION LISTENER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running smoothly on port ${PORT}`);
});