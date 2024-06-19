const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const vpnstatSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
        },
        totaldownload: {
            type: String,
            required: true,
        },
        totalupload: {
            type: String,
            required: true,
        },
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
      
    },
    {
        timestamps: true,
    }
);



//Export the model
module.exports = mongoose.model('vpnStat', vpnstatSchema);