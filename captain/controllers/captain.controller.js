const captainModel = require('../models/captain.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklisttokenModel = require('../models/blacklisttoken.model.js');
const {subscribeToQueue,publishToQueue} = require('../service/rabbit.js');
const pendingRequests =[];

module.exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const captain = await captainModel.findOne({ email });
        if (captain) {
            return res.status(400).json({ message: 'captain already exists' });
        }

        const hashPassword= await bcrypt.hash(password,10);
        const newcaptain = new captainModel({ name, email, password: hashPassword });
        await newcaptain.save();
        const token = jwt.sign({ id: newcaptain._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token);
        delete newcaptain._doc.password;

        res.send({token, newcaptain });
    }catch(err){
        console.log(err);
        res.status(500).json({message:'Internal server error'});
    }
}

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const captain = await captainModel
            .findOne({ email })
            .select('+password');

        if (!captain) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, captain.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }


        const token = jwt.sign({ id: captain._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        delete captain._doc.password;

        res.cookie('token', token);

        res.send({ token, captain });

    } catch (error) {

        res.status(500).json({ message: error.message });
    }

}

module.exports.logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        await blacklisttokenModel.create({ token });
        res.clearCookie('token');
        res.send({ message: 'captain logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.profile = async (req, res) => {
    try {
        res.send(req.captain);
    } catch (error) {
        console.log(err)
        res.status(500).json({ message: error.message });
    }
}


module.exports.toggleAvailability = async(req,res)=>{
    try{
        const captain= await captainModel.findById(req.captain._id)
        captain.isAvailable = !captain.isAvailable;
        await captain.save()
        res.send(captain);
    }catch(err){
        console.log(err)
        res.status(500).json({message : err.message})
    }
}



module.exports.waitForNewRide = async (req, res) => {
   req.setTimeout(30000,() => {
    res.status(204).end();
   });
   pendingRequests.push(res);
}


subscribeToQueue("new-ride",(data)=>{
    const rideData = JSON.parse(data);

    pendingRequests.forEach((res)=>{
        res.json(rideData);
    });
    pendingRequests.length=0;
})

// module.exports.acceptedRide = async (req, res) => {
//     // Long polling: wait for 'ride-accepted' event
//     rideEventEmitter.once('ride-accepted', (data) => {
//         res.send(data);
//     });

//     // Set timeout for long polling (e.g., 30 seconds)
//     setTimeout(() => {
//         res.status(204).send();
//     }, 30000);