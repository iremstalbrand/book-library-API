const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");

//console.log("TEST TEST!");

function connectDatabase() {
  //await client.connect(); //connects with mongoDB
  //console.log("Connected to MongoDB successfully!");
  return client.db("book-library");
}

async function addBook(book) {
  const db = await connectDatabase();
  return await db.collection("books").insertOne(book); //I have the books collection, and adding document to that collection
}

async function getAllBooks() {
  const db = await connectDatabase();
  return await db.collection("books").find().toArray();
}

module.exports = { addBook, getAllBooks };
