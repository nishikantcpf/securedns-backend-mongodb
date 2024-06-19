const jwt = require('jsonwebtoken');
// const { promisify } = require('util');
const verify = jwt.verify;

const jwtSecret = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  // Get the token from the request headers
  const token = req.headers['authorization'];

  if (!token) {
    console.log("decoded")
    return res.status(401).json({ success: false, error: 'Token not provided' });
  }

  // Verify the token
  
  verify(token, jwtSecret, (err, decoded) => {
    
    if (err) {
        
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check token expiration
    
    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ success: false, error: 'Token has expired' });
    }

    // Attach the decoded user data to the request for further use
    req.user = decoded;

    next();
  });
}

module.exports = authenticateToken;