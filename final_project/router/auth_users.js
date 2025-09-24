const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // 1. Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // 2. Validate credentials
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // 3. Generate JWT token
  const accessToken = jwt.sign(
    { username },
    'access', // secret key (for demo only; use env vars in production)
    { expiresIn: '1h' }
  );

  // 4. Save token in session (via req.session.authorization)
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "Login successful!", token: accessToken });
//   return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;

  // Check if user is logged in
  const username = req.session.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  // Check if review content is provided
  if (!review) {
    return res.status(400).json({ message: "Review content is required." });
  }

  // Check if book exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Add or update the review under the user's name
  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully.",
    reviews: book.reviews
  });
//   return res.status(300).json({message: "Yet to be implemented"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

  // Get username from session
  const username = req.session.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  // Check if book exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Check if the user has a review to delete
  if (!book.reviews[username]) {
    return res.status(404).json({ message: "No review by this user to delete." });
  }

  // Delete the user's review
  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully.",
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
