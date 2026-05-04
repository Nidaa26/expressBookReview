const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop (Task 10 - async/await)
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        resolve(books);
      });
    };
    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get book details based on ISBN (Task 11 - async/await)
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const getBookByISBN = (isbn) => {
      return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) resolve(book);
        else reject({ message: "Book not found" });
      });
    };
    const book = await getBookByISBN(req.params.isbn);
    return res.status(200).json(book);
  } catch (err) {
    return res.status(404).json(err);
  }
});

// Get book details based on Author (Task 12 - async/await)
public_users.get('/author/:author', async function (req, res) {
  try {
    const getBooksByAuthor = (author) => {
      return new Promise((resolve, reject) => {
        const results = [];
        const keys = Object.keys(books);
        keys.forEach(key => {
          if (books[key].author.toLowerCase() === author.toLowerCase()) {
            results.push({ isbn: key, ...books[key] });
          }
        });
        if (results.length > 0) resolve(results);
        else reject({ message: "No books found for this author" });
      });
    };
    const result = await getBooksByAuthor(req.params.author);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(404).json(err);
  }
});

// Get all books based on Title (Task 13 - async/await)
public_users.get('/title/:title', async function (req, res) {
  try {
    const getBooksByTitle = (title) => {
      return new Promise((resolve, reject) => {
        const results = [];
        const keys = Object.keys(books);
        keys.forEach(key => {
          if (books[key].title.toLowerCase() === title.toLowerCase()) {
            results.push({ isbn: key, ...books[key] });
          }
        });
        if (results.length > 0) resolve(results);
        else reject({ message: "No books found for this title" });
      });
    };
    const result = await getBooksByTitle(req.params.title);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(404).json(err);
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
