const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.getSignup = (req, res, next) => {
  // In a decoupled setup, the frontend handles the view. 
  // We return the necessary metadata for the signup page.
  res.status(200).json({
    pageTitle: 'Signup',
    path: '/signup',
    isLoggedIn: false
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  User.findOne({ email: email })
    .then(userDoc => {
      // If user already exists, return a 422 (Unprocessable Entity) status
      if (userDoc) {
        console.log("User already exists.");
        return res.status(422).json({ message: "User already exists." });
      }
      
      // If user is new, create them
      const user = new User({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName
      });
      
      return user.save()
        .then(result => {
          // Manually handle user data to prevent BSON crash (preserving your logic)
          const userData = {
            _id: result._id.toString(),
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName
          };

          // 🟢 RECTIFIED: Use process.env.JWT_SECRET instead of a hardcoded string
          const token = jwt.sign(
            { email: userData.email, userId: userData._id },
            process.env.JWT_SECRET, //
            { expiresIn: '1h' }
          );
          
          res.status(201).json({
            message: "User created successfully",
            token: token,
            user: userData,
            isLoggedIn: true
          });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "Signup failed." });
    });
};

exports.getLogin = (req, res, next) => {
  res.status(200).json({
    pageTitle: 'Login',
    path: '/login',
    isLoggedIn: false
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        // Return 401 (Unauthorized) instead of redirect
        return res.status(401).json({ message: "Invalid email or password." });
      }
      
      // Manually handle user data to prevent BSON crash (preserving your logic)
      const userData = {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };

      // 🟢 RECTIFIED: Use process.env.JWT_SECRET for generating the login token
      const token = jwt.sign(
        { email: userData.email, userId: userData._id },
        process.env.JWT_SECRET, //
        { expiresIn: '1h' }
      );
      
      res.status(200).json({
        message: "Login successful",
        token: token,
        user: userData,
        isLoggedIn: true
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "Login failed." });
    });
};

exports.postLogout = (req, res, next) => {
  // In a JWT-based decoupled system, the client handles logout by deleting the token.
  res.status(200).json({ message: "Logged out successfully." });
};