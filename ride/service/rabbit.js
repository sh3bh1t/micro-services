const amqp = require('amqplib');

const RABBIT_URL = process.env.RABBIT_URL;

let connection;
let channel;

// Helper function to reconnect to RabbitMQ
async function reconnectRabbitMQ() {
    console.log('Attempting to reconnect to RabbitMQ...');
    try {
        connection = await amqp.connect(RABBIT_URL, { heartbeat: 60 }); // Set heartbeat to 60 seconds
        channel = await connection.createChannel();
        console.log('Reconnected to RabbitMQ');
    } catch (error) {
        console.error('Error reconnecting to RabbitMQ:', error);
        setTimeout(reconnectRabbitMQ, 5000); // Retry every 5 seconds if the connection fails
    }
}

// Function to connect to RabbitMQ (initial connection)
async function connectRabbitMQ() {
    try {
        connection = await amqp.connect(RABBIT_URL, { heartbeat: 60 }); // Enable heartbeat
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
        
        // Set up error handling for connection and channel
        connection.on('error', (err) => {
            console.error('Connection error:', err);
            reconnectRabbitMQ(); // Reconnect on connection error
        });

        connection.on('close', () => {
            console.log('Connection closed. Attempting to reconnect...');
            reconnectRabbitMQ(); // Reconnect on connection close
        });

        channel.on('error', (err) => {
            console.error('Channel error:', err);
            reconnectRabbitMQ(); // Reconnect on channel error
        });

        channel.on('close', () => {
            console.log('Channel closed. Attempting to reconnect...');
            reconnectRabbitMQ(); // Reconnect on channel close
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        setTimeout(connectRabbitMQ, 5000); // Retry connection after 5 seconds if it fails
    }
}

// Publish message to the specified queue
async function publishToQueue(queue, message) {
    if (!channel) await connectRabbitMQ();
    try {
        await channel.assertQueue(queue);
        channel.sendToQueue(queue, Buffer.from(message));
        console.log(`Message sent to queue: ${queue}`);
    } catch (error) {
        console.error('Error publishing to queue:', error);
    }
}

// Subscribe to a specified queue
async function subscribeToQueue(queue, callback) {
    if (!channel) await connectRabbitMQ();
    try {
        await channel.assertQueue(queue);
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                callback(msg.content.toString());
                channel.ack(msg);
            }
        });
        console.log(`Subscribed to queue: ${queue}`);
    } catch (error) {
        console.error('Error subscribing to queue:', error);
    }
}

module.exports = { publishToQueue, subscribeToQueue, connectRabbitMQ };
