console.log("TEST TEST!");

const express = require("express"); //get express
const { ObjectId } = require("mongodb");
const { addBook, deleteBookById, getBooks } = require("./database.js"); //get the function from database.js
const app = express(); //start express
app.use(express.json()); //body parts of the req can read as JSON, need for post,put etc. from json data to json object

//ADD BOOKS ---> POST
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

//DELETE BOOKS ---> DELETE
app.delete("/books/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      error: "Invalid ID format. ID must be a 24-character hexadecimal string",
    });
  }

  await deleteBookById(id);
  res.status(204).send();
});

//LIST BOOKS ---> GET
app.get("/books", async (req, res) => {
  const { language, author, status } = req.query;
  console.log("QUERY:", req.query);

  const filters = {};

  if (language) filters.language = { $regex: language, $options: "i" };
  if (author) filters.author = { $regex: author, $options: "i" };
  if (status) filters.status = status;

  const books = await getBooks(filters);
  res.status(200).json(books);
});

//UPDATE READ STATUS --> PATCH

app.listen(5002, () => {
  console.log("listening on port, 5002");
});
