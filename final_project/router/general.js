const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res
      .status(400)
      .json({ message: "Invalid or already existing username" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const bookList = await new Promise((resolve) => resolve(books));
    return res.status(200).send(JSON.stringify(bookList, null, 2));
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving book list" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const book = await new Promise((resolve) =>
      resolve(books[req.params.isbn])
    );
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving book by ISBN" });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  try {
    const results = await new Promise((resolve) =>
      resolve(
        Object.values(books).filter(
          (book) =>
            book.author.toLowerCase() === req.params.author.toLowerCase()
        )
      )
    );
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error retrieving books by author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    const results = await new Promise((resolve) =>
      resolve(
        Object.values(books).filter((book) =>
          book.title.toLowerCase().includes(req.params.title.toLowerCase())
        )
      )
    );
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res
        .status(404)
        .json({ message: "No books found with this title" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books by title" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
