const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
    },
    pickup:{
        type:String,
        required:true,
    }, 
    destination:{
        type:String,
        required:true,
    },
    status :{
        type:String,
        enum:['pending','completed'],
        default:'pending',
    }
});


const Ride=mongoose.model('Ride',rideSchema);
module.exports=Ride;