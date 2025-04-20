const express = require('express');
require('dotenv').config();

const { connectToDatabase } = require('./config/connectionURI');

const { registerUser, loginUser, getCurrentUser } = require('./controllers/authController');
const {authenticateUser}=require('./middleware/authenticator')


// index.js

const app = express();
const PORT = process.env.PORT 

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    connectToDatabase();
    res.send('Welcome to the CANOAS!');
});


app.post('/register',registerUser);
app.post('/login',loginUser)

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});