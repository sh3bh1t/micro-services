const rideModel = require('../models/ride.models.js');
const {suscribeToRabbitMQ,publishToQueue} = require('../service/rabbit.js');


module.exports.createRide = async (req, res,next) => {
    const {pickup , destination}=req.body;

    const newRide = new rideModel({
        user:req.user._id,
        pickup,
        destination,
    });

    await newRide.save();
    publishToQueue("new-ride",JSON.stringify(newRide));
    res.send(newRide);
}