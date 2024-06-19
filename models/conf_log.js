const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const conflogSchema = new mongoose.Schema(
    {
        client_privetkey: {
            type: String,
            // required: true,
        },
        client_publickey: {
            type: String,
            // required: true,
        },
        device: {
            type: String,
            // required: true,
        },
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        internalip: {
            type: String,
        },
        preSharedKey: {
            type: String,
        },
        server_publickey: {
            type: String,
        },
        token: {
            type: String,
        },
        userip:{
            type: String,
        },
      
    },
    {
        timestamps: true,
    }
);



//Export the model
module.exports = mongoose.model('Conflog', conflogSchema);