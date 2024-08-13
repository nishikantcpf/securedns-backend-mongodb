const mongoose = require('mongoose');


const IPAssignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ipAddress: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, expires: '24h' }
});

const IPAssignment = mongoose.model('IPAssignment', IPAssignmentSchema);

module.exports = IPAssignment;
