const http = require('http');
const app = require('./app');


const server=http.createServer(app);


server.listen(3003,()=>{
    console.log('Ride Service is running on port 3003');
});