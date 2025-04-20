const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});



const User = mongoose.model('User', userSchema);


const createUser=(username,email,password)=>{
    const newUser = new User({ username, email, password });
    return newUser.save();


}

module.exports = {User , createUser};