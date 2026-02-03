console.log("TEST TEST!");

const express = require("express"); //get express
const { ObjectId } = require("mongodb");
const {
  addBook,
  deleteBookById,
  getBooks,
  connectDatabase,
  updateBookStatus,
} = require("./database.js"); //get the functions from database.js
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

  //validation
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof author !== "string" ||
    !author.trim() ||
    typeof language !== "string" ||
    !language.trim() ||
    typeof pages !== "number" ||
    pages <= 0
  ) {
    return res.status(400).json({
      error: "Invalid or missing book fields",
    });
  }

  //required status
  if (status !== "read" && status !== "unread") {
    return res.status(400).json({
      error: 'Status must be either "read" or "unread"',
    });
  }

  const db = await connectDatabase();

  //check if the book is exist
  const existing = await db.collection("books").findOne({ name, author });
  if (existing) {
    return res.status(409).json({ error: "Book already exist" });
  }

  const book = { name, author, language, pages, status };
  const result = await addBook(book);
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
app.patch("/books/:id/status", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const newStatus = await updateBookStatus(id);
  if (!newStatus) {
    return res.status(404).json({ error: "Book not found" });
  }

  res.status(200).json({ status: newStatus });
});

app.listen(5002, () => {
  console.log("listening on port, 5002");
});
