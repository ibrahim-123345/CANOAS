const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {User,createUser } = require('../models/userModel'); // Adjust the path as needed
const { connectToDatabase } = require('../config/connectionURI');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET 
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN

module.exports = {
    // User Registration
    registerUser: async (req, res) => {
        try {
            const { fullName,NIDA, email, password } = req.body;

            // Check if user already exists
            await connectToDatabase();
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            createUser(fullName,NIDA,email,hashedPassword)

            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // User Login
    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Check if user exists
            await connectToDatabase()
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate JWT
            const token = jwt.sign({ id: user._id , user : user.fullName , role:user.role}, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

            res.status(200).json({tokenData:token });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Get Current User
    getCurrentUser: async (req, res) => {
        try {
            await connectToDatabase()
            const user = await User.findById(req.user.id).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Update User
    updateUser: async (req, res) => {
        try {
            const updates = req.body;
            await connectToDatabase()
            const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'User updated successfully', user });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Delete User
    deleteUser: async (req, res) => {
        try {
            await connectToDatabase()
            const user = await User.findByIdAndDelete(req.user.id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

   
};