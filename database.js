const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");

async function testDatabase() {
  await client.connect();
  console.log("connected");

  const db = client.db("book-library");
  const books = db.collection("books");

  const result = await books.insertOne({
    title: "A Tale for the Time Being",
    author: "Ruth Ozeki",
    pages: 432,
    language: "english",
    read: true,
    rating: null,
    comments: [],
  });
  console.log("Book added with _id:", result.insertedId);
  const allBooks = await books.find().toArray();
  console.log("All books in DB:", allBooks);

  await client.close();
}
testDatabase();
