const IPAssignment = require("../models/IPAssignment");

async function findAvailableIP() {
    try {
      // Query existing IP assignments within the range
      const assignedIPs = await IPAssignment.find();
  
      // Create a set of assigned IPs for fast lookup
      const assignedIPSet = new Set(assignedIPs.map(ip => ip.ipAddress));
  
      for (let i = 1; i <= 225; i++) {
        for (let j = 1; j <= 254; j++) {
          // ipRange.push(`192.168.${i}.${j}`);
          const currentIP = `192.168.69.${j}`
          if (!assignedIPSet.has(currentIP)) {
            return currentIP;
          }
        }
      }
      // If no available IP found
      return null;
    } catch (err) {
      console.error('Error finding available IP:', err);
      throw err; // Propagate the error back to the caller
    }
  }

  module.exports = findAvailableIP;