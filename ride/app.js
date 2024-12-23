const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const rideRoutes = require('./routes/ride.routes.js');
const cookieparser = require('cookie-parser');
const rabbitMq = require('./service/rabbit.js');
const { default: mongoose } = require('mongoose');

rabbitMq.connectRabbitMQ();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieparser());

app.use('/',rideRoutes);

 
main().then(()=>{
    console.log('connected to db successfully');
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(process.env.MONGODB_URL);
}

module.exports = app;