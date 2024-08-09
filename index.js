const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express()
const dotenv = require("dotenv").config();
const PORT =65520;
const authRouter = require('./routes/authRoute');
const uploadRouter = require('./routes/uploadRoute');
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const path = require("path");
const multer = require('multer');
const fs = require('fs');
const storage = require('node-persist');
const chokidar = require('chokidar');
const { default: mongoose } = require('mongoose');

// db connection
dbConnect();

// this images folder can be access by public
app.use("/api/images", express.static(path.join(__dirname, "/images")));

app.use(cors());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// router 










// MongoDB connection
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.log('Connected to MongoDB');
  });
  
  // Define a schema and a model for logs
  const logSchema = new mongoose.Schema({
    log: String,
    timestamp: { type: Date, default: Date.now }
  });
  
  const Log = mongoose.model('Log', logSchema);
  
  // Initialize persistent storage
  (async () => {
    await storage.init({
      dir: path.join(__dirname, 'persist')
    });
  })();
  
  // Function to read and upload new logs
  async function uploadNewLogs() {
    try {
      const filePath = path.join(__dirname, 'logs.txt'); // Path to your log file
      const logs = fs.readFileSync(filePath, 'utf-8').split('\n');
  
      // Get the last processed log index
      const lastProcessedIndex = (await storage.getItem('lastProcessedIndex')) ;
  
      // Filter only new logs
      const newLogs = logs.slice(lastProcessedIndex + 1).filter(log => log.trim() !== '');
  
      if (newLogs.length > 0) {
        const logDocuments = newLogs.map(log => ({ log }));
  
        await Log.insertMany(logDocuments);
  
        // Update the last processed log index
        await storage.setItem('lastProcessedIndex', lastProcessedIndex + newLogs.length);
  
        console.log('New logs have been successfully inserted into the database.');
      } else {
        console.log('No new logs to insert.');
      }
    } catch (err) {
      console.error(err);
    }
  }
  
  // Watch the log file for changes
  const watcher = chokidar.watch(path.join(__dirname, 'logs.txt'), {
    persistent: true
  });
  
  watcher.on('change', uploadNewLogs);












// Endpoint to get log data in JSON format
// app.get('/dns_logs', (req, res) => {
//   const logFilePath = path.join(__dirname, 'logs.txt');// Adjust the path to your log file

//   fs.readFile(logFilePath, 'utf8', (err, data) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to read log file' });
//     }

//     const visitedWebsites = new Set();
//     const lines = data.trim().split('\n');

//     lines.forEach(line => {
//       const parts = line.split(' ');
//       const sourceIP = parts[2].split('.')[0] + '.' + parts[2].split('.')[1] + '.' + parts[2].split('.')[2] + '.' + parts[2].split('.')[3];
      
//       if (sourceIP === '192.168.69.19') {
//         const domainMatch = line.match(/[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
//         if (domainMatch) {
//           visitedWebsites.add(domainMatch[0]);
//         }
//       }
//     });

//     res.json(Array.from(visitedWebsites));
//   });
// });
















// upload middilware start
// app.use("/image", express.static(path.join(__dirname, "/image")));
// var maxSize = 20 * 1024 * 1024;
// const storage1 = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "./image");
//     },
//     filename: (req, file, cb) => {
//         cb(null, req.body.name);

//     },

// });

// const upload = multer({
//     storage: storage1,
//     limits: { fieldSize: maxSize, fileSize: maxSize }
// });



app.use("/api/user", authRouter);
app.use("/api/upload", uploadRouter);

app.use("/", (req, res) => {
    res.send("Not Found ! You are lost")
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
});  
uploadNewLogs();