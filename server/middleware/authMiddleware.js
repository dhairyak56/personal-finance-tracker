const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    console.log('Auth middleware - Token:', token ? 'Present' : 'Missing'); // Add logging

    if (!token) {
        return res.status(401).json({ error: 'Please authenticate' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;
        console.log('Auth middleware - User ID:', req.userId); // Add logging
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message); // Add logging
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;
