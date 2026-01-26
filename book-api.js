console.log("TEST TEST!");

const express = require("express"); //get express

const { addBook, getAllBooks } = require("./database.js"); //get the function from database.js

const app = express(); //start express
app.use(express.json()); //body parts of the req can read as JSON, need for post,put etc. from json data to json object

//ENDPOINT 1 - POST

app.post("/books", async (req, res) => {
  const { name, author, language, pages, status } = req.body;
  //required fields
  if (!name || !author || !language || !pages || !status) {
    return res.status(400).json({
      error:
        "Missing or invalid book fields:  name, author, language, pages, status",
    });
  }

  //required status
  if (status !== "read" && status !== "unread") {
    return res.status(400).json({
      error: 'Status must be either "read" or "unread"',
    });
  }

  const book = { name, author, language, pages, status };

  const result = await addBook(book); //addBook function from DB
  res.status(201).json({ id: result.insertedId });
});

//ENDPOINT 2 - GET

app.get("/books", async (req, res) => {
  const books = await getAllBooks();
  res.status(200).json(books);
});

app.listen(5002, () => {
  console.log("listening on port, 5002");
});

//ENDPOINT 3 - DELETE
