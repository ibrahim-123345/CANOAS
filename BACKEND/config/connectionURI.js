const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try {
        const uri = process.env.MONGO_URI 
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        //console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = {connectToDatabase};