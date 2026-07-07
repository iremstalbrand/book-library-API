require("dotenv").config();
const cors = require("cors");
const authMiddleware = require("./middleware/authMiddleware");
const express = require("express");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  addBook,
  deleteBookById,
  getBooks,
  connectDatabase,
  updateBookStatus,
  addReview,
  createUser,
  findUserByEmail,
} = require("./database.js");

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json()); //body parts of the req can read as JSON, need for post,put etc. from json data to json object!!

//REGISTER USER --> POST
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Missing fields: email, password, name",
      });
    }

    // validation
    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({ error: "Invalid field types" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    // check if email is already registered
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const result = await createUser({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    });

    res.status(201).json({
      id: result.insertedId,
      email,
      name,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//LOGIN USER --> POST
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // required fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Missing fields: email, password",
      });
    }

    // validation
    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string"
    ) {
      return res.status(400).json({ error: "Invalid field types" });
    }

    // find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // success - generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//ADD BOOKS ---> POST
app.post("/books", authMiddleware, async (req, res) => {
  try {
    const { name, author, language, pages, status, googleBookId, coverUrl } =
      req.body;

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

    //optional field validation
    if (googleBookId !== undefined && typeof googleBookId !== "string") {
      return res.status(400).json({ error: "googleBookId must be a string" });
    }
    if (coverUrl !== undefined && typeof coverUrl !== "string") {
      return res.status(400).json({ error: "coverUrl must be a string" });
    }

    const db = await connectDatabase();

    //check if the book is exist
    const existing = await db
      .collection("books")
      .findOne({ name, author, userId: new ObjectId(req.user.id) });
    if (existing) {
      return res.status(409).json({ error: "Book already exist" });
    }
    const book = {
      name,
      author,
      language,
      pages,
      status,
      userId: new ObjectId(req.user.id),
      ...(googleBookId !== undefined && { googleBookId }),
      ...(coverUrl !== undefined && { coverUrl }),
    };
    const result = await addBook(book);
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//DELETE BOOKS ---> DELETE
app.delete("/books/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    //validation
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error:
          "Invalid ID format. ID must be a 24-character hexadecimal string",
      });
    }

    const result = await deleteBookById(id, req.user.id);
    //if no book found
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//LIST BOOKS ---> GET
app.get("/books", authMiddleware, async (req, res) => {
  try {
    const { language, author, status } = req.query;

    const filters = { userId: new ObjectId(req.user.id) };
    //apply filters
    if (language) filters.language = { $regex: language, $options: "i" };
    if (author) filters.author = { $regex: author, $options: "i" };
    if (status) filters.status = status;

    const books = await getBooks(filters);
    res.status(200).json(books);
  } catch (error) {
    console.error("Error getting books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//UPDATE READ STATUS --> PATCH
app.patch("/books/:id/status", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const newStatus = await updateBookStatus(id, req.user.id);
    //if no book found
    if (!newStatus) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json({ status: newStatus });
  } catch (error) {
    console.error("Error updating book status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//ADD REVIEW --> POST
app.post("/books/:id/reviews", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    //required fields
    if (!rating || !comment) {
      return res.status(400).json({
        error: "Missing review fields: rating, comment",
      });
    }
    //validation
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be a number between 1 and 5",
      });
    }
    if (typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({
        error: "Comment must be a non-empty string",
      });
    }
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error:
          "Invalid ID format. ID must be a 24-character hexadecimal string",
      });
    }
    //check if the book exists
    const db = await connectDatabase();
    const book = await db
      .collection("books")
      .findOne({ _id: new ObjectId(id), userId: new ObjectId(req.user.id) });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    //add or update review
    const review = { rating, comment, date: new Date() };
    if (book.reviews && book.reviews.length > 0) {
      await db
        .collection("books")
        .updateOne(
          { _id: new ObjectId(id), userId: new ObjectId(req.user.id) },
          { $set: { "reviews.0": review } },
        );
      return res.status(200).json({ message: "Review updated successfully" });
    }
    await addReview(id, req.user.id, review);

    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//SEARCH GOOGLE BOOKS ---> GET
app.get("/search", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string" || !q.trim()) {
      return res.status(400).json({ error: "Missing or invalid search query" });
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

    let googleRes;
    try {
      googleRes = await fetch(url);
    } catch (err) {
      console.error("Google Books API unreachable:", err);
      return res
        .status(502)
        .json({ error: "Could not reach Google Books API" });
    }

    if (!googleRes.ok) {
      console.error("Google Books API returned", googleRes.status);
      return res
        .status(502)
        .json({ error: `Google Books API error: ${googleRes.status}` });
    }

    const data = await googleRes.json();

    const books = (data.items || []).map((item) => {
      const info = item.volumeInfo || {};
      const rawThumbnail = info.imageLinks?.thumbnail || null;
      const coverUrl = rawThumbnail
        ? rawThumbnail.replace(/^http:/, "https:")
        : null;

      return {
        googleBookId: item.id,
        title: info.title || "Unknown",
        author: (info.authors && info.authors[0]) || "Unknown",
        language: info.language || null,
        pages: info.pageCount || null,
        coverUrl,
      };
    });

    res.status(200).json(books);
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//START THE SERVER!!
app.listen(5002, () => {
  console.log("listening on port, 5002");
});
