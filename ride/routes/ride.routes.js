const express=require('express');
const router=express.Router();
const authMiddleware=require('../middleware/auth.middleware.js');
const rideController=require('../controller/ride.controller.js');


router.post('/create-ride',authMiddleware.userAuth,rideController.createRide);


module.exports=router;