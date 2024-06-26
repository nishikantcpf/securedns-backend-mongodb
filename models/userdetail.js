const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const userdetailSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            // required: true,
        },
        firstname: {
            type: String,
            // required: true,
        },
        lastname: {
            type: String,
            // required: true,
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
module.exports = mongoose.model('userdetail', userdetailSchema);