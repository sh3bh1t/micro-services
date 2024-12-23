const jwt = require('jsonwebtoken');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

module.exports.userAuth = async (req, res, next) => {
    try {
        let token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const response = await axios.get(`${process.env.BASE_URL}/user/profile`, {
            headers: { 
                Authorization: `Bearer ${token}`  // Ensure correct 'Bearer' format
            }
        });

        const user = response.data;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: No user found' });
        }

        req.user = user;

        next();

    } catch (err) {
        console.log('Authentication error:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token expired' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        return res.status(401).json({ message: 'Unauthorized: Token verification failed' });
    }
};
