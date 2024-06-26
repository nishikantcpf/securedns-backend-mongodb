const jwt = require("jsonwebtoken");

const generateToken = (id,email) => {
    return jwt.sign({uid:id,email:email }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

module.exports = { generateToken };