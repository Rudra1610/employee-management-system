const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  position: { type: String, required: true },
  dateOfJoining: { type: String, required: true },
  phoneNumber: { type: String, default: "" },
  aadharNumber: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  department: { type: String, default: 'Development' },
  role: { type: String, default: 'user' },
  profileImage: { type: String, default: ''}
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);