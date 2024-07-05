const jwt = require('jsonwebtoken');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const { error } = require('console');
const VpnStat = require('../models/vpnstat'); // Corrected import name to match model
const User = require('../models/usermodel');
// const vpnstat = require('../models/vpnstat');
const userdetail = require('../models/userdetail');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');
const conf_log = require('../models/conf_log');
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
    console.log(vpnStatDocument)
    if (vpnStatDocument) {
      // Update existing document
      // vpnStatDocument.timestamp = new Date();
      // uid,
      vpnStatDocument.token = token;
      vpnStatDocument.totaldownload = cumulativeDownload;
      vpnStatDocument.totalupload = cumulativeUpload;
      await vpnStatDocument.save();
      res.json({ success: true, message: 'Document updated successfully ' });
    } else {
      // Create a new document
      vpnStatDocument = new VpnStat({
        
        // timestamp: new Date(),
        uid,
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
    console.log(uid)
    // const userData = ((await User.findById({_id:uid })));
    const userData = await User.findById(uid).select('firstname lastname email mobile ').lean();

    // const userData = await userdetail.findOne({ uid:uid1 });
   
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }else{
     
      res.json({ userData });
    }

    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const userdetailCtrlget = async (req, res) => {
  

  try {
    const uid=req.params.id;
    // console.log(uid)
    // const userData = ((await User.findById({_id:uid })));
    const userData = await User.findById(uid).select('firstname lastname email mobile ').lean();

    // const userData = await userdetail.findOne({ uid:uid1 });
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }else{
     
      res.json({ userData });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const vpnstatdataCtrl = asyncHandler(async (req, res,) => {

  try {
      const getUser = await User.find();
      res.json(getUser);
  } catch (error) {
      throw new Error(error)
  }
});

const deviceCtrl = asyncHandler(async (req, res,) => {

  try {
    const uid=req.params.id;
    const andriodcount = await conf_log.countDocuments({ uid: uid, device: 'android' });
    const windowscount = await conf_log.countDocuments({ uid: uid, device: 'windows' });
    const ioscount = await conf_log.countDocuments({ uid: uid, device: 'ios' });
      res.json( {andriodcount,windowscount,ioscount});
      
  } catch (error) {
      throw new Error(error)
  }
});

const bigchartCtrl = asyncHandler(async (req, res,) => {

  try {

    const uid = req.params.id;
    // Get the current date
    const currentDate = new Date();

    // Get the current month's start date (1st day of the current month)
    const currentMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Get the current month's end date (last day of the current month)
    const currentMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get the previous month's start date (1st day of the previous month)
    const previousMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Get the previous month's end date (last day of the previous month)
    const previousMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    
    const query = {
      uid: uid,
      createdAt: {
        $gte: currentMonthStartDate,
        $lte: currentMonthEndDate
      }
    };
    const query2 = {
      uid: uid,
      createdAt: {
        $gte: previousMonthStartDate,
        $lte: previousMonthEndDate
      }
    };

    

    // Execute the query
    const currentMonthData = await VpnStat.find(query);
    const previousMonthData = await VpnStat.find(query2);

    let sumKey1 = 0;
      let sumKey2 = 0;
      let sumKey3 = 0;
      let sumKey4 = 0;


      let data = null;
      let data2 = null;

      if (!currentMonthData.empty) {
        // Iterate over each object in the array

        currentMonthData.forEach(obj => {
          sumKey1 += Math.floor(obj.totaldownload);
          sumKey2 += Math.floor(obj.totalupload);
        });
        data = {
          'name': "Current Month",
          'Recived':Math.floor(sumKey1/1000) ,
          'Send':Math.floor(sumKey2/1000),
         
        };
      }
      if (!previousMonthData.empty) {
        // Iterate over each object in the array

        previousMonthData.forEach(obj => {
          sumKey1 += Math.floor(obj.totaldownload);
          sumKey2 += Math.floor(obj.totalupload);
        });
        data2 = {
          'name': "Last Month",
          'Recived': Math.floor(sumKey3/1000) ,
          'Send': Math.floor(sumKey4/1000) ,
         
        };
      }

    res.json({  data ,data2});

  } catch (error) {
    throw new Error(error)
  }
});


const statdataCtrl = asyncHandler(async (req, res,) => {

  try {

    const uid = req.params.id;
    // Get the current date
    const currentDate = new Date();

    // Get the current month's start date (1st day of the current month)
    const currentMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Get the current month's end date (last day of the current month)
    const currentMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get the previous month's start date (1st day of the previous month)
    const previousMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Get the previous month's end date (last day of the previous month)
    const previousMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    
    const query = {
      uid: uid,
     
    };
   

    

    // Execute the query
    const currentMonthData = await VpnStat.find(query);
    

    let sumKey1 = 0;
      let sumKey2 = 0;
      
      let data = null;
   

      if (!currentMonthData.empty) {
        // Iterate over each object in the array

        currentMonthData.forEach(obj => {
          sumKey1 += Math.floor(obj.totaldownload);
          sumKey2 += Math.floor(obj.totalupload);
        });
        
        data = {
          "downloaddata": sumKey1,
          "reciveddata": sumKey2,
          "totaldata": sumKey1 + sumKey2,
      };
      }
     
    res.json({  data });

  } catch (error) {
    throw new Error(error)
  }
});


module.exports = {
  vpnStateCtrl,
  // contactCtrl,
  userdetailCtrl,
  userdetailCtrlget,
  vpnstatdataCtrl,
  deviceCtrl,
  bigchartCtrl,
  statdataCtrl,
};
