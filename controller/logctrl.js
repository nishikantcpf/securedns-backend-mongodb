const jwt = require('jsonwebtoken');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const { error } = require('console');
const VpnStat = require('../models/vpnstat'); // Corrected import name to match model
const User = require('../models/usermodel');

const execPromise = util.promisify(exec);

const vpnStateCtrl = async (req, res) => {
  try {
    // Extract data from the request body
    const { cumulativeUpload, cumulativeDownload, token, uid } = req.body;

    if (!uid) {
      throw new Error("UID is required.");
    }

    // Check if a document with the given uid exists
    let vpnStatDocument = await VpnStat.findOne({ uid });
    // console.log(vpnStatDocument)
    if (vpnStatDocument) {
      // Update existing document
      vpnStatDocument.timestamp = new Date();
      vpnStatDocument.token = token;
      vpnStatDocument.totaldownload = cumulativeDownload;
      vpnStatDocument.totalupload = cumulativeUpload;
      await vpnStatDocument.save();
      res.json({ success: true, message: 'Document updated successfully ' });
    } else {
      // Create a new document
      vpnStatDocument = new VpnStat({
        uid,
        timestamp: new Date(),
        token,
        totaldownload: cumulativeDownload,
        totalupload: cumulativeUpload,
      });
      await vpnStatDocument.save();
      res.json({ success: true, message: 'Document created successfully ' });
    }
  } catch (error) {
    // Return an error message
    res.status(500).json({ success: false, error: error.message });
  }
};

const userdetailCtrl = async (req, res) => {
  

  try {
    const {uid1}=req.body;
    
    const userData = await User.findOne({ uid:uid1 }); // Find one user with matching uid
   
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }else{
      
    }

    // Extract the fields you need from the userData object
    // const { email, firstname, lastname } = userData;

    res.json({ userData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


module.exports = {
  vpnStateCtrl,
  // contactCtrl,
  userdetailCtrl,
};
