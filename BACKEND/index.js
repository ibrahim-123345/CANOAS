const express = require('express');
require('dotenv').config();
const cors=require('cors');
const path = require('path');

const { connectToDatabase } = require('./config/connectionURI');

const { registerUser,deleteUser, loginUser, getCurrentUser,getAllUsers } = require('./controllers/authController');
const {authenticateUser}=require('./middleware/authenticator')
const { getAllContestants, createContestant, getContestantById, updateContestant,deleteContestant } = require('./controllers/constestant');
const {files}=require('./config/imageHandler');
const {getVotes,castVote,deleteVote,getVotePercentagesByCandidateId, getAverageVoteByUserId,getAverageVoteByCandidateId, getUserAverageVoteOnPosition,getUserVote}=require("./controllers/vote")
const {getNotifications,createNotification,markAsRead,deleteNotification}  = require('./controllers/notification');
const { getAllcomments,getCommentsForContestant,createComment } = require('./controllers/comments');


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
app.get('/users',  getAllUsers);
app.delete('/delete/:id', deleteUser); // Delete user by ID


// Contestant routes
app.get('/contestants', getAllContestants);
app.post('/contestants', files.single('profileImage'), createContestant);
app.get('/contestants/:id', getContestantById);
app.patch('/contestants/:id', updateContestant);
app.delete('/contestants/:id', deleteContestant);


app.post('/vote', castVote);
app.get('/vote', getVotes);
app.delete('/vote/:id', deleteVote);
app.post('/getVotePercentage', getVotePercentagesByCandidateId);
app.post('/user-average', getUserAverageVoteOnPosition);
app.get('/avaragebyCandidate/:candidateId',getAverageVoteByCandidateId);
app.post('/getUserVote', getUserVote);




//notification
app.get('/notifications', getNotifications);
app.post('/notifications', createNotification);
app.delete('/notifications/:id', deleteNotification);
app.patch('/notifications/:id/read', markAsRead);




// Comments routes

app.post("/comment", createComment);

app.get("/comments/:contestantId", getCommentsForContestant);







// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});