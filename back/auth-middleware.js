const jwt = require('jsonwebtoken');
const StatusCodes = require('http-status-codes');
const { JWT_SECRET } = process.env;
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Token is required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    });
};

const checkRole = (roles) => {
    return (req, res, next) => {
        const { role } = req.user;

        if (!roles.includes(role)) {
            return res.status(StatusCodes.FORBIDDEN).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    checkRole,
};
