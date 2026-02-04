const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");
let db;

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
async function updateBookStatus(id) {
  const db = await connectDatabase();
  const book = await db.collection("books").findOne({ _id: new ObjectId(id) });
  if (!book) return null;
  let newStatus;

  if (book.status === "read") {
    newStatus = "unread";
  } else {
    newStatus = "read";
  }

  await db
    .collection("books")
    .updateOne({ _id: new ObjectId(id) }, { $set: { status: newStatus } });
  return newStatus;
}

async function addReview(id, review) {
  const db = await connectDatabase();
  return db.collection("books").updateOne(
    { _id: new ObjectId(id) },
    {
      $push: { reviews: review },
    },
  );
}
module.exports = {
  addBook,
  deleteBookById,
  getBooks,
  connectDatabase,
  updateBookStatus,
  addReview,
};
