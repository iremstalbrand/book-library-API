const { MongoClient } = require("mongodb");
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
  return db.collection("books").insertOne(book); //I have the books collection, and adding document to that collection
}

async function getAllBooks() {
  const db = await connectDatabase();
  return db.collection("books").find().toArray();
}

module.exports = { addBook, getAllBooks };
