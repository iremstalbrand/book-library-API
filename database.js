const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");

function connectDatabase() {
  //await client.connect(); //connects with mongoDB
  //console.log("Connected to MongoDB successfully!");
  return client.db("book-library");
}

function addBook(book) {
  const db = connectDatabase();
  return db.collection("books").insertOne(book); //I have the books collection, and adding document to that collection
}

function getAllBooks() {
  const db = connectDatabase();
  return db.collection("books").find().toArray();
}

module.exports = { addBook, getAllBooks };
