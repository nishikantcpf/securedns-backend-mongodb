const User = require('../models/usermodel');
const asyncHandler = require('express-async-handler');


const jwt = require("jsonwebtoken");
const Conflog = require('../models/conf_log');
const path = require('path')
const { WgConfig } = require('wireguard-tools');
const { exec } = require('child_process');
const util = require('util');



// wireguard funtion
const wireguardCtrl2 = async (req, res) => {
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

    wireguardCtrl2
};