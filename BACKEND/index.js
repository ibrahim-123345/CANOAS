const express = require('express');
require('dotenv').config();
const cors=require('cors');
const path = require('path');

const { connectToDatabase } = require('./config/connectionURI');

const { registerUser, loginUser, getCurrentUser } = require('./controllers/authController');
const {authenticateUser}=require('./middleware/authenticator')
const { getAllContestants, createContestant, getContestantById, updateContestant } = require('./controllers/constestant');
const {files}=require('./config/imageHandler');
const {getVotes,castVote,deleteVote,getVotePercentagesByCandidateId}=require("./controllers/vote")
const {getNotifications,createNotification,markAsRead,deleteNotification}  = require('./controllers/notification');


// index.js

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(cors({origin:"*"}))

const PORT = process.env.PORT || 8000

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
app.post('/contestants', files.single('profileImage'), createContestant);
app.get('/contestants/:id', getContestantById);
app.put('/contestants/:id', updateContestant);


app.post('/vote', castVote);
app.get('/vote', getVotes);
app.delete('/vote/:id', deleteVote);
app.post('/getVotePercentage', getVotePercentagesByCandidateId);



//notification
app.get('/notifications', getNotifications);
app.post('/notifications', createNotification);
app.delete('/notifications/:id', deleteNotification);
app.patch('/notifications/:id/read', markAsRead);








// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});