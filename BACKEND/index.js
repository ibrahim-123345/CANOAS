const express = require('express');
require('dotenv').config();
const cors=require('cors');

const { connectToDatabase } = require('./config/connectionURI');

const { registerUser, loginUser, getCurrentUser } = require('./controllers/authController');
const {authenticateUser}=require('./middleware/authenticator')
const { getAllContestants, createContestant, getContestantById, updateContestant } = require('./controllers/constestant');
const {upload}=require('./config/imageHandler');
const {getVotes,castVote,deleteVote}=require("./controllers/vote")


// index.js

const app = express();
app.use(cors({origin:"*"}))
const PORT = process.env.PORT 

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    connectToDatabase();
    res.send('Welcome to the CANOAS!');
});

//authentication routes
app.post('/register',registerUser);
app.post('/login',loginUser)
app.get('/currentUser', authenticateUser, getCurrentUser);


// Contestant routes
app.get('/contestants', getAllContestants);
app.post('/contestants', upload.single('image'), createContestant);
app.get('/contestants/:id', getContestantById);
app.put('/contestants/:id', updateContestant);










// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});