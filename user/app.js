const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const userRoutes = require('./routes/user.routes.js');
const cookieparser = require('cookie-parser');
const { default: mongoose } = require('mongoose');
const rabbitMq=require('./service/rabbit.js');

rabbitMq.connectRabbitMQ();


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieparser());

app.use('/',userRoutes);


main().then(()=>{
    console.log('connected to db successfully');
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(process.env.MONGODB_URL);
}

module.exports = app;