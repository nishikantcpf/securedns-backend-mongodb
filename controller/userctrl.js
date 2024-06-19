const { generateToken } = require('../config/jwtToken');
const User = require('../models/usermodel');
// const Payee = require('../models/payeemodel')
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require("../config/refreshtoken");
const jwt = require("jsonwebtoken");
const Conflog = require('../models/conf_log');
const path = require('path')
const { WgConfig, createPeerPairs, getConfigObjectFromFile, checkWgIsInstalled } = require('wireguard-tools');
const { exec } = require('child_process');
const util = require('util');
const { error } = require("console");

// Protected route
const protectedctrl = async (req, res) => {
    res.json({ success: true, user: req.user });
  
  }

// create user
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        // create a new User
        let data = req.body;


        // data.document = "logo.jpeg";

        console.log(data)
        const newUser = await User.create(data);
        res.json(newUser);
    } else {
        throw new Error("User already exist")
    }
});

// login user
const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // check if user exists or not
    const findUser = await User.findOne({ email });
    if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id,email);
        const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,

            },
            {
                new: true
            }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            Path: "/",
            // secure: true,  
            maxAge: 72 * 60 * 60 * 1000,

        });
        res.json({
         
            success: true,
            token: generateToken(findUser?._id,email),
        });
    } else {
        throw new Error("Invalid Credentials");
    }

});
// handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error(" No Refresh token present in db or not matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token");
        }
        const accessToken = generateToken(user?._id);
        res.json({ accessToken });
    });
});

// logout functionality

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            // secure: true,
        });
        return res.sendStatus(204); // forbidden
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: "",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });
    res.sendStatus(204); // forbidden
});

// update user
const updatedUser = asyncHandler(async (req, res) => {
    console.log();
    const { _id } = req.body;
    validateMongoDbId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                // name: req?.body?.name,
                // email: req?.body?.email,
                mobile: req?.body?.mobile,
                password: req?.body?.password,
            },
            {
                new: true,
            },

        );
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error)
    }
});

// Get all users

const getallUser = asyncHandler(async (req, res,) => {

    try {
        const getUser = await User.find();
        res.json(getUser);
    } catch (error) {
        throw new Error(error)
    }
});

// Get a single user

const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaUser = await User.findById(id);
        res.json(getaUser);
    } catch (error) {
        throw new Error(error)
    }
});

// Delete a user

const deleteaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json(deleteaUser);
    } catch (error) {
        throw new Error(error)
    }
});

//block user

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            }
        );
        res.json({
            message: "User blocked"
        });
    } catch (error) {
        throw new Error(error);
    }
});

//unblock user
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const unblock = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            }
        );
        res.json({
            message: "User unblocked"
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Update password
const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.body;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});

// wireguard funtion
const wireguardCtrl = async (req, res) => {
    const { uid1, userip1, token1, device1 } = req.body;
    const filePath = path.join(__dirname, '/configs', '/guardline-client1.conf');


    function generateRandomIp() {
        const getRandomOctet = () => Math.floor(Math.random() * 256);
        let ip;
    
        do {
            ip = `192.168.69.${getRandomOctet()}`;
        } while (ip === '192.168.69.4');
    
        return ip;
    }

    const ipaddonly = generateRandomIp();
    const ipaddr = `${ipaddonly}/32`

    try {
        // make a new config
        const config1 = new WgConfig({
            wgInterface: {
                address: [ipaddr],
                dns: ['101.53.147.30']
            },
            filePath
        })
        
        // give the config a name
        config1.wgInterface.name = 'Guardline_client'



        // make a keypair for the config and a pre-shared key
        const keypair = await config1.generateKeys({ preSharedKey: true })
console.log(keypair)
        // these keys will be saved to the config object
        console.log(keypair.publicKey === config1.publicKey)
        console.log(keypair.preSharedKey === config1.preSharedKey)
        console.log(keypair.privateKey === config1.wgInterface.privateKey)


        // write the config to disk
        await config1.writeToFile()


        // read that file into another config object
        const thatConfigFromFile = await getConfigObjectFromFile({ filePath })
        const config2FilePath = path.join(__dirname, '/configs', '/guardline-server-2.conf')
        const config2 = new WgConfig({
            ...thatConfigFromFile,
            filePath: config2FilePath
        })


        // both configs private key will be the same because config2 has been parsed
        // from the file written by config
        console.log(config1.wgInterface.privateKey === config2.wgInterface.privateKey)

        // however, config2 doesn't have a public key becuase WireGuard doesn't save the
        // the public key in the config file.
        // To get the public key, you'll need to run generateKeys on config2
        // it'll keep it's private key and derive a public key from it
        // 
        await config2.generateKeys({ overwrite: true })
        // so now the two public keys will be the same
        console.log(config1.publicKey === config2.publicKey)
        // true
        console.log(config1.publicKey)
        console.log(config2.publicKey)

        // you can generate a new keypair by passing an arg:
        // config2.generateKeys({ overwrite: true })

        // so now their public/private keys are different
        console.log(config1.publicKey === config2.publicKey) // false

        // you can create a peer object from a WgConfig like this
        const config2AsPeer = config2.createPeer({
            publicKey: 'FytzEla1nQkpfGAouJaM1eFKR1e5N9vbt24of2+iIHg=',
            endpoint: '115.113.39.74:51820',
            persistentKeepalive: 15,
            allowedIps: ['0.0.0.0/0'],


        })

        // you can add a peer to a config like this:
        config1.addPeer(config2AsPeer)





        // That will end up with config1 having config2 as a peer
        // and config2 having config1 as a peer
        console.log(config1.getPeer(config2.publicKey)) // logs the peer
        // console.log(config2.getPeer(config1.publicKey))





        // (make sure it's been written to file first!)
        await config1.writeToFile()
        // add client keys to wg0.conf
console.log(config1.publicKey)
        const command =
            ` echo "" | sudo tee -a /etc/wireguard/wg0.conf
       echo "[Peer]" | sudo tee -a /etc/wireguard/wg0.conf
       echo "## Desktop/client VPN public key ##" | sudo tee -a /etc/wireguard/wg0.conf
       echo "PublicKey = ${config1.publicKey}" | sudo tee -a /etc/wireguard/wg0.conf
       echo "PresharedKey = ${config1.preSharedKey}" | sudo tee -a /etc/wireguard/wg0.conf
       echo "" | sudo tee -a /etc/wireguard/wg0.conf
       echo "## client VPN IP address (note the /32 subnet) ##" | sudo tee -a /etc/wireguard/wg0.conf
       echo "AllowedIPs = ${ipaddr}" | sudo tee -a /etc/wireguard/wg0.conf `;

        const command2 = `sudo systemctl restart wg-quick@wg0`;

        //  exec(command, (error, stdout, stderr) => {
        //    if (error) {
        //      console.error(`Error: ${error.message}`);
        //      return res.status(500).json({ error: error.message, stdout, stderr });
        //    }

        //    console.log(`stdout: ${stdout}`);
        //    console.error(`stderr: ${stderr}`);

        //  });


        // restart wirguard servies 

        //   exec(command2, (error, stdout, stderr) => {
        //     if (error) {
        //       console.error(`Error: ${error.message}`);
        //       return res.status(500).json({ error: error.message, stdout, stderr });
        //     }

        //     console.log(`stdout: ${stdout}`);
        //     console.error(`stderr: ${stderr}`);

        //   });

       

        const result = new Conflog({

            uid: uid1,
            userip: userip1,
            token: token1,
            internalip: ipaddr,
            client_privetkey: config1.wgInterface.privateKey,
            client_publickey: config1.publicKey,
            preSharedKey: config1.preSharedKey,
            server_publickey: config1.peers[0].publicKey,
            device: device1,
            // timestamp: serverTimestamp(),

        });
        await result.save();
        // Send the token to the client
        res.json({ success: true, config1, message: 'all lines executed' });


    } catch (error) {
        // If fails, return an error message
        res.status(401).json({ success: false, error: error.message });
    }
};


module.exports = {
    createUser,
    loginUserCtrl,
    getallUser,
    getaUser,
    deleteaUser,
    updatedUser,
    blockUser,
    unblockUser,
    logout,
    handleRefreshToken,
    protectedctrl,
    updatePassword,
    wireguardCtrl
};