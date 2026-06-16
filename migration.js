const { MongoClient, ObjectId } = require("mongodb");

const MY_USER_ID = "6a0ccd5a15c96ec7f16b1fed";

async function migrate() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    const db = client.db("book-library");

    const result = await db
      .collection("books")
      .updateMany(
        { userId: { $exists: false } },
        { $set: { userId: new ObjectId(MY_USER_ID) } },
      );

    console.log(`Updated ${result.modifiedCount} books`);
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await client.close();
  }
}

migrate();
