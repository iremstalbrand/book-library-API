console.log("TEST TEST!");

const express = require("express"); //get express

const { addBook, getAllBooks } = require("./database.js"); //get the function from database.js

const app = express(); //start express
app.use(express.json()); //body parts of the req can read as JSON, need for post,put etc. from json data to json object

//ENDPOINT 1 - POST

app.post("/books", async (req, res) => {
  const book = req.body;
  if (!book) {
    return res
      .status(400)
      .json({ error: "No book data sent. Use JSON like {'title': 'My Book'}" });
  }
  const result = addBook(book); //addBook function from DB
  res.status(201).json({ id: result.insertedId });
});

//ENDPOINT 2 - GET

app.get("/books", async (req, res) => {
  const books = getAllBooks();
  res.status(202).json(books);
});

app.listen(5002, () => {
  console.log("listening on port, 5002");
});
