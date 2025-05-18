const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try {
        const uri = process.env.MONGO_URI||'mongodb://localhost:27017/CANOAS';
        await mongoose.connect(uri);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = {connectToDatabase};