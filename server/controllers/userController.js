const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d'
    });
};

exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        console.log('Registration attempt:', { username, email }); // Add logging

        // Validation
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findByUsername(username);
        const existingEmail = await User.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create user
        const result = await User.create(username, password, email);
        const token = generateToken(result.insertId);

        console.log('User created successfully:', result.insertId); // Add logging

        res.status(201).json({ 
            message: 'User created successfully',
            token,
            user: { id: result.insertId, username, email }
        });
    } catch (error) {
        console.error('Registration error details:', error); // More detailed error logging
        res.status(500).json({ error: 'Failed to register user', details: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await User.verifyPassword(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({ 
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};
