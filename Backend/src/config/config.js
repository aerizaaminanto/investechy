const mongoose = require('mongoose');
const { setServers } = require('node:dns/promises');
const env = require('dotenv').config()

setServers(["1.1.1.1", "8.8.8.8"]);

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected!'))
    .catch(err => console.error('MongoDB connection error:', err.message));

module.exports = mongoose;
