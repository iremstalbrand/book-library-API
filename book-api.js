//console.log("test");

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.status(202);
  res.send("OK");
});

app.listen(5001, () => {
  console.log("listening");
});
