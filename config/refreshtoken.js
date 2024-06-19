const jwt = require("jsonwebtoken");

const generateRefreshToken = (id,email) => {
    return jwt.sign({uid:id,email:email}, process.env.JWT_SECRET, { expiresIn: "1d" });
};

module.exports = { generateRefreshToken };