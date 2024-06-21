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


// db connection
dbConnect();

// app.use(cors())
// app.use("*", cors({
//     origin: true,
//     credentials: true,
// }));



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


// upload middilware start
app.use("/image", express.static(path.join(__dirname, "/image")));
var maxSize = 20 * 1024 * 1024;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./image");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);

    },

});

const upload = multer({
    storage: storage,
    limits: { fieldSize: maxSize, fileSize: maxSize }
});
// upload middilware end

// app.post("/api/upload", upload.single("file"), (req, res) => {
//     res.status(200).json("File has been uploaded");
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