const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

async function getBooksUsingAsyncAwait() {
    try {
      const response = await axios.get('http://localhost:3000/'); // Replace with your actual endpoint URL
      console.log("Books fetched (Async/Await):", response.data);
      // You can do more here, e.g., return or process data
    } catch (error) {
      console.error("Error fetching books:", error.message);
    }
  }

  function getBooksUsingPromises() {
    axios.get('http://localhost:3000/') // Replace with your actual endpoint URL
      .then(response => {
        console.log("Books fetched (Promises):", response.data);
        // You can do more here, e.g., return or process data
      })
      .catch(error => {
        console.error("Error fetching books:", error.message);
      });
  }

  async function getBookDetailsByISBNAsync(isbn) {
    try {
      const response = await axios.get(`http://localhost:3000/isbn/${isbn}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async function getBooksByAuthorAsync(author) {
    try {
      const response = await axios.get(`http://localhost:3000/author/${encodeURIComponent(author)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  function getBooksByTitlePromise(title) {
    return axios.get(`http://localhost:3000/title/${encodeURIComponent(title)}`)
      .then(response => response.data)
      .catch(error => { throw error; });
  }


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // 1. Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // 2. Check if username already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists. Please choose another one." });
  }

  // 3. Add new user
  users.push({ username, password });

  return res.status(200).json({ message: "User registered successfully." });
//   return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
   // Extract all books from the object
  const allBooks = Object.values(books);
  // Return the books list as JSON
  return res.status(200).json(allBooks);
//   return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  // Check if the book exists
  const book = books[isbn];
  if (book) {
    // Return the book details if found
    return res.status(200).json(book);
  } else {
    // If book not found, return 404
    return res.status(404).json({ message: "Book not found for the given ISBN." });
  }
//   return res.status(300).json({message: "Yet to be implemented"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});
const requestedAuthor = req.params.author.toLowerCase();

  // 2. Initialize an array to hold matching books
  let matchingBooks = [];

  // 3. Iterate through the books object
  for (let key in books) {
    if (books[key].author.toLowerCase() === requestedAuthor) {
      matchingBooks.push({ ...books[key] });
    }
  }

  // 4. Check if any books were found
  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found for the given author." });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // 1. Get the title from request parameters
  const requestedTitle = req.params.title.toLowerCase();

  // 2. Initialize an array to hold matching books
  let matchingBooks = [];

  // 3. Iterate through the books object
  for (let key in books) {
    if (books[key].title.toLowerCase() === requestedTitle) {
      matchingBooks.push({...books[key] });
    }
  }

  // 4. Return results
  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found with the given title." });
  }
//   return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  // 1. Get the ISBN from request parameters
  const isbn = req.params.isbn;

  // 2. Find the book by ISBN
  const book = books[isbn];

  // 3. If book exists, return its reviews
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    // 4. If not found, return 404
    return res.status(404).json({ message: "Book not found for the given ISBN." });
  }
//   return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
