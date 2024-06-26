const jwt = require('jsonwebtoken');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const { error } = require('console');
const VpnStat = require('../models/vpnstat'); // Corrected import name to match model
const User = require('../models/usermodel');
const vpnstat = require('../models/vpnstat');
const userdetail = require('../models/userdetail');

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
    const {uid}=req.body;
    // const userData = ((await User.findById({_id:uid })));
    const userData = await User.findById(uid).select('firstname lastname email ').lean();

    // const userData = await userdetail.findOne({ uid:uid1 });
   console.log(userData)
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }else{
     
      res.json({ userData });
    }


    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


module.exports = {
  vpnStateCtrl,
  // contactCtrl,
  userdetailCtrl,
};
