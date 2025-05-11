const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const token = req.cookies.auth_token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Access denied, no token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        req.user = decoded;  // Attach decoded payload (user info) to the request object
        next();
    });
}

module.exports = verifyToken;
