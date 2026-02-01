console.log("DATABASE.JS LOADED");
const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");
let db;

//console.log("TEST TEST!");

async function connectDatabase() {
  if (!db) {
    await client.connect(); //connects with mongoDB
    db = client.db("book-library");
  }
  return db;
}

async function addBook(book) {
  const db = await connectDatabase();
  return db.collection("books").insertOne(book);
}

async function deleteBookById(id) {
  const db = await connectDatabase();
  return db.collection("books").deleteOne({ _id: new ObjectId(id) });
}

async function getBooks(filters = {}) {
  const db = await connectDatabase();
  return db.collection("books").find(filters).toArray();
}

module.exports = { addBook, deleteBookById, getBooks, connectDatabase };
