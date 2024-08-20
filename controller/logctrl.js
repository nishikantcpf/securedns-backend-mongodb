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
const fs = require('fs');
const IPAssignment = require('../models/IPAssignment');
const { json } = require('body-parser');
const findAvailableIP = require('../utils/findAvilabeIP');

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



const assingip = asyncHandler(async (req, res) => {

  try {
    // Find an available IP in the range
    const assignedIP = await findAvailableIP();
    if (!assignedIP) {
      return res.status(404).json({ message: 'No available IP addresses in range.' });
    }
    // Assign the IP to the user
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Save IP assignment record
    const newAssignment = new IPAssignment({
      userId: req.body.userId,
      ipAddress: assignedIP
    });
    await newAssignment.save();
    res.status(200).json({ message: 'IP assigned successfully.', ipAddress: assignedIP });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Function to read the log file and check the validity of domain queries
const checkDomains = async (req, res) => {
  const ids = req.params.id
  const user = await User.findById(ids);
  const ips = await IPAssignment.find({ userId: user._id });
  const ipAddresses = ips.map(ip => ip.ipAddress);
  const monitoredIPs = ipAddresses;
  const extractIPAddress = (ipWithPort) => ipWithPort.split('.').slice(0, 4).join('.');

  const parseTimestamp = (timestamp) => {
console.log(timestamp)
    // Split the timestamp into time and microseconds
    // let [time, microseconds] = timestamp.split('.');
    let [datePart, timePart] = timestamp.split(' ');
    let [time, microseconds] = timePart.split('.');
    // Parse the time into hours, minutes, and seconds
    let [hours, minutes, seconds] = time.split(':');

    // Create a new Date object for today
     // Create a new Date object using the parsed date
     let [year, month, day] = datePart.split('-');
     let date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));

    // Set the hours, minutes, and seconds
    date.setUTCHours(parseInt(hours));
    date.setUTCMinutes(parseInt(minutes));
    date.setUTCSeconds(parseInt(seconds));

    // Convert microseconds to milliseconds and set the milliseconds
    let milliseconds = Math.round(parseInt(microseconds) / 1000);
    date.setUTCMilliseconds(milliseconds);
    // Convert the date to ISO 8601 format
    return date;
  }

  // Current time and time 24 hours ago
  const now = new Date();
  const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);


  const logFilePath = path.join(__dirname, process.env.LOG_PATH);

  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read log file' });
    }


    // Extract DNS queries and responses from the log file
    const queries = {};
    const lines = data.split('\n');

    lines.forEach(line => {
      const matchQuery = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{6}) IP (\S+)\.\d+ > \S+: (\d+)\+ A\? (\S+)\. \(\d+\)/);

      if (matchQuery) {
        const [timestamp, , ipWithPort, queryId, domain] = matchQuery;

        const ip = extractIPAddress(ipWithPort);

        const logTime = parseTimestamp(timestamp);


        if (monitoredIPs.includes(ip)
          && logTime >= past24Hours
        ) {

          if (!queries[queryId]) {
            queries[queryId] = { ip, domain, status: 'valid', timestamp: logTime };
          }
        }
      }

      const matchResponse = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{6}) IP \S+ > (\S+)\.\d+: (\d+) NXDomain \d+\/\d+\/\d+ \(\d+\)/);

      if (matchResponse) {
        const [timestamp, , ipWithPort, queryId] = matchResponse;
        const ip = extractIPAddress(ipWithPort);
        const logTime = parseTimestamp(timestamp);
        if (monitoredIPs.includes(ip)
          && logTime >= past24Hours
        ) {
          if (queries[queryId]) {
            queries[queryId].status = 'invalid';
          }
        }
      }
    });

    // Create the response
    const result = Object.values(queries).sort((a, b) => b.timestamp - a.timestamp).map(({ ip, domain, status, timestamp }) => ({ ip, domain, status, timestamp }));
    res.json(result);
  });
};

module.exports = {
  vpnStateCtrl,
  // contactCtrl,
  userdetailCtrl,
  userdetailCtrlget,
  vpnstatdataCtrl,
  deviceCtrl,
  bigchartCtrl,
  statdataCtrl,
  // dns_logs,
  assingip,
  // readlog,
  checkDomains
};
